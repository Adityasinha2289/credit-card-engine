/**
 * POST /api/taqdeer — grounded, streaming Taqdeer answers (Gemini).
 *
 * Body: { query, history?: [{ role: 'user'|'ai', content }], walletCardIds?: string[],
 *         spendSummary?: { [category]: monthlyRupees }, stream?: boolean }
 *
 * - Requires a Clerk session: the LLM is a paid resource. Signed-out callers
 *   (e.g. the landing-page demo) get 401 + { localOnly: true } and the client
 *   answers from its on-device engine.
 * - One model from GEMINI_MODEL (default gemini-3.8-flash), key in a header,
 *   systemInstruction + generationConfig, 12 s timeout, SSE streaming.
 * - Grounded: wallet cards + retrieved catalog cards + spend summary
 *   (api/_lib/taqdeerContext.ts). The query goes in as user content, never
 *   spliced into the instructions.
 * - Per-user rate limit and a 10-minute answer cache for history-less questions.
 *
 * Response (stream=true, default): text/event-stream of
 *   data: {"t":"…"}        incremental text
 *   data: {"done":true,"cards":[ids],"cached":bool}
 *   data: {"error":"…"}    (client falls back to its local engine)
 * Response (stream=false): { success, content, cards }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';
import { ClerkAuth } from '../src/features/recommendation/api/auth.js';
import { buildGrounding, SYSTEM_INSTRUCTION } from './_lib/taqdeerContext.js';

const auth = new ClerkAuth();

export const DEFAULT_MODEL = 'gemini-3.8-flash';
const TIMEOUT_MS = 12_000;
const MAX_HISTORY_TURNS = 6;
const MAX_QUERY_CHARS = 800;
const RATE_LIMIT = { windowMs: 60_000, max: 15 };
const CACHE_TTL_MS = 10 * 60_000;
const CACHE_MAX = 300;

const rate = new Map<string, number[]>();
const cache = new Map<string, { content: string; cards: string[]; at: number }>();

function rateLimited(userId: string, now = Date.now()): boolean {
  const recent = (rate.get(userId) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) {
    rate.set(userId, recent);
    return true;
  }
  recent.push(now);
  rate.set(userId, recent);
  return false;
}

function cacheGet(key: string) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  cache.delete(key); // refresh LRU position
  cache.set(key, hit);
  return hit;
}

function cacheSet(key: string, value: { content: string; cards: string[] }) {
  cache.set(key, { ...value, at: Date.now() });
  while (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value as string);
}

/** Exposed for tests. */
export function _resetTaqdeerState() {
  rate.clear();
  cache.clear();
}

type Turn = { role: 'user' | 'ai'; content: string };

function sanitizeHistory(history: unknown): Turn[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter((h: any) => h && (h.role === 'user' || h.role === 'ai') && typeof h.content === 'string')
    .slice(-MAX_HISTORY_TURNS)
    .map((h: any) => ({ role: h.role, content: String(h.content).slice(0, 1500) }));
}

async function* geminiStream(apiKey: string, model: string, body: unknown, signal: AbortSignal): AsyncGenerator<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal,
    },
  );
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gemini HTTP ${res.status} ${detail.slice(0, 300)}`);
  }
  const reader = (res.body as any).getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const json = JSON.parse(payload);
        const text = (json.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? '').join('');
        if (text) yield text;
      } catch {
        // partial / keep-alive line
      }
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Only POST method is allowed' });
  }

  const authResult = await auth.verifyToken(req.headers.authorization);
  if (!authResult.authenticated || !authResult.userId) {
    return res.status(401).json({ success: false, localOnly: true, error: authResult.error || 'Sign in to use Taqdeer AI' });
  }
  const userId = authResult.userId;

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const query = typeof body.query === 'string' ? body.query.trim().slice(0, MAX_QUERY_CHARS) : '';
  if (!query) {
    return res.status(400).json({ success: false, error: 'Missing query' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured on the server.');
    return res.status(503).json({ success: false, error: 'AI Backend offline due to missing configuration' });
  }

  if (rateLimited(userId)) {
    return res.status(429).json({ success: false, error: 'Too many questions — try again in a minute.' });
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const history = sanitizeHistory(body.history);
  const walletCardIds: string[] = Array.isArray(body.walletCardIds) ? body.walletCardIds.filter((x: unknown) => typeof x === 'string').slice(0, 20) : [];
  const spendSummary = body.spendSummary && typeof body.spendSummary === 'object' ? body.spendSummary : undefined;
  const grounding = buildGrounding({ query, walletCardIds, spendSummary });
  const cardIds = [...grounding.walletCards, ...grounding.retrievedCards].map((c) => c.id);
  const stream = body.stream !== false;

  const cacheKey = history.length === 0
    ? createHash('sha1').update(JSON.stringify([model, query.toLowerCase().replace(/\s+/g, ' '), [...walletCardIds].sort(), spendSummary ?? null])).digest('hex')
    : null;

  const send = {
    start() {
      if (!stream) return;
      res.status(200);
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      (res as any).flushHeaders?.();
    },
    event(data: unknown) {
      if (stream) res.write(`data: ${JSON.stringify(data)}\n\n`);
    },
  };

  const cached = cacheKey ? cacheGet(cacheKey) : null;
  if (cached) {
    if (!stream) return res.status(200).json({ success: true, content: cached.content, cards: cached.cards, cached: true });
    send.start();
    send.event({ t: cached.content });
    send.event({ done: true, cards: cached.cards, cached: true });
    return res.end();
  }

  const contents = [
    ...history.map((h) => ({ role: h.role === 'ai' ? 'model' : 'user', parts: [{ text: h.content }] })),
    { role: 'user', parts: [{ text: `CONTEXT:\n${grounding.text}\n\nQUESTION:\n${query}` }] },
  ];
  const geminiBody = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents,
    generationConfig: { temperature: 0.3, maxOutputTokens: 600, topP: 0.9 },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let content = '';
  let started = false;
  try {
    for await (const chunk of geminiStream(apiKey, model, geminiBody, controller.signal)) {
      if (!started) {
        send.start();
        started = true;
      }
      content += chunk;
      send.event({ t: chunk });
    }
    clearTimeout(timer);
    if (!content) throw new Error('Empty model response');
    if (cacheKey) cacheSet(cacheKey, { content, cards: cardIds });
    if (!stream) return res.status(200).json({ success: true, content, cards: cardIds });
    send.event({ done: true, cards: cardIds });
    return res.end();
  } catch (err: any) {
    clearTimeout(timer);
    const reason = err?.name === 'AbortError' ? 'timeout' : (err?.message || 'error');
    console.warn(`[taqdeer] ${model} failed: ${reason}`);
    if (!stream) return res.status(200).json({ success: false, fallback: true, error: 'AI Backend currently unavailable' });
    if (!started) send.start();
    send.event({ error: 'AI Backend currently unavailable', partial: content.length > 0 });
    return res.end();
  }
}

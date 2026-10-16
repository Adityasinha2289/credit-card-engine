// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { answerLocally, generateTaqdeerResponse, parseAmount } from '../taqdeerEngine';
import { CARD_DATASET } from '../../data/cardDataset';
import type { CardData } from '../../../cards/types/card.types';

const wallet = (ids: string[]) => ids.map((id) => ({ id, status: 'active', label: id, pan: '1234', creditLimit: 0, availableCredit: 0 } as unknown as CardData));

describe('Taqdeer local routing', () => {
  it('greets only real greetings (regression: "evening"/"help"/"bot" anywhere triggered it)', () => {
    expect(answerLocally('hi')?.content).toMatch(/Taqdeer/);
    expect(answerLocally('Hello Taqdeer')?.content).toMatch(/Taqdeer/);
    const dinner = answerLocally('best card for dinner at a restaurant this evening');
    expect(dinner?.content ?? '').not.toMatch(/Credit Intelligence Assistant/);
  });

  it('does not match bank names inside other words (regression: "au" in restaurant/because)', () => {
    const r = answerLocally('which card for a restaurant bill because I eat out a lot');
    expect(r?.content ?? '').not.toMatch(/Top credit cards offered by AU/i);
    expect(answerLocally('show me hdfc cards')?.content).toMatch(/HDFC/i);
    expect(answerLocally('show me AU Bank cards')?.content ?? '').toMatch(/AU/);
  });

  it('answers merchant spend questions locally with a structured evaluation', () => {
    const ids = CARD_DATASET.slice(0, 3).map((c) => c.id);
    const r = answerLocally('which card should I use for ₹2,500 on Swiggy?', wallet(ids));
    expect(r?.source).toBe('local');
    expect(r?.evaluation?.best).toBeTruthy();
    expect(r?.content).toMatch(/₹2,500/);
  });

  it('leaves open-ended questions to the AI', () => {
    expect(answerLocally('should I close my oldest card to get a premium one?')).toBeNull();
    expect(answerLocally('mujhe pehla card kaunsa lena chahiye?')).toBeNull();
  });

  it('has exactly one forex intent', () => {
    expect(answerLocally('zero forex card for my trip abroad')?.content).toMatch(/Forex|forex/);
  });
});

describe('parseAmount', () => {
  it.each([
    ['₹4,500 on amazon', 4500],
    ['rs 2k dinner', 2000],
    ['1.5 lakh laptop', 150000],
    ['INR 999', 999],
    ['which card for swiggy', null],
  ])('%s → %s', (q, v) => expect(parseAmount(q as string)).toBe(v));
});

describe('generateTaqdeerResponse', () => {
  const fetchMock = vi.fn();
  beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock); });
  afterEach(() => { vi.unstubAllGlobals(); delete (window as any).Clerk; });

  it('answers well-understood questions instantly without the network', async () => {
    const r = await generateTaqdeerResponse('which cards give airport lounge access?');
    expect(r.source).toBe('local');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('never calls the LLM for signed-out users', async () => {
    const r = await generateTaqdeerResponse('should I get a second card or not?');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(r.content).toBeTruthy();
  });

  it('streams open-ended questions from the AI and reports progress', async () => {
    (window as any).Clerk = { session: { getToken: async () => 'tok' } };
    const enc = new TextEncoder();
    fetchMock.mockResolvedValue(new Response(new ReadableStream({
      start(c) {
        c.enqueue(enc.encode('data: {"t":"Keep your "}\n\n'));
        c.enqueue(enc.encode('data: {"t":"oldest card open."}\n\n'));
        c.enqueue(enc.encode(`data: {"done":true,"cards":["${CARD_DATASET[0].id}"]}\n\n`));
        c.close();
      },
    }), { status: 200 }));
    const seen: string[] = [];
    const r = await generateTaqdeerResponse('should I close my oldest card?', [], { onToken: (t) => seen.push(t), history: [{ role: 'user', content: 'hi' }] });
    expect(r.source).toBe('ai');
    expect(r.content).toBe('Keep your oldest card open.');
    expect(seen).toEqual(['Keep your ', 'Keep your oldest card open.']);
    expect(r.cards?.[0].id).toBe(CARD_DATASET[0].id);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.history).toHaveLength(1);
  });

  it('falls back to a local answer when the AI errors', async () => {
    (window as any).Clerk = { session: { getToken: async () => 'tok' } };
    fetchMock.mockResolvedValue(new Response('data: {"error":"down"}\n\n', { status: 200 }));
    const r = await generateTaqdeerResponse('should I get a second card?');
    expect(r.source).toBe('local');
  });
});

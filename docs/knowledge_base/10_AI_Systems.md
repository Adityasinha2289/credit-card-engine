# 10 — AI Systems (Taqdeer)

_Updated October 2026 to match the code._

## Request flow

```
UI (TaqdeerDrawer · QuickAskTaqdeer · /app/taqdeer · landing demo)
  └─ generateTaqdeerResponse(query, walletCards, { history, onToken, localOnly })
       1. answerLocally()  — instant, on-device, no network
            intent registry (lounges, fees/LTF, forex, CIBIL, wallet health, UPI/RuPay,
            minimum due, a named card or bank, offers, greetings)
            + merchant/category spend questions → evaluatePayment() (exact wallet maths,
              amount parsed from the question, default "per ₹1,000")
       2. askAi()          — only when 1 returns nothing, and only with a Clerk session
            POST /api/taqdeer  (SSE stream, 15 s client timeout)
       3. fallback         — closest local answer or a short "try asking" guide
```

Follow-ups (short questions with history) skip step 1 so the model sees the conversation.

## /api/taqdeer (server)

| Aspect | Behaviour |
|---|---|
| Model | `GEMINI_MODEL`, default `gemini-3.8-flash` (one model — no fallback chain of retired models) |
| Transport | `streamGenerateContent?alt=sse`, key in `x-goog-api-key` header, 12 s timeout |
| Auth | Clerk session required (401 + `localOnly` otherwise). The public landing demo runs on-device only. |
| Prompt | `systemInstruction` (rules) + up to 6 history turns + one user turn with `CONTEXT` and `QUESTION`. The user's text is never spliced into the instructions. |
| Grounding | `api/_lib/taqdeerContext.ts`: the user's wallet cards with full facts, up to 6 catalog cards retrieved by BM25 + category detection, and a 90-day monthly spend summary sent by the client. |
| Rules | Use only numbers from CONTEXT, name the cards used, show arithmetic, say when data is missing, reply in the user's language (English / Hindi / Hinglish), 2–5 short points. |
| Limits | 15 questions/min/user (per instance), 600 output tokens, 800-char questions |
| Cache | 10 min LRU for history-less questions (key: model + normalised question + wallet + spend) |
| Output | SSE `data: {"t": "..."}` chunks, then `{"done": true, "cards": [ids]}`; `{"error": ...}` makes the client fall back. `stream: false` returns JSON. |

Retrieval is lexical on purpose: the corpus is ~150 short card documents, so BM25 is
deterministic and adds no latency; embeddings/pgvector would only add infrastructure.

## Other AI-adjacent pieces

- `src/features/taqdeer/decisionEngine.ts` — deterministic "today's decision" rules (no LLM).
- `api/health-ai.ts` — pings an optional external `VITE_AI_API_URL`; not related to Gemini and excluded from deployment (`.vercelignore`).
- `src/features/finix/components/TaqdeerPanel.tsx` — legacy panel, not mounted anywhere.

## Configuration

`GEMINI_API_KEY` (required for AI answers), `GEMINI_MODEL` (optional override). Check
https://ai.google.dev/gemini-api/docs/deprecations before pinning a model.

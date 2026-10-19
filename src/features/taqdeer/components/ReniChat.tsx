/**
 * Reni, the conversation. One component for the drawer and the full page:
 * a header, the thread (your messages right, Reni's answers left), and the
 * composer. The thread is kept by the caller, so it survives closing the drawer.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUp, RotateCcw, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { generateTaqdeerResponse, stripEmoji, type TaqdeerAnswer } from '../../finix/lib/taqdeerEngine';
import { CardFace } from '../../../public-platform/site/CardFace';
import { cn } from '../../../lib/utils';
import { ReniMark } from './ReniMark';

export type ReniMessage = { id: string; role: 'user' | 'ai'; content: string; answer?: TaqdeerAnswer; pending?: boolean };

const SUGGESTIONS = [
  '₹1,200 on Swiggy: which card?',
  'Is HDFC Infinia worth it for me?',
  'Which of my cards has lounge access?',
  'How do I improve my CIBIL score?',
];

/** Markdown, set in the brand's type: bold lead line, quiet bullets. */
const MD = {
  p: ({ children }: { children?: ReactNode }) => <p className="text-[14.5px] leading-relaxed text-rc-ink [&+p]:mt-2">{children}</p>,
  strong: ({ children }: { children?: ReactNode }) => <strong className="font-semibold text-rc-ink">{children}</strong>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="mt-2 space-y-1.5">{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="mt-2 list-decimal space-y-1.5 pl-5">{children}</ol>,
  li: ({ children }: { children?: ReactNode }) => (
    <li className="relative pl-4 text-[14px] leading-relaxed text-rc-ink/80 before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rc-sage">{children}</li>
  ),
  a: ({ children, href }: { children?: ReactNode; href?: string }) => <a href={href} className="font-medium text-rc-forest underline underline-offset-2">{children}</a>,
  h1: ({ children }: { children?: ReactNode }) => <p className="text-[14.5px] font-semibold text-rc-ink">{children}</p>,
  h2: ({ children }: { children?: ReactNode }) => <p className="text-[14.5px] font-semibold text-rc-ink">{children}</p>,
  h3: ({ children }: { children?: ReactNode }) => <p className="text-[14.5px] font-semibold text-rc-ink">{children}</p>,
};

function Typing() {
  return (
    <span className="inline-flex h-5 items-center gap-1" aria-label="Reni is writing">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-rc-ink/40" animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }} />
      ))}
    </span>
  );
}

export function ReniChat({ messages, setMessages, onClose, variant = 'panel' }: {
  messages: ReniMessage[];
  setMessages: (fn: (m: ReniMessage[]) => ReniMessage[]) => void;
  onClose?: () => void;
  variant?: 'panel' | 'page';
}) {
  const reduce = useReducedMotion();
  const userCards = useDashboardStore((s) => s.userCards);
  const [draft, setDraft] = useState('');
  const busy = messages.some((m) => m.pending);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'end' }); }, [messages, reduce]);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setDraft('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    const history = messages.filter((m) => !m.pending).map(({ role, content }) => ({ role, content })).slice(-6);
    const id = `${Date.now()}`;
    setMessages((m) => [...m, { id: `${id}-q`, role: 'user', content: q }, { id: `${id}-a`, role: 'ai', content: '', pending: true }]);
    const patch = (p: Partial<ReniMessage>) => setMessages((m) => m.map((msg) => (msg.id === `${id}-a` ? { ...msg, ...p } : msg)));
    try {
      const answer = await generateTaqdeerResponse(q, userCards, { history, onToken: (t) => patch({ content: t }) });
      patch({ content: answer.content, answer, pending: false });
    } catch {
      patch({ content: '**I couldn’t answer that just now.** Try again in a moment.', pending: false });
    }
  };

  const empty = messages.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-rc-cream text-rc-ink">
      {/* header */}
      <div className={cn('flex shrink-0 items-center gap-3 border-b border-rc-ink/[0.08] px-4 py-3 sm:px-5', variant === 'page' && 'sm:px-6')}>
        <ReniMark size={34} tone="ink" />
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[19px] font-semibold leading-none">Reni</p>
          <p className="mt-1 truncate text-[12px] text-rc-muted">{userCards.length > 0 ? `Knows your ${userCards.length} ${userCards.length === 1 ? 'card' : 'cards'}` : 'Your card assistant'}</p>
        </div>
        {!empty && (
          <button type="button" onClick={() => setMessages(() => [])} disabled={busy} aria-label="New chat" title="New chat" className="flex h-9 w-9 items-center justify-center rounded-full text-rc-muted transition-colors hover:bg-rc-ink/[0.06] hover:text-rc-ink disabled:opacity-40">
            <RotateCcw size={16} />
          </button>
        )}
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-rc-muted transition-colors hover:bg-rc-ink/[0.06] hover:text-rc-ink">
            <X size={18} />
          </button>
        )}
      </div>

      {/* thread */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5" aria-live="polite">
        {empty ? (
          <div className="flex h-full flex-col justify-end pb-2">
            <p className="font-serif text-[26px] font-semibold leading-[1.1] tracking-[-0.02em]">Ask about your cards.</p>
            <p className="mt-2 max-w-[34ch] text-[14px] leading-relaxed text-rc-muted">Which one to use for a purchase, whether a card is worth its fee, your limits and score. English, Hindi or Hinglish.</p>
            <ul className="mt-5 divide-y divide-rc-ink/[0.08] overflow-hidden rounded-[18px] border border-rc-ink/[0.08] bg-rc-paper">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => void ask(s)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[14px] text-rc-ink transition-colors hover:bg-white">
                    {s}
                    <ArrowUp size={15} className="shrink-0 rotate-45 text-rc-ink/30" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((m) => (m.role === 'user' ? (
              <motion.div key={m.id} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-[18px] rounded-br-[6px] bg-rc-ink px-4 py-2.5 text-[14.5px] leading-relaxed text-rc-cream">{m.content}</p>
              </motion.div>
            ) : (
              <motion.div key={m.id} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                {m.answer?.evaluation?.best ? (
                  <CardFace name={m.answer.evaluation.best.card.name} bank={m.answer.evaluation.best.card.bank} network={m.answer.evaluation.best.card.network} width={52} lifted={false} className="mt-0.5" />
                ) : (
                  <ReniMark size={26} tone="ink" className="mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  {m.pending && !m.content ? <Typing /> : <ReactMarkdown components={MD}>{stripEmoji(m.content)}</ReactMarkdown>}
                </div>
              </motion.div>
            )))}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); void ask(draft); }}
        className="shrink-0 border-t border-rc-ink/[0.08] bg-rc-cream px-3 pb-3 pt-3 sm:px-4"
      >
        <div className="flex items-end gap-2 rounded-[22px] border border-rc-ink/15 bg-white py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-rc-ink/40">
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(120, e.target.scrollHeight)}px`;
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void ask(draft); } }}
            placeholder="Message Reni"
            aria-label="Message Reni"
            className="max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-snug text-rc-ink outline-none placeholder:text-rc-ink/40"
          />
          <button type="submit" disabled={busy || !draft.trim()} aria-label="Send" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rc-ink text-rc-cream transition-opacity disabled:opacity-30">
            <ArrowUp size={17} />
          </button>
        </div>
        <p className="mt-2 px-2 text-center text-[11px] text-rc-muted">Reni can be wrong. Check the issuer’s terms before you apply.</p>
      </form>
    </div>
  );
}

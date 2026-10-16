import { useEffect, useRef, useState } from 'react';
import { ArrowRight, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageContainer } from '../../components/shared/PageContainer';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { generateTaqdeerResponse } from '../../features/finix/lib/taqdeerEngine';

type Msg = { role: 'user' | 'ai'; content: string; cards?: { id: string; name: string }[] };

const SUGGESTIONS = [
  'Which card should I use for ₹2,000 on Swiggy?',
  'Is a premium travel card worth it for me?',
  'How do I improve my CIBIL score?',
  'Zero forex cards for a trip abroad',
];

export default function TaqdeerPage() {
  const userCards = useDashboardStore((s) => s.userCards);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'ai', content: "Hi! I'm Taqdeer. Ask me which card to use, whether a card is worth it, or anything about fees, rewards and credit scores." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages]);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setQuery('');
    setBusy(true);
    const history = messages.slice(1).map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: 'user', content: q }, { role: 'ai', content: '' }]);

    const updateLast = (patch: Partial<Msg>) =>
      setMessages((m) => m.map((msg, i) => (i === m.length - 1 ? { ...msg, ...patch } : msg)));

    try {
      const res = await generateTaqdeerResponse(q, userCards, { history, onToken: (t) => updateLast({ content: t }) });
      updateLast({ content: res.content, cards: res.cards?.slice(0, 3).map((c) => ({ id: c.id, name: c.name })) });
    } catch {
      updateLast({ content: "Sorry — I couldn't answer that right now. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageContainer title="Taqdeer AI" subtitle="Your card and money copilot">
      <div className="flex flex-col glass-panel rounded-3xl overflow-hidden border-border-subtle max-w-3xl w-full mx-auto min-h-[70vh] max-h-[80vh]">
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${msg.role === 'ai' ? 'bg-brand-emerald/20 text-brand-emerald' : 'bg-surface-elevated text-text-muted'}`}>
                {msg.role === 'ai' ? <img src="/taqdeer-logo.png" alt="" className="w-full h-full object-cover" /> : <User size={16} />}
              </div>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-surface-elevated text-text-primary rounded-tr-sm' : 'bg-brand-emerald/5 border border-brand-emerald/20 text-text-primary rounded-tl-sm'}`}>
                {msg.role === 'ai' && !msg.content ? (
                  <Loader2 size={16} className="animate-spin text-brand-emerald" aria-label="Thinking" />
                ) : msg.role === 'ai' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
                {msg.cards && msg.cards.length > 0 && (
                  <p className="mt-3 text-[11px] text-text-muted">Cards referenced: {msg.cards.map((c) => c.name).join(' · ')}</p>
                )}
              </div>
            </div>
          ))}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => void ask(s)} className="text-xs px-3 py-1.5 rounded-full border border-border-subtle text-text-secondary hover:border-brand-emerald">
                  {s}
                </button>
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="p-4 border-t border-border-subtle bg-surface-base">
          <form onSubmit={(e) => { e.preventDefault(); void ask(query); }} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about cards, rewards or spending…"
              aria-label="Ask Taqdeer"
              className="w-full bg-surface-elevated border border-border-subtle rounded-xl py-4 pl-4 pr-12 text-text-primary focus:outline-none focus:border-brand-emerald/50"
            />
            <button type="submit" disabled={busy || !query.trim()} aria-label="Send" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-brand-emerald text-black flex items-center justify-center hover:bg-brand-400 transition-colors disabled:opacity-40">
              {busy ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}

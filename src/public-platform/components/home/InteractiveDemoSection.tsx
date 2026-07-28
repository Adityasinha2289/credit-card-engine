import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowUp, Plane, Coffee, ShoppingBag } from 'lucide-react';
import { RecommendationCard } from './RecommendationCard';
import { generateTaqdeerResponse } from '../../../features/finix/lib/taqdeerEngine';

type Message = {
  id: string;
  role: 'user' | 'system';
  content: string;
  isStreaming?: boolean;
  recommendation?: {
    cardName: string;
    expectedSavings: string;
    rewards: string;
    reasons: string[];
    confidence: number;
    alternative?: string;
  };
};

const suggestedQueries = [
  { text: "I'm booking a ₹15,000 flight to Dubai.", icon: Plane },
  { text: "₹4,500 dinner at Taj", icon: Coffee },
  { text: "₹1,20,000 Macbook Pro", icon: ShoppingBag },
  { text: "₹5,000 monthly groceries", icon: ShoppingBag }
];

export function InteractiveDemoSection() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: "Hi. I'm TAQDEER. Tell me what you're about to buy, and I'll tell you exactly which of your cards to use."
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 1 || isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  // Removed mock fetchRecommendation in favor of generateTaqdeerResponse

  const handleSubmit = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const text = presetQuery || query;
    if (!text.trim() || isTyping) return;

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    const response = await generateTaqdeerResponse(text, []);

    let rec = undefined;
    if (response.cards && response.cards.length > 0) {
      const best = response.cards[0];
      rec = {
        cardName: best.name,
        expectedSavings: 'Maximized',
        rewards: `${best.baseRewardRate}% Base`,
        reasons: best.highlights.slice(0, 3).map(h => h.replace('✓', '').trim()),
        confidence: 95
      };
    }

    const sysMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'system',
      content: response.content,
      isStreaming: false,
      recommendation: rec
    };

    setMessages(prev => [...prev, sysMsg]);
    setIsTyping(false);
  };

  return (
    <section className="w-full py-32 bg-[#0A0A0A] text-white relative border-t border-white/[0.04]">
      
      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-gray-400 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#00E599]" />
            <span className="text-white">TAQDEER AI Assistant</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 tracking-tight leading-tight">
            Chat with your wallet.
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Experience the TAQDEER engine in action. Ask a financial question and get an instant, personalized recommendation.
          </p>
        </div>

        {/* Chat Interface */}
        <div className="w-full max-w-4xl bg-[#0A0A0A] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
          
          {/* Chat Header */}
          <div className="h-16 border-b border-white/[0.04] flex items-center px-6 bg-[#0A0A0A]/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#111111] border border-white/[0.08] flex items-center justify-center overflow-hidden">
                <img src="/logo.jpg" alt="RenoCred Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white">RenoCred Intelligence</p>
                <p className="text-xs text-[#00E599]">Online</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                >
                  {msg.role === 'system' && (
                    <div className="w-8 h-8 rounded-full bg-[#111111] border border-white/[0.08] flex items-center justify-center mr-4 shrink-0 mt-1 overflow-hidden">
                      <img src="/logo.jpg" alt="RenoCred Logo" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                    <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[#111111] text-white border border-white/[0.08] rounded-tr-sm' 
                        : 'bg-transparent text-gray-300'
                    }`}>
                      {msg.content.split(/(\*\*.*?\*\*|\n)/g).map((part, i) => {
                        if (part === '\n') return <br key={i} />;
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                        }
                        return <span key={i}>{part}</span>;
                      })}
                    </div>

                    {msg.recommendation && (
                      <div className="mt-4 flex flex-col gap-4 w-full">
                        <RecommendationCard 
                          cardName={msg.recommendation.cardName}
                          expectedSavings={msg.recommendation.expectedSavings}
                          rewards={msg.recommendation.rewards}
                          reasons={msg.recommendation.reasons}
                          confidence={msg.recommendation.confidence}
                        />
                        {msg.recommendation.alternative && (
                          <div className="text-xs text-gray-500 ml-2">
                            <span className="font-semibold">Alternative: </span> {msg.recommendation.alternative}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start w-full"
                >
                  <div className="w-8 h-8 rounded-full bg-[#111111] border border-white/[0.08] flex items-center justify-center mr-4 shrink-0 mt-1 overflow-hidden">
                    <img src="/logo.jpg" alt="RenoCred Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-1.5 px-4 py-4 rounded-2xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/[0.04] bg-[#0A0A0A]">
            <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar">
              {suggestedQueries.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(undefined, q.text)}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-[#111111] hover:bg-[#1A1A1A] transition-colors text-xs font-medium text-gray-300"
                >
                  <q.icon className="w-3.5 h-3.5 text-gray-500" /> {q.text}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about a purchase..."
                className="w-full bg-[#111111] border border-white/[0.08] rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/[0.2] transition-colors"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!query.trim() || isTyping}
                className="absolute right-2 w-10 h-10 flex items-center justify-center rounded-lg bg-[#00E599] text-[#0A0A0A] disabled:opacity-50 disabled:bg-[#1A1A1A] disabled:text-gray-500 transition-colors"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

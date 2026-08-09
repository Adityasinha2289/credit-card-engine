import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, User, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '../../../lib/utils';

interface TaqdeerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TaqdeerDrawer({ isOpen, onClose }: TaqdeerDrawerProps) {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; content: string }[]>([]);

  // Set contextual prompt when drawer opens or location changes
  useEffect(() => {
    let prompt = "Good evening, Demo.\n\nWhat are we optimizing today?";
    const path = location.pathname;
    
    if (path.startsWith('/app/wallet/emi')) {
      prompt = "Good evening, Demo.\n\nI can help you decide whether financing this purchase makes sense.";
    } else if (path.startsWith('/app/wallet')) {
      prompt = "Good evening, Demo.\n\nI can help you choose the best card for a purchase.";
    } else if (path.startsWith('/app/lifestyle')) {
      prompt = "Good evening, Demo.\n\nI can help turn your plans into a smarter spending strategy.";
    }

    if (messages.length === 0 || (isOpen && messages[messages.length - 1].content !== prompt)) {
      setMessages(prev => {
        if (prev.length > 0 && prev[prev.length - 1].content === prompt) {
          return prev;
        }
        return [...prev, { role: 'ai', content: prompt }];
      });
    }
  }, [location.pathname, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setQuery('');

    // Simulate AI parsing intent
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "I've structured a plan for you. I also optimized the payments to maximize your rewards."
      }]);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            "fixed bottom-[88px] right-6 z-50 flex flex-col origin-bottom-right",
            "w-[calc(100vw-48px)] sm:w-[380px]",
            "h-[500px] max-h-[calc(100vh-120px)]",
            "bg-obsidian border border-border-subtle rounded-[22px] shadow-ag-modal overflow-hidden"
          )}
        >
          {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-surface-primary shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary tracking-wide">TAQDEER</h2>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Your financial copilot</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 hide-scrollbar bg-bg-page">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 mt-0.5 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-surface-elevated border border-border-subtle text-text-muted'}`}>
                    {msg.role === 'ai' ? <Sparkles size={12} /> : <User size={12} />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap",
                    msg.role === 'user' 
                      ? "bg-surface-elevated text-text-primary rounded-tr-sm border border-border-subtle" 
                      : "bg-surface-primary border border-border-subtle text-text-primary rounded-tl-sm"
                  )}>
                    {msg.content}
                    {msg.role === 'ai' && i === 0 && (
                      <div className="flex flex-col gap-2 mt-4">
                        {['Optimize my cards', 'Plan a ₹5,000 purchase', 'Review my spending'].map(chip => (
                          <button
                            key={chip}
                            onClick={() => { setQuery(chip); }}
                            className="text-left px-3 py-2 rounded-xl text-xs font-medium bg-surface-elevated border border-border-subtle text-text-secondary hover:text-text-primary hover:border-brand-emerald/30 transition-colors"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-border-subtle bg-surface-primary shrink-0">
              <form onSubmit={handleSubmit} className="relative">
                <input 
                  type="text" 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Ask Taqdeer anything..." 
                  className="w-full bg-surface-elevated border border-border-subtle rounded-xl py-2.5 pl-4 pr-11 text-[13px] text-text-primary focus:outline-none focus:border-brand-emerald/50 transition-colors h-[48px]"
                />
                <button 
                  type="submit" 
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-surface-secondary text-text-secondary hover:text-brand-emerald hover:bg-brand-emerald/10 flex items-center justify-center transition-colors"
                >
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

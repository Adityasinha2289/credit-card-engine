import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, User, X } from 'lucide-react';
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

    // Simulate AI
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
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 12 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          className={cn(
            "fixed bottom-[144px] lg:bottom-[88px] right-4 lg:right-6 z-[100] flex flex-col origin-bottom-right",
            "w-[calc(100vw-32px)] lg:w-[380px]",
            "h-[500px] max-h-[calc(100dvh-160px)] lg:max-h-[calc(100dvh-120px)]",
            "bg-semantic-surface-primary border border-semantic-border-subtle rounded-2xl shadow-ag-modal overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-semantic-border-subtle bg-semantic-shell shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-semantic-surface-intelligence border border-semantic-border-intelligence text-semantic-brand flex items-center justify-center">
                <span className="font-display font-bold text-[13px] tracking-tighter">R</span>
              </div>
              <div>
                <h2 className="text-xs font-bold text-semantic-text-primary tracking-wide">TAQDEER</h2>
                <p className="text-[10px] text-semantic-text-muted uppercase tracking-widest font-semibold">Financial Copilot</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-semantic-text-muted hover:text-semantic-text-primary hover:bg-semantic-surface-secondary transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 hide-scrollbar bg-semantic-surface-primary">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={cn(
                  "w-6 h-6 mt-0.5 rounded-full flex items-center justify-center shrink-0 border",
                  msg.role === 'ai' 
                    ? 'bg-semantic-surface-intelligence border-semantic-border-intelligence text-semantic-brand' 
                    : 'bg-semantic-surface-elevated border-semantic-border-subtle text-semantic-text-muted'
                )}>
                  {msg.role === 'ai' ? <span className="font-display font-bold text-[10px] tracking-tighter">R</span> : <User size={12} />}
                </div>
                <div className={cn(
                  "max-w-[85%] p-3 text-[13px] leading-relaxed whitespace-pre-wrap border",
                  msg.role === 'user' 
                    ? "bg-semantic-surface-elevated text-semantic-text-primary rounded-2xl rounded-tr-sm border-semantic-border-subtle" 
                    : "bg-semantic-surface-card border-semantic-border-subtle text-semantic-text-primary rounded-2xl rounded-tl-sm"
                )}>
                  {msg.content}
                  {msg.role === 'ai' && i === 0 && (
                    <div className="flex flex-col gap-2 mt-4">
                      {['Optimize my cards', 'Plan a ₹5,000 purchase', 'Review my spending'].map(chip => (
                        <button
                          key={chip}
                          onClick={() => { setQuery(chip); }}
                          className="text-left px-3 py-2 rounded-xl text-xs font-medium bg-semantic-surface-elevated border border-semantic-border-subtle text-semantic-text-secondary hover:text-semantic-text-primary hover:border-semantic-border-strong transition-colors"
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
          <div className="p-3 border-t border-semantic-border-subtle bg-semantic-shell shrink-0">
            <form onSubmit={handleSubmit} className="relative">
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask Taqdeer anything..." 
                className="w-full bg-semantic-surface-elevated border border-semantic-border-subtle rounded-xl py-2.5 pl-4 pr-11 text-[13px] text-semantic-text-primary focus:outline-none focus:border-semantic-border-strong transition-colors h-[48px]"
              />
              <button 
                type="submit" 
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-semantic-surface-card border border-semantic-border-subtle text-semantic-text-secondary hover:text-semantic-text-primary hover:border-semantic-border-strong flex items-center justify-center transition-colors"
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

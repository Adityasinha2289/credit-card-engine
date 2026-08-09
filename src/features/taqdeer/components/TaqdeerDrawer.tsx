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
    let prompt = "Hello! I'm Taqdeer. What are we planning today?";
    const path = location.pathname;
    
    if (path === '/app') {
      prompt = "Looking at your financial overview. What would you like to optimize?";
    } else if (path.startsWith('/app/wallet/emi')) {
      prompt = "I can help you decide whether financing this purchase makes sense.";
    } else if (path.startsWith('/app/wallet')) {
      prompt = "I can help you choose the best card for a purchase.";
    } else if (path.startsWith('/app/lifestyle')) {
      prompt = "I can help turn your plans into a smarter spending strategy.";
    }

    if (messages.length === 0 || (isOpen && messages[messages.length - 1].content !== prompt)) {
      setMessages(prev => {
        // Avoid adding the same prompt twice in a row
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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:bg-transparent lg:backdrop-blur-none"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed top-0 right-0 h-screen z-50 flex flex-col",
              "w-full sm:w-[420px]",
              "bg-obsidian border-l border-border-subtle shadow-ag-modal"
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
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 hide-scrollbar bg-bg-page">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-surface-elevated border border-border-subtle text-text-muted'}`}>
                    {msg.role === 'ai' ? <Sparkles size={14} /> : <User size={14} />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-surface-elevated text-text-primary rounded-tr-sm border border-border-subtle" 
                      : "bg-surface-primary border border-border-subtle text-text-primary rounded-tl-sm"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border-subtle bg-surface-primary shrink-0">
              <form onSubmit={handleSubmit} className="relative">
                <input 
                  type="text" 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Ask Taqdeer anything..." 
                  className="w-full bg-surface-elevated border border-border-subtle rounded-xl py-3.5 pl-4 pr-12 text-sm text-text-primary focus:outline-none focus:border-brand-emerald/50 transition-colors"
                />
                <button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-surface-secondary text-text-secondary hover:text-brand-emerald hover:bg-brand-emerald/10 flex items-center justify-center transition-colors"
                >
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

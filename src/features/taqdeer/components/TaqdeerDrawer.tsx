import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, User, X, CreditCard, Sparkles, Bot } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { generateTaqdeerResponse } from '../../finix/lib/taqdeerEngine';
interface TaqdeerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TaqdeerDrawer({ isOpen, onClose }: TaqdeerDrawerProps) {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; content: string }[]>([]);
  const userCards = useDashboardStore(state => state.userCards);
  const [isTyping, setIsTyping] = useState(false);

  // No initial message useEffect

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const currentQuery = query;
    setMessages(prev => [...prev, { role: 'user', content: currentQuery }]);
    setQuery('');
    setIsTyping(true);

    try {
      const response = await generateTaqdeerResponse(currentQuery, userCards);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: response.content
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'I encountered an error while trying to generate a response. Please try again.'
      }]);
    } finally {
      setIsTyping(false);
    }
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
            "bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2A9D5C]" />
              <h2 className="text-xs font-bold text-[#2A9D5C] tracking-widest uppercase">TAQDEER</h2>
              <span className="text-xs text-gray-400 font-medium ml-1">Always available</span>
            </div>
            <button 
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Chat Area */}
          {messages.length === 0 ? (
            <div className="flex-1 overflow-y-auto px-6 py-2 flex flex-col hide-scrollbar">
              <div className="flex flex-col gap-1 mt-4 mb-8">
                <h1 className="text-3xl font-medium text-gray-900 mb-2">Good Evening.</h1>
                <p className="text-[17px] text-gray-900">I'm <span className="text-[#2A9D5C]">TAQDEER</span>.</p>
                <p className="text-[17px] text-gray-700">Your AI Financial Copilot.</p>
              </div>

              <div className="mt-2">
                <p className="text-[13px] font-semibold text-gray-600 mb-4">What would you like to optimise today?</p>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: <CreditCard size={18} />, text: 'Which card should I use today?' },
                    { icon: <Sparkles size={18} />, text: 'Plan my vacation' },
                    { icon: <Bot size={18} />, text: 'Analyse my wallet' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(item.text)}
                      className="flex items-center gap-4 px-5 py-4 rounded-3xl bg-gray-50 hover:bg-white border border-gray-200 hover:border-[#2A9D5C]/30 hover:shadow-sm transition-all text-gray-900 text-[13px] font-medium text-left"
                    >
                      <div className="text-gray-400 group-hover:text-[#2A9D5C]">{item.icon}</div>
                      {item.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 hide-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={cn(
                    "w-6 h-6 mt-0.5 rounded-full flex items-center justify-center shrink-0 border overflow-hidden",
                    msg.role === 'ai' 
                      ? 'bg-emerald-50 border-emerald-100 text-[#2A9D5C]' 
                      : 'bg-gray-100 border-gray-200 text-gray-600'
                  )}>
                    {msg.role === 'ai' ? <img src="/taqdeer-logo.png" alt="AI" className="w-full h-full object-cover" /> : <User size={12} />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] p-3 text-[13px] leading-relaxed whitespace-pre-wrap border",
                    msg.role === 'user' 
                      ? "bg-gray-900 text-white rounded-2xl rounded-tr-sm border-gray-900 shadow-sm" 
                      : "bg-white border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm shadow-sm"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-6 h-6 mt-0.5 rounded-full flex items-center justify-center shrink-0 border overflow-hidden bg-emerald-50 border-emerald-100 text-[#2A9D5C]">
                    <img src="/taqdeer-logo.png" alt="AI" className="w-full h-full object-cover" />
                  </div>
                  <div className="max-w-[85%] p-3 text-[13px] leading-relaxed bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm shadow-sm flex items-center">
                    <span className="flex gap-1 items-center h-4">
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 shrink-0 bg-transparent">
            <form onSubmit={handleSubmit} className="relative">
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask Taqdeer anything..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-3.5 pl-5 pr-12 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2A9D5C] focus:bg-white transition-all h-[52px]"
              />
              <button 
                type="submit" 
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gray-900 border border-gray-900 text-white hover:bg-[#2A9D5C] hover:border-[#2A9D5C] flex items-center justify-center transition-colors shadow-sm"
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

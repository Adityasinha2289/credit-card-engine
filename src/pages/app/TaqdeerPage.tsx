import React, { useState } from 'react';
import { Sparkles, ArrowRight, User } from 'lucide-react';
import { PageContainer } from '../../components/shared/PageContainer';
import { MOCK_DATE_ITINERARY } from '../../features/lifestyle/mock/datePlans';

export default function TaqdeerPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm Taqdeer. What are we planning today?" }
  ]);
  const [showCanvas, setShowCanvas] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setMessages([...messages, { role: 'user', content: query }]);
    setQuery('');

    // Simulate AI parsing intent
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "I've structured a Date Plan in Noida for ₹5,000. I also optimized the payments to maximize your HDFC Diners and Axis Ace rewards."
      }]);
      setShowCanvas(true);
    }, 1500);
  };

  return (
    <PageContainer title="Taqdeer AI" subtitle="Your Intelligent Financial Copilot">
      <div className="flex flex-col-reverse lg:flex-row gap-6 min-h-[75vh]">
        
        {/* Left Side: Chat Interface */}
        <div className="w-full lg:w-1/3 flex flex-col glass-panel rounded-3xl overflow-hidden border-border-subtle shrink-0 max-h-[75vh]">
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-brand-emerald/20 text-brand-emerald' : 'bg-surface-elevated text-text-muted'}`}>
                  {msg.role === 'ai' ? <Sparkles size={16} /> : <User size={16} />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-surface-elevated text-text-primary rounded-tr-sm' : 'bg-brand-emerald/5 border border-brand-emerald/20 text-text-primary rounded-tl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border-subtle bg-surface-base">
            <form onSubmit={handleSubmit} className="relative">
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Plan a date for ₹5,000..." 
                className="w-full bg-surface-elevated border border-border-subtle rounded-xl py-4 pl-4 pr-12 text-text-primary focus:outline-none focus:border-brand-emerald/50"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-brand-emerald text-black flex items-center justify-center hover:bg-brand-400 transition-colors">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Visual Canvas Prototype */}
        <div className={`w-full lg:w-2/3 glass-panel rounded-3xl p-6 border-brand-emerald/20 transition-all duration-700 ${showCanvas ? 'opacity-100 lg:translate-x-0' : 'opacity-0 lg:translate-x-8 pointer-events-none hidden lg:block'}`}>
          <div className="h-full overflow-y-auto hide-scrollbar">
            {showCanvas && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-display font-medium text-white">{MOCK_DATE_ITINERARY.title}</h2>
                  <span className="text-xs bg-brand-emerald/10 text-brand-emerald px-2 py-1 rounded font-bold tracking-wider uppercase">Generated</span>
                </div>

                <div className="space-y-4">
                  {MOCK_DATE_ITINERARY.venues.map(venue => (
                    <div key={venue.id} className="bg-surface-elevated/50 p-4 rounded-xl border border-border-subtle">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{venue.time} • {venue.type}</p>
                          <h3 className="font-medium text-text-primary">{venue.name} @ {venue.partnerName}</h3>
                        </div>
                        <span className="text-sm text-text-muted">₹{venue.originalCost.toLocaleString()}</span>
                      </div>
                      <div className="bg-brand-emerald/5 rounded-lg p-3 flex justify-between items-center text-sm">
                        <span className="text-text-secondary">Best Card: <span className="text-white font-medium">{venue.recommendation.bestCard.bankName}</span></span>
                        <span className="text-brand-emerald font-semibold">-₹{venue.recommendation.totalSavings.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-brand-emerald/10 border border-brand-emerald/30 p-5 rounded-2xl mt-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-text-secondary">Estimated Value</span>
                    <span className="text-xl font-display font-bold text-white">₹4,150</span>
                  </div>
                  <p className="text-xs text-text-muted text-right">You save ₹650</p>
                </div>
                
                <button className="w-full bg-text-primary text-black py-3 rounded-xl font-medium mt-4">
                  Confirm Plan
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </PageContainer>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, Heart, ArrowRight, Utensils, Music, Car } from 'lucide-react';
import { MOCK_DATE_ITINERARY } from '../../../features/lifestyle/mock/datePlans';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { CommerceOptimizationService } from '../../../features/commerce';
import type { SpendingOpportunity, ItineraryOptimizationResult } from '../../../features/optimization/types';
import { useEffect } from 'react';

export default function PlanDatePage() {
  const [step, setStep] = useState<'input' | 'itinerary'>('input');
  
  const itinerary = MOCK_DATE_ITINERARY;
  
  const profile = useDashboardStore(state => state.profile);

  const [optimizationResult, setOptimizationResult] = useState<ItineraryOptimizationResult>({ 
    totalBaseAmount: 0, 
    totalEffectiveCost: 0, 
    totalSavings: 0, 
    items: [] 
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (step === 'itinerary') {
      async function fetchOptimization() {
        setIsLoading(true);
        try {
          const opportunities: SpendingOpportunity[] = itinerary.venues.map(v => ({
            id: v.id,
            partnerId: v.partnerName.toLowerCase().replace(' ', '-'), // Rough match for mock partners
            category: v.type === 'Dinner' ? 'dining' : 'entertainment',
            baseAmount: v.originalCost,
            currency: 'INR',
          }));
          const userId = profile?.id || 'demo-user-id';
          const result = await CommerceOptimizationService.optimizeItinerary(opportunities, userId);
          setOptimizationResult(result);
        } catch (err) {
          console.error("Failed to optimize itinerary", err);
        } finally {
          setIsLoading(false);
        }
      }
      fetchOptimization();
    }
  }, [step, itinerary, profile?.id]);
  
  return (
    <div className="max-w-3xl mx-auto pb-32 text-text-primary min-h-screen pt-8">
      
      <AnimatePresence mode="wait">
        {step === 'input' ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <header className="mb-10 text-center">
              <h1 className="text-4xl font-display font-medium tracking-tight text-white mb-4">
                Plan a Date
              </h1>
              <p className="text-lg text-text-muted font-light max-w-lg mx-auto">
                Tell us what you're looking for, and RenoCred will build the perfect itinerary and optimize your payments.
              </p>
            </header>

            <div className="glass-panel p-8 max-w-xl mx-auto space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Location</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" defaultValue="Noida" className="w-full bg-surface-elevated border border-border-subtle rounded-xl py-3 pl-12 pr-4 text-text-primary focus:outline-none focus:border-brand-emerald/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Budget</label>
                  <input type="text" defaultValue="₹5,000" className="w-full bg-surface-elevated border border-border-subtle rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-brand-emerald/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">People</label>
                  <div className="relative">
                    <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="number" defaultValue={2} className="w-full bg-surface-elevated border border-border-subtle rounded-xl py-3 pl-12 pr-4 text-text-primary focus:outline-none focus:border-brand-emerald/50" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Vibe</label>
                <div className="flex gap-3">
                  {['Romantic', 'Casual', 'Adventurous'].map((v) => (
                    <button key={v} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${v === 'Romantic' ? 'bg-brand-emerald/10 border-brand-emerald/30 text-brand-emerald' : 'bg-surface-elevated border-border-subtle text-text-muted hover:text-text-primary'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setStep('itinerary')}
                className="w-full mt-6 bg-brand-emerald hover:bg-brand-400 text-black py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                Generate Itinerary <SparklesIcon />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="itinerary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setStep('input')} className="text-text-muted hover:text-text-primary px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-base text-sm">
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-display font-medium text-white">{itinerary.title}</h1>
                <p className="text-sm text-text-muted">{itinerary.location} • Budget: ₹{itinerary.budget.toLocaleString('en-IN')} • {itinerary.vibe}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Itinerary */}
              <div>
                <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-text-muted mb-6 flex items-center gap-2">
                  <Calendar size={14} /> The Plan
                </h2>
                <div className="relative border-l border-border-subtle ml-4 space-y-8 pb-4">
                  {itinerary.venues.map((venue, idx) => (
                    <div key={venue.id} className="relative pl-6">
                      <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-brand-emerald shadow-[0_0_10px_rgba(0,229,153,0.5)]" />
                      <span className="text-xs font-bold text-brand-emerald tracking-wider">{venue.time}</span>
                      <div className="glass-panel p-4 mt-2 rounded-2xl">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">{venue.type}</p>
                            <h3 className="text-lg font-medium text-text-primary">{venue.name}</h3>
                            <p className="text-text-secondary">{venue.partnerName}</p>
                          </div>
                          <span className="text-sm text-text-muted">₹{venue.originalCost.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Optimization */}
              <div>
                <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-text-muted mb-6 flex items-center gap-2">
                  <Heart size={14} /> Smart Payment Plan
                </h2>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-emerald"></div>
                    </div>
                  ) : optimizationResult.items.length > 0 ? (
                    optimizationResult.items.map((optItem, idx) => {
                      const venue = itinerary.venues[idx];
                      return (
                        <div key={venue.id} className="flex justify-between items-center glass-panel p-4 rounded-2xl border-border-subtle">
                          <div>
                            <p className="text-sm font-medium text-text-primary mb-1">{venue.partnerName}</p>
                            <p className="text-xs text-text-muted">
                              {optItem.recommendedPaymentMethod.paymentMethodName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Save</p>
                            <p className="text-brand-emerald font-semibold">-₹{optItem.savings.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-text-muted py-4">No optimal plan found.</div>
                  )}
                  
                  <div className="glass-panel p-6 rounded-2xl mt-6 border-brand-emerald/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-emerald/5 pointer-events-none" />
                    
                    <div className="relative z-10 grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1">Total Cost</p>
                        <p className="text-sm font-medium text-text-secondary line-through decoration-text-muted/50">
                          ₹{optimizationResult.totalBaseAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1">Date Value</p>
                        <p className="text-sm font-medium text-brand-emerald">
                          -₹{optimizationResult.totalSavings.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative z-10 pt-4 border-t border-brand-emerald/10">
                      <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1">Effective Cost</p>
                      <p className="text-3xl font-display font-bold text-white tracking-tight">₹{optimizationResult.totalEffectiveCost.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 text-center">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-3">Powered by Optimization Engine V2</p>
                    <button className="w-full bg-text-primary hover:bg-white text-black py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                      Continue to Bookings <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" />
    </svg>
  );
}

import { useState } from 'react';
import { useDashboardStore } from '../dashboard/store/dashboardStore';
import { seedDemoStore } from './demoData';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Database, RefreshCw, X, Code2, AlertTriangle } from 'lucide-react';

export function DemoDataInspector() {
  const [isOpen, setIsOpen] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  
  // Subscribe to the store data that we care about
  const profile = useDashboardStore((s) => s.profile);
  const cards = useDashboardStore((s) => s.userCards);
  const transactions = useDashboardStore((s) => s.transactions);
  const offers = useDashboardStore((s) => s.offers);

  const handleReset = () => {
    seedDemoStore();
  };

  const handleExit = () => {
    window.location.href = '/app';
  };

  // ---------------------------------------------------------------------------
  // TOGGLE BUTTON (Visible when closed)
  // ---------------------------------------------------------------------------
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] bg-black text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 hover:scale-105 transition-transform"
        aria-label="Open Demo Inspector"
      >
        <Database className="w-4 h-4 text-emerald-400" />
        <div className="flex flex-col items-start leading-tight">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Demo Mode</span>
          <span className="text-[10px] text-white/60 font-medium">Data Inspector</span>
        </div>
      </button>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN PANEL
  // ---------------------------------------------------------------------------
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-[#111111] border-l border-white/10 shadow-2xl z-[9999] flex flex-col overflow-hidden text-white font-sans"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide uppercase">Demo Inspector</h2>
              <p className="text-xs text-white/50">Preview Environment</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* WARNING BANNERS */}
        <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-200/80 leading-relaxed">
            <strong className="text-emerald-400">Isolated Demo State.</strong> No changes made here will affect production databases or real user profiles.
          </p>
        </div>

        {/* CONTENT SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* PROFILE SUMMARY */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Active Profile</h3>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Name</span>
                <span className="text-sm font-medium">{profile?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Goal</span>
                <span className="text-sm font-medium capitalize">{profile?.primaryGoal?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">CIBIL</span>
                <span className="text-sm font-medium text-emerald-400">{profile?.creditScore}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Salary</span>
                <span className="text-sm font-medium">₹{(profile?.salary || 0) / 12}/mo</span>
              </div>
            </div>
          </section>

          {/* DATA COUNTS */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Data Volumes</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col">
                <span className="text-2xl font-light">{cards.length}</span>
                <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mt-1">Cards</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col">
                <span className="text-2xl font-light">{transactions.length}</span>
                <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mt-1">Transactions</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col">
                <span className="text-2xl font-light">{offers.length}</span>
                <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mt-1">Offers</span>
              </div>
            </div>
          </section>

          {/* RAW JSON TOGGLE */}
          <section>
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 text-sm font-medium"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-white/50" />
                <span>View Raw JSON State</span>
              </div>
              <span className="text-xs text-white/40">{showRawJson ? 'Hide' : 'Show'}</span>
            </button>
            
            {showRawJson && (
              <div className="mt-2 p-4 bg-black rounded-xl border border-white/10 overflow-x-auto">
                <pre className="text-[10px] leading-relaxed text-emerald-400 font-mono">
                  {JSON.stringify(
                    {
                      profile,
                      cards,
                      transactions,
                      offers,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </section>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-5 border-t border-white/10 bg-black/20 flex flex-col gap-3">
          <button
            onClick={handleReset}
            className="w-full py-3.5 px-4 bg-white/10 hover:bg-white/20 active:bg-white/5 transition-colors rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Demo State
          </button>
          
          <button
            onClick={handleExit}
            className="w-full py-3.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
          >
            <X className="w-4 h-4" />
            Exit Demo Mode
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

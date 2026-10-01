import React, { useEffect, useState } from 'react';
import { seedDemoStore } from './demoData';
import { useDashboardStore } from '../dashboard/store/dashboardStore';
import { usePlanStore } from '../plan/store/planStore';
import { DemoDataInspector } from './DemoDataInspector';
import { Database } from 'lucide-react';

export const DemoContext = React.createContext(false);
export const useIsDemo = () => React.useContext(DemoContext);

export function DemoAppProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Seed the store with our deterministic fake data
    seedDemoStore();
    
    // 2. Explicitly nullify the Supabase client in the store
    // This physically prevents any store action (e.g., deleteUserCard)
    // from communicating with the production backend.
    useDashboardStore.getState().setSupabaseClient(null);

    // 3. Set Plan store to demo mode (memory only)
    usePlanStore.getState().setDemoMode(true);
    usePlanStore.getState().setSupabaseClient(null);

    setIsReady(true);

    return () => {
      // Clear out demo data on unmount
      useDashboardStore.getState()._reset();
      usePlanStore.getState().setDemoMode(false);
    };
  }, []);

  if (!isReady) {
    return <div className="min-h-[100dvh] w-full bg-[#111111]" />;
  }

  return (
    <DemoContext.Provider value={true}>
      {/* SUBTLE DEMO BADGE */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
        <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
          <Database className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Demo Profile</span>
        </div>
      </div>

      {children}
      
      <DemoDataInspector />
    </DemoContext.Provider>
  );
}

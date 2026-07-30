import { useDashboardStore } from '../../store/dashboardStore';
import { AmbientCanvas } from './AmbientCanvas';
import { DashboardHeroV4 } from './DashboardHeroV4';
import { TaqdeerSurfaceV4 } from './TaqdeerSurfaceV4';
import { AICuratedWallet } from './AICuratedWallet';
import { ActionableStream } from './ActionableStream';
import { SecondaryMetrics } from './SecondaryMetrics';
import { motion } from 'framer-motion';

interface CoreDashboardProps {
  onNavigateToTab: (tabId: string) => void;
}

export function CoreDashboard({ onNavigateToTab }: CoreDashboardProps) {
  const profile = useDashboardStore((s) => s.profile);
  const userCards = useDashboardStore((s) => s.userCards);

  const userName = profile?.name?.split(' ')[0] || 'User';

  const handleAskTaqdeer = (query: string) => {
    const event = new CustomEvent('NAVIGATE_TAB', { detail: 'taqdeer' });
    window.dispatchEvent(event);
  };

  // V4 Empty State (Narrative-driven)
  if (userCards.length === 0) {
    return (
      <div className="relative min-h-screen">
        <AmbientCanvas />
        <div className="max-w-4xl mx-auto w-full pt-32 pb-20 px-4 md:px-0 flex flex-col items-start justify-center min-h-[70vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-lg text-text-secondary mb-8">Hello, {userName}.</p>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-display font-medium text-text-primary tracking-tight leading-[1.1] mb-8">
              Let's build your<br />
              <span className="font-extrabold">first wallet.</span>
            </h1>
            <p className="text-xl text-text-muted max-w-lg leading-relaxed mb-16">
              Add your existing credit cards to unlock intelligent recommendations, or let TAQDEER find the perfect first card for you.
            </p>
            <button 
              onClick={() => onNavigateToTab('discover')}
              className="text-lg font-medium text-text-primary hover:text-brand-emerald transition-colors flex items-center gap-3 group"
            >
              Start discovering
              <span className="w-10 h-10 rounded-full border border-border-subtle  flex items-center justify-center group-hover:border-brand-emerald/50 transition-colors">
                →
              </span>
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // V4 Full Experience
  return (
    <div className="relative min-h-screen w-full">
      <AmbientCanvas />
      
      <div className="max-w-5xl mx-auto w-full pb-32">
        {/* Emotional Hero */}
        <DashboardHeroV4 
          userName={userName}
          potentialSavings={24860}
          percentile={91}
        />
        
        {/* Living AI Surface */}
        <TaqdeerSurfaceV4 onAsk={handleAskTaqdeer} />
        
        {/* AI Curated Wallet Experience (V5) */}
        <AICuratedWallet 
          cards={userCards}
          onOpenWallet={() => onNavigateToTab('wallet')}
          onAskTaqdeer={handleAskTaqdeer}
          context="Swiggy"
        />

        {/* Actionable Stream */}
        <ActionableStream />
        
        {/* Secondary Metrics */}
        <SecondaryMetrics />
      </div>
    </div>
  );
}

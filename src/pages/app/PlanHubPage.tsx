import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  PlaneTakeoff, 
  Heart, 
  Film, 
  Gift, 
  Utensils,
  ArrowRight,
  Map as MapIcon
} from 'lucide-react';
import { PageContainer } from '../../components/shared/PageContainer';
import { cn } from '../../lib/utils';
import { usePlanStore } from '../../features/plan/store/planStore';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';

type PlanStatus = 'FULLY_ACTIVE' | 'UI_READY';

interface PlanCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: PlanStatus;
  path: string;
  gradient: string;
  ctaText: string;
}

const CATEGORIES: PlanCategory[] = [
  {
    id: 'trip',
    title: 'PLAN A TRIP',
    description: 'Build the whole journey.',
    icon: PlaneTakeoff,
    status: 'FULLY_ACTIVE',
    path: '/app/plan/trip',
    gradient: 'from-emerald-500 to-teal-500',
    ctaText: 'EXPLORE'
  },
  {
    id: 'date',
    title: 'ROMANTIC DATE',
    description: 'Plan something worth remembering.',
    icon: Heart,
    status: 'UI_READY',
    path: '/app/plan/date',
    gradient: 'from-rose-400 to-red-500',
    ctaText: 'BUILD A DATE'
  },
  {
    id: 'movie',
    title: 'MOVIE PLAN',
    description: 'Tickets, food and the rest of the night.',
    icon: Film,
    status: 'UI_READY',
    path: '/app/plan/movie',
    gradient: 'from-indigo-400 to-purple-500',
    ctaText: 'PLAN YOUR NIGHT'
  },
  {
    id: 'weekend',
    title: 'WEEKEND ESCAPE',
    description: 'Find a break without the planning headache.',
    icon: MapIcon,
    status: 'UI_READY',
    path: '/app/plan/weekend',
    gradient: 'from-amber-400 to-orange-500',
    ctaText: 'EXPLORE'
  },
  {
    id: 'food',
    title: 'FOOD DAY',
    description: 'Build your perfect food itinerary.',
    icon: Utensils,
    status: 'UI_READY',
    path: '/app/plan/food',
    gradient: 'from-orange-400 to-red-500',
    ctaText: 'EXPLORE'
  },
  {
    id: 'birthday',
    title: 'BIRTHDAY / OCCASION',
    description: 'Make the whole day work.',
    icon: Gift,
    status: 'UI_READY',
    path: '/app/plan/occasion',
    gradient: 'from-blue-400 to-indigo-500',
    ctaText: 'EXPLORE'
  }
];

export default function PlanHubPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { loadAllSessions, activeSessions } = usePlanStore();
  const profile = useDashboardStore(state => state.profile);
  const [history, setHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (profile?.id) {
      loadAllSessions(profile.id).then(sessions => {
        setHistory(sessions);
      });
    }
  }, [profile?.id, loadAllSessions]);

  // Combine memory sessions and loaded sessions, prioritize memory ones as they are more up to date
  const combinedSessions = React.useMemo(() => {
    const map = new Map<string, any>();
    history.forEach(s => map.set(s.id, s));
    Object.values(activeSessions).forEach(s => map.set(s.id, s));
    return Array.from(map.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [history, activeSessions]);

  const activePlans = combinedSessions.filter(s => s.status === 'draft' || s.status === 'generating');
  const readyPlans = combinedSessions.filter(s => s.status === 'ready');

  const renderDraftTitle = (session: any) => {
    if (session.planType === 'trip') {
      const dest = session.draft?.destination?.name || 'Unknown Destination';
      const origin = session.draft?.origin?.name || 'Unknown Origin';
      if (session.draft?.destination) return dest;
      if (session.draft?.origin) return `${origin} to ...`;
      return 'New Trip Plan';
    }
    if (session.planType === 'romantic_date') {
      return session.draft?.location ? `Date in ${session.draft.location}` : 'New Date Plan';
    }
    return `New ${session.planType.replace('_', ' ')} Plan`;
  };

  const renderDraftDetails = (session: any) => {
    if (session.planType === 'trip') {
      const ppl = session.draft?.travelers ? `${session.draft.travelers} people` : '';
      const mode = session.draft?.transportMode ? `· ${session.draft.transportMode.toLowerCase()}` : '';
      return `${ppl} ${mode}`;
    }
    if (session.planType === 'romantic_date') {
      return session.draft?.vibe || '';
    }
    return '';
  };

  return (
    <PageContainer
      eyebrow="RenoCred Plan"
      title="WHAT ARE WE PLANNING?"
      subtitle="Build the whole plan. We'll handle the details."
      className="max-w-5xl mx-auto pb-24"
    >
      {activePlans.length > 0 && (
        <div className="mt-8 mb-12">
          <h2 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">Continue Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePlans.map(session => (
              <div key={session.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex justify-between items-center group cursor-pointer hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all" onClick={() => navigate({ pathname: CATEGORIES.find(c => c.id === session.planType || (c.id === 'date' && session.planType === 'romantic_date'))?.path || '/app/plan/trip', search: `?session=${session.id}` })}>
                <div>
                  <h3 className="font-display font-medium text-lg text-gray-900 mb-1 uppercase tracking-tight">{renderDraftTitle(session)}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{renderDraftDetails(session)}</span>
                    {renderDraftDetails(session) && <span>·</span>}
                    <span>Last saved: {new Date(session.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-900 text-xs font-bold tracking-wider uppercase group-hover:bg-gray-900 group-hover:text-white transition-colors">
                  Continue
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {readyPlans.length > 0 && (
        <div className="mt-8 mb-12">
          <h2 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">Ready Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyPlans.map(session => (
              <div key={session.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex justify-between items-center group cursor-pointer hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all" onClick={() => navigate({ pathname: CATEGORIES.find(c => c.id === session.planType || (c.id === 'date' && session.planType === 'romantic_date'))?.path || '/app/plan/trip', search: `?session=${session.id}` })}>
                <div>
                  <h3 className="font-display font-medium text-lg text-gray-900 mb-1 uppercase tracking-tight">{renderDraftTitle(session)}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{renderDraftDetails(session)}</span>
                    {renderDraftDetails(session) && <span>·</span>}
                    <span>Ready</span>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-900 text-xs font-bold tracking-wider uppercase group-hover:bg-gray-900 group-hover:text-white transition-colors">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4 mt-12">Start a New Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat, idx) => {
          const isActive = cat.status === 'FULLY_ACTIVE' || cat.status === 'UI_READY';
          
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => {
                if (isActive) {
                  const newParams = new URLSearchParams(location.search);
                  newParams.delete('session');
                  newParams.set('new', 'true');
                  navigate({ pathname: cat.path, search: newParams.toString() });
                }
              }}
              disabled={!isActive}
              className={cn(
                "relative group w-full text-left rounded-3xl p-6 h-48 overflow-hidden transition-all duration-300",
                isActive 
                  ? "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer hover:-translate-y-1" 
                  : "bg-gray-50/50 cursor-not-allowed opacity-80"
              )}
            >
              {/* Background Gradient Blob */}
              {isActive && (
                <div className={cn(
                  "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[50px] opacity-20 bg-gradient-to-br transition-opacity group-hover:opacity-30",
                  cat.gradient
                )} />
              )}

              <div className="flex flex-col h-full justify-between relative z-10">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    isActive ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
                  )}>
                    <cat.icon size={24} strokeWidth={1.5} />
                  </div>
                  
                  {isActive ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-widest text-gray-500 group-hover:text-gray-900 transition-colors uppercase">
                        {cat.ctaText}
                      </span>
                      <ArrowRight 
                        size={20} 
                        className="text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" 
                        strokeWidth={1.5} 
                      />
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 bg-gray-200 px-3 py-1.5 rounded-full">
                      COMING NEXT
                    </span>
                  )}
                </div>

                <div>
                  <h3 className={cn(
                    "text-xl font-display font-medium tracking-tight mt-4",
                    isActive ? "text-gray-900" : "text-gray-500"
                  )}>
                    {cat.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {cat.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </PageContainer>
  );

}

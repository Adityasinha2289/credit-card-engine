import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageContainer } from '../../../components/shared/PageContainer';
import { usePlanStore } from '../../../features/plan/store/planStore';
import { TaqdeerPlanningBrain } from '../../../features/plan/lib/TaqdeerPlanningBrain';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { AdaptivePlanningShell } from '../../../features/plan/components/shared/AdaptivePlanningShell';
import { PlaceSearchInput } from '../../../features/plan/components/trip-planner/PlaceSearchInput';
import { usePlanningProviderRegistry } from '../../../features/plan/providers/PlanningProviderRegistry';

export default function OccasionPlannerPage() {
  const profile = useDashboardStore(state => state.profile);
  const { currentSessionId, activeSessions, startOrResumeSession, updateDraft, setPhase, completePlan } = usePlanStore();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const requestedSessionId = searchParams.get('session');
  const isNewRequested = searchParams.get('new') === 'true';

  const session = currentSessionId ? activeSessions[currentSessionId] : null;
  const currentPlanType = session?.planType;

  useEffect(() => {
    if (isNewRequested) {
      const newId = startOrResumeSession(profile?.id || 'anon', 'occasion');
      window.history.replaceState({}, '', `/app/plan/occasion?session=${newId}`);
    } else if (!currentSessionId || 
        (requestedSessionId && currentSessionId !== requestedSessionId) ||
        (!requestedSessionId && currentPlanType !== 'occasion')) {
      const newId = startOrResumeSession(profile?.id || 'anon', 'occasion', requestedSessionId || undefined);
      if (!requestedSessionId) {
        window.history.replaceState({}, '', `/app/plan/occasion?session=${newId}`);
      }
    }
  }, [currentSessionId, requestedSessionId, isNewRequested, profile, startOrResumeSession, currentPlanType]);

  const providerRegistry = usePlanningProviderRegistry();

  const generatePlan = async () => {
    if (!session) return;
    setPhase(session.id, 3);
    const draft = session.draft;
    
    let providerError = null;
    let variants: any[] = [];
    let activityOptions: any[] = [];
    let foodOptions: any[] = [];
    const isDemoMode = usePlanStore.getState().isDemoMode;

    try {
      if (draft.location) {
        const activityProvider = providerRegistry.getActivityProvider();
        const foodProvider = providerRegistry.getFoodProvider();
        const [aRes, fRes] = await Promise.all([
          activityProvider.searchActivities(draft.location),
          foodProvider.searchFood(draft.location)
        ]);
        activityOptions = aRes;
        foodOptions = fRes;
      }
    } catch (e: any) {
      providerError = e.message;
    }

    if (!isDemoMode && !providerError) {
      providerError = "LIVE OCCASION DATA UNAVAILABLE: Venue and event integrations are not currently active in production.";
    } 
    
    if (!providerError) {
      const selectedVenue = activityOptions[0] || { name: 'Premium Banquet Hall' };
      const selectedCaterer = foodOptions[0] || { name: 'Gourmet Caterers' };

      variants = [
        {
          id: 'OCCASION_PERFECT',
          name: `The Perfect ${draft.occasion || 'Event'}`,
          description: `A memorable celebration in ${draft.location?.name || 'your city'}.`,
          budget: {
            estimatedTotal: 25000,
            perPerson: 2500,
            food: 15000,
            activities: 10000,
            potentialOfferValue: 2000,
          },
          itinerary: [
            {
              dayNumber: 1,
              date: draft.date || 'Today',
              events: [
                { time: '18:00', title: `Guests Arrive at ${selectedVenue.name}`, type: 'ACTIVITY' },
                { time: '19:30', title: 'Main Event / Celebration', type: 'ACTIVITY' },
                { time: '20:30', title: `Dinner Served by ${selectedCaterer.name}`, type: 'FOOD' },
                { time: '22:00', title: 'Wrap up', type: 'ACTIVITY' }
              ]
            }
          ]
        }
      ];
    }
    
    const finalResult = {
      draft,
      variants,
      providerError,
      isDemoMode,
      generatedAt: new Date().toISOString()
    };
    completePlan(session.id, finalResult);
  };

  const nextQuestion = session ? TaqdeerPlanningBrain.determineNextQuestion(session, profile) : null;

  useEffect(() => {
    if (session && !nextQuestion && session.status !== 'ready' && session.currentPhase !== 3) {
      generatePlan();
    }
  }, [nextQuestion, session?.status, session?.currentPhase]);

  if (!session) return <div className="bg-[#111] h-screen" />;

  if (session.status === 'ready' && session.selectedPlan) {
    if (session.selectedPlan.providerError) {
      return (
        <PageContainer hideHeader className="max-w-3xl mx-auto pb-safe">
          <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-3xl font-display font-medium text-gray-900 mb-4">LIVE DATA UNAVAILABLE</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {session.selectedPlan.providerError}
            </p>
            <button 
              className="px-8 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
              onClick={() => setPhase(session.id, 1)}
            >
              Modify Draft
            </button>
          </div>
        </PageContainer>
      );
    }

    const v = session.selectedPlan.variants[0];
    const draft = session.selectedPlan.draft;
    
    return (
      <PageContainer hideHeader className="max-w-3xl mx-auto pb-safe">
        <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-display font-medium text-gray-900 mb-2">YOUR {draft.occasion ? draft.occasion.toUpperCase() : 'OCCASION'} PLAN</h1>
          <p className="text-gray-500 mb-8 uppercase tracking-wide text-sm font-medium">{draft.location?.name || ''} • {draft.date}</p>
          
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
            <h2 className="text-xl font-bold mb-6">{v.name}</h2>
            <div className="flex justify-between items-end mb-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{session.selectedPlan.isDemoMode ? 'DEMO TOTAL' : 'CALCULATED TOTAL'}</p>
                <p className="text-4xl font-display font-medium text-gray-900">₹{v.budget.estimatedTotal.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 mb-1">Per Person (Est. 10)</p>
                <p className="text-xl font-medium text-gray-900">₹{v.budget.perPerson.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between"><span className="text-gray-600">Venue & Decor <span className="text-xs uppercase ml-1 px-2 py-0.5 rounded-md bg-gray-100">{session.selectedPlan.isDemoMode ? 'Demo' : 'Estimate'}</span></span><span className="font-medium text-gray-900">₹{v.budget.activities.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Food & Drink <span className="text-xs uppercase ml-1 px-2 py-0.5 rounded-md bg-gray-100">{session.selectedPlan.isDemoMode ? 'Demo' : 'Estimate'}</span></span><span className="font-medium text-gray-900">₹{v.budget.food.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-emerald-600 font-medium pt-2 border-t border-gray-50"><span>Offers / Rewards <span className="text-xs uppercase ml-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">{session.selectedPlan.isDemoMode ? 'Demo' : 'Live'}</span></span><span>-₹{v.budget.potentialOfferValue.toLocaleString('en-IN')}</span></div>
            </div>
          </div>

          <h3 className="font-display text-xl font-medium mb-4">Itinerary</h3>
          <div className="space-y-4">
            {v.itinerary[0].events.map((ev: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-start bg-white p-4 rounded-2xl border border-gray-100">
                <div className="text-sm font-bold text-gray-400 mt-1">{ev.time}</div>
                <div>
                  <div className="font-medium text-gray-900">{ev.title}</div>
                  <div className="text-sm text-gray-500">{ev.type}</div>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </PageContainer>
    );
  }

  if (session.currentPhase === 3 && session.status !== 'ready') {
    return (
      <AdaptivePlanningShell session={session}>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-3xl font-display font-medium text-gray-900 mb-4 animate-pulse">FINDING VENUES</h2>
          <p className="text-gray-500 mb-8 text-center max-w-md">Looking for the perfect spot for your occasion...</p>
        </div>
      </AdaptivePlanningShell>
    );
  }

  const renderQuestion = () => {
    if (!nextQuestion) return null;
    const { id } = nextQuestion;
    const { draft } = session;

    return (
      <div className="h-full flex flex-col justify-between pt-8 animate-in fade-in slide-in-from-bottom-4">
        <div>
          <h2 className="text-3xl font-display font-medium mb-8 uppercase">{nextQuestion.label}</h2>
          
          {id === 'occasion_type' && (
            <input 
              type="text" 
              placeholder="e.g. 25th Birthday, Anniversary" 
              className="w-full text-2xl font-display placeholder:text-gray-300 border-none focus:ring-0 px-0 bg-transparent mb-8 outline-none"
              defaultValue={draft.occasion || ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  updateDraft(session.id, { occasion: e.currentTarget.value });
                  setPhase(session.id, 1);
                }
              }}
              autoFocus
            />
          )}

          {id === 'occasion_city' && (
            <div className="mb-8">
              <PlaceSearchInput 
                placeholder="Enter city" 
                initialPlace={draft.location}
                onSelect={(place) => {
                  updateDraft(session.id, { location: place });
                }}
              />
              <button 
                className="mt-8 px-8 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors w-full disabled:opacity-50"
                disabled={!draft.location}
                onClick={() => setPhase(session.id, 2)}
              >
                Continue
              </button>
            </div>
          )}

        </div>
      </div>
    );
  };

  return (
    <AdaptivePlanningShell session={session} totalPhases={2}>
      {renderQuestion()}
    </AdaptivePlanningShell>
  );
}

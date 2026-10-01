import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageContainer } from '../../../components/shared/PageContainer';
import { usePlanStore } from '../../../features/plan/store/planStore';
import { TaqdeerPlanningBrain } from '../../../features/plan/lib/TaqdeerPlanningBrain';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { AdaptivePlanningShell } from '../../../features/plan/components/shared/AdaptivePlanningShell';
import { PlaceSearchInput } from '../../../features/plan/components/trip-planner/PlaceSearchInput';
import { usePlanningProviderRegistry } from '../../../features/plan/providers/PlanningProviderRegistry';

export default function WeekendPlannerPage() {
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
      const newId = startOrResumeSession(profile?.id || 'anon', 'weekend_escape');
      window.history.replaceState({}, '', `/app/plan/weekend?session=${newId}`);
    } else if (!currentSessionId || 
        (requestedSessionId && currentSessionId !== requestedSessionId) ||
        (!requestedSessionId && currentPlanType !== 'weekend_escape')) {
      const newId = startOrResumeSession(profile?.id || 'anon', 'weekend_escape', requestedSessionId || undefined);
      if (!requestedSessionId) {
        window.history.replaceState({}, '', `/app/plan/weekend?session=${newId}`);
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
    let hotels: any[] = [];
    let activities: any[] = [];
    let food: any[] = [];
    const isDemoMode = usePlanStore.getState().isDemoMode;

    try {
      if (draft.origin) {
        // Just get some data using origin as a proxy for destination in demo mode
        const hotelProvider = providerRegistry.getHotelProvider();
        const activityProvider = providerRegistry.getActivityProvider();
        const foodProvider = providerRegistry.getFoodProvider();
        
        const [hRes, aRes, fRes] = await Promise.all([
          hotelProvider.searchHotels({ destination: draft.origin, checkIn: '', checkOut: '', travelers: 2, preference: '3_STAR' }),
          activityProvider.searchActivities(draft.origin),
          foodProvider.searchFood(draft.origin)
        ]);
        hotels = hRes;
        activities = aRes;
        food = fRes;
      }
    } catch (e: any) {
      providerError = e.message;
    }

    if (!isDemoMode && !providerError) {
      providerError = "LIVE WEEKEND DATA UNAVAILABLE: Weekend integrations are not currently active in production.";
    } 
    
    if (!providerError) {
      const selectedHotel = hotels[0] || { name: 'Relaxing Resort' };
      const selectedActivity = activities[0] || { name: 'Local exploration' };
      const selectedFood = food[0] || { name: 'Nice Dinner' };

      variants = [
        {
          id: 'WEEKEND_ESCAPE',
          name: 'The Perfect Getaway',
          description: `A ${draft.vibe || 'relaxing'} escape from ${draft.origin?.name || 'your city'}.`,
          budget: {
            estimatedTotal: 15000,
            perPerson: 7500,
            intercityTransport: 3000,
            accommodation: 8000,
            food: 3000,
            activities: 1000,
            potentialOfferValue: 800,
          },
          itinerary: [
            {
              dayNumber: 1,
              date: 'Saturday',
              events: [
                { time: '08:00', title: `Depart ${draft.origin?.name || 'City'}`, type: 'TRANSPORT' },
                { time: '12:00', title: 'Arrive at destination & Lunch', type: 'FOOD' },
                { time: '14:00', title: `Check in to ${selectedHotel.name}`, type: 'STAY' },
                { time: '16:00', title: selectedActivity.name, type: 'ACTIVITY' },
                { time: '19:30', title: `Dinner at ${selectedFood.name}`, type: 'FOOD' }
              ]
            },
            {
              dayNumber: 2,
              date: 'Sunday',
              events: [
                { time: '09:00', title: `Breakfast at ${selectedHotel.name}`, type: 'FOOD' },
                { time: '11:00', title: 'Check out', type: 'STAY' },
                { time: '12:00', title: 'One last activity', type: 'ACTIVITY' },
                { time: '15:00', title: 'Depart for Home', type: 'TRANSPORT' }
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

  if (!session) return <div className="bg-[#111] h-screen" />; // Loading...

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
          <h1 className="text-3xl font-display font-medium text-gray-900 mb-2">YOUR WEEKEND PLAN</h1>
          <p className="text-gray-500 mb-8 uppercase tracking-wide text-sm font-medium">FROM {draft.origin?.name || ''} • {draft.vibe}</p>
          
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
            <h2 className="text-xl font-bold mb-6">{v.name}</h2>
            <div className="flex justify-between items-end mb-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{session.selectedPlan.isDemoMode ? 'DEMO TOTAL' : 'CALCULATED TOTAL'}</p>
                <p className="text-4xl font-display font-medium text-gray-900">₹{v.budget.estimatedTotal.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 mb-1">Per Person</p>
                <p className="text-xl font-medium text-gray-900">₹{v.budget.perPerson.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between"><span className="text-gray-600">Travel <span className="text-xs uppercase ml-1 px-2 py-0.5 rounded-md bg-gray-100">{session.selectedPlan.isDemoMode ? 'Demo' : 'Estimate'}</span></span><span className="font-medium text-gray-900">₹{v.budget.intercityTransport.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Stay <span className="text-xs uppercase ml-1 px-2 py-0.5 rounded-md bg-gray-100">{session.selectedPlan.isDemoMode ? 'Demo' : 'Estimate'}</span></span><span className="font-medium text-gray-900">₹{v.budget.accommodation.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Food <span className="text-xs uppercase ml-1 px-2 py-0.5 rounded-md bg-gray-100">{session.selectedPlan.isDemoMode ? 'Demo' : 'Estimate'}</span></span><span className="font-medium text-gray-900">₹{v.budget.food.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Activities <span className="text-xs uppercase ml-1 px-2 py-0.5 rounded-md bg-gray-100">{session.selectedPlan.isDemoMode ? 'Demo' : 'Estimate'}</span></span><span className="font-medium text-gray-900">₹{v.budget.activities.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-emerald-600 font-medium pt-2 border-t border-gray-50"><span>Offers / Rewards <span className="text-xs uppercase ml-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">{session.selectedPlan.isDemoMode ? 'Demo' : 'Live'}</span></span><span>-₹{v.budget.potentialOfferValue.toLocaleString('en-IN')}</span></div>
            </div>
          </div>

          <h3 className="font-display text-xl font-medium mb-4">Itinerary</h3>
          <div className="space-y-4">
            {v.itinerary.map((day: any, dIdx: number) => (
              <div key={dIdx} className="mb-6">
                <h4 className="font-bold text-gray-500 text-sm tracking-widest uppercase mb-3">{day.date}</h4>
                <div className="space-y-3">
                  {day.events.map((ev: any, idx: number) => (
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
          <h2 className="text-3xl font-display font-medium text-gray-900 mb-4 animate-pulse">FINDING WEEKEND DESTINATIONS</h2>
          <p className="text-gray-500 mb-8 text-center max-w-md">Scanning locations matching your vibe...</p>
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
          
          {id === 'weekend_origin' && (
            <div className="mb-8">
              <PlaceSearchInput 
                placeholder="Enter your starting city" 
                initialPlace={draft.origin}
                onSelect={(place) => {
                  updateDraft(session.id, { origin: place });
                }}
              />
              <button 
                className="mt-8 px-8 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors w-full disabled:opacity-50"
                disabled={!draft.origin}
                onClick={() => setPhase(session.id, 1)}
              >
                Continue
              </button>
            </div>
          )}

          {id === 'weekend_vibe' && (
            <div className="flex flex-wrap gap-3">
              {['Mountains / Hills', 'Beach / Coastal', 'Forest / Nature', 'Desert / Sand', 'Heritage / History', 'Luxury Resort', 'City Break', 'Adventure'].map(v => (
                <button
                  key={v}
                  onClick={() => {
                    updateDraft(session.id, { vibe: v });
                    setPhase(session.id, 2);
                  }}
                  className="px-6 py-3 rounded-full border-2 transition-all font-medium border-gray-200 text-gray-600 hover:border-gray-300"
                >
                  {v}
                </button>
              ))}
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

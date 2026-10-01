import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageContainer } from '../../components/shared/PageContainer';
import { usePlanStore } from '../../features/plan/store/planStore';
import { TaqdeerPlanningBrain } from '../../features/plan/lib/TaqdeerPlanningBrain';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { AdaptivePlanningShell } from '../../features/plan/components/shared/AdaptivePlanningShell';

import { StepOrigin } from '../../features/plan/components/trip-planner/StepOrigin';
import { StepDestination } from '../../features/plan/components/trip-planner/StepDestination';
import { StepDates } from '../../features/plan/components/trip-planner/StepDates';
import { StepTravelers } from '../../features/plan/components/trip-planner/StepTravelers';
import { StepTransport } from '../../features/plan/components/trip-planner/StepTransport';
import { StepStay } from '../../features/plan/components/trip-planner/StepStay';
import { StepExperience } from '../../features/plan/components/trip-planner/StepExperience';

import { usePlanningProviderRegistry } from '../../features/plan/providers/PlanningProviderRegistry';
import { calculateBudget } from '../../features/plan/lib/budgetEngine';
import { buildItinerary } from '../../features/plan/lib/itineraryEngine';
import { PlanVariant } from '../../features/plan/types';

export default function TripPlannerPage() {
  const profile = useDashboardStore(state => state.profile);
  const { currentSessionId, activeSessions, startOrResumeSession, updateDraft, setPhase, completePlan, isDemoMode } = usePlanStore();
  const providerRegistry = usePlanningProviderRegistry();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const requestedSessionId = searchParams.get('session');
  const isNewRequested = searchParams.get('new') === 'true';

  const session = currentSessionId ? activeSessions[currentSessionId] : null;
  const currentPlanType = session?.planType;

  useEffect(() => {
    if (isNewRequested) {
      const newId = startOrResumeSession(profile?.id || 'anon', 'trip');
      // Update URL to reflect the new session and remove 'new' param
      window.history.replaceState({}, '', `/app/plan/trip?session=${newId}`);
    } else if (!currentSessionId || 
        (requestedSessionId && currentSessionId !== requestedSessionId) ||
        (!requestedSessionId && currentPlanType !== 'trip')) {
      const newId = startOrResumeSession(profile?.id || 'anon', 'trip', requestedSessionId || undefined);
      if (!requestedSessionId) {
        window.history.replaceState({}, '', `/app/plan/trip?session=${newId}`);
      }
    }
  }, [currentSessionId, requestedSessionId, isNewRequested, profile, startOrResumeSession, currentPlanType]);

  const nextQuestion = session ? TaqdeerPlanningBrain.determineNextQuestion(session, profile) : null;

  const generatePlanRef = React.useRef(0);

  // If Taqdeer says we have everything needed, generate the plan
  const generatePlan = async () => {
    if (!session) return;
    setPhase(session.id, 4); // Generating phase visually
    const currentGenId = ++generatePlanRef.current;
    
    const draft = session.draft;
    const prevPlan = session.selectedPlan;
    const prevDraft = prevPlan?.draft || {};
    
    // Dependency Analysis
    const originChanged = prevDraft.origin?.placeId !== draft.origin?.placeId;
    const destChanged = prevDraft.destination?.placeId !== draft.destination?.placeId;
    const modeChanged = prevDraft.transportMode !== draft.transportMode;
    const stayPrefChanged = prevDraft.stayPreference !== draft.stayPreference;
    const datesChanged = prevDraft.departureDate !== draft.departureDate || prevDraft.returnDate !== draft.returnDate;
    const travelersChanged = prevDraft.travelers !== draft.travelers;
    const activitiesChanged = JSON.stringify(prevDraft.activityPreferences) !== JSON.stringify(draft.activityPreferences);

    const needRoute = originChanged || destChanged || modeChanged;
    const needFlights = originChanged || destChanged || datesChanged || travelersChanged || modeChanged;
    const needHotels = destChanged || datesChanged || travelersChanged || stayPrefChanged;
    
    let transportOptions: any[] = needFlights ? [] : (prevPlan?.transportOptions || []);
    let stayOptions: any[] = needHotels ? [] : (prevPlan?.stayOptions || []);
    let routeInfo = needRoute ? { distanceKm: 0, durationMinutes: 0 } : { distanceKm: prevPlan?.routeDistanceKm || 0, durationMinutes: prevPlan?.routeDurationMinutes || 0 };
    let providerError = null;

    try {
      const isRoadTrip = ['BUS', 'CAB', 'MY_OWN_VEHICLE'].includes(draft.transportMode || '');
      if (needRoute && draft.origin && draft.destination && isRoadTrip) {
        console.log('[PLAN FETCH] provider=route');
        const routeProvider = providerRegistry.getRouteProvider();
        routeInfo = await routeProvider.getRoute({
          origin: draft.origin,
          destination: draft.destination,
          mode: 'DRIVE'
        });
      } else if (needRoute) {
        // If not a road trip, we don't calculate road route distances
        console.log('[PLAN FETCH] provider=route SKIPPED (not a road trip)');
      } else {
        console.log('[PLAN CACHE HIT] provider=route');
      }

      if (needFlights) {
        if (draft.transportMode === 'FLIGHT') {
          console.log('[PLAN FETCH] provider=flights');
          const flightProvider = providerRegistry.getFlightProvider();
          transportOptions = await flightProvider.searchFlights({} as any);
        } else {
          console.log('[PLAN FETCH] provider=rail');
          const railProvider = providerRegistry.getRailProvider();
          transportOptions = await railProvider.searchTrains({} as any);
        }
      } else {
        console.log('[PLAN CACHE HIT] provider=flights');
      }

      if (needHotels) {
        console.log('[PLAN FETCH] provider=hotels reason=dependenciesChanged');
        const hotelProvider = providerRegistry.getHotelProvider();
        stayOptions = await hotelProvider.searchHotels({ preference: draft.stayPreference || '3_STAR' } as any);
      } else {
        console.log('[PLAN CACHE HIT] provider=hotels');
      }
    } catch (e: any) {
      providerError = e.message;
    }

    if (currentGenId !== generatePlanRef.current) {
      console.log('[PLAN ABORT] generation superseded');
      return;
    }

    const tOpt = transportOptions[0] || {} as any;
    const sOpt = stayOptions[0] || {} as any;
    
    // In Production mode, Activity and Food providers are DEMO ONLY.
    // They must not return fabricated data.
    let activities: any[] = [];
    if (isDemoMode) {
      activities = activitiesChanged ? (draft.activityPreferences || []).map((a: string, i: number) => ({
        id: `act_${i}`,
        name: `${a} Experience`,
        category: a,
        distanceKm: 5,
        estimatedTravelTimeMinutes: 20,
        estimatedTransportCost: 150,
        durationMinutes: 120,
        entryCost: 500,
        provider: 'Mock',
        source: 'Mock',
        fetchedAt: new Date().toISOString()
      })) : (prevPlan?.activities || []);
    }

    const generateVariant = (id: string, name: string, desc: string, tOpt: any, sOpt: any, acts: any[]): PlanVariant => {
      const b = calculateBudget(draft, tOpt, sOpt, acts, [], isDemoMode);
      const it = buildItinerary(draft, tOpt, sOpt, acts);
      return {
        id, name, description: desc, transportOption: tOpt, stayOption: sOpt,
        budget: b, itinerary: it, paymentStrategy: [], appliedOffers: []
      };
    };

    const sortedTransports = [...transportOptions].sort((a, b) => (a.price || 0) - (b.price || 0));
    const sortedStays = [...stayOptions].sort((a, b) => (a.totalStayPrice || 0) - (b.totalStayPrice || 0));

    const getMid = (arr: any[]) => arr[Math.floor((arr.length - 1) / 2)] || arr[0] || {} as any;
    const getFirst = (arr: any[]) => arr[0] || {} as any;
    const getLast = (arr: any[]) => arr[arr.length - 1] || arr[0] || {} as any;

    const tOptBalanced = getMid(sortedTransports);
    const sOptBalanced = getMid(sortedStays);

    const tOptValue = getFirst(sortedTransports);
    const sOptValue = getFirst(sortedStays);

    const tOptComfort = getLast(sortedTransports);
    const sOptComfort = getLast(sortedStays);

    const variants: PlanVariant[] = [];
    
    // Balanced (Default)
    const variantBalanced = generateVariant('BALANCED', 'BALANCED PLAN', 'A great mix of value and comfort', tOptBalanced, sOptBalanced, activities);
    variants.push(variantBalanced);

    // Value
    const variantValue = generateVariant('VALUE', 'VALUE PLAN', 'Optimized for budget', tOptValue, sOptValue, activities);
    if (tOptValue.id !== tOptBalanced.id || sOptValue.id !== sOptBalanced.id) {
       variants.push(variantValue);
    }

    // Comfort
    const variantComfort = generateVariant('COMFORT', 'COMFORT PLAN', 'Premium experience', tOptComfort, sOptComfort, activities);
    if ((tOptComfort.id !== tOptBalanced.id || sOptComfort.id !== sOptBalanced.id) && (tOptComfort.id !== tOptValue.id || sOptComfort.id !== sOptValue.id)) {
       variants.push(variantComfort);
    }

    const finalResult = {
      draft,
      routeDistanceKm: routeInfo.distanceKm,
      routeDurationMinutes: routeInfo.durationMinutes,
      transportOptions,
      stayOptions,
      localTransfers: [],
      activities,
      foodSuggestions: [],
      partnerOffers: [],
      variants, // fix variants error
      generatedAt: new Date().toISOString(),
      providerError, // store error if any to show in UI
      isDemoMode // store demo mode flag in the plan for UI rendering
    };

    completePlan(session.id, finalResult);
  };

  // If no more questions, trigger generation if not already done
  useEffect(() => {
    if (session && !nextQuestion && session.status !== 'ready' && session.currentPhase !== 4) {
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
          <h1 className="text-3xl font-display font-medium text-gray-900 mb-2">YOUR TRIP PLAN</h1>
          <p className="text-gray-500 mb-8 uppercase tracking-wide text-sm font-medium">{draft.origin?.name} to {draft.destination?.name}</p>
          
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{v.name}</h2>
              {session.selectedPlan.variants.length < 3 && (
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Limited Availability</span>
              )}
            </div>
            <div className="flex justify-between items-end mb-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {session.selectedPlan.isDemoMode ? 'DEMO TOTAL' : 'CALCULATED TOTAL'}
                </p>
                <p className="text-4xl font-display font-medium text-gray-900">₹{v.budget.estimatedTotal.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 mb-1">Per Person</p>
                <p className="text-xl font-medium text-gray-900">₹{v.budget.perPerson.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Travel <span className="text-xs uppercase ml-1 px-2 py-0.5 rounded-md bg-gray-100">{session.selectedPlan.isDemoMode ? 'Demo' : 'Live'}</span></span>
                <span className="font-medium text-gray-900">₹{v.budget.intercityTransport.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stay <span className="text-xs uppercase ml-1 px-2 py-0.5 rounded-md bg-gray-100">{session.selectedPlan.isDemoMode ? 'Demo' : 'Live'}</span></span>
                <span className="font-medium text-gray-900">₹{v.budget.accommodation.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Food <span className="text-xs uppercase ml-1 px-2 py-0.5 rounded-md bg-gray-100">{session.selectedPlan.isDemoMode ? 'Demo' : 'Estimate'}</span></span>
                <span className="font-medium text-gray-900">₹{v.budget.food.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Activities <span className="text-xs uppercase ml-1 px-2 py-0.5 rounded-md bg-gray-100">{session.selectedPlan.isDemoMode ? 'Demo' : 'Estimate'}</span></span>
                <span className="font-medium text-gray-900">₹{v.budget.activities.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium pt-2 border-t border-gray-50">
                <span>Offers / Rewards <span className="text-xs uppercase ml-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">{session.selectedPlan.isDemoMode ? 'Demo' : 'Live'}</span></span>
                <span>-₹{v.budget.potentialOfferValue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          
          {!session.selectedPlan.isDemoMode && (
            <div className="bg-orange-50 text-orange-800 rounded-2xl p-4 text-sm font-medium border border-orange-100 flex gap-3 items-start">
              <span>⚠️</span>
              <p>LIVE ACTIVITY DATA UNAVAILABLE: Activity recommendations and pricing are not currently supported by live providers in Production mode.</p>
            </div>
          )}
        </div>
      </PageContainer>
    );
  }

  if (session.currentPhase === 4 && session.status !== 'ready') {
    return (
      <AdaptivePlanningShell session={session}>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-3xl font-display font-medium text-gray-900 mb-4 animate-pulse">GENERATING PLAN</h2>
          <p className="text-gray-500 mb-8 text-center max-w-md">Consulting Taqdeer planning intelligence...</p>
        </div>
      </AdaptivePlanningShell>
    );
  }

  // Render the current question
  const renderQuestion = () => {
    if (!nextQuestion) return null;

    const key = nextQuestion.id;
    const { draft } = session;

    switch (key) {
      case 'trip_origin':
        return (
          <StepOrigin key={key} initialOrigin={draft.origin} onNext={(val) => { updateDraft(session.id, { origin: val }); setPhase(session.id, 1); }} />
        );
      case 'trip_destination':
        return (
          <StepDestination key={key} initialDestination={draft.destination} originPlaceId={draft.origin?.placeId} onNext={(val) => { updateDraft(session.id, { destination: val }); setPhase(session.id, 1); }} onBack={() => { updateDraft(session.id, { origin: null }) }} />
        );
      case 'trip_dates':
        return (
          <StepDates key={key} initialDeparture={draft.departureDate} initialReturn={draft.returnDate} initialTripType={draft.tripType} onNext={(dep, ret, t) => { updateDraft(session.id, { departureDate: dep, returnDate: ret, tripType: t }); setPhase(session.id, 2); }} onBack={() => { updateDraft(session.id, { destination: null }) }} />
        );
      case 'trip_travelers':
        return (
          <StepTravelers key={key} initialTravelers={draft.travelers} onNext={(val) => { updateDraft(session.id, { travelers: val }); }} onBack={() => { updateDraft(session.id, { departureDate: null, returnDate: null }) }} />
        );
      case 'trip_transport':
        return (
          <StepTransport key={key} initialMode={draft.transportMode} onNext={(val) => { updateDraft(session.id, { transportMode: val }); }} onBack={() => { updateDraft(session.id, { travelers: null }) }} />
        );
      case 'trip_stay':
        return (
          <StepStay key={key} initialPreference={draft.stayPreference} onNext={(val) => { updateDraft(session.id, { stayPreference: val }); setPhase(session.id, 3); }} onBack={() => { updateDraft(session.id, { transportMode: null }) }} />
        );
      case 'trip_activities':
        return (
          <StepExperience key={key} initialActivities={draft.activityPreferences} onNext={(val) => { updateDraft(session.id, { activityPreferences: val }); setPhase(session.id, 4); }} onBack={() => { updateDraft(session.id, { stayPreference: null }) }} />
        );
      default:
        return <div>Unknown question</div>;
    }
  };

  const getTaqdeerContext = () => {
    if (!nextQuestion) return undefined;
    if (nextQuestion.id === 'trip_transport') return 'Taqdeer noticed you have the RenoCred HDFC Travel card. We will optimize for rail and flight combos.';
    return undefined;
  };

  return (
    <AdaptivePlanningShell session={session} totalPhases={4} taqdeerContext={getTaqdeerContext()}>
      {renderQuestion()}
    </AdaptivePlanningShell>
  );
}

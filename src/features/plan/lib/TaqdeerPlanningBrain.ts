import type { AppProfile } from '../../dashboard/types/dashboard.types';
import type { PlanSession, PlanCategory } from '../types';

export interface NextQuestion {
  id: string; // e.g., 'trip_dates', 'trip_origin', 'trip_transport'
  phase: number;
  label: string;
  type: 'dates' | 'location' | 'choice' | 'multi-choice' | 'budget';
  options?: any[];
}

export class TaqdeerPlanningBrain {
  
  /**
   * Main orchestration method: given what we know, what do we ask next?
   */
  static determineNextQuestion(
    session: PlanSession,
    profile: AppProfile | null
  ): NextQuestion | null {
    const draft = session.draft || {};

    if (session.planType === 'trip') {
      return this.determineTripQuestion(draft, profile);
    } else if (session.planType === 'romantic_date') {
      return this.determineDateQuestion(draft, profile);
    } else if (session.planType === 'movie') {
      return this.determineMovieQuestion(draft, profile);
    } else if (session.planType === 'weekend_escape') {
      return this.determineWeekendQuestion(draft, profile);
    } else if (session.planType === 'food_day') {
      return this.determineFoodQuestion(draft, profile);
    } else if (session.planType === 'occasion') {
      return this.determineOccasionQuestion(draft, profile);
    }

    return null;
  }

  // --- TRIP LOGIC ---
  private static determineTripQuestion(draft: any, profile: AppProfile | null): NextQuestion | null {
    // PHASE 1: WHERE + WHEN
    
    // We can infer origin from profile if it's there and explicit.
    // For now, if no origin, ask origin.
    if (!draft.origin) {
      return {
        id: 'trip_origin',
        phase: 1,
        label: 'Where are you starting from?',
        type: 'location'
      };
    }

    if (!draft.destination) {
      return {
        id: 'trip_destination',
        phase: 1,
        label: 'Where do you want to go?',
        type: 'location'
      };
    }

    if (!draft.departureDate || (draft.tripType === 'round-trip' && !draft.returnDate)) {
      return {
        id: 'trip_dates',
        phase: 1,
        label: 'When are you going?',
        type: 'dates'
      };
    }

    // PHASE 2: WHO + HOW + STAY
    if (!draft.travelers) {
      return {
        id: 'trip_travelers',
        phase: 2,
        label: 'How many people are going?',
        type: 'choice'
      };
    }

    if (!draft.transportMode) {
      return {
        id: 'trip_transport',
        phase: 2,
        label: 'How do you want to travel?',
        type: 'choice',
        options: ['FLIGHT', 'TRAIN', 'BUS', 'CAB', 'MY_OWN_VEHICLE']
      };
    }

    if (!draft.stayPreference) {
      return {
        id: 'trip_stay',
        phase: 2,
        label: 'Where do you want to stay?',
        type: 'choice',
        options: ['NO_STAY', 'HOSTEL_GUESTHOUSE', '2_STAR', '3_STAR', '4_STAR', '5_STAR']
      };
    }

    // PHASE 3: EXPERIENCES
    if (!draft.activityPreferences || draft.activityPreferences.length === 0) {
      return {
        id: 'trip_activities',
        phase: 3,
        label: 'What kind of experiences are you looking for?',
        type: 'multi-choice'
      };
    }

    // PHASE 4: DONE (returns null to signal generation phase)
    return null;
  }

  // --- ROMANTIC DATE LOGIC ---
  private static determineDateQuestion(draft: any, profile: AppProfile | null): NextQuestion | null {
    if (!draft.location) return { id: 'date_location', phase: 1, label: 'Where is the date?', type: 'location' };
    if (!draft.date) return { id: 'date_time', phase: 1, label: 'When is it?', type: 'dates' };
    if (!draft.vibe) return { id: 'date_vibe', phase: 2, label: 'What is the vibe?', type: 'choice' };
    if (!draft.budgetPreference) return { id: 'date_budget', phase: 2, label: 'What is your budget?', type: 'budget' };
    return null;
  }

  // --- MOVIE LOGIC ---
  private static determineMovieQuestion(draft: any, profile: AppProfile | null): NextQuestion | null {
    if (!draft.city) return { id: 'movie_city', phase: 1, label: 'Which city?', type: 'location' };
    if (!draft.date) return { id: 'movie_date', phase: 1, label: 'When?', type: 'dates' };
    if (!draft.movieName) return { id: 'movie_name', phase: 2, label: 'Which movie?', type: 'choice' };
    if (!draft.format) return { id: 'movie_format', phase: 2, label: 'Format preference?', type: 'choice' };
    return null;
  }

  // --- WEEKEND ESCAPE LOGIC ---
  private static determineWeekendQuestion(draft: any, profile: AppProfile | null): NextQuestion | null {
    if (!draft.origin) return { id: 'weekend_origin', phase: 1, label: 'Starting from?', type: 'location' };
    if (!draft.dates) return { id: 'weekend_dates', phase: 1, label: 'Which weekend?', type: 'dates' };
    if (!draft.vibe) return { id: 'weekend_vibe', phase: 2, label: 'What kind of escape?', type: 'choice' };
    return null;
  }

  // --- FOOD DAY LOGIC ---
  private static determineFoodQuestion(draft: any, profile: AppProfile | null): NextQuestion | null {
    if (!draft.city) return { id: 'food_city', phase: 1, label: 'Which city?', type: 'location' };
    if (!draft.date) return { id: 'food_date', phase: 1, label: 'When?', type: 'dates' };
    if (!draft.cuisine) return { id: 'food_cuisine', phase: 2, label: 'What are you craving?', type: 'multi-choice' };
    if (!draft.vibe) return { id: 'food_vibe', phase: 2, label: 'Vibe?', type: 'choice' };
    return null;
  }

  // --- OCCASION LOGIC ---
  private static determineOccasionQuestion(draft: any, profile: AppProfile | null): NextQuestion | null {
    if (!draft.city) return { id: 'occ_city', phase: 1, label: 'Which city?', type: 'location' };
    if (!draft.date) return { id: 'occ_date', phase: 1, label: 'When?', type: 'dates' };
    if (!draft.occasion) return { id: 'occ_type', phase: 2, label: 'What is the occasion?', type: 'choice' };
    if (!draft.budgetPreference) return { id: 'occ_budget', phase: 2, label: 'Budget?', type: 'budget' };
    return null;
  }
}

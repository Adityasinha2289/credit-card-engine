import type { AppProfile } from '../dashboard/types/dashboard.types';
import { useDashboardStore } from '../dashboard/store/dashboardStore';
import type { PersonaModel, PersonaPreferences } from './types';

/**
 * Calculates profile completeness percentage (0 to 100).
 * Required base & segment fields: 70% weight
 * Optional fields (occupation, city): 30% weight
 */
export function calculateProfileCompleteness(profile: AppProfile | null): number {
  if (!profile) return 0;

  let score = 0;

  // Base profile fields (40 points)
  if (profile.name) score += 10;
  if (profile.email) score += 10;
  if (profile.salary > 0) score += 10;
  if (profile.creditScore >= 300) score += 10;

  // Required onboarding fields (30 points)
  if (profile.userSegment) score += 15;
  if (profile.primaryGoal) score += 15;

  // Optional profile details (30 points)
  if (profile.occupation) score += 15;
  if (profile.city && profile.city.trim().length > 0) score += 15;

  return Math.min(100, Math.max(0, score));
}

/**
 * Derives normalized persona preferences based on segment, primary goal, and profile attributes.
 */
export function derivePersonaPreferences(profile: AppProfile | null): PersonaPreferences {
  const goal = profile?.primaryGoal;
  const segment = profile?.userSegment;

  return {
    cashback: goal === 'Maximise Cashback' || segment === 'adult',
    travel: goal === 'Travel Rewards' || segment === 'youth',
    savings: goal === 'Save More Money',
    creditBuilding: goal === 'Build Credit Score',
    rewardPoints: goal === 'Earn Reward Points',
  };
}

/**
 * Centralized Personalization Engine class
 * Single source of truth for user persona, preferences, and profile completeness.
 */
export class PersonalizationEngine {
  /**
   * Generates a normalized PersonaModel from an AppProfile object or current Zustand store state.
   */
  public static getPersona(profile?: AppProfile | null): PersonaModel {
    const userProfile = profile !== undefined ? profile : useDashboardStore.getState().profile;

    const segment = userProfile?.userSegment || 'adult';
    const primaryGoal = userProfile?.primaryGoal;
    const occupation = userProfile?.occupation;
    const city = userProfile?.city;
    const salary = userProfile?.salary;
    const creditScore = userProfile?.creditScore;
    const profileCompleteness = calculateProfileCompleteness(userProfile);
    const hasCompletedOnboarding = Boolean(userProfile?.onboardingCompleted);
    const preferences = derivePersonaPreferences(userProfile);

    return {
      segment,
      primaryGoal,
      occupation,
      city,
      salary,
      creditScore,
      profileCompleteness,
      hasCompletedOnboarding,
      preferences,
    };
  }

  /**
   * Helper: Check if user is in Youth segment (18–22).
   */
  public static isYouth(profile?: AppProfile | null): boolean {
    return this.getPersona(profile).segment === 'youth';
  }

  /**
   * Helper: Check if user is in Adult segment (22+).
   */
  public static isAdult(profile?: AppProfile | null): boolean {
    return this.getPersona(profile).segment === 'adult';
  }

  /**
   * Helper: Get primary financial goal.
   */
  public static getPrimaryGoal(profile?: AppProfile | null) {
    return this.getPersona(profile).primaryGoal;
  }

  /**
   * Helper: Check if user has completed onboarding / profile setup.
   */
  public static hasCompletedProfile(profile?: AppProfile | null): boolean {
    return this.getPersona(profile).hasCompletedOnboarding;
  }

  /**
   * Helper: Get numerical profile completeness percentage (0 to 100).
   */
  public static getProfileCompleteness(profile?: AppProfile | null): number {
    return this.getPersona(profile).profileCompleteness;
  }

  /**
   * Helper: Get 1 contextual sentence for Home greeting.
   */
  public static getContextualSentence(profile?: AppProfile | null): string {
    const goal = this.getPrimaryGoal(profile);
    switch (goal) {
      case 'Travel Rewards':
        return"Let's help you earn more miles today.";
      case 'Maximise Cashback':
        return"Let's maximise your cashback opportunities.";
      case 'Save More Money':
        return 'Every smart payment saves money.';
      case 'Build Credit Score':
        return 'Small habits build strong credit.';
      case 'Earn Reward Points':
        return"Let's unlock more rewards.";
      default:
        return"Let's optimize your financial journey today.";
    }
  }

  /**
   * Helper: Get 3 contextual quick action titles.
   */
  public static getQuickActions(profile?: AppProfile | null): string[] {
    const goal = this.getPrimaryGoal(profile);
    switch (goal) {
      case 'Travel Rewards':
        return ['Find Travel Cards', 'Airport Lounge Benefits', 'Flight Offers'];
      case 'Maximise Cashback':
        return ['Best Cashback Cards', 'Merchant Offers', 'Spending Optimizer'];
      case 'Save More Money':
        return ['Lower Monthly Expenses', 'Bill Optimizer', 'EMI Calculator'];
      case 'Build Credit Score':
        return ['Credit Simulator', 'CIBIL Health Score', 'Utilization Tracker'];
      case 'Earn Reward Points':
      default:
        return ['Reward Multipliers', 'Redeem Points', 'Merchant Offers'];
    }
  }

  /**
   * Helper: Get 1 contextual motivation banner quote.
   */
  public static getMotivationBanner(profile?: AppProfile | null): string {
    const goal = this.getPrimaryGoal(profile);
    switch (goal) {
      case 'Travel Rewards':
        return 'Your next trip starts with smarter spending.';
      case 'Maximise Cashback':
        return 'Small savings become big rewards.';
      case 'Build Credit Score':
        return 'Maintain utilisation below 30%.';
      case 'Save More Money':
        return 'Every smart choice compounds over time.';
      case 'Earn Reward Points':
      default:
        return 'Maximize your points on every transaction.';
    }
  }
}

/**
 * React Hook wrapper for consuming Persona in components
 */
export function usePersona(): PersonaModel {
  const profile = useDashboardStore((s) => s.profile);
  return PersonalizationEngine.getPersona(profile);
}

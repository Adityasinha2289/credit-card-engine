import type { UserSegment, PrimaryGoal, Occupation } from '../dashboard/types/dashboard.types';

export const USER_SEGMENTS = {
  YOUTH: 'youth',
  ADULT: 'adult',
} as const;

export const PRIMARY_GOALS = {
  MAXIMISE_CASHBACK: 'Maximise Cashback',
  TRAVEL_REWARDS: 'Travel Rewards',
  SAVE_MORE_MONEY: 'Save More Money',
  BUILD_CREDIT_SCORE: 'Build Credit Score',
  EARN_REWARD_POINTS: 'Earn Reward Points',
} as const;

export interface PersonaPreferences {
  cashback: boolean;
  travel: boolean;
  savings: boolean;
  creditBuilding: boolean;
  rewardPoints: boolean;
}

export interface PersonaModel {
  segment: UserSegment;
  primaryGoal?: PrimaryGoal;
  occupation?: Occupation;
  city?: string;
  salary?: number;
  creditScore?: number;
  profileCompleteness: number;
  hasCompletedOnboarding: boolean;
  preferences: PersonaPreferences;
}

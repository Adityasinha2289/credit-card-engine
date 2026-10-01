import { Trophy, PiggyBank, Plane, TrendingUp, Banknote } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface GoalConfig {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PRIMARY_GOALS_CONFIG: Record<string, GoalConfig> = {
  maximize_rewards: {
    id: 'maximize_rewards',
    title: 'Maximize Rewards',
    description: 'Get the most value from your eligible spending.',
    icon: Trophy,
  },
  save_money: {
    id: 'save_money',
    title: 'Save More Money',
    description: 'Reduce unnecessary fees and keep more of your money.',
    icon: PiggyBank,
  },
  travel: {
    id: 'travel',
    title: 'Travel More',
    description: 'Get better value from flights, hotels and travel perks.',
    icon: Plane,
  },
  build_credit: {
    id: 'build_credit',
    title: 'Build My Credit',
    description: 'Build healthier credit habits and stay on top of your credit.',
    icon: TrendingUp,
  },
  cashback: {
    id: 'cashback',
    title: 'Get More Cashback',
    description: 'Prefer simple cash returns on everyday spending.',
    icon: Banknote,
  }
};

export const PRIMARY_GOALS = Object.values(PRIMARY_GOALS_CONFIG);

/**
 * Normalizes legacy goal strings from the database into canonical IDs.
 */
export function normalizeGoal(goal?: string): string | undefined {
  if (!goal) return undefined;
  
  const lowerGoal = goal.toLowerCase();
  
  if (lowerGoal.includes('cashback') || lowerGoal.includes('cash')) return 'cashback';
  if (lowerGoal.includes('travel') || lowerGoal.includes('lounge')) return 'travel';
  if (lowerGoal.includes('credit')) return 'build_credit';
  if (lowerGoal.includes('save')) return 'save_money';
  if (lowerGoal.includes('reward') || lowerGoal.includes('lifestyle') || lowerGoal.includes('shopping')) return 'maximize_rewards';
  
  return goal;
}

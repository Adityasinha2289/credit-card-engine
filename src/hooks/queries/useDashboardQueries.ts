import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '../useSupabase';
import { queryKeys } from './queryKeys';
import type {
  AppProfile,
  Transaction,
  CategoryBudget,
  Subscription,
  CreditAccount,
} from '../../features/dashboard/types/dashboard.types';
import type { CardData } from '../../features/cards/types/card.types';
import { ProfileService } from '../../services/profile/ProfileService';
import { WalletService } from '../../services/wallet/WalletService';
import {
  mapTransactionRow,
  mapBudgetRow,
  mapSubscriptionRow,
  mapCreditAccountRow,
  mapUserCardRow,
} from '../../features/dashboard/store/rowMappers';

// 1. Profile Query
export function useProfileQuery(userId?: string, initialInfo?: { email?: string; name?: string; avatar?: string }) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: async (): Promise<AppProfile | null> => {
      if (!userId || !supabase) return null;
      const profileService = new ProfileService(supabase as any);
      const { data: userRow } = await profileService.getProfile(userId);
      if (!userRow) return null;
      return {
        id: userRow.id,
        name: userRow.name || initialInfo?.name || 'User',
        email: userRow.email || initialInfo?.email || '',
        phone: userRow.phone || '',
        avatar: userRow.avatar_url || initialInfo?.avatar || '',
        salary: userRow.salary,
        creditScore: userRow.credit_score,
      };
    },
    enabled: !!userId && !!supabase,
    staleTime: 5 * 60 * 1000,
  });
}

// 2. User Cards Query
export function useUserCardsQuery(userId?: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: queryKeys.userCards(userId),
    queryFn: async (): Promise<CardData[]> => {
      if (!userId || !supabase) return [];
      const walletService = new WalletService(supabase as any);
      const { data: userCardsRow } = await walletService.getWallet(userId);
      if (!userCardsRow) return [];

      return userCardsRow.map((row: any) => mapUserCardRow(row, 'Cardholder'));
    },
    enabled: !!userId && !!supabase,
    staleTime: 2 * 60 * 1000,
  });
}

// 3. Transactions Query
export function useTransactionsQuery(userId?: string, limit: number = 50) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: queryKeys.transactions(userId),
    queryFn: async (): Promise<Transaction[]> => {
      if (!userId || !supabase) return [];
      const { data } = await (supabase as any)
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!data) return [];
      return data.map(mapTransactionRow);
    },
    enabled: !!userId && !!supabase,
    staleTime: 30 * 1000,
  });
}

// 4. Budgets Query
export function useBudgetsQuery(userId?: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: queryKeys.budgets(userId),
    queryFn: async (): Promise<CategoryBudget[]> => {
      if (!userId || !supabase) return [];
      const { data } = await (supabase as any)
        .from('budgets')
        .select('*')
        .eq('user_id', userId);

      if (!data) return [];
      return data.map(mapBudgetRow);
    },
    enabled: !!userId && !!supabase,
    staleTime: 5 * 60 * 1000,
  });
}

// 5. Subscriptions Query
export function useSubscriptionsQuery(userId?: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: queryKeys.subscriptions(userId),
    queryFn: async (): Promise<Subscription[]> => {
      if (!userId || !supabase) return [];
      const { data } = await (supabase as any)
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (!data) return [];
      // Translate subscriptions.card_id (user_cards row id) back to catalog card ids.
      const { data: walletRows } = await (supabase as any)
        .from('user_cards').select('id, card_id').eq('user_id', userId);
      const byRowId: Record<string, string> = {};
      (walletRows || []).forEach((r: any) => { byRowId[r.id] = r.card_id; });
      return data.map((row: any) => mapSubscriptionRow(row, byRowId));
    },
    enabled: !!userId && !!supabase,
    staleTime: 5 * 60 * 1000,
  });
}

// 6. Credit Accounts Query
export function useCreditAccountsQuery(userId?: string, userCards?: CardData[]) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: queryKeys.creditAccounts(userId),
    queryFn: async (): Promise<CreditAccount[]> => {
      if (!userId || !supabase) return [];
      const { data } = await (supabase as any)
        .from('credit_accounts')
        .select('*')
        .eq('user_id', userId);

      if (!data) return [];
      return data.map((row: any) => mapCreditAccountRow(row, userCards || []));
    },
    enabled: !!userId && !!supabase,
    staleTime: 1 * 60 * 1000,
  });
}

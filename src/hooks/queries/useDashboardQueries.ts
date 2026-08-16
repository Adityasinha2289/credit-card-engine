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

      return userCardsRow.map((row: any) => {
        const cardDef = Array.isArray(row.cards) ? row.cards[0] : row.cards;
        return {
          id: row.card_id,
          pan: `**** **** **** ${row.last_4_digits || '0000'}`,
          cardholderName: row.cardholder_name || 'Cardholder',
          expiry: row.expiry || '12/30',
          network: cardDef?.network || 'visa',
          bank: cardDef?.bank || 'Bank',
          status: row.status || 'active',
          availableCredit: row.credit_limit || 0,
          creditLimit: row.credit_limit || 0,
          label: cardDef?.name || 'Credit Card',
          gradientFrom: cardDef?.gradient_from || '#1F5247',
          gradientVia: '#30595c',
          gradientTo: cardDef?.gradient_to || '#456171',
        };
      });
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
      return data.map((row: any) => ({
        id: row.id,
        merchant: row.merchant,
        amount: row.amount,
        date: row.created_at,
        category: row.category,
        type: row.type,
        cardId: row.card_id || '',
        pending: row.is_pending,
        rewardPoints: 0,
      }));
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
      return data.map((row: any) => ({
        id: row.id,
        category: row.category,
        limitAmount: row.limit_amount,
        icon: row.icon,
        color: row.color,
      }));
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
      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        amount: row.amount,
        billingCycle: row.billing_cycle,
        nextBillingDate: row.next_billing_date,
        icon: row.icon,
        category: row.category,
        cardId: row.card_id,
      }));
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
      return data.map((row: any) => ({
        cardId: row.card_id,
        totalLimit: userCards?.find((c) => c.id === row.card_id)?.creditLimit || 100000,
        currentBalance: row.current_balance,
        minimumPaymentDue: row.min_due || 0,
        paymentDueDate: row.due_date || row.next_statement_date || '2025-01-01',
        lastPaymentAmount: 0,
        lastPaymentDate: null,
        apr: 0.1999,
      }));
    },
    enabled: !!userId && !!supabase,
    staleTime: 1 * 60 * 1000,
  });
}

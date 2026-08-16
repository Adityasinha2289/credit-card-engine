import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { queryKeys } from './queryKeys';
import type { AddTransactionInput, PayBillInput, CategoryBudget, Subscription } from '../../features/dashboard/types/dashboard.types';
import type { CardData } from '../../features/cards/types/card.types';

export function useDashboardMutations(userId?: string) {
  const queryClient = useQueryClient();
  const store = useDashboardStore();

  const addTransaction = useMutation({
    mutationFn: async (input: AddTransactionInput) => {
      await store.addTransaction(input);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions(userId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.creditAccounts(userId) });
      }
    },
  });

  const payBill = useMutation({
    mutationFn: async (input: PayBillInput) => {
      await store.payBill(input);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions(userId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.creditAccounts(userId) });
      }
    },
  });

  const addUserCard = useMutation({
    mutationFn: async (card: CardData) => {
      await store.addUserCard(card);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.userCards(userId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.creditAccounts(userId) });
      }
    },
  });

  const deleteUserCard = useMutation({
    mutationFn: async (cardId: string) => {
      await store.deleteUserCard(cardId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.userCards(userId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.creditAccounts(userId) });
      }
    },
  });

  const addBudget = useMutation({
    mutationFn: async (budget: CategoryBudget) => {
      await store.addBudget(budget);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.budgets(userId) });
      }
    },
  });

  const updateBudgetLimit = useMutation({
    mutationFn: async ({ budgetId, limitAmount }: { budgetId: string; limitAmount: number }) => {
      await store.updateBudgetLimit(budgetId, limitAmount);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.budgets(userId) });
      }
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (budgetId: string) => {
      await store.deleteBudget(budgetId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.budgets(userId) });
      }
    },
  });

  return {
    addTransaction,
    payBill,
    addUserCard,
    deleteUserCard,
    addBudget,
    updateBudgetLimit,
    deleteBudget,
  };
}

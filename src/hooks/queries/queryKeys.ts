export const queryKeys = {
  profile: (userId?: string) => ['profile', userId] as const,
  userCards: (userId?: string) => ['userCards', userId] as const,
  transactions: (userId?: string) => ['transactions', userId] as const,
  budgets: (userId?: string) => ['budgets', userId] as const,
  subscriptions: (userId?: string) => ['subscriptions', userId] as const,
  creditAccounts: (userId?: string) => ['creditAccounts', userId] as const,
};

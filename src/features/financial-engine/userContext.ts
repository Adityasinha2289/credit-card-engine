export interface SpendingCategoryContext {
  monthlySpend: number;
  transactionCount: number;
}

export interface UserFinancialProfile {
  creditScore?: number;
  annualIncome?: number;
  employmentType?: string;
  age?: number;
  location?: string;
}

export interface UserContext {
  userId: string;
  financialProfile: UserFinancialProfile;
  spendingProfile: Record<string, SpendingCategoryContext>; // Key is normalized categoryId
  existingWalletCardIds: string[]; // Strict catalog IDs representing ALREADY_OWNED
}

export type EligibilityStatus = 'ELIGIBLE' | 'INELIGIBLE' | 'UNKNOWN' | 'ALREADY_OWNED';

export interface EligibilityResult {
  cardId: string;
  status: EligibilityStatus;
  reasons: string[];
  failedRules: string[];
  unknownRules: string[];
}

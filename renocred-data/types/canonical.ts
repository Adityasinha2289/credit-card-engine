/**
 * Canonical Domain Model for RenoCred Card Data Intelligence
 * 
 * Strict typing preserving the full financial and product truth of the
 * 518-card dense master dataset without loss of fidelity, premature conversions,
 * or assumptions.
 */

export type DataQualityStatus = 'VALID' | 'NEEDS_REVIEW' | 'INVALID';

export type RecommendationConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNAVAILABLE';

export type LifecycleStatus = 'ACTIVE' | 'UNKNOWN' | 'DISCONTINUED';

export interface CanonicalFeeValue {
  amount: number;
  currency: string;
  conditions: string | null;
}

export interface CanonicalIdentity {
  id: string;
  canonicalId: string;
  name: string;
  issuer: string;
  network: string | null;
  networkTier: string | null;
  networkVariants: string[] | null;
  productFamily: string | null;
  productFamilyId: string;
  variant: string | null;
  cardType: string | null;
  category: string | null;
  coBrandedPartner: string | null;
  securedUnsecured: string | null;
  personalBusiness: string | null;
  officialUrl: string | null;
}

export interface CanonicalFees {
  joiningFee: CanonicalFeeValue | null;
  annualFee: CanonicalFeeValue | null;
  renewalFee: CanonicalFeeValue | null;
  supplementaryCardFee: CanonicalFeeValue | null;
  cashWithdrawalFee: string | null;
  rewardRedemptionFee: string | null;
  forexMarkup: number | null;
  foreignCurrencyFee: string | null;
  feeWaiverAvailable: boolean | null;
  feeWaiverCondition: string | null;
  feeWaiverThreshold: number | null;
  feeWaiverPeriod: string | null;
  otherExplicitWaiverRequirements: string | null;
  otherFees: Record<string, unknown> | null;
}

export interface CanonicalEligibility {
  minimumAge: number | null;
  maximumAge: number | null;
  minimumIncome: number | null;
  maximumIncome: number | null;
  monthlyIncome: number | null;
  annualIncome: number | null;
  incomeType: string | null;
  employmentRequirements: string | null;
  studentEligibility: string | null;
  residencyRequirements: string | null;
  nationality: string | null;
  existingCustomerRequirements: string | null;
  creditProfileRequirements: string | null;
  securedCardRequirement: string | null;
  businessEligibility: string | null;
  invitationOnlyRequirements: string | null;
  otherRequirements: string | null;
}

export interface CanonicalEarningRule {
  category: string;
  rate: number;
  condition: string;
}

export interface CanonicalRewards {
  rewardType: string | null;
  rewardCurrency: string | null;
  earningRules: CanonicalEarningRule[] | null;
  baseRate: number | null;
  acceleratedCategories: unknown | null;
  rewardMultipliers: unknown | null;
  thresholds: unknown | null;
  caps: unknown | null;
  frequency: string | null;
  expiry: string | null;
  redemption: unknown | null;
}

export interface CanonicalCashbackRate {
  rate: number;
  rateType: 'EXACT' | 'UP_TO' | string;
  category: string;
  merchant: string | null;
  cap: number | null;
  capPeriod: string | null;
  minimumTransaction: number | null;
  maximumTransaction: number | null;
  transactionConditions: string | null;
  exclusions: string | null;
  conditions: string;
}

export interface CanonicalCashback {
  available: 'AVAILABLE' | 'NOT_AVAILABLE' | string | null;
  rates: CanonicalCashbackRate[];
  categories: string[];
  caps: unknown | null;
  frequency: string | null;
  minimumSpend: number | null;
  exclusions: string[];
  conditions: string | null;
}

export interface CanonicalBenefit {
  category: string;
  description: string;
  eligibility: string | null;
  frequency: string | null;
  limit: number | null;
  spendRequirement: number | null;
  conditions: string | null;
}

export interface CanonicalLounge {
  available: string | null;
  domesticVisits: number | null;
  internationalVisits: number | null;
  frequency: string | null;
  eligibilityCondition: string | null;
  spendCondition: string | null;
}

export interface CanonicalMilestone {
  category?: string;
  description?: string;
  spendRequirement?: number | null;
  reward?: string | null;
  frequency?: string | null;
  conditions?: string | null;
  [key: string]: unknown;
}

export interface CanonicalFeature {
  field: string;
  rawText: string;
  structuredValue: unknown | null;
  sourceUrl: string | null;
  extractionMethod: string | null;
  needsReview: boolean;
  reviewReason: string | null;
  confidence: string | null;
}

export interface CanonicalSpendConditions {
  minimumTransaction: number | null;
  monthlyThreshold: number | null;
  quarterlyThreshold: number | null;
  annualThreshold: number | null;
  transactionType: string | null;
  onlineOffline: string | null;
  merchantRestrictions: string | null;
  categoryRestrictions: string | null;
  paymentMethodRequirements: string | null;
}

export interface CanonicalRedemption {
  methods: string | null;
  value: string | null;
  conversionRatio: string | null;
  minimumRedemption: number | null;
  fees: string | null;
  expiry: string | null;
}

export interface CanonicalTravel {
  forexMarkup: number | null;
  internationalLounge: string | null;
  travelInsurance: string | null;
  airlineBenefits: string | null;
  hotelBenefits: string | null;
  concierge: string | null;
  airportTransfer: string | null;
}

export interface CanonicalApplication {
  applicationUrl: string | null;
  applicationMethod: string | null;
  eligibilityCheckUrl: string | null;
}

export interface CanonicalStatus {
  status: string | null;
  launchDate: string | null;
  discontinuedDate: string | null;
  lastVerifiedAt: string | null;
}

export interface CanonicalEvidence {
  field: string;
  value: string;
  sourceUrl: string | null;
  evidence: string;
  needsReview: boolean;
  reviewReason: string | null;
}

export interface CanonicalCard {
  identity: CanonicalIdentity;
  fees: CanonicalFees;
  eligibility: CanonicalEligibility;
  rewards: CanonicalRewards;
  cashback: CanonicalCashback;
  benefits: CanonicalBenefit[];
  lounge: CanonicalLounge;
  milestones: CanonicalMilestone[];
  features: CanonicalFeature[];
  spendConditions: CanonicalSpendConditions;
  exclusions: string[] | null;
  redemption: CanonicalRedemption;
  travelInternational: CanonicalTravel;
  application: CanonicalApplication;
  status: CanonicalStatus;

  // Lifecycle & Quality
  lifecycleStatus: LifecycleStatus;
  dataQuality: DataQualityStatus;
  recommendationConfidence: RecommendationConfidence;
  recommendationExclusionReason: string | null;

  // Provenance
  sourceName: string | null;
  sourceUrl: string | null;
  detailUrl: string | null;
  extractedAt: string | null;
  lastVerifiedAt: string | null;
  extractionMethod: string | null;
  evidenceData: CanonicalEvidence[];
}

export interface CanonicalCardResult {
  card: CanonicalCard;
  status: DataQualityStatus;
  reasons: string[];
  warnings: string[];
}

export interface DatasetMetadata {
  datasetName?: string;
  datasetVersion?: string;
  schemaVersion?: string;
  generatedAt?: string;
  sourceCount?: number;
  issuerCount?: number;
  cardCount?: number;
  duplicateCount?: number;
  invalidCount?: number;
  needsReviewCount?: number;
  coverageByIssuer?: Record<string, unknown>;
  coverageByField?: Record<string, unknown>;
  lastVerifiedAt?: string;
  phase?: string;
  confidenceDistribution?: Record<string, number>;
  [key: string]: unknown;
}

export interface DatasetIntegrityReport {
  totalCards: number;
  validCards: number;
  needsReviewCards: number;
  invalidCards: number;
  duplicateIdCount: number;
  duplicateCardIds: string[];
  issuerDistribution: Record<string, number>;
  networkDistribution: Record<string, number>;
  lifecycleDistribution: Record<string, number>;
  confidenceDistribution: Record<string, number>;
  blockers: string[];
  warnings: string[];
  metadata?: DatasetMetadata;
}

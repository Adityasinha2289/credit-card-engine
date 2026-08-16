import type { FinancialCard } from '../types';
import type { SourceSnapshot } from '../provenanceTypes';

export const SYNTHETIC_SOURCE_SNAPSHOT_V1: SourceSnapshot = {
  id: 'snap-synth-v1',
  sourceUrl: 'https://bank.example.com/cards/titanium/terms_2025.pdf',
  sourceType: 'ISSUER_MITC',
  issuer: 'SYNTHETIC_BANK',
  documentTitle: 'Synthetic Titanium Rewards Cardholder Agreement 2025',
  contentSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  storageUri: 'snapshots/synth_titanium_2025.pdf',
  effectiveDate: '2025-01-01',
  status: 'VERIFIED',
  retrievedAt: '2025-01-02T10:00:00Z'
};

export const SYNTHETIC_SOURCE_SNAPSHOT_V2: SourceSnapshot = {
  id: 'snap-synth-v2',
  sourceUrl: 'https://bank.example.com/cards/titanium/terms_2026.pdf',
  sourceType: 'ISSUER_MITC',
  issuer: 'SYNTHETIC_BANK',
  documentTitle: 'Synthetic Titanium Rewards Cardholder Agreement 2026 (Revised)',
  contentSha256: 'f4c2c54398fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852c966',
  storageUri: 'snapshots/synth_titanium_2026.pdf',
  effectiveDate: '2026-01-01',
  status: 'VERIFIED',
  retrievedAt: '2026-01-02T10:00:00Z'
};

export const SYNTHETIC_TITANIUM_CARD: FinancialCard = {
  id: 'synth-titanium-rewards',
  name: 'Synthetic Titanium Rewards Card',
  issuer: 'SYNTHETIC_BANK',
  network: 'Visa',
  premiumTier: 'premium',
  annualFee: 2500,
  joiningFee: 1000,
  feeWaiverSpend: 300000,
  verificationStatus: 'ACTIVE',

  rewardRules: [
    // 1. Base Reward (Active)
    {
      id: 'rule-synth-base',
      categoryId: 'all',
      rewardType: 'POINTS',
      earningMethod: 'POINTS_PER_SPEND',
      pointsAwarded: 2,
      spendRequirement: 100, // 2 points per ₹100 = 2.0% base rate at ₹1/point
      isBaseRule: true,
      isExclusion: false,
      effectiveFrom: '2025-01-01',
      effectiveUntil: null,
      version: 1,
      isActive: true,
      verificationStatus: 'ACTIVE',
      snapshotId: SYNTHETIC_SOURCE_SNAPSHOT_V2.id,
      rawSourceExcerpt: 'Earn 2 Reward Points for every ₹100 spent on all retail purchases.',
      verifiedAt: '2026-01-03T00:00:00Z',
      verifiedBy: 'auditor-synth-01'
    },

    // 2. Accelerated Category (Historical Version 1: 3% Dining in 2025)
    {
      id: 'rule-synth-dining-v1',
      categoryId: 'dining',
      rewardType: 'POINTS',
      earningMethod: 'POINTS_PER_SPEND',
      pointsAwarded: 3,
      spendRequirement: 100,
      isBaseRule: false,
      isExclusion: false,
      effectiveFrom: '2025-01-01',
      effectiveUntil: '2025-12-31',
      version: 1,
      isActive: false,
      verificationStatus: 'SUPERSEDED',
      snapshotId: SYNTHETIC_SOURCE_SNAPSHOT_V1.id,
      rawSourceExcerpt: 'Earn 3 Reward Points per ₹100 spent on Dining throughout 2025.',
      verifiedAt: '2025-01-03T00:00:00Z',
      verifiedBy: 'auditor-synth-01'
    },

    // 3. Accelerated Category (Active Version 2: 5% Dining starting 2026)
    {
      id: 'rule-synth-dining-v2',
      categoryId: 'dining',
      rewardType: 'POINTS',
      earningMethod: 'POINTS_PER_SPEND',
      pointsAwarded: 5,
      spendRequirement: 100,
      isBaseRule: false,
      isExclusion: false,
      effectiveFrom: '2026-01-01',
      effectiveUntil: null,
      version: 2,
      isActive: true,
      verificationStatus: 'ACTIVE',
      snapshotId: SYNTHETIC_SOURCE_SNAPSHOT_V2.id,
      rawSourceExcerpt: 'Earn 5 Reward Points per ₹100 spent on Dining starting Jan 1, 2026.',
      verifiedAt: '2026-01-03T00:00:00Z',
      verifiedBy: 'auditor-synth-01'
    },

    // 4. Accelerated Category (Shopping)
    {
      id: 'rule-synth-shopping',
      categoryId: 'shopping',
      rewardType: 'POINTS',
      earningMethod: 'POINTS_PER_SPEND',
      pointsAwarded: 4,
      spendRequirement: 100,
      isBaseRule: false,
      isExclusion: false,
      effectiveFrom: '2026-01-01',
      effectiveUntil: null,
      version: 1,
      isActive: true,
      verificationStatus: 'ACTIVE',
      snapshotId: SYNTHETIC_SOURCE_SNAPSHOT_V2.id,
      rawSourceExcerpt: 'Earn 4 Reward Points per ₹100 spent on Online Shopping.',
      verifiedAt: '2026-01-03T00:00:00Z',
      verifiedBy: 'auditor-synth-01'
    },

    // 5. Exclusion Rule (Fuel: 0 points)
    {
      id: 'rule-synth-fuel-ex',
      categoryId: 'fuel',
      rewardType: 'POINTS',
      earningMethod: 'FLAT',
      isBaseRule: false,
      isExclusion: true,
      effectiveFrom: '2025-01-01',
      effectiveUntil: null,
      version: 1,
      isActive: true,
      verificationStatus: 'ACTIVE',
      snapshotId: SYNTHETIC_SOURCE_SNAPSHOT_V2.id,
      rawSourceExcerpt: 'No reward points are accrued for fuel transactions.',
      verifiedAt: '2026-01-03T00:00:00Z',
      verifiedBy: 'auditor-synth-01'
    }
  ],

  caps: [
    // 1. Monthly Category Cap (Dining Max ₹1,000 monetary cap per month)
    {
      id: 'cap-synth-dining-monthly',
      period: 'MONTHLY',
      unit: 'MONETARY',
      maxValue: 1000,
      linkedRuleIds: ['rule-synth-dining-v2'],
      effectiveFrom: '2026-01-01',
      effectiveUntil: null,
      isActive: true,
      verificationStatus: 'ACTIVE',
      snapshotId: SYNTHETIC_SOURCE_SNAPSHOT_V2.id,
      rawSourceExcerpt: 'Dining rewards capped at maximum ₹1,000 cashback value per calendar month.',
      verifiedAt: '2026-01-03T00:00:00Z',
      verifiedBy: 'auditor-synth-01'
    },

    // 2. Shared Monthly Cap (Dining + Shopping combined max ₹2,000 per month)
    {
      id: 'cap-synth-shared-monthly',
      period: 'MONTHLY',
      unit: 'MONETARY',
      maxValue: 2000,
      linkedRuleIds: ['rule-synth-dining-v2', 'rule-synth-shopping'],
      effectiveFrom: '2026-01-01',
      effectiveUntil: null,
      isActive: true,
      verificationStatus: 'ACTIVE',
      snapshotId: SYNTHETIC_SOURCE_SNAPSHOT_V2.id,
      rawSourceExcerpt: 'Total accelerated rewards across Dining and Shopping capped at ₹2,000/month.',
      verifiedAt: '2026-01-03T00:00:00Z',
      verifiedBy: 'auditor-synth-01'
    }
  ],

  redemptionRates: [
    // Mechanism 1: Travel Portal Booking (1 RP = ₹1.00)
    {
      id: 'red-synth-travel',
      pointTypeName: 'Synthetic Points',
      mechanism: 'TRAVEL',
      monetaryValue: 1.00,
      pointsRequired: 1.0,
      minRedemptionUnits: 500,
      effectiveFrom: '2025-01-01',
      effectiveUntil: null,
      isActive: true,
      verificationStatus: 'ACTIVE',
      snapshotId: SYNTHETIC_SOURCE_SNAPSHOT_V2.id,
      rawSourceExcerpt: 'Redeem on Travel Portal for flight and hotel bookings at 1 Point = ₹1.00.',
      verifiedAt: '2026-01-03T00:00:00Z',
      verifiedBy: 'auditor-synth-01'
    },

    // Mechanism 2: Direct Statement Credit (1 RP = ₹0.25)
    {
      id: 'red-synth-statement',
      pointTypeName: 'Synthetic Points',
      mechanism: 'STATEMENT_CREDIT',
      monetaryValue: 0.25,
      pointsRequired: 1.0,
      minRedemptionUnits: 1000,
      redemptionFee: 99,
      effectiveFrom: '2025-01-01',
      effectiveUntil: null,
      isActive: true,
      verificationStatus: 'ACTIVE',
      snapshotId: SYNTHETIC_SOURCE_SNAPSHOT_V2.id,
      rawSourceExcerpt: 'Cashback against credit card statement at 1 Point = ₹0.25.',
      verifiedAt: '2026-01-03T00:00:00Z',
      verifiedBy: 'auditor-synth-01'
    }
  ],

  benefits: [
    {
      benefitType: 'lounge',
      details: { visitsPerQuarter: 2, network: 'Visa Airport Companion' },
      effectiveFrom: '2025-01-01',
      isActive: true,
      verificationStatus: 'ACTIVE',
      snapshotId: SYNTHETIC_SOURCE_SNAPSHOT_V2.id,
      rawSourceText: '2 complimentary domestic lounge visits per calendar quarter.'
    }
  ],

  eligibility: [
    {
      minIncome: 600000,
      minCibil: 750,
      employmentType: 'Salaried or Self-Employed',
      minAge: 21,
      maxAge: 65,
      effectiveFrom: '2025-01-01',
      isActive: true,
      verificationStatus: 'ACTIVE',
      snapshotId: SYNTHETIC_SOURCE_SNAPSHOT_V2.id,
      rawSourceText: 'Minimum annual income ₹6,00,000 and CIBIL score 750+.'
    }
  ]
};

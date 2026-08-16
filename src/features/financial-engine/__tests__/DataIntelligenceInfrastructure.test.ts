import { describe, it, expect } from 'vitest';
import { SYNTHETIC_TITANIUM_CARD, SYNTHETIC_SOURCE_SNAPSHOT_V2 } from '../fixtures/syntheticTitaniumCard';
import { DataQualityGate } from '../quality/DataQualityGate';
import { FinancialTruthEngine } from '../FinancialTruthEngine';
import { TaxonomyResolver } from '../taxonomy/TaxonomyResolver';
import type { FinancialCard, RewardRule } from '../types';

describe('Phase 4.1A: Data Intelligence Infrastructure Invariant Suite', () => {

  it('1. Quality Gates: Synthetic Titanium card passes with zero blocking issues', () => {
    const result = DataQualityGate.validate(SYNTHETIC_TITANIUM_CARD);
    
    expect(result.isValid).toBe(true);
    expect(result.blockingIssues).toHaveLength(0);
    expect(result.summary.blockingCount).toBe(0);
  });

  it('2. Provenance Requirement: Blocks active rules that lack source snapshot or evidence', () => {
    const unprovenancedCard: FinancialCard = {
      ...SYNTHETIC_TITANIUM_CARD,
      rewardRules: [
        {
          id: 'rule-unverified-active',
          categoryId: 'dining',
          rewardType: 'PERCENTAGE',
          earningMethod: 'PERCENTAGE',
          baseRate: 5.0,
          isBaseRule: false,
          isExclusion: false,
          isActive: true,
          verificationStatus: 'ACTIVE',
          // Missing snapshotId, rawSourceText, and rawSourceExcerpt
        }
      ]
    };

    const result = DataQualityGate.validate(unprovenancedCard);
    expect(result.isValid).toBe(false);
    expect(result.blockingIssues.some(i => i.code === 'MISSING_PROVENANCE_FOR_ACTIVE_RULE')).toBe(true);
  });

  it('3. Verification Gating: Draft/Unverified rules are isolated from active calculation', () => {
    const draftRule: RewardRule = {
      id: 'rule-draft-only',
      categoryId: 'groceries',
      rewardType: 'PERCENTAGE',
      earningMethod: 'PERCENTAGE',
      baseRate: 10.0,
      isBaseRule: false,
      isExclusion: false,
      isActive: false, // Not yet promoted to active
      verificationStatus: 'DRAFT',
      effectiveFrom: '2026-01-01'
    };

    const activeRules = DataQualityGate.selectActiveRules([draftRule], '2026-06-01');
    expect(activeRules).toHaveLength(0); // Draft rule is never returned for active calculations
  });

  it('4. Temporal Versioning: Deterministically resolves historical rules vs current active rules', () => {
    const allRules = SYNTHETIC_TITANIUM_CARD.rewardRules;

    // 4.1 Historical Evaluation in 2025: Expect 3% Dining (Version 1)
    const activeRules2025 = DataQualityGate.selectActiveRules(allRules, '2025-06-15');
    const diningRule2025 = activeRules2025.find(r => r.categoryId === 'dining');
    expect(diningRule2025).toBeDefined();
    expect(diningRule2025?.id).toBe('rule-synth-dining-v1');
    expect(diningRule2025?.pointsAwarded).toBe(3); // 3 points per ₹100 = 3%
    expect(diningRule2025?.version).toBe(1);

    // 4.2 Current Evaluation in 2026: Expect 5% Dining (Version 2)
    const activeRules2026 = DataQualityGate.selectActiveRules(allRules, '2026-06-15');
    const diningRule2026 = activeRules2026.find(r => r.categoryId === 'dining');
    expect(diningRule2026).toBeDefined();
    expect(diningRule2026?.id).toBe('rule-synth-dining-v2');
    expect(diningRule2026?.pointsAwarded).toBe(5); // 5 points per ₹100 = 5%
    expect(diningRule2026?.version).toBe(2);
  });

  it('5. Overlapping Versions: Quality gate blocks overlapping active dates for identical rule scopes', () => {
    const invalidOverlappingCard: FinancialCard = {
      ...SYNTHETIC_TITANIUM_CARD,
      rewardRules: [
        {
          id: 'rule-a',
          categoryId: 'dining',
          rewardType: 'PERCENTAGE',
          earningMethod: 'PERCENTAGE',
          baseRate: 5.0,
          isBaseRule: false,
          isExclusion: false,
          effectiveFrom: '2026-01-01',
          effectiveUntil: '2026-12-31',
          snapshotId: SYNTHETIC_SOURCE_SNAPSHOT_V2.id
        },
        {
          id: 'rule-b',
          categoryId: 'dining', // Identical scope
          rewardType: 'PERCENTAGE',
          earningMethod: 'PERCENTAGE',
          baseRate: 6.0,
          isBaseRule: false,
          isExclusion: false,
          effectiveFrom: '2026-06-01', // Overlaps with 2026-01-01 -> 2026-12-31
          effectiveUntil: '2027-05-31',
          snapshotId: SYNTHETIC_SOURCE_SNAPSHOT_V2.id
        }
      ]
    };

    const result = DataQualityGate.validate(invalidOverlappingCard);
    expect(result.isValid).toBe(false);
    expect(result.blockingIssues.some(i => i.code === 'OVERLAPPING_RULE_VERSIONS')).toBe(true);
  });

  it('6. Shared Cap Linkage: Supports category-specific caps and shared multi-rule caps', () => {
    const diningCap = SYNTHETIC_TITANIUM_CARD.caps.find(c => c.id === 'cap-synth-dining-monthly');
    const sharedCap = SYNTHETIC_TITANIUM_CARD.caps.find(c => c.id === 'cap-synth-shared-monthly');

    expect(diningCap).toBeDefined();
    expect(diningCap?.linkedRuleIds).toEqual(['rule-synth-dining-v2']);

    expect(sharedCap).toBeDefined();
    expect(sharedCap?.linkedRuleIds).toEqual(['rule-synth-dining-v2', 'rule-synth-shopping']);
  });

  it('7. Multi-Mechanism Redemption: Separates Travel vs Statement Credit conversions without fabrication', () => {
    const travelRedemption = SYNTHETIC_TITANIUM_CARD.redemptionRates.find(r => r.mechanism === 'TRAVEL');
    const statementRedemption = SYNTHETIC_TITANIUM_CARD.redemptionRates.find(r => r.mechanism === 'STATEMENT_CREDIT');

    expect(travelRedemption?.monetaryValue).toBe(1.00);
    expect(statementRedemption?.monetaryValue).toBe(0.25);

    // Evaluate 500 points (from ₹10,000 Dining spend at 5%)
    // Under TRAVEL (1:1): ₹500 monetary reward
    const currentActiveCard2026: FinancialCard = {
      ...SYNTHETIC_TITANIUM_CARD,
      rewardRules: DataQualityGate.selectActiveRules(SYNTHETIC_TITANIUM_CARD.rewardRules, '2026-06-15'),
      redemptionRates: [travelRedemption!]
    };

    const travelResult = FinancialTruthEngine.calculateTransaction(
      { amount: 10000, categoryId: 'dining' },
      currentActiveCard2026
    );
    expect(travelResult.grossReward).toBe(500); // 500 points
    expect(travelResult.monetaryRewardValue).toBe(500); // 500 * 1.00 = ₹500

    // Under STATEMENT_CREDIT (1 RP = ₹0.25): ₹125 monetary reward
    const statementCard2026: FinancialCard = {
      ...SYNTHETIC_TITANIUM_CARD,
      rewardRules: DataQualityGate.selectActiveRules(SYNTHETIC_TITANIUM_CARD.rewardRules, '2026-06-15'),
      redemptionRates: [statementRedemption!]
    };

    const statementResult = FinancialTruthEngine.calculateTransaction(
      { amount: 10000, categoryId: 'dining' },
      statementCard2026
    );
    expect(statementResult.grossReward).toBe(500); // 500 points
    expect(statementResult.monetaryRewardValue).toBe(125); // 500 * 0.25 = ₹125
  });

  it('8. Taxonomy Resolver: Normalizes category and subcategory hierarchy deterministically', () => {
    expect(TaxonomyResolver.normalizeCategory('Dining & Restaurants')).toBe('dining');
    expect(TaxonomyResolver.normalizeCategory('Swiggy Food Delivery')).toBe('dining');
    expect(TaxonomyResolver.normalizeCategory('Flights & Airlines')).toBe('flights');
    expect(TaxonomyResolver.getParentCategory('flights')).toBe('travel');
    expect(TaxonomyResolver.getParentCategory('quick_commerce')).toBe('groceries');
  });

});

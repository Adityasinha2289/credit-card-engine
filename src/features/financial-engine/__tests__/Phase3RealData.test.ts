import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { toFinancialCard } from '../adapters/financialAdapter';
import { BaselineWalletEngine } from '../BaselineWalletEngine';
import { CandidateGenerator } from '../CandidateGenerator';
import { IncrementalValueEngine } from '../IncrementalValueEngine';
import { RecommendationRanker } from '../RecommendationRanker';
import type { UserContext } from '../userContext';
import type { FinancialCard } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASET_PATH = path.resolve(__dirname, '../../../../renocred-data/datasets/master_dataset.json');

describe('Phase 3 Real Dataset Tests (Step 28 Specification)', () => {
  const rawCards = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf-8'));
  const catalog: FinancialCard[] = rawCards
    .map((r: any) => toFinancialCard(r))
    .filter((c: FinancialCard | null): c is FinancialCard => c !== null);

  it('1. Successfully loads real card catalog with FinancialCard transformations', () => {
    expect(catalog.length).toBeGreaterThan(50);
    const millennia = catalog.find(c => c.id.toLowerCase().includes('millennia') || c.name.toLowerCase().includes('millennia'));
    expect(millennia).toBeDefined();
  });

  it('2. Real card adapted with Cashback rule and missing catalog caps yields PARTIAL data quality, never fabricated caps', () => {
    // Take real card from catalog (e.g. Millennia) with CASHBACK rule and 0 caps (from dataset)
    const baseRealCard = catalog.find(c => c.name.toLowerCase().includes('millennia')) || catalog[0];
    const realCashbackAdapted: FinancialCard = {
      ...baseRealCard,
      rewardRules: [
        { categoryId: 'Amazon', rewardType: 'CASHBACK', earningMethod: 'PERCENTAGE', baseRate: 5.0, isBaseRule: false, isExclusion: false }
      ],
      caps: [] // Reflects real dataset where caps are currently missing (0 verified caps)
    };

    const userContext: UserContext = {
      userId: 'real-user-1',
      financialProfile: { annualIncome: 600000, creditScore: 750 },
      spendingProfile: {
        'Amazon': { monthlySpend: 10000, transactionCount: 3 }
      },
      existingWalletCardIds: []
    };

    const candidateCtx = {
      card: realCashbackAdapted,
      eligibility: { status: 'ELIGIBLE' as const, reasons: [], failedRules: [], unknownRules: [], cardId: realCashbackAdapted.id },
      spendingOverlap: { 'Amazon': userContext.spendingProfile['Amazon'] }
    };

    const incValue = IncrementalValueEngine.calculate(candidateCtx, userContext, {});

    // Must be flagged as PARTIAL (due to missing caps in dataset catalog), not silently COMPLETE
    expect(incValue.dataQuality).toBe('PARTIAL');
    expect(incValue.warnings).toContain('Calculation may be artificially high due to missing cap constraints.');
  });

  it('3. Real cards with CashPoints / Points without verified redemption ratios produce INCOMPLETE / INSUFFICIENT_DATA', () => {
    const millennia = catalog.find(c => c.id.toLowerCase().includes('millennia') || c.name.toLowerCase().includes('millennia')) || catalog[0];
    
    // Dataset statistics show 0 explicit redemption rates currently verified in master dataset
    expect(millennia.redemptionRates.length).toBe(0);

    const userContext: UserContext = {
      userId: 'real-user-points',
      financialProfile: { annualIncome: 1200000, creditScore: 780 },
      spendingProfile: {
        'Amazon': { monthlySpend: 10000, transactionCount: 5 }
      },
      existingWalletCardIds: []
    };

    const candidateCtx = {
      card: millennia,
      eligibility: { status: 'ELIGIBLE' as const, reasons: [], failedRules: [], unknownRules: [], cardId: millennia.id },
      spendingOverlap: { 'Amazon': userContext.spendingProfile['Amazon'] }
    };

    const incValue = IncrementalValueEngine.calculate(candidateCtx, userContext, {});

    // Step 28: Missing redemption yields INCOMPLETE / UNKNOWN rather than fabricated economics
    expect(incValue.dataQuality).toBe('INCOMPLETE');
    expect(incValue.annualGrossIncrementalReward).toBe(0);
    expect(incValue.warnings).toContain('Cannot calculate economic value: Missing redemption ratio.');
  });

  it('4. Full end-to-end pipeline with real catalog: Candidate generation -> Baseline -> Ranking', () => {
    const userContext: UserContext = {
      userId: 'real-user-e2e',
      financialProfile: { annualIncome: 1000000, creditScore: 760 },
      spendingProfile: {
        'Amazon': { monthlySpend: 15000, transactionCount: 4 },
        'Swiggy': { monthlySpend: 8000, transactionCount: 6 },
        'Fuel': { monthlySpend: 5000, transactionCount: 2 }
      },
      existingWalletCardIds: []
    };

    // 1. Generate Candidates
    const candidates = CandidateGenerator.generate(catalog, userContext);
    expect(candidates.eligible.length + candidates.unknown.length).toBeGreaterThan(0);

    // 2. Compute Baseline across existing wallet (empty for this test)
    const baselines = BaselineWalletEngine.calculateBaselines(userContext, []);
    expect(baselines['Amazon']).toBe(0);

    // 3. Rank Recommendations
    const ranked = RecommendationRanker.rank(candidates, userContext, []);
    
    // Recommendations must be sorted deterministically by Phase 3.75 safety tiers
    for (let i = 0; i < ranked.length - 1; i++) {
      const curr = ranked[i];
      const next = ranked[i + 1];

      const tierCurr = RecommendationRanker.getRecommendationTier(curr);
      const tierNext = RecommendationRanker.getRecommendationTier(next);
      expect(tierCurr).toBeGreaterThanOrEqual(tierNext);

      if (tierCurr === tierNext) {
        expect(curr.economicValue.netAnnualValue).toBeGreaterThanOrEqual(next.economicValue.netAnnualValue);
      }
    }
  });
});

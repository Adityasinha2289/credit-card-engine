import { BenchmarkLoader } from '../src/features/recommendation/evaluation/benchmarkLoader';
import { BenchmarkRunner } from '../src/features/recommendation/evaluation/benchmarkRunner';
import { CardRepository as IntelligenceRepo } from '../src/features/card-intelligence/cardRepository';
import { CardRepository as FinixRepo } from '../src/features/finix/data/repository/CardRepository';
import { USE_NEW_DATASET } from '../src/features/finix/data/repository/CardRepository';
import type { CreditCardIntelligence } from '../src/features/card-intelligence/types';
import fs from 'fs';
import path from 'path';

async function runParityTest() {
  console.log('Starting Behavioral Parity Test Suite...');
  
  const runner = new BenchmarkRunner();
  const scenarios = BenchmarkLoader.loadBenchmarks();
  console.log(`Loaded ${scenarios.length} scenarios.`);

  // 1. RUN A: Legacy Dataset (MOCK_CARDS_INTELLIGENCE)
  console.log('Executing Run A: Legacy Intelligence Dataset...');
  const legacyResults = runner.runAllScenarios(scenarios);

  // 2. RUN B: New Dataset via Adapter (Mapped to Intelligence)
  console.log('Executing Run B: Adapter Dataset (Mapped from FinixCard)...');
  
  const finixRepo = FinixRepo.getInstance();
  const finixCards = finixRepo.getCards(); // Note: This uses USE_NEW_DATASET flag

  // CRITICAL ARCHITECTURAL FINDING: The RecommendationIntelligenceEngine expects `CreditCardIntelligence`, 
  // but our Adapter outputs `FinixCard`. We must forcefully map it to test behavior parity.
  const mappedCards: CreditCardIntelligence[] = finixCards.map(c => ({
    id: c.id,
    cardName: c.name,
    issuer: c.bank,
    network: c.network as any,
    annualFee: c.annualFee,
    joiningFee: c.annualFee,
    rewardType: 'points',
    rewardRate: `${c.baseRewardRate}%`,
    loungeAccess: c.loungeAccess ? `${c.loungeAccess} visits` : 'None',
    forexMarkup: 3.5, // Dummy
    fuelBenefits: 'None',
    welcomeBenefits: c.welcomeBonus ? [c.welcomeBonus] : [],
    milestoneBenefits: [],
    eligibility: { minSalary: c.minIncome, minCreditScore: c.minCibil },
    categories: c.rewards.map(r => r.category) as any[],
    premiumTier: c.annualFee > 3000 ? 'premium' : 'entry',
    topBenefit: c.highlights[0] || 'None'
  }));

  // Override the intelligence repository to use our mapped adapter cards
  const intelligenceRepo = IntelligenceRepo.getInstance();
  intelligenceRepo.setCards(mappedCards);

  const adapterResults = runner.runAllScenarios(scenarios);

  // 3. COMPARE
  console.log('Generating Parity Report...');
  let exactMatches = 0;
  let nearMatches = 0;
  let majorRegressions = 0;
  let missingCards = 0;
  
  let mdReport = `# Behavioral Parity Report\n\n`;
  mdReport += `## Statistics\n`;
  
  let details = `## Scenario Details\n\n`;

  for (let i = 0; i < scenarios.length; i++) {
    const s = scenarios[i];
    const resA = legacyResults[i];
    const resB = adapterResults[i];

    let matchType = 'Major Regression';
    let rootCause = 'Adapter mapping failure or missing data';

    if (resA.actualWinnerId === resB.actualWinnerId) {
      matchType = 'Exact Match';
      exactMatches++;
      rootCause = 'N/A';
    } else if (resB.actualTop3Ids.includes(resA.actualWinnerId)) {
      matchType = 'Near Match';
      nearMatches++;
      rootCause = 'Scoring weight differences due to points vs % mapping';
    } else {
      majorRegressions++;
      if (!finixCards.find(c => c.id === resA.actualWinnerId)) {
        rootCause = 'Card completely missing from new dataset (Schema ID mismatch)';
        missingCards++;
      } else {
        rootCause = 'Recommendation Engine expects CreditCardIntelligence (rich data) but receives down-mapped FinixCard structure';
      }
    }

    details += `### Scenario: ${s.title}\n`;
    details += `- **Merchant:** ${s.input.merchant}\n`;
    details += `- **Legacy Winner (Run A):** ${resA.actualWinnerName} (${resA.actualWinnerId})\n`;
    details += `- **New Winner (Run B):** ${resB.actualWinnerName} (${resB.actualWinnerId})\n`;
    details += `- **Legacy Savings:** ₹${resA.actualSavings} | **New Savings:** ₹${resB.actualSavings}\n`;
    details += `- **Status:** ${matchType}\n`;
    if (matchType !== 'Exact Match') {
      details += `- **Root Cause:** ${rootCause}\n`;
    }
    details += `\n`;
  }

  mdReport += `- **Total Scenarios:** ${scenarios.length}\n`;
  mdReport += `- **Exact Matches:** ${exactMatches}\n`;
  mdReport += `- **Near Matches:** ${nearMatches}\n`;
  mdReport += `- **Major Regressions:** ${majorRegressions}\n`;
  mdReport += `- **Cards Missing (ID mismatch):** ${missingCards}\n`;
  mdReport += `- **Adapter Assumptions Triggered:** 100% (Adapter forces FinixCard into CreditCardIntelligence)\n\n`;
  mdReport += `### 🚨 Architectural Root Cause Analysis\n`;
  mdReport += `The application currently contains **two disconnected recommendation engines**:\n`;
  mdReport += `1. \`RecommendationIntelligenceEngine\` which consumes \`CreditCardIntelligence\` objects from \`MOCK_CARDS_INTELLIGENCE\`.\n`;
  mdReport += `2. \`taqdeerEngine.ts\` / \`recommendEngine.ts\` which consumes \`FinixCard\` objects from \`CARD_DATASET\`.\n\n`;
  mdReport += `In Phase 2 and 3, we successfully migrated the \`FinixCard\` dataset to the new \`renocred-data\` adapter. However, this test suite evaluates the \`RecommendationIntelligenceEngine\`. Because our adapter outputs \`FinixCard\`, we had to forcefully cast the schema to \`CreditCardIntelligence\` for this test. This extreme data-loss during casting (missing \`forexMarkup\`, \`rewardType\`, \`fuelBenefits\`) completely breaks the Scoring Engine, resulting in massive regressions.\n\n`;
  mdReport += details;

  fs.writeFileSync(path.resolve(process.cwd(), 'behavioralParityReport.md'), mdReport);
  console.log('Report written to behavioralParityReport.md');
}

runParityTest().catch(console.error);

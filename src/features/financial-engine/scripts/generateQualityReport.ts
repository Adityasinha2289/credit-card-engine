import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { toFinancialCard } from '../adapters/financialAdapter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_PATH = path.resolve(__dirname, '../../../../renocred-data/datasets/master_dataset.json');

async function generateReport() {
  const rawData = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf-8'));
  
  let totalCards = 0;
  let explicitCashback = 0;
  let explicitPoints = 0;
  let explicitMiles = 0;
  let explicitCaps = 0;
  let missingCaps = 0;
  let explicitRedemptions = 0;
  let missingRedemptions = 0;
  let explicitExclusions = 0;
  let ambiguousExclusions = 0;
  let explicitEligibility = 0;
  let missingEligibility = 0;
  let withProvenance = 0;
  let missingProvenance = 0;
  let ambiguousCategories = 0;

  for (const raw of rawData) {
    const card = toFinancialCard(raw);
    if (!card) continue;
    
    totalCards++;
    
    let hasCashback = false;
    let hasPoints = false;
    let hasMiles = false;
    let hasExclusions = false;

    for (const rule of card.rewardRules) {
      if (rule.rewardType === 'CASHBACK') hasCashback = true;
      if (rule.rewardType === 'POINTS') hasPoints = true;
      if (rule.rewardType === 'MILES') hasMiles = true;
      if (rule.isExclusion) hasExclusions = true;
      
      // If it's a fallback 'all' and not explicitly 'Base Rewards', we flag as ambiguous category
      if (!rule.isBaseRule && rule.categoryId && rule.categoryId.toLowerCase() !== 'all') {
         ambiguousCategories++; 
      }
    }

    if (hasCashback) explicitCashback++;
    if (hasPoints) explicitPoints++;
    if (hasMiles) explicitMiles++;
    if (hasExclusions) explicitExclusions++;

    if (card.caps.length > 0) explicitCaps++;
    else missingCaps++;

    if (card.redemptionRates.length > 0) explicitRedemptions++;
    else missingRedemptions++;
    
    if (card.eligibility.length > 0) explicitEligibility++;
    else missingEligibility++;
    
    if (card.dataProvenance && Object.keys(card.dataProvenance).length > 0) withProvenance++;
    else missingProvenance++;
  }

  const report = `
# Dataset Quality Report

- Total Cards Parsed: ${totalCards}
- Cards with explicit cashback rules: ${explicitCashback}
- Cards with points rules: ${explicitPoints}
- Cards with miles rules: ${explicitMiles}
- Cards with explicit caps: ${explicitCaps}
- Cards missing caps: ${missingCaps}
- Cards with verified redemption values: ${explicitRedemptions}
- Cards missing redemption values: ${missingRedemptions}
- Cards with explicit exclusions: ${explicitExclusions}
- Cards with ambiguous exclusions: ${ambiguousExclusions}
- Cards with eligibility information: ${explicitEligibility}
- Cards missing eligibility: ${missingEligibility}
- Cards with provenance: ${withProvenance}
- Cards missing provenance: ${missingProvenance}
- Total un-mapped (ambiguous) category rules across dataset: ${ambiguousCategories}
`;

  console.log(report);
}

generateReport().catch(console.error);

import { LegacyCardDataSource } from '../src/features/finix/data/repository/LegacyCardDataSource';
import { AdapterCardDataSource } from '../src/features/finix/data/repository/AdapterCardDataSource';

function runComparison() {
  console.log('====================================');
  console.log('       DATASET COMPARISON REPORT      ');
  console.log('====================================\n');

  const legacySource = new LegacyCardDataSource();
  const adapterSource = new AdapterCardDataSource();

  const legacyCards = legacySource.getCards();
  const adapterCards = adapterSource.getCards();

  console.log(`[Summary]`);
  console.log(`Legacy Dataset Total Cards: ${legacyCards.length}`);
  console.log(`Adapter Dataset Total Cards: ${adapterCards.length}\n`);

  // Map legacy ids for quick lookup
  const legacyMap = new Map(legacyCards.map(c => [c.id, c]));

  const missingIds = [];
  const rewardDifferences = [];
  let differencesCount = 0;

  for (const newCard of adapterCards) {
    const legacyCard = legacyMap.get(newCard.id);
    
    if (!legacyCard) {
      missingIds.push(newCard.id);
      continue;
    }

    // Compare fields
    const diffs = [];
    if (newCard.annualFee !== legacyCard.annualFee) {
      diffs.push(`Annual Fee: (Legacy: ${legacyCard.annualFee} | New: ${newCard.annualFee})`);
    }
    if (newCard.bank !== legacyCard.bank) {
      diffs.push(`Bank: (Legacy: ${legacyCard.bank} | New: ${newCard.bank})`);
    }
    if (newCard.network !== legacyCard.network) {
      diffs.push(`Network: (Legacy: ${legacyCard.network} | New: ${newCard.network})`);
    }
    if (newCard.loungeAccess !== legacyCard.loungeAccess) {
      diffs.push(`Lounge Access: (Legacy: ${legacyCard.loungeAccess} | New: ${newCard.loungeAccess})`);
    }

    // Compare rewards structure
    if (newCard.rewards.length !== legacyCard.rewards.length) {
      diffs.push(`Rewards Count: (Legacy: ${legacyCard.rewards.length} | New: ${newCard.rewards.length})`);
    }

    if (diffs.length > 0) {
      rewardDifferences.push({ id: newCard.id, name: newCard.name, diffs });
      differencesCount++;
    }
  }

  console.log(`[Missing/New Cards]`);
  if (missingIds.length > 0) {
    console.log(`Found ${missingIds.length} cards in new dataset that do NOT exist in legacy dataset.`);
    // console.log(missingIds.join(', '));
  } else {
    console.log('All new cards exist in the legacy dataset.');
  }

  console.log(`\n[Field Discrepancies]`);
  if (differencesCount > 0) {
    console.log(`Found discrepancies in ${differencesCount} cards.`);
    // Just print the first 5 to avoid spam
    for (let i = 0; i < Math.min(5, rewardDifferences.length); i++) {
      const rd = rewardDifferences[i];
      console.log(`\n- ${rd.name} (${rd.id})`);
      rd.diffs.forEach((d: string) => console.log(`  * ${d}`));
    }
    if (differencesCount > 5) {
      console.log(`  ... and ${differencesCount - 5} more cards with differences.`);
    }
  } else {
    console.log('No field discrepancies found between mapped and legacy cards.');
  }
  
  console.log('\n====================================');
}

runComparison();

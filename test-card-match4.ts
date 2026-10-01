import { CARD_DATASET } from './src/features/finix/data/cardDataset';
import { getAllPublicCards } from './src/public-platform/lib/cardKnowledgeGraph';

const cards = getAllPublicCards().slice(0, 4);

for (const card of cards) {
  const idMatch = card.id;
  const normalizedId = idMatch.toLowerCase().replace('card-', '').replace(/-/g, '_');
  
  let finix1 = CARD_DATASET.find(c => c.id.toLowerCase() === normalizedId);
  let finix2 = CARD_DATASET.find(c => c.id.toLowerCase().includes(normalizedId) || normalizedId.includes(c.id.toLowerCase()));
  
  console.log(`card ID: ${idMatch} -> normalized: ${normalizedId}`);
  console.log(`Exact Match: ${finix1?.name}`);
  console.log(`Includes Match: ${finix2?.name}`);
  console.log('---');
}

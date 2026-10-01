import { CARD_DATASET } from './src/features/finix/data/cardDataset';
import { getAllPublicCards } from './src/public-platform/lib/cardKnowledgeGraph';

const cards = getAllPublicCards().slice(0, 4);

for (const card of cards) {
  const nameMatch = card.cardName;
  let finix1 = CARD_DATASET.find(c => c.name.toLowerCase() === nameMatch.toLowerCase());
  let finix2 = CARD_DATASET.find(c => nameMatch.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(nameMatch.toLowerCase()));
  
  console.log(`cardName: ${nameMatch}`);
  console.log(`Exact Match: ${finix1?.name}`);
  console.log(`Includes Match: ${finix2?.name}`);
  console.log('---');
}

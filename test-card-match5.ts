import { CARD_DATASET } from './src/features/finix/data/cardDataset';
console.log(CARD_DATASET.filter(c => c.name.toLowerCase().includes('atlas')).map(c => ({ id: c.id, name: c.name })));

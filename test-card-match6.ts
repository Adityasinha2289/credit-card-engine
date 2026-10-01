import { CARD_DATASET } from './src/features/finix/data/cardDataset';
console.log(CARD_DATASET.filter(c => c.name.toLowerCase().includes('infinia')).map(c => c.id));
console.log(CARD_DATASET.filter(c => c.name.toLowerCase().includes('cashback sbi')).map(c => c.id));
console.log(CARD_DATASET.filter(c => c.name.toLowerCase().includes('amazon pay icici')).map(c => c.id));

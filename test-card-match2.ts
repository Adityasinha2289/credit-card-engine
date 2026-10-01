import { CARD_DATASET } from './src/features/finix/data/cardDataset';
console.log(CARD_DATASET.filter(c => c.bank === 'HDFC' || c.bank.includes('HDFC')).map(c => c.name).slice(0, 10));
console.log(CARD_DATASET.filter(c => c.bank === 'ICICI' || c.bank.includes('ICICI')).map(c => c.name).slice(0, 10));

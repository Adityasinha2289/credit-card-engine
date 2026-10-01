import { CARD_DATASET } from './src/features/finix/data/cardDataset';
console.log(CARD_DATASET.filter(c => c.name.includes("Infinia") || c.name.includes("Magnus") || c.name.includes("Cashback") || c.name.includes("Regalia")));

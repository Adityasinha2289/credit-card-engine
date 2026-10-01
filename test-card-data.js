import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('./src/features/finix/data/datasets/final/credit_cards_master_dataset.json', 'utf-8'));
console.log(data.filter(c => c.name.includes("Infinia") || c.name.includes("Magnus") || c.name.includes("Cashback") || c.name.includes("Regalia")));

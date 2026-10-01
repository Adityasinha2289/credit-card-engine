const fs = require('fs');

const categories = [
  'Food & Dining', 'Transport', 'Shopping', 'Entertainment', 
  'Subscriptions', 'Education', 'Bills & Utilities', 'Travel', 'Rent/Housing', 'P2P Transfers', 'Other'
];

const merchants = [
  { name: 'Zomato', category: 'Food & Dining', type: 'P2M' },
  { name: 'Swiggy', category: 'Food & Dining', type: 'P2M' },
  { name: 'Uber', category: 'Transport', type: 'P2M' },
  { name: 'Ola', category: 'Transport', type: 'P2M' },
  { name: 'Amazon', category: 'Shopping', type: 'P2M' },
  { name: 'Myntra', category: 'Shopping', type: 'P2M' },
  { name: 'BookMyShow', category: 'Entertainment', type: 'P2M' },
  { name: 'Netflix', category: 'Subscriptions', type: 'P2M', isRecurring: true },
  { name: 'Spotify', category: 'Subscriptions', type: 'P2M', isRecurring: true },
  { name: 'Udemy', category: 'Education', type: 'P2M' },
  { name: 'Airtel', category: 'Bills & Utilities', type: 'P2M', isRecurring: true },
  { name: 'MakeMyTrip', category: 'Travel', type: 'P2M' },
  { name: 'Landlord', category: 'Rent/Housing', type: 'P2M', isRecurring: true },
  { name: 'Rahul', category: 'P2P Transfers', type: 'P2P' },
  { name: 'Priya', category: 'P2P Transfers', type: 'P2P' },
  { name: 'Salary', category: 'Income', type: 'P2P', amount: 75000, direction: 'INFLOW', typeId: 'INCOME' },
];

const piIds = ['pi_upi_primary', 'pi_debit_1', 'pi_credit_hdfc_dcb', 'pi_credit_sbi_cb', 'pi_credit_amazon'];

let transactions = [];

// Base date: 2026-09-20
let baseDate = new Date('2026-09-20T10:00:00Z');

let idCounter = 1;

for (let i = 0; i < 60; i++) {
  const m = merchants[Math.floor(Math.random() * merchants.length)];
  const date = new Date(baseDate.getTime() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
  
  let amount = Math.floor(Math.random() * 2000) + 100;
  if (m.name === 'Landlord') amount = 18000;
  if (m.category === 'Income') amount = 75000;
  if (m.name === 'MakeMyTrip') amount = 12000;
  
  const piId = m.type === 'P2P' ? 'pi_upi_primary' : piIds[Math.floor(Math.random() * piIds.length)];
  
  let type = 'PURCHASE';
  if (m.category === 'Income') type = 'INCOME';
  else if (m.type === 'P2P' && m.direction !== 'INFLOW') type = 'TRANSFER';
  
  // Create a refund for 1 in 20 purchases
  if (i === 15 || i === 42) {
    type = 'REFUND';
    amount = Math.floor(amount / 2);
  }
  
  let direction = m.direction || (type === 'REFUND' || type === 'INCOME' ? 'INFLOW' : 'OUTFLOW');
  
  transactions.push({
    id: `txn_demo_${idCounter++}`,
    date: date.toISOString(),
    merchant: m.name,
    merchantCategory: m.category,
    amount: amount,
    currency: 'INR',
    type: type,
    paymentInstrumentId: piId,
    accountId: piId.includes('upi') || piId.includes('debit') ? 'acc_demo_salary' : undefined,
    direction: direction,
    source: 'DEMO',
    status: 'COMPLETED',
    isRecurring: !!m.isRecurring,
    category: m.category,
    merchantType: m.type
  });
}

// Add card payments
transactions.push({
  id: `txn_demo_${idCounter++}`,
  date: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  merchant: 'SBI Card Payment',
  amount: 25000,
  currency: 'INR',
  type: 'CARD_PAYMENT',
  paymentInstrumentId: 'pi_upi_primary',
  accountId: 'acc_demo_salary',
  direction: 'OUTFLOW',
  source: 'DEMO',
  status: 'COMPLETED',
  isRecurring: false,
  category: 'Other',
  merchantType: 'P2M'
});

transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

const fileContent = `import { Transaction } from '../../types';\n\nexport const DEMO_TRANSACTIONS: Transaction[] = ${JSON.stringify(transactions, null, 2)};\n`;

fs.writeFileSync('/Users/aditya/Desktop/intern/kartik/credit-card-engine/src/features/money/data/demo/demoTransactions.ts', fileContent);
console.log('demoTransactions.ts generated successfully.');

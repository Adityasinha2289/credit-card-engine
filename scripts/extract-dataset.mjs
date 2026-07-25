/**
 * Extract master card dataset from TypeScript to JSON
 * for consumption by the Next.js marketing app.
 * 
 * Run: node scripts/extract-dataset.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Read the TypeScript source
const tsSource = readFileSync(
  resolve(rootDir, 'src/features/finix/data/masterDataset.ts'),
  'utf-8'
);

// Extract the array literal using a simple regex approach
// The dataset starts after "export const MASTER_CARD_DATASET: FinixCard[] = [" and ends at "];"
const match = tsSource.match(/export const MASTER_CARD_DATASET[^=]*=\s*(\[[\s\S]*\]);/);
if (!match) {
  console.error('Could not extract dataset from TypeScript source');
  process.exit(1);
}

let arrayLiteral = match[1];

// Fix TypeScript-specific syntax for JSON compatibility
// Replace `undefined` with `null`
arrayLiteral = arrayLiteral.replace(/:\s*undefined/g, ': null');
// Remove trailing commas before } or ]
arrayLiteral = arrayLiteral.replace(/,(\s*[}\]])/g, '$1');
// Wrap unquoted keys in quotes
arrayLiteral = arrayLiteral.replace(/(\s+)(\w+):/g, '$1"$2":');
// Fix single quotes to double quotes in string values
arrayLiteral = arrayLiteral.replace(/'([^']*)'/g, '"$1"');

// Try to parse
let cards;
try {
  cards = JSON.parse(arrayLiteral);
} catch (e) {
  // Fallback: use a more robust approach with eval in a sandboxed context
  console.log('Direct parse failed, using eval fallback...');
  // Re-read and use Function constructor
  const cleanedSource = tsSource
    .replace(/import[^;]*;/g, '')
    .replace(/export const MASTER_CARD_DATASET[^=]*=/, 'return ')
    .replace('FinixCard[]', '');
  
  try {
    cards = new Function(cleanedSource)();
  } catch (e2) {
    console.error('Eval fallback also failed:', e2.message);
    console.error('First parse error:', e.message);
    process.exit(1);
  }
}

// Generate slugs for each card
cards = cards.map(card => ({
  ...card,
  slug: card.id.replace(/_/g, '-'),
  welcomeBonus: card.welcomeBonus || null,
}));

// Extract unique banks
const banksMap = new Map();
cards.forEach(card => {
  const bankId = card.bank.toLowerCase().replace(/\s+/g, '-');
  if (!banksMap.has(bankId)) {
    banksMap.set(bankId, {
      id: bankId,
      name: card.bank,
      cardCount: 0,
      cardIds: [],
    });
  }
  const bank = banksMap.get(bankId);
  bank.cardCount++;
  bank.cardIds.push(card.id);
});

const banks = Array.from(banksMap.values());

// Write outputs
const outDir = resolve(rootDir, 'marketing/src/data');
mkdirSync(outDir, { recursive: true });

writeFileSync(
  resolve(outDir, 'cards.json'),
  JSON.stringify(cards, null, 2)
);

writeFileSync(
  resolve(outDir, 'banks.json'),
  JSON.stringify(banks, null, 2)
);

console.log(`✅ Exported ${cards.length} cards and ${banks.length} banks to marketing/src/data/`);

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const MERCHANTS = [
  { slug: 'swiggy', name: 'Swiggy', category: 'dining', description: 'Food delivery, Swiggy Instamart, Dineout, and Gourmet.' },
  { slug: 'zomato', name: 'Zomato', category: 'dining', description: 'Food ordering, Zomato Gold dining, and Blinkit grocery.' },
  { slug: 'amazon', name: 'Amazon India', category: 'shopping', description: 'Online shopping, Prime Video, Amazon Pay, and Bill Payments.' },
  { slug: 'flipkart', name: 'Flipkart', category: 'shopping', description: 'Electronics, fashion, household items, and Big Billion Days sales.' },
  { slug: 'makemytrip', name: 'MakeMyTrip', category: 'travel', description: 'Flight tickets, hotel bookings, homestays, and holiday packages.' },
  { slug: 'blinkit', name: 'Blinkit', category: 'groceries', description: '10-minute quick commerce grocery and household essentials delivery.' },
  { slug: 'croma', name: 'Croma', category: 'shopping', description: 'Consumer electronics, laptops, smartphones, and home appliances.' },
  { slug: 'myntra', name: 'Myntra', category: 'shopping', description: 'Fashion apparel, footwear, accessories, and beauty products.' },
  { slug: 'uber', name: 'Uber', category: 'transport', description: 'Ridesharing, daily commutes, airport trips, and Uber Rentals.' },
  { slug: 'bookmyshow', name: 'BookMyShow', category: 'entertainment', description: 'Movie tickets, concert passes, play bookings, and live events.' },
  { slug: 'hpcl', name: 'HPCL Fuel', category: 'fuel', description: 'Petrol, diesel, and auto-LPG refill at Hindustan Petroleum pumps.' },
  { slug: 'bpcl', name: 'BPCL Fuel', category: 'fuel', description: 'Fuel payments and surcharge waivers at Bharat Petroleum stations.' },
  { slug: 'starbucks', name: 'Starbucks India', category: 'dining', description: 'Coffee, beverages, and food items at Tata Starbucks outlets.' },
  { slug: 'indigo', name: 'IndiGo Airlines', category: 'travel', description: 'Domestic and international flights with IndiGo.' },
  { slug: 'air-india', name: 'Air India', category: 'travel', description: 'Full-service airline flights across domestic and international routes.' },
];

const outDir = resolve(rootDir, 'marketing/src/data');
mkdirSync(outDir, { recursive: true });

writeFileSync(
  resolve(outDir, 'merchants.json'),
  JSON.stringify(MERCHANTS, null, 2)
);

console.log(`✅ Exported ${MERCHANTS.length} merchant profiles to marketing/src/data/merchants.json`);

import fs from 'fs';

const mdText = fs.readFileSync('travel_dataset.md', 'utf8');
const lines = mdText.split('\n');

const offers: any[] = [];
const seenPartners = new Set<string>();

// Look for lines that look like table rows
for (const line of lines) {
  if (!line.includes('|')) continue;
  if (line.includes('---')) continue;
  
  const cols = line.split('|').map(c => c.trim()).filter(c => c !== '');
  if (cols.length < 13) continue;
  
  if (cols[0] === 'Brand' || cols[0].includes('Brand')) continue;

  const brand = cols[0];
  const category = cols[1];
  const subcategory = cols[2];
  const minorCategory = cols[3];
  const description = cols[4];
  const website = cols[5];
  const directUrl = cols[6];
  const benefit = cols[7];
  const offerType = cols[8];
  
  const id = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Mapping logic
  // e.g., Subcategory "Flights", Minor Category "1.1 Domestic Flights"
  // We need to match this to our taxonomy slugs.
  let catSlug = 'travel';
  let subcatSlug = '';
  let minorCatSlug = '';

  const subLC = subcategory.toLowerCase();
  if (subLC.includes('flight')) subcatSlug = 'flights';
  else if (subLC.includes('hotel') || subLC.includes('stay') || subLC.includes('resort') || subLC.includes('hostel')) subcatSlug = 'hotels-stays';
  else if (subLC.includes('train') || subLC.includes('bus') || subLC.includes('intercity')) subcatSlug = 'trains-buses';
  else if (subLC.includes('airport')) subcatSlug = 'airport';
  else if (subLC.includes('experience') || subLC.includes('tour') || subLC.includes('cruise')) subcatSlug = 'travel-experiences';
  else if (subLC.includes('car') || subLC.includes('rent') || subLC.includes('cab') || subLC.includes('mobility')) subcatSlug = 'car-rental-mobility';
  else subcatSlug = 'other';

  const minorLC = minorCategory.toLowerCase();
  
  // Flights
  if (subcatSlug === 'flights') {
    if (minorLC.includes('domestic')) minorCatSlug = 'domestic-flights';
    else if (minorLC.includes('international')) minorCatSlug = 'international-flights';
    else if (minorLC.includes('business')) minorCatSlug = 'business-class';
    else if (minorLC.includes('student')) minorCatSlug = 'student-flights';
    else if (minorLC.includes('hotel')) minorCatSlug = 'flight-hotel';
    else minorCatSlug = 'domestic-flights';
  }
  // Hotels
  else if (subcatSlug === 'hotels-stays') {
    if (minorLC.includes('resort')) minorCatSlug = 'resorts';
    else if (minorLC.includes('hostel')) minorCatSlug = 'hostels';
    else if (minorLC.includes('luxury')) minorCatSlug = 'luxury-stays';
    else if (minorLC.includes('staycation')) minorCatSlug = 'staycations';
    else if (minorLC.includes('vacation')) minorCatSlug = 'vacation-rentals';
    else minorCatSlug = 'hotels';
  }
  // Trains & Buses
  else if (subcatSlug === 'trains-buses') {
    if (minorLC.includes('train')) minorCatSlug = 'trains';
    else if (minorLC.includes('bus')) minorCatSlug = 'buses';
    else if (minorLC.includes('intercity')) minorCatSlug = 'intercity-travel';
    else if (minorLC.includes('rail')) minorCatSlug = 'rail-passes';
    else minorCatSlug = 'trains';
  }
  // Airport
  else if (subcatSlug === 'airport') {
    if (minorLC.includes('lounge')) minorCatSlug = 'lounge-access';
    else if (minorLC.includes('transfer')) minorCatSlug = 'airport-transfers';
    else if (minorLC.includes('parking')) minorCatSlug = 'airport-parking';
    else if (minorLC.includes('meet')) minorCatSlug = 'meet-assist';
    else minorCatSlug = 'lounge-access';
  }
  // Experiences
  else if (subcatSlug === 'travel-experiences') {
    if (minorLC.includes('tour')) minorCatSlug = 'tours';
    else if (minorLC.includes('activit')) minorCatSlug = 'activities';
    else if (minorLC.includes('attract')) minorCatSlug = 'attractions';
    else if (minorLC.includes('advent')) minorCatSlug = 'adventure';
    else if (minorLC.includes('cruis')) minorCatSlug = 'cruises';
    else minorCatSlug = 'tours';
  }
  // Car rental
  else if (subcatSlug === 'car-rental-mobility') {
    if (minorLC.includes('rent')) minorCatSlug = 'car-rentals';
    else if (minorLC.includes('self')) minorCatSlug = 'self-drive';
    else if (minorLC.includes('chauffeur')) minorCatSlug = 'chauffeur-services';
    else if (minorLC.includes('intercity')) minorCatSlug = 'intercity-cabs';
    else minorCatSlug = 'car-rentals';
  }

  // Handle multiple minor categories for the same brand based on multiple rows in the dataset
  // Since the markdown table might have commas or we just have multiple rows per brand.
  
  offers.push({
    id,
    partnerName: brand,
    partnerLogo: '', // placeholder
    description: description || benefit,
    categorySlug: catSlug,
    subcategorySlug: subcatSlug,
    minorCategorySlug: minorCatSlug,
    affiliateUrl: directUrl !== '-' ? directUrl : website,
    isDiscovery: true
  });
}

const fileContent = `import type { MarketplaceOffer } from '../types';

export const TRAVEL_PARTNERS: MarketplaceOffer[] = ${JSON.stringify(offers, null, 2)};
`;

fs.writeFileSync('src/features/marketplace/data/travelPartners.ts', fileContent);
console.log('Successfully wrote', offers.length, 'partners to travelPartners.ts');

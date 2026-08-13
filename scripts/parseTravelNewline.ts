import fs from 'fs';

const mdText = fs.readFileSync('travel_dataset.md', 'utf8');
const lines = mdText.split('\n').map(l => l.trim()).filter(l => l !== '');

// Find the index of "MakeMyTrip" as the start of the data
const startIndex = lines.indexOf('MakeMyTrip');
if (startIndex === -1) {
  console.error('Could not find MakeMyTrip in the dataset');
  process.exit(1);
}

const dataLines = lines.slice(startIndex);
const offers: any[] = [];
const seenPartners = new Set<string>();

for (let i = 0; i < dataLines.length; i += 12) {
  // If we run out of bounds or hit something else, break
  if (i + 11 >= dataLines.length) break;

  const brand = dataLines[i];
  if (brand === '</USER_REQUEST>') break; // End of file indicator
  
  const category = dataLines[i+1];
  const subcategory = dataLines[i+2];
  const minorCategory = dataLines[i+3];
  const description = dataLines[i+4];
  const website = dataLines[i+5];
  const directUrl = dataLines[i+6];
  const benefit = dataLines[i+7];
  const offerType = dataLines[i+8];
  
  const id = brand.toLowerCase().replace(/[^a-z0-9-]/g, '');
  
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
  
  if (subcatSlug === 'flights') {
    if (minorLC.includes('domestic')) minorCatSlug = 'domestic-flights';
    else if (minorLC.includes('international')) minorCatSlug = 'international-flights';
    else if (minorLC.includes('business')) minorCatSlug = 'business-class';
    else if (minorLC.includes('student')) minorCatSlug = 'student-flights';
    else if (minorLC.includes('hotel')) minorCatSlug = 'flight-hotel';
    else minorCatSlug = 'domestic-flights';
  }
  else if (subcatSlug === 'hotels-stays') {
    if (minorLC.includes('resort')) minorCatSlug = 'resorts';
    else if (minorLC.includes('hostel')) minorCatSlug = 'hostels';
    else if (minorLC.includes('luxury')) minorCatSlug = 'luxury-stays';
    else if (minorLC.includes('staycation')) minorCatSlug = 'staycations';
    else if (minorLC.includes('vacation')) minorCatSlug = 'vacation-rentals';
    else minorCatSlug = 'hotels';
  }
  else if (subcatSlug === 'trains-buses') {
    if (minorLC.includes('train')) minorCatSlug = 'trains';
    else if (minorLC.includes('bus')) minorCatSlug = 'buses';
    else if (minorLC.includes('intercity')) minorCatSlug = 'intercity-travel';
    else if (minorLC.includes('rail')) minorCatSlug = 'rail-passes';
    else minorCatSlug = 'trains';
  }
  else if (subcatSlug === 'airport') {
    if (minorLC.includes('lounge')) minorCatSlug = 'lounge-access';
    else if (minorLC.includes('transfer')) minorCatSlug = 'airport-transfers';
    else if (minorLC.includes('parking')) minorCatSlug = 'airport-parking';
    else if (minorLC.includes('meet')) minorCatSlug = 'meet-assist';
    else minorCatSlug = 'lounge-access';
  }
  else if (subcatSlug === 'travel-experiences') {
    if (minorLC.includes('tour')) minorCatSlug = 'tours';
    else if (minorLC.includes('activit')) minorCatSlug = 'activities';
    else if (minorLC.includes('attract')) minorCatSlug = 'attractions';
    else if (minorLC.includes('advent')) minorCatSlug = 'adventure';
    else if (minorLC.includes('cruis')) minorCatSlug = 'cruises';
    else minorCatSlug = 'tours';
  }
  else if (subcatSlug === 'car-rental-mobility') {
    if (minorLC.includes('rent')) minorCatSlug = 'car-rentals';
    else if (minorLC.includes('self')) minorCatSlug = 'self-drive';
    else if (minorLC.includes('chauffeur')) minorCatSlug = 'chauffeur-services';
    else if (minorLC.includes('intercity')) minorCatSlug = 'intercity-cabs';
    else minorCatSlug = 'car-rentals';
  }

  // To prevent massive duplication if a brand is listed twice in the same minor category
  if (directUrl.startsWith('http')) {
    const uniqueKey = `${id}-${catSlug}-${subcatSlug}-${minorCatSlug}`;
    if (!seenPartners.has(uniqueKey)) {
      seenPartners.add(uniqueKey);
      offers.push({
        id,
        partnerName: brand,
        partnerLogo: '', // placeholder
        description: description || benefit,
        categorySlug: catSlug,
        subcategorySlug: subcatSlug,
        minorCategorySlug: minorCatSlug,
        affiliateUrl: directUrl,
        isDiscovery: true
      });
    }
  }
}

const fileContent = `import type { MarketplaceOffer } from '../types';

export const TRAVEL_PARTNERS: MarketplaceOffer[] = ${JSON.stringify(offers, null, 2)};
`;

fs.writeFileSync('src/features/marketplace/data/travelPartners.ts', fileContent);
console.log('Successfully wrote', offers.length, 'partners to travelPartners.ts');

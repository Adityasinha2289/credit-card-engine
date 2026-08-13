import fs from 'fs';

const text = fs.readFileSync('dining_dataset.txt', 'utf8');

// The separator is "VERIFIED"
const rows = text.split('VERIFIED').filter(r => r.trim() !== '');

const subcategories = [
  'Restaurants', 'Cafés & Drinks', 'Food Delivery', 'Dining Experiences'
];

const minorCategories = [
  'Fine Dining', 'Casual Dining', 'QSR', 'Family Dining', 'Buffets',
  'Coffee', 'Cafés', 'Desserts', 'Tea', 'Beverages',
  'Food Delivery Platforms', 'Restaurant Delivery', 'Cloud Kitchens',
  'Date Night', 'Brunch', 'Celebrations', 'Premium Experiences'
];

const offersList: any[] = [];
const seenPartners = new Set<string>();

for (const row of rows) {
  // Find URL boundaries
  const urlMatch = row.match(/(https:\/\/[^\s]+?(?:\.com|\.in|\.co\.in|\.info|\.net|\.org|\.php)[^\s]*?)(https:\/\/[^\s]+|DIRECT URL UNAVAILABLE)/);
  if (!urlMatch) {
    console.log("Could not find URLs in:", row.substring(0, 50));
    continue;
  }
  
  let website = urlMatch[1];
  let directUrl = urlMatch[2];
  
  // Clean up google wrappers
  if (website.startsWith('https://www.google.com/search?q=')) {
    website = website.replace('https://www.google.com/search?q=', '');
    const ampIdx = website.indexOf('&');
    if (ampIdx !== -1) website = website.substring(0, ampIdx);
  }
  if (directUrl.startsWith('https://www.google.com/search?q=')) {
    directUrl = directUrl.replace('https://www.google.com/search?q=', '');
    const ampIdx = directUrl.indexOf('&');
    if (ampIdx !== -1) directUrl = directUrl.substring(0, ampIdx);
  }

  // Strip PAN-INDIA or TIER-1 from URLs
  if (website.includes('PAN-INDIA')) website = website.substring(0, website.indexOf('PAN-INDIA'));
  if (website.includes('TIER-1')) website = website.substring(0, website.indexOf('TIER-1'));
  if (directUrl.includes('PAN-INDIA')) directUrl = directUrl.substring(0, directUrl.indexOf('PAN-INDIA'));
  if (directUrl.includes('TIER-1')) directUrl = directUrl.substring(0, directUrl.indexOf('TIER-1'));

  const prefix = row.substring(0, urlMatch.index);
  const suffix = row.substring((urlMatch.index || 0) + urlMatch[0].length);
  
  // Parse prefix: Brand + "Dining" + Subcategory + MinorCategory + Description
  let brand = '';
  let subcategory = '';
  let minorCategory = '';
  let description = '';
  
  // Find where Subcategory starts
  let subcatIdx = -1;
  let matchedSubcat = '';
  for (const sub of subcategories) {
    const idx = prefix.indexOf('Dining' + sub);
    if (idx !== -1) {
      // Pick the earliest occurrence in case brand name has 'Dining'
      if (subcatIdx === -1 || idx < subcatIdx) {
        subcatIdx = idx;
        matchedSubcat = sub;
      }
    }
  }

  if (subcatIdx !== -1) {
    brand = prefix.substring(0, subcatIdx);
    subcategory = matchedSubcat;
    
    // The rest of the string after 'Dining' + subcategory
    const rest2 = prefix.substring(subcatIdx + 6 + matchedSubcat.length);
    
    // Find minor category
    for (const minor of minorCategories) {
      if (rest2.startsWith(minor)) {
        minorCategory = minor;
        description = rest2.substring(minor.length);
        break;
      }
    }
  }
  
  if (brand.trim() === 'Olive Bar & Kitchen') {
    continue;
  }

  if (!brand || !subcategory || !minorCategory) {
    console.log("Failed to parse prefix cleanly:", prefix);
    continue;
  }
  
  // Clean up IDs and slugs
  const id = brand.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const catSlug = 'dining';
  
  let subcatSlug = subcategory.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  let minorCatSlug = minorCategory.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Distinguish Family Dining in Restaurants vs Dining Experiences
  if (subcatSlug === 'restaurants' && minorCatSlug === 'family-dining') {
     minorCatSlug = 'family-dining-restaurants';
  } else if (subcatSlug === 'dining-experiences' && minorCatSlug === 'family-dining') {
     minorCatSlug = 'family-dining-experiences';
  }

  // Find Benefit and Offer Type
  // suffix looks like: TIER-1 CITIESDelhi NCR, MumbaiPremium dining experiencesReservationMEDIUMTIER A
  // We need to extract the Benefit and Offer Type.
  // Actually, wait, let's just use generic logic to extract benefit from suffix
  // or just use description as benefit if suffix is too hard to parse.
  // The dataset structure: Geographic Reach | Key Cities | Benefit | Offer Type | Affiliate Potential | Tier | Verification
  
  // Since we just need benefit and offer type, we can fake the parsing of it or use regex.
  // Let's just use description for benefit since it's cleaner, and determine offer type from suffix
  let offerType = 'Discount';
  if (suffix.includes('Card Offer')) offerType = 'Card Offer';
  else if (suffix.includes('Dining Deal')) offerType = 'Dining Deal';
  else if (suffix.includes('Reservation')) offerType = 'Reservation';
  else if (suffix.includes('Discovery')) offerType = 'Discovery';
  else if (suffix.includes('Cashback')) offerType = 'Cashback';
  else if (suffix.includes('Membership')) offerType = 'Membership';
  else if (suffix.includes('Coupon')) offerType = 'Coupon';
  else if (suffix.includes('Loyalty')) offerType = 'Loyalty';
  else if (suffix.includes('Rewards')) offerType = 'Rewards';
  
  const offer = {
    id,
    brandName: brand.trim(),
    partnerName: brand.trim(),
    categorySlug: catSlug,
    subcategorySlug: subcatSlug,
    minorCategorySlug: minorCatSlug,
    description: description.trim(),
    benefit: description.trim(), // Use description as benefit for cleaner UI
    offerType,
    affiliateUrl: directUrl !== 'DIRECT URL UNAVAILABLE' ? directUrl : website
  };
  
  offersList.push(offer);
  seenPartners.add(brand.trim());
}

// Generate the output file
let outputFile = `import type { MarketplaceOffer } from '../types';

export const DINING_PARTNERS: MarketplaceOffer[] = [
`;

for (const offer of offersList) {
  outputFile += `  {
    id: '${offer.id}',
    brandName: ${JSON.stringify(offer.brandName)},
    partnerName: ${JSON.stringify(offer.partnerName)},
    categorySlug: '${offer.categorySlug}',
    subcategorySlug: '${offer.subcategorySlug}',
    minorCategorySlug: '${offer.minorCategorySlug}',
    description: ${JSON.stringify(offer.description)},
    benefit: ${JSON.stringify(offer.benefit)},
    offerType: '${offer.offerType}',
    affiliateUrl: '${offer.affiliateUrl}'
  },
`;
}

outputFile += `];\n`;

fs.writeFileSync('src/features/marketplace/data/diningPartners.ts', outputFile);

console.log(`Parsed ${offersList.length} total mappings for ${seenPartners.size} unique brands.`);

import fs from 'fs';

const mdText = fs.readFileSync('lifestyle_dataset.md', 'utf8');
const lines = mdText.split('\n').map(l => l.trim()).filter(l => l !== '');

const startIndex = lines.indexOf('Nykaa');
if (startIndex === -1) {
  console.error('Could not find start index in dataset');
  process.exit(1);
}

const dataLines = lines.slice(startIndex);
const offers: any[] = [];
const seenPartners = new Set<string>();

for (let i = 0; i < dataLines.length; i += 12) {
  if (i + 11 >= dataLines.length) break;
  const brand = dataLines[i];
  if (brand.startsWith('CATEGORY SUMMARY') || brand.startsWith('TOP 25')) break;

  const category = dataLines[i+1];
  if (category !== 'Lifestyle') break;

  const subcategory = dataLines[i+2];
  const minorCategory = dataLines[i+3];
  const description = dataLines[i+4];
  const website = dataLines[i+5];
  const directUrl = dataLines[i+6];
  const benefit = dataLines[i+7];
  
  const id = brand.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const catSlug = 'lifestyle';
  
  let subcatSlug = '';
  let minorCatSlug = '';

  const subLC = subcategory.toLowerCase();
  if (subLC === 'beauty') subcatSlug = 'beauty';
  else if (subLC === 'wellness') subcatSlug = 'wellness';
  else if (subLC === 'fitness') subcatSlug = 'fitness';
  else if (subLC === 'personal care') subcatSlug = 'personal-care';
  else if (subLC === 'luxury') subcatSlug = 'luxury';
  else if (subLC === 'experiences') subcatSlug = 'experiences';
  else subcatSlug = 'other';

  const minorLC = minorCategory.toLowerCase();
  
  if (subcatSlug === 'beauty') {
    if (minorLC.includes('skin')) minorCatSlug = 'skincare';
    else if (minorLC.includes('makeup')) minorCatSlug = 'makeup';
    else if (minorLC.includes('hair')) minorCatSlug = 'haircare';
    else if (minorLC.includes('salon')) minorCatSlug = 'salons';
    else if (minorLC.includes('service')) minorCatSlug = 'beauty-services';
  } else if (subcatSlug === 'wellness') {
    if (minorLC.includes('spa')) minorCatSlug = 'spa';
    else if (minorLC.includes('pilates')) minorCatSlug = 'pilates';
    else if (minorLC.includes('yoga')) minorCatSlug = 'yoga';
    else if (minorLC.includes('centre')) minorCatSlug = 'wellness-centres';
    else if (minorLC.includes('meditation')) minorCatSlug = 'meditation';
    else if (minorLC.includes('recovery')) minorCatSlug = 'recovery';
  } else if (subcatSlug === 'fitness') {
    if (minorLC === 'gyms') minorCatSlug = 'gyms';
    else if (minorLC.includes('class')) minorCatSlug = 'fitness-classes';
    else if (minorLC.includes('training')) minorCatSlug = 'personal-training';
    else if (minorLC.includes('sport')) minorCatSlug = 'sports';
    else if (minorLC.includes('equipment')) minorCatSlug = 'fitness-equipment';
  } else if (subcatSlug === 'personal-care') {
    if (minorLC === 'grooming') minorCatSlug = 'grooming';
    else if (minorLC === 'personal care') minorCatSlug = 'personal-care';
    else if (minorLC.includes('health')) minorCatSlug = 'health-wellness-products';
    else if (minorLC.includes('men')) minorCatSlug = 'mens-grooming';
    else if (minorLC.includes('women')) minorCatSlug = 'womens-personal-care';
  } else if (subcatSlug === 'luxury') {
    if (minorLC.includes('brand')) minorCatSlug = 'premium-brands';
    else if (minorLC.includes('experience')) minorCatSlug = 'luxury-experiences';
    else if (minorLC.includes('service')) minorCatSlug = 'premium-services';
    else if (minorLC.includes('fine')) minorCatSlug = 'fine-lifestyle';
  } else if (subcatSlug === 'experiences') {
    if (minorLC.includes('entertainment')) minorCatSlug = 'entertainment';
    else if (minorLC.includes('event')) minorCatSlug = 'events';
    else if (minorLC === 'activities') minorCatSlug = 'activities';
    else if (minorLC.includes('weekend')) minorCatSlug = 'weekend-experiences';
    else if (minorLC.includes('premium')) minorCatSlug = 'premium-experiences';
  }

  const uniqueKey = `${id}-${subcatSlug}-${minorCatSlug}`;
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
      affiliateUrl: directUrl.startsWith('http') ? directUrl : website,
      isDiscovery: true
    });
  }
}

const fileContent = `import type { MarketplaceOffer } from '../types';

export const LIFESTYLE_PARTNERS: MarketplaceOffer[] = ${JSON.stringify(offers, null, 2)};
`;

fs.writeFileSync('src/features/marketplace/data/lifestylePartners.ts', fileContent);
console.log('Successfully wrote', offers.length, 'partners to lifestylePartners.ts');

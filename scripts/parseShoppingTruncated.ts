import fs from 'fs';

const text = fs.readFileSync('shopping_dataset.md', 'utf8');
const startIdx = text.indexOf('Banner URL') + 'Banner URL'.length;
let data = text.substring(startIdx);

// Some trailing garbage from truncation might exist, let's clean it up
const lastValidIdx = data.lastIndexOf('VERIFIEDLOGO URL UNAVAILABLEBANNER URL UNAVAILABLE');
if (lastValidIdx !== -1) {
  data = data.substring(0, lastValidIdx + 'VERIFIEDLOGO URL UNAVAILABLEBANNER URL UNAVAILABLE'.length);
}

const rows = data.split('VERIFIEDLOGO URL UNAVAILABLEBANNER URL UNAVAILABLE').filter(r => r.trim() !== '');

const subcategories = [
  'Electronics', 'Fashion', 'Home', 'Beauty & Personal Care', 'Grocery', 
  'Shopping Platforms', 'Kids & Baby', 'Jewellery & Accessories'
];

const minorCategories = [
  'Smartphones', 'Laptops', 'Tablets', 'Audio', 'Cameras', 'Gaming', 'Accessories', 'Smart Devices',
  'Clothing', 'Shoes', 'Accessories', 'Ethnic Wear', 'Women\'s Fashion', 'Men\'s Fashion', 'Kids\' Fashion', 'Workwear', 'Innerwear & Loungewear',
  'Furniture', 'Appliances', 'Home Decor', 'Kitchen', 'Bedding & Bath', 'Home Improvement',
  'Skincare', 'Makeup', 'Haircare', 'Grooming', 'Personal Care',
  'Online Grocery', 'Supermarkets', 'Fresh Food', 'Daily Essentials', 'Household Essentials',
  'Marketplaces', 'Brand Stores', 'D2C Brands', 'Department Stores',
  'Baby Products', 'Kids\' Toys', 'Kids\' Clothing', 'Maternity', 'Baby Care',
  'Jewellery', 'Watches', 'Sunglasses', 'Bags', 'Fashion Accessories'
];

const offersList: any[] = [];
const seenPartners = new Set<string>();

for (const row of rows) {
  // Find URL boundaries
  const urlMatch = row.match(/(https:\/\/[^\s]+?(?:\.com|\.in|\.co\.in|\.info|\.net|\.org)[^\s]*?)(https:\/\/[^\s]+|DIRECT URL UNAVAILABLE)/);
  if (!urlMatch) {
    console.log("Could not find URLs in:", row.substring(0, 50));
    continue;
  }
  
  let website = urlMatch[1];
  let directUrl = urlMatch[2];

  // Strip trailing artifacts like Premium, Smartphones, etc.
  // The squashed text almost always starts with an uppercase letter after a lowercase, number, or slash.
  website = website.replace(/([a-z0-9\/\-])([A-Z].*)$/, '$1');
  directUrl = directUrl.replace(/([a-z0-9\/\-])([A-Z].*)$/, '$1');

  // Strip known specific artifacts just in case
  if (website.includes('PAN-INDIA')) website = website.substring(0, website.indexOf('PAN-INDIA'));
  if (website.includes('TIER-1')) website = website.substring(0, website.indexOf('TIER-1'));
  if (directUrl.includes('PAN-INDIA')) directUrl = directUrl.substring(0, directUrl.indexOf('PAN-INDIA'));
  if (directUrl.includes('TIER-1')) directUrl = directUrl.substring(0, directUrl.indexOf('TIER-1'));

  const prefix = row.substring(0, urlMatch.index);
  const suffix = row.substring((urlMatch.index || 0) + urlMatch[0].length);
  
  // Parse prefix: Brand + "Shopping" + Subcategory + MinorCategory + Description
  let brand = '';
  let subcategory = '';
  let minorCategory = '';
  let description = '';
  
  const shoppingIdx = prefix.indexOf('Shopping');
  if (shoppingIdx !== -1) {
    brand = prefix.substring(0, shoppingIdx);
    const rest = prefix.substring(shoppingIdx + 8);
    
    // Find subcategory
    for (const sub of subcategories) {
      if (rest.startsWith(sub)) {
        subcategory = sub;
        const rest2 = rest.substring(sub.length);
        
        // Find minor category
        for (const minor of minorCategories) {
          if (rest2.startsWith(minor)) {
            minorCategory = minor;
            description = rest2.substring(minor.length);
            break;
          }
        }
        break;
      }
    }
  }
  
  // If we couldn't parse cleanly, skip or fallback
  if (!brand || !subcategory || !minorCategory) {
    console.log("Failed to parse prefix cleanly:", prefix);
    continue;
  }
  
  // Clean up IDs and slugs
  const id = brand.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const catSlug = 'shopping';
  
  let subcatSlug = subcategory.toLowerCase().replace(/ & /g, '-').replace(/[^a-z0-9-]/g, '');
  let minorCatSlug = minorCategory.toLowerCase().replace(/ & /g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Special taxonomy mapping for Shopping
  if (subcatSlug === 'beauty-personal-care') subcatSlug = 'beauty';
  if (minorCatSlug === 'personal-care') minorCatSlug = 'personal-care-minor';
  if (subcatSlug === 'kids-baby') subcatSlug = 'kids-baby'; // Needs to exist in categories.ts
  if (subcatSlug === 'jewellery-accessories') subcatSlug = 'jewellery'; // Needs to exist in categories.ts
  if (subcatSlug === 'shopping-platforms') subcatSlug = 'platforms';
  
  // Correct known minor slugs from categories.ts
  if (subcatSlug === 'electronics') {
    if (minorCatSlug === 'smartphones') minorCatSlug = 'phones';
    else if (minorCatSlug === 'accessories') minorCatSlug = 'acc';
  }
  if (subcatSlug === 'fashion') {
    if (minorCatSlug === 'accessories') minorCatSlug = 'fashion-acc';
  }

  const uniqueKey = id + '-' + subcatSlug + '-' + minorCatSlug;
  if (!seenPartners.has(uniqueKey)) {
    seenPartners.add(uniqueKey);
    offersList.push({
      id,
      partnerName: brand,
      partnerLogo: '', // placeholder
      description: description,
      categorySlug: catSlug,
      subcategorySlug: subcatSlug,
      minorCategorySlug: minorCatSlug,
      affiliateUrl: directUrl.startsWith('http') ? directUrl : website,
      isDiscovery: true
    });
  }
}

const fileContent = "import type { MarketplaceOffer } from '../types';\n\nexport const SHOPPING_PARTNERS: MarketplaceOffer[] = " + JSON.stringify(offersList, null, 2) + ";\n";

fs.writeFileSync('src/features/marketplace/data/shoppingPartners.ts', fileContent);
console.log('Successfully wrote', offersList.length, 'partners to shoppingPartners.ts');


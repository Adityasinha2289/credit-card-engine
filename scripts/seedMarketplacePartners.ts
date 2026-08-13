import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env from project root
dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const partnersToSeed = [
  {
    slug: 'house-of-chikankari',
    name: 'House of Chikankari',
    categorySlug: 'shopping',
    description: 'Referral-ready D2C brand.',
    logo_url: '',
  },
  {
    slug: 'bummer',
    name: 'Bummer',
    categorySlug: 'shopping',
    description: 'D2C innerwear and loungewear.',
    logo_url: '',
  },
  {
    slug: 'powersutra',
    name: 'Powersutra',
    categorySlug: 'shopping',
    description: 'Womens workwear.',
    logo_url: '',
  },
  {
    slug: 'bushirt',
    name: 'Bushirt',
    categorySlug: 'shopping',
    description: 'Mens casual.',
    logo_url: '',
  },
  {
    slug: 'littlebox-india',
    name: 'Littlebox India',
    categorySlug: 'shopping',
    description: 'Gen-Z women fast fashion.',
    logo_url: '',
  },
  {
    slug: 'pilates-dluxe',
    name: "Pilates d'Luxe",
    categorySlug: 'lifestyle',
    description: 'Reformer Pilates.',
    logo_url: '',
  },
  {
    slug: 'nitrro-fitness',
    name: 'Nitrro Fitness',
    categorySlug: 'lifestyle',
    description: 'Premium gym chain.',
    logo_url: '',
  },
  {
    slug: 'burn-out',
    name: 'Burn-Out Unisex Fitness Studio',
    categorySlug: 'lifestyle',
    description: 'Regional gym chain.',
    logo_url: '',
  },
  {
    slug: 'the-pilates-studio',
    name: 'The Pilates Studio',
    categorySlug: 'lifestyle',
    description: 'Pilates and EMS.',
    logo_url: '',
  },
  {
    slug: 'kris-gethin-gyms',
    name: 'Kris Gethin Gyms',
    categorySlug: 'lifestyle',
    description: 'Luxury gym chain.',
    logo_url: '',
  }
];

async function seed() {
  console.log('Fetching category IDs...');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug');

  if (catError) {
    console.error('Error fetching categories', catError);
    return;
  }

  const categoryMap = categories.reduce((acc: any, cat: any) => {
    acc[cat.slug] = cat.id;
    return acc;
  }, {});

  console.log('Seeding marketplace partners...');
  
  for (const p of partnersToSeed) {
    const categoryId = categoryMap[p.categorySlug];
    if (!categoryId) {
      console.log(`Skipping ${p.name}, category ${p.categorySlug} not found.`);
      continue;
    }

    const { error } = await supabase
      .from('partners')
      .upsert({
        slug: p.slug,
        name: p.name,
        description: p.description,
        logo_url: p.logo_url,
        primary_category_id: categoryId,
        status: 'active'
      }, { onConflict: 'slug' });
      
    if (error) {
      console.error(`Error inserting partner ${p.name}:`, error);
    } else {
      console.log(`✅ Upserted partner: ${p.name}`);
    }
  }

  // Insert offer for Littlebox India
  // Since offers table doesn't have partner_id, we will store it in internal_campaign_metadata
  const { data: partnerData } = await supabase.from('partners').select('id').eq('slug', 'littlebox-india').single();
  if (partnerData) {
    const { error: offerError } = await supabase
      .from('offers')
      .upsert({
        source: 'merchant',
        offer_type: 'percentage_discount',
        value: 10,
        title: 'Up to 10% Creator Commission',
        description: 'Exclusive 10% commission on qualifying organic sales via the Creator Program.',
        min_spend: 0,
        valid_until: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        internal_campaign_metadata: { partner_id: partnerData.id }
      }, { onConflict: 'id' });

      if (offerError) {
        console.error(`Error inserting offer:`, offerError);
      } else {
        console.log(`✅ Upserted offer for Littlebox India`);
      }
  }
  
  console.log('Seeding completed!');
}

seed().catch(console.error);

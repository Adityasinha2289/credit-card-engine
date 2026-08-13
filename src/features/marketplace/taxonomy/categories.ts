import type { MarketplaceCategory } from '../types';

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    id: 'c-travel',
    slug: 'travel',
    name: 'Travel & Flights',
    description: 'Maximize miles, hotel stays and travel rewards.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop',
    iconName: 'Plane',
    subcategories: [
      {
        id: 'sc-flights',
        slug: 'flights',
        name: 'Flights',
        subSubCategories: [
          { id: 'ssc-domestic-flights', slug: 'domestic-flights', name: 'Domestic Flights' },
          { id: 'ssc-international-flights', slug: 'international-flights', name: 'International Flights' },
          { id: 'ssc-business-class', slug: 'business-class', name: 'Business Class' },
          { id: 'ssc-student-flights', slug: 'student-flights', name: 'Student Flights' },
          { id: 'ssc-flight-hotel', slug: 'flight-hotel', name: 'Flight + Hotel' }
        ]
      },
      {
        id: 'sc-hotels-stays',
        slug: 'hotels-stays',
        name: 'Hotels & Stays',
        subSubCategories: [
          { id: 'ssc-hotels', slug: 'hotels', name: 'Hotels' },
          { id: 'ssc-resorts', slug: 'resorts', name: 'Resorts' },
          { id: 'ssc-hostels', slug: 'hostels', name: 'Hostels' },
          { id: 'ssc-luxury-stays', slug: 'luxury-stays', name: 'Luxury Stays' },
          { id: 'ssc-staycations', slug: 'staycations', name: 'Staycations' },
          { id: 'ssc-vacation-rentals', slug: 'vacation-rentals', name: 'Vacation Rentals' }
        ]
      },
      {
        id: 'sc-trains-buses',
        slug: 'trains-buses',
        name: 'Trains & Buses',
        subSubCategories: [
          { id: 'ssc-trains', slug: 'trains', name: 'Trains' },
          { id: 'ssc-buses', slug: 'buses', name: 'Buses' },
          { id: 'ssc-intercity-travel', slug: 'intercity-travel', name: 'Intercity Travel' },
          { id: 'ssc-rail-passes', slug: 'rail-passes', name: 'Rail Passes' }
        ]
      },
      {
        id: 'sc-airport',
        slug: 'airport',
        name: 'Airport',
        subSubCategories: [
          { id: 'ssc-lounge-access', slug: 'lounge-access', name: 'Lounge Access' },
          { id: 'ssc-airport-transfers', slug: 'airport-transfers', name: 'Airport Transfers' },
          { id: 'ssc-airport-parking', slug: 'airport-parking', name: 'Airport Parking' },
          { id: 'ssc-meet-assist', slug: 'meet-assist', name: 'Meet & Assist' }
        ]
      },
      {
        id: 'sc-travel-experiences',
        slug: 'travel-experiences',
        name: 'Travel Experiences',
        subSubCategories: [
          { id: 'ssc-tours', slug: 'tours', name: 'Tours' },
          { id: 'ssc-activities', slug: 'activities', name: 'Activities' },
          { id: 'ssc-attractions', slug: 'attractions', name: 'Attractions' },
          { id: 'ssc-adventure', slug: 'adventure', name: 'Adventure' },
          { id: 'ssc-cruises', slug: 'cruises', name: 'Cruises' }
        ]
      },
      {
        id: 'sc-car-rental-mobility',
        slug: 'car-rental-mobility',
        name: 'Car Rental & Mobility',
        subSubCategories: [
          { id: 'ssc-car-rentals', slug: 'car-rentals', name: 'Car Rentals' },
          { id: 'ssc-self-drive', slug: 'self-drive', name: 'Self-Drive' },
          { id: 'ssc-chauffeur-services', slug: 'chauffeur-services', name: 'Chauffeur Services' },
          { id: 'ssc-intercity-cabs', slug: 'intercity-cabs', name: 'Intercity Cabs' }
        ]
      }
    ],
    filters: [
      { id: 'domestic', label: 'Domestic', type: 'boolean' },
      { id: 'international', label: 'International', type: 'boolean' },
      { id: 'cashback', label: 'Cashback', type: 'boolean' },
      { id: 'miles', label: 'Miles', type: 'boolean' }
    ]
  },
  {
    id: 'c-lifestyle',
    slug: 'lifestyle',
    name: 'Lifestyle',
    description: 'Everyday lifestyle spending and experiences.',
    image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=1200&auto=format&fit=crop',
    iconName: 'Compass',
    subcategories: [
      {
        id: 'sc-beauty',
        slug: 'beauty',
        name: 'Beauty',
        subSubCategories: [
          { id: 'ssc-skincare', slug: 'skincare', name: 'Skincare' },
          { id: 'ssc-makeup', slug: 'makeup', name: 'Makeup' },
          { id: 'ssc-haircare', slug: 'haircare', name: 'Haircare' },
          { id: 'ssc-salons', slug: 'salons', name: 'Salons' },
          { id: 'ssc-beauty-services', slug: 'beauty-services', name: 'Beauty Services' }
        ]
      },
      {
        id: 'sc-wellness',
        slug: 'wellness',
        name: 'Wellness',
        subSubCategories: [
          { id: 'ssc-spa', slug: 'spa', name: 'Spa' },
          { id: 'ssc-pilates', slug: 'pilates', name: 'Pilates' },
          { id: 'ssc-yoga', slug: 'yoga', name: 'Yoga' },
          { id: 'ssc-wellness-centres', slug: 'wellness-centres', name: 'Wellness Centres' },
          { id: 'ssc-meditation', slug: 'meditation', name: 'Meditation' },
          { id: 'ssc-recovery', slug: 'recovery', name: 'Recovery' }
        ]
      },
      {
        id: 'sc-fitness',
        slug: 'fitness',
        name: 'Fitness',
        subSubCategories: [
          { id: 'ssc-gyms', slug: 'gyms', name: 'Gyms' },
          { id: 'ssc-fitness-classes', slug: 'fitness-classes', name: 'Fitness Classes' },
          { id: 'ssc-personal-training', slug: 'personal-training', name: 'Personal Training' },
          { id: 'ssc-sports', slug: 'sports', name: 'Sports' },
          { id: 'ssc-fitness-equipment', slug: 'fitness-equipment', name: 'Fitness Equipment' }
        ]
      },
      {
        id: 'sc-personal-care',
        slug: 'personal-care',
        name: 'Personal Care',
        subSubCategories: [
          { id: 'ssc-grooming', slug: 'grooming', name: 'Grooming' },
          { id: 'ssc-personal-care-minor', slug: 'personal-care', name: 'Personal Care' },
          { id: 'ssc-health-wellness-products', slug: 'health-wellness-products', name: 'Health & Wellness Products' },
          { id: 'ssc-mens-grooming', slug: 'mens-grooming', name: "Men's Grooming" },
          { id: 'ssc-womens-personal-care', slug: 'womens-personal-care', name: "Women's Personal Care" }
        ]
      },
      {
        id: 'sc-luxury',
        slug: 'luxury',
        name: 'Luxury',
        subSubCategories: [
          { id: 'ssc-premium-brands', slug: 'premium-brands', name: 'Premium Brands' },
          { id: 'ssc-luxury-experiences', slug: 'luxury-experiences', name: 'Luxury Experiences' },
          { id: 'ssc-premium-services', slug: 'premium-services', name: 'Premium Services' },
          { id: 'ssc-fine-lifestyle', slug: 'fine-lifestyle', name: 'Fine Lifestyle' }
        ]
      },
      {
        id: 'sc-experiences',
        slug: 'experiences',
        name: 'Experiences',
        subSubCategories: [
          { id: 'ssc-entertainment', slug: 'entertainment', name: 'Entertainment' },
          { id: 'ssc-events', slug: 'events', name: 'Events' },
          { id: 'ssc-activities', slug: 'activities', name: 'Activities' },
          { id: 'ssc-weekend-experiences', slug: 'weekend-experiences', name: 'Weekend Experiences' },
          { id: 'ssc-premium-experiences', slug: 'premium-experiences', name: 'Premium Experiences' }
        ]
      }
    ],
    filters: []
  },
  {
    id: 'c-shopping',
    slug: 'shopping',
    name: 'Shopping',
    description: 'Earn more on every purchase across top brands.',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=1200&auto=format&fit=crop',
    iconName: 'ShoppingBag',
    subcategories: [
      {
        id: 'sc-electronics',
        slug: 'electronics',
        name: 'Electronics',
        subSubCategories: [
          { id: 'ssc-phones', slug: 'phones', name: 'Smartphones' },
          { id: 'ssc-laptops', slug: 'laptops', name: 'Laptops' },
          { id: 'ssc-tablets', slug: 'tablets', name: 'Tablets' },
          { id: 'ssc-audio', slug: 'audio', name: 'Audio' },
          { id: 'ssc-cameras', slug: 'cameras', name: 'Cameras' },
          { id: 'ssc-gaming', slug: 'gaming', name: 'Gaming' },
          { id: 'ssc-acc', slug: 'acc', name: 'Accessories' },
          { id: 'ssc-smart-devices', slug: 'smart-devices', name: 'Smart Devices' }
        ]
      },
      {
        id: 'sc-fashion',
        slug: 'fashion',
        name: 'Fashion',
        subSubCategories: [
          { id: 'ssc-clothing', slug: 'clothing', name: 'Clothing' },
          { id: 'ssc-shoes', slug: 'shoes', name: 'Shoes' },
          { id: 'ssc-fashion-acc', slug: 'fashion-acc', name: 'Accessories' },
          { id: 'ssc-ethnic-wear', slug: 'ethnic-wear', name: 'Ethnic Wear' },
          { id: 'ssc-womens-fashion', slug: 'womens-fashion', name: "Women's Fashion" },
          { id: 'ssc-mens-fashion', slug: 'mens-fashion', name: "Men's Fashion" },
          { id: 'ssc-kids-fashion', slug: 'kids-fashion', name: "Kids' Fashion" },
          { id: 'ssc-workwear', slug: 'workwear', name: 'Workwear' },
          { id: 'ssc-innerwear-loungewear', slug: 'innerwear-loungewear', name: 'Innerwear & Loungewear' }
        ]
      },
      {
        id: 'sc-home',
        slug: 'home',
        name: 'Home',
        subSubCategories: [
          { id: 'ssc-furniture', slug: 'furniture', name: 'Furniture' },
          { id: 'ssc-appliances', slug: 'appliances', name: 'Appliances' },
          { id: 'ssc-decor', slug: 'home-decor', name: 'Home Decor' },
          { id: 'ssc-kitchen', slug: 'kitchen', name: 'Kitchen' },
          { id: 'ssc-bedding-bath', slug: 'bedding-bath', name: 'Bedding & Bath' },
          { id: 'ssc-home-improvement', slug: 'home-improvement', name: 'Home Improvement' }
        ]
      },
      {
        id: 'sc-beauty-shop',
        slug: 'beauty',
        name: 'Beauty & Personal Care',
        subSubCategories: [
          { id: 'ssc-skincare-shop', slug: 'skincare', name: 'Skincare' },
          { id: 'ssc-makeup-shop', slug: 'makeup', name: 'Makeup' },
          { id: 'ssc-haircare-shop', slug: 'haircare', name: 'Haircare' },
          { id: 'ssc-grooming-shop', slug: 'grooming', name: 'Grooming' },
          { id: 'ssc-personal-care-shop', slug: 'personal-care-minor', name: 'Personal Care' }
        ]
      },
      {
        id: 'sc-grocery',
        slug: 'grocery',
        name: 'Grocery',
        subSubCategories: [
          { id: 'ssc-online-grocery', slug: 'online-grocery', name: 'Online Grocery' },
          { id: 'ssc-supermarkets', slug: 'supermarkets', name: 'Supermarkets' },
          { id: 'ssc-fresh-food', slug: 'fresh-food', name: 'Fresh Food' },
          { id: 'ssc-daily-essentials', slug: 'daily-essentials', name: 'Daily Essentials' },
          { id: 'ssc-household-essentials', slug: 'household-essentials', name: 'Household Essentials' }
        ]
      },
      {
        id: 'sc-platforms',
        slug: 'platforms',
        name: 'Shopping Platforms',
        subSubCategories: [
          { id: 'ssc-marketplaces', slug: 'marketplaces', name: 'Marketplaces' },
          { id: 'ssc-brand-stores', slug: 'brand-stores', name: 'Brand Stores' },
          { id: 'ssc-d2c', slug: 'd2c-brands', name: 'D2C Brands' },
          { id: 'ssc-department-stores', slug: 'department-stores', name: 'Department Stores' }
        ]
      },
      {
        id: 'sc-kids-baby',
        slug: 'kids-baby',
        name: 'Kids & Baby',
        subSubCategories: [
          { id: 'ssc-baby-products', slug: 'baby-products', name: 'Baby Products' },
          { id: 'ssc-kids-toys', slug: 'kids-toys', name: "Kids' Toys" },
          { id: 'ssc-kids-clothing', slug: 'kids-clothing', name: "Kids' Clothing" },
          { id: 'ssc-maternity', slug: 'maternity', name: 'Maternity' },
          { id: 'ssc-baby-care', slug: 'baby-care', name: 'Baby Care' }
        ]
      },
      {
        id: 'sc-jewellery',
        slug: 'jewellery',
        name: 'Jewellery & Accessories',
        subSubCategories: [
          { id: 'ssc-jewel', slug: 'jewellery', name: 'Jewellery' },
          { id: 'ssc-watches', slug: 'watches', name: 'Watches' },
          { id: 'ssc-sunglasses', slug: 'sunglasses', name: 'Sunglasses' },
          { id: 'ssc-bags', slug: 'bags', name: 'Bags' },
          { id: 'ssc-fashion-accessories-jewel', slug: 'fashion-accessories', name: 'Fashion Accessories' }
        ]
      }
    ],
    filters: [
      { id: 'online', label: 'Online', type: 'boolean' },
      { id: 'offline', label: 'Offline', type: 'boolean' },
      { id: 'cashback', label: 'Cashback', type: 'boolean' },
      { id: 'rewards', label: 'Rewards', type: 'boolean' },
      { id: 'emi', label: 'EMI', type: 'boolean' },
      { id: 'instant-discount', label: 'Instant Discount', type: 'boolean' }
    ]
  },
  {
    id: 'c-dining',
    slug: 'dining',
    name: 'Dining',
    description: 'Get the best rewards at your favourite restaurants.',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200&auto=format&fit=crop',
    iconName: 'Utensils',
    subcategories: [
      {
        id: 'sc-restaurants',
        slug: 'restaurants',
        name: 'Restaurants',
        subSubCategories: [
          { id: 'ssc-fine-dining', slug: 'fine-dining', name: 'Fine Dining' },
          { id: 'ssc-casual-dining', slug: 'casual-dining', name: 'Casual Dining' },
          { id: 'ssc-qsr', slug: 'qsr', name: 'QSR' },
          { id: 'ssc-family-dining-restaurants', slug: 'family-dining-restaurants', name: 'Family Dining' },
          { id: 'ssc-buffets', slug: 'buffets', name: 'Buffets' }
        ]
      },
      {
        id: 'sc-cafes-drinks',
        slug: 'cafes-drinks',
        name: 'Cafés & Drinks',
        subSubCategories: [
          { id: 'ssc-coffee', slug: 'coffee', name: 'Coffee' },
          { id: 'ssc-cafes', slug: 'cafes', name: 'Cafés' },
          { id: 'ssc-desserts', slug: 'desserts', name: 'Desserts' },
          { id: 'ssc-tea', slug: 'tea', name: 'Tea' },
          { id: 'ssc-beverages', slug: 'beverages', name: 'Beverages' }
        ]
      },
      {
        id: 'sc-food-delivery',
        slug: 'food-delivery',
        name: 'Food Delivery',
        subSubCategories: [
          { id: 'ssc-food-delivery-platforms', slug: 'food-delivery-platforms', name: 'Food Delivery Platforms' },
          { id: 'ssc-restaurant-delivery', slug: 'restaurant-delivery', name: 'Restaurant Delivery' },
          { id: 'ssc-cloud-kitchens', slug: 'cloud-kitchens', name: 'Cloud Kitchens' }
        ]
      },
      {
        id: 'sc-dining-experiences',
        slug: 'dining-experiences',
        name: 'Dining Experiences',
        subSubCategories: [
          { id: 'ssc-date-night', slug: 'date-night', name: 'Date Night' },
          { id: 'ssc-brunch', slug: 'brunch', name: 'Brunch' },
          { id: 'ssc-family-dining-experiences', slug: 'family-dining-experiences', name: 'Family Dining' },
          { id: 'ssc-celebrations', slug: 'celebrations', name: 'Celebrations' },
          { id: 'ssc-premium-experiences', slug: 'premium-experiences', name: 'Premium Experiences' }
        ]
      }
    ],
    filters: [
      { id: 'near-me', label: 'Near Me', type: 'boolean' },
      { id: 'under-500', label: 'Under ₹500', type: 'boolean' },
      { id: 'date-night', label: 'Date Night', type: 'boolean' },
      { id: 'family', label: 'Family', type: 'boolean' },
      { id: 'fine-dining', label: 'Fine Dining', type: 'boolean' },
      { id: 'offers', label: 'Offers', type: 'boolean' }
    ]
  },
  {
    id: 'c-learning',
    slug: 'learning',
    name: 'Learning',
    description: 'Pay less, learn more with exclusive offers on courses.',
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop',
    iconName: 'BookOpen',
    subcategories: [
      {
        id: 'sc-education',
        slug: 'education',
        name: 'Education',
        subSubCategories: [
          { id: 'ssc-school', slug: 'school', name: 'School' },
          { id: 'ssc-college', slug: 'college', name: 'College' },
          { id: 'ssc-university', slug: 'university', name: 'University' },
          { id: 'ssc-certifications', slug: 'certifications', name: 'Certifications' }
        ]
      },
      {
        id: 'sc-professional-skills',
        slug: 'professional-skills',
        name: 'Professional Skills',
        subSubCategories: [
          { id: 'ssc-finance', slug: 'finance', name: 'Finance' },
          { id: 'ssc-marketing', slug: 'marketing', name: 'Marketing' },
          { id: 'ssc-coding', slug: 'coding', name: 'Coding' },
          { id: 'ssc-design', slug: 'design', name: 'Design' },
          { id: 'ssc-data', slug: 'data', name: 'Data' },
          { id: 'ssc-ai', slug: 'ai', name: 'AI' }
        ]
      },
      {
        id: 'sc-career',
        slug: 'career',
        name: 'Career',
        subSubCategories: [
          { id: 'ssc-internships', slug: 'internships', name: 'Internships' },
          { id: 'ssc-job-prep', slug: 'job-prep', name: 'Job Preparation' },
          { id: 'ssc-interview', slug: 'interview', name: 'Interview Preparation' },
          { id: 'ssc-resume', slug: 'resume', name: 'Resume Building' }
        ]
      },
      {
        id: 'sc-online-learning',
        slug: 'online-learning',
        name: 'Online Learning',
        subSubCategories: [
          { id: 'ssc-courses', slug: 'courses', name: 'Courses' },
          { id: 'ssc-bootcamps', slug: 'bootcamps', name: 'Bootcamps' },
          { id: 'ssc-masterclasses', slug: 'masterclasses', name: 'Masterclasses' },
          { id: 'ssc-certifications-online', slug: 'certifications', name: 'Certifications' }
        ]
      },
      {
        id: 'sc-language',
        slug: 'language',
        name: 'Language',
        subSubCategories: [
          { id: 'ssc-english', slug: 'english', name: 'English' },
          { id: 'ssc-foreign', slug: 'foreign', name: 'Foreign Languages' },
          { id: 'ssc-comm', slug: 'communication', name: 'Communication' }
        ]
      },
      {
        id: 'sc-books',
        slug: 'books',
        name: 'Books',
        subSubCategories: [
          { id: 'ssc-physical-books', slug: 'physical', name: 'Physical Books' },
          { id: 'ssc-ebooks', slug: 'ebooks', name: 'E-books' },
          { id: 'ssc-audiobooks', slug: 'audiobooks', name: 'Audiobooks' }
        ]
      }
    ],
    filters: []
  },
  {
    id: 'c-debt',
    slug: 'debt',
    name: 'Debt',
    description: 'Smart tools and offers to help you manage and repay better.',
    image: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?q=80&w=1200&auto=format&fit=crop',
    iconName: 'Receipt',
    subcategories: [
      {
        id: 'sc-credit-cards',
        slug: 'credit-cards',
        name: 'Credit Cards',
        subSubCategories: [
          { id: 'ssc-cc-selection', slug: 'selection', name: 'Credit Card Selection' },
          { id: 'ssc-cc-rewards', slug: 'rewards', name: 'Rewards' },
          { id: 'ssc-cc-bill-pay', slug: 'bill-payment', name: 'Bill Payment' },
          { id: 'ssc-cc-mgmt', slug: 'management', name: 'Card Management' }
        ]
      },
      {
        id: 'sc-loans',
        slug: 'loans',
        name: 'Loans',
        subSubCategories: [
          { id: 'ssc-personal-loans', slug: 'personal', name: 'Personal Loans' },
          { id: 'ssc-edu-loans', slug: 'education', name: 'Education Loans' },
          { id: 'ssc-vehicle-loans', slug: 'vehicle', name: 'Vehicle Loans' },
          { id: 'ssc-home-loans', slug: 'home', name: 'Home Loans' }
        ]
      },
      {
        id: 'sc-bnpl',
        slug: 'bnpl',
        name: 'BNPL',
        subSubCategories: [
          { id: 'ssc-pay-later', slug: 'pay-later', name: 'Pay Later' },
          { id: 'ssc-emi', slug: 'emi', name: 'EMI' }
        ]
      },
      {
        id: 'sc-debt-management',
        slug: 'debt-management',
        name: 'Debt Management',
        subSubCategories: [
          { id: 'ssc-repayment-plan', slug: 'repayment', name: 'Repayment Planning' },
          { id: 'ssc-emi-mgmt', slug: 'emi-management', name: 'EMI Management' },
          { id: 'ssc-consolidation', slug: 'consolidation', name: 'Debt Consolidation' },
          { id: 'ssc-utilization', slug: 'utilization', name: 'Credit Utilisation' }
        ]
      }
    ],
    filters: [
      { id: 'loan-type', label: 'Loan Type', type: 'options', options: [{value: 'personal', label: 'Personal'}, {value: 'home', label: 'Home'}] },
      { id: 'emi', label: 'EMI', type: 'boolean' },
      { id: 'repayment', label: 'Repayment', type: 'boolean' },
      { id: 'credit-utilization', label: 'Credit Utilisation', type: 'boolean' }
    ]
  },
  {
    id: 'c-investment',
    slug: 'investment',
    name: 'Investment',
    description: 'Grow your wealth with partners and smart reward strategies.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop',
    iconName: 'TrendingUp',
    subcategories: [
      {
        id: 'sc-mutual-funds',
        slug: 'mutual-funds',
        name: 'Mutual Funds',
        subSubCategories: [
          { id: 'ssc-sip', slug: 'sip', name: 'SIP' },
          { id: 'ssc-equity', slug: 'equity', name: 'Equity Funds' },
          { id: 'ssc-debt-fund', slug: 'debt', name: 'Debt Funds' },
          { id: 'ssc-index', slug: 'index', name: 'Index Funds' }
        ]
      },
      {
        id: 'sc-stocks',
        slug: 'stocks',
        name: 'Stocks',
        subSubCategories: [
          { id: 'ssc-indian-stocks', slug: 'indian', name: 'Indian Stocks' },
          { id: 'ssc-us-stocks', slug: 'us', name: 'US Stocks' }
        ]
      },
      {
        id: 'sc-etfs',
        slug: 'etfs',
        name: 'ETFs',
        subSubCategories: []
      },
      {
        id: 'sc-fixed-income',
        slug: 'fixed-income',
        name: 'Fixed Income',
        subSubCategories: [
          { id: 'ssc-fd', slug: 'fd', name: 'Fixed Deposits' },
          { id: 'ssc-bonds', slug: 'bonds', name: 'Bonds' },
          { id: 'ssc-govt-sec', slug: 'govt-sec', name: 'Government Securities' }
        ]
      },
      {
        id: 'sc-gold',
        slug: 'gold',
        name: 'Gold',
        subSubCategories: [
          { id: 'ssc-digital-gold', slug: 'digital', name: 'Digital Gold' },
          { id: 'ssc-gold-etf', slug: 'etf', name: 'Gold ETFs' },
          { id: 'ssc-sgb', slug: 'sgb', name: 'Sovereign Gold' }
        ]
      }
    ],
    filters: [
      { id: 'investment-type', label: 'Investment Type', type: 'options' },
      { id: 'risk', label: 'Risk', type: 'options' },
      { id: 'horizon', label: 'Horizon', type: 'options' }
    ]
  },
  {
    id: 'c-hobbies',
    slug: 'hobbies',
    name: 'Hobbies',
    description: 'From gadgets to gear, rewards for what you love.',
    image: 'https://images.unsplash.com/photo-1511871893393-82ce9c2aa4bf?q=80&w=1200&auto=format&fit=crop',
    iconName: 'Heart',
    subcategories: [
      {
        id: 'sc-photography',
        slug: 'photography',
        name: 'Photography',
        subSubCategories: [
          { id: 'ssc-cameras', slug: 'cameras', name: 'Cameras' },
          { id: 'ssc-lenses', slug: 'lenses', name: 'Lenses' },
          { id: 'ssc-photo-acc', slug: 'accessories', name: 'Accessories' }
        ]
      },
      {
        id: 'sc-gaming-hobbies',
        slug: 'gaming',
        name: 'Gaming',
        subSubCategories: [
          { id: 'ssc-consoles', slug: 'consoles', name: 'Consoles' },
          { id: 'ssc-games', slug: 'games', name: 'Games' },
          { id: 'ssc-gaming-acc', slug: 'accessories', name: 'Gaming Accessories' }
        ]
      },
      {
        id: 'sc-music',
        slug: 'music',
        name: 'Music',
        subSubCategories: [
          { id: 'ssc-instruments', slug: 'instruments', name: 'Instruments' },
          { id: 'ssc-music-classes', slug: 'classes', name: 'Music Classes' },
          { id: 'ssc-audio-equip', slug: 'audio', name: 'Audio Equipment' }
        ]
      },
      {
        id: 'sc-sports-hobbies',
        slug: 'sports',
        name: 'Sports',
        subSubCategories: [
          { id: 'ssc-sports-equip', slug: 'equipment', name: 'Equipment' },
          { id: 'ssc-sports-classes', slug: 'classes', name: 'Classes' },
          { id: 'ssc-sportswear', slug: 'sportswear', name: 'Sportswear' }
        ]
      },
      {
        id: 'sc-art',
        slug: 'art',
        name: 'Art & Creativity',
        subSubCategories: [
          { id: 'ssc-art-supplies', slug: 'supplies', name: 'Art Supplies' },
          { id: 'ssc-craft', slug: 'craft', name: 'Craft' },
          { id: 'ssc-painting', slug: 'painting', name: 'Painting' },
          { id: 'ssc-diy', slug: 'diy', name: 'DIY' }
        ]
      },
      {
        id: 'sc-reading',
        slug: 'reading',
        name: 'Books & Reading',
        subSubCategories: [
          { id: 'ssc-read-books', slug: 'books', name: 'Books' },
          { id: 'ssc-ereaders', slug: 'ereaders', name: 'E-readers' },
          { id: 'ssc-book-clubs', slug: 'book-clubs', name: 'Book Clubs' }
        ]
      },
      {
        id: 'sc-collectibles',
        slug: 'collectibles',
        name: 'Collectibles',
        subSubCategories: [
          { id: 'ssc-watches', slug: 'watches', name: 'Watches' },
          { id: 'ssc-cards', slug: 'cards', name: 'Cards' },
          { id: 'ssc-memorabilia', slug: 'memorabilia', name: 'Memorabilia' }
        ]
      },
      {
        id: 'sc-tech',
        slug: 'tech',
        name: 'Tech & Gadgets',
        subSubCategories: [
          { id: 'ssc-tech-gadgets', slug: 'gadgets', name: 'Gadgets' },
          { id: 'ssc-smart-devices', slug: 'smart-devices', name: 'Smart Devices' },
          { id: 'ssc-tech-acc', slug: 'accessories', name: 'Accessories' }
        ]
      }
    ],
    filters: []
  }
];

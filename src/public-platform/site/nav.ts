/** Site navigation, shared by the header, mobile menu and footer. */

export const CARD_NEEDS = [
  { label: 'Travel & flights', to: '/compare/travel' },
  { label: 'Cashback', to: '/compare/cashback' },
  { label: 'Dining & delivery', to: '/compare/dining' },
  { label: 'Online shopping', to: '/compare/shopping' },
  { label: 'Fuel', to: '/compare/fuel' },
  { label: 'Bills & utilities', to: '/compare/utilities' },
  { label: 'Lifetime free', to: '/compare/lifetime-free' },
  { label: 'Premium', to: '/compare/premium' },
];

export const TOOLS = [
  {
    label: 'Which card to use',
    to: '/calculators/which-card-to-use',
    description: 'Rank the cards you own for any spend.',
  },
  {
    label: 'Reward calculator',
    to: '/calculators/credit-card-reward-calculator',
    description: 'What a card returns on your spend, after its fee.',
  },
  {
    label: 'Annual fee break-even',
    to: '/calculators/annual-fee-break-even',
    description: 'How much you need to spend before a fee pays for itself.',
  },
  {
    label: 'Credit utilisation',
    to: '/calculators/credit-utilization',
    description: 'How much of your limit you use, and what it does to your score.',
  },
];

export const COMPANY = [
  { label: 'About', to: '/about' },
  { label: 'How we rank cards', to: '/methodology' },
  { label: 'For business', to: '/business' },
  { label: 'Contact', to: '/contact' },
];

export const LEGAL = [
  { label: 'Editorial policy', to: '/editorial-policy' },
  { label: 'Affiliate disclosure', to: '/affiliate-disclosure' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Disclaimer', to: '/disclaimer' },
];

export const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/social_renocred/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/renocred' },
];

export const SIGN_UP = '/app/sign-up';
export const SIGN_IN = '/app/sign-in';

/** Signed-in pages. They live on the website, under the same header and footer. */
export const MY_RENOCRED = [
  { label: 'Overview', to: '/app' },
  { label: 'Wallet', to: '/app/wallet' },
  { label: 'Money', to: '/app/money' },
  { label: 'Picks for you', to: '/app/discover' },
  { label: 'Experiences', to: '/app/marketplace' },
  { label: 'Account', to: '/app/account' },
];

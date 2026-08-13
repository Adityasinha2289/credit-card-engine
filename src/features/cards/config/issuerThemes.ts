export type PatternType = 'dots' | 'lines' | 'geometric' | 'none';
export type MaterialType = 'matte' | 'metallic' | 'glossy';
export type ChipStyle = 'silver' | 'gold' | 'dark' | 'none';
export type LogoType = 'light' | 'dark' | 'colored';

export interface IssuerTheme {
  primary: string;
  secondary: string;
  accent?: string;
  surface?: string;
  text: string;
  pattern?: PatternType;
  material?: MaterialType;
  network?: string;
  chipStyle?: ChipStyle;
  logoType?: LogoType;
}

export const PRODUCT_THEMES: Record<string, IssuerTheme> = {
  // SBI
  'Cashback SBI Card': {
    primary: '#3A1C71',
    secondary: '#D76D77',
    accent: '#FFAF7B',
    text: '#FFFFFF',
    pattern: 'none',
    material: 'glossy',
    chipStyle: 'gold',
  },
  'SBI SimplyCLICK': {
    primary: '#0B8A9E',
    secondary: '#076878',
    text: '#FFFFFF',
    pattern: 'geometric',
    material: 'matte',
    chipStyle: 'silver',
  },
  'SBI Card PRIME': {
    primary: '#002E6D',
    secondary: '#1878BC',
    accent: '#E6B800',
    text: '#FFFFFF',
    pattern: 'lines',
    material: 'metallic',
    chipStyle: 'gold',
  },

  // HDFC
  'Swiggy HDFC Bank Credit Card': {
    primary: '#1E1E1E',
    secondary: '#000000',
    accent: '#FF5E00',
    text: '#FFFFFF',
    pattern: 'none',
    material: 'matte',
    network: 'mastercard',
    chipStyle: 'silver',
  },
  'HDFC Infinia': {
    primary: '#1A1A1A',
    secondary: '#2C3E50',
    text: '#E5E7EB',
    pattern: 'none',
    material: 'metallic',
    chipStyle: 'silver',
  },
  'HDFC Regalia': {
    primary: '#B69A5D',
    secondary: '#8C7335',
    text: '#FFFFFF',
    pattern: 'geometric',
    material: 'metallic',
    chipStyle: 'gold',
  },

  // ICICI
  'ICICI Coral': {
    primary: '#FF7F50',
    secondary: '#FF4500',
    text: '#FFFFFF',
    pattern: 'geometric',
    material: 'glossy',
    chipStyle: 'silver',
  },
  'ICICI Sapphiro': {
    primary: '#4B0082',
    secondary: '#2B0054',
    text: '#FFFFFF',
    pattern: 'lines',
    material: 'metallic',
    chipStyle: 'silver',
  },
  'ICICI Rubyx': {
    primary: '#900C3F',
    secondary: '#581845',
    text: '#FFFFFF',
    pattern: 'dots',
    material: 'metallic',
    chipStyle: 'silver',
  },

  // Axis
  'Axis Bank Atlas Credit Card': {
    primary: '#800020',
    secondary: '#4A0404',
    text: '#FDF7E3',
    pattern: 'none',
    material: 'matte',
    chipStyle: 'gold',
  },
  'Axis Bank Magnus Credit Card': {
    primary: '#1A1A1A',
    secondary: '#000000',
    text: '#E8DCC4',
    pattern: 'geometric',
    material: 'metallic',
    chipStyle: 'gold',
  },
  'Axis Bank ACE Credit Card': {
    primary: '#0B231E',
    secondary: '#071512',
    accent: '#00E599',
    text: '#FFFFFF',
    pattern: 'lines',
    material: 'matte',
    chipStyle: 'silver',
  },

  // Amex
  'American Express Platinum Travel Credit Card': {
    primary: '#E0E0E0',
    secondary: '#9E9E9E',
    text: '#1A1A1A',
    pattern: 'none',
    material: 'metallic',
    network: 'amex',
    chipStyle: 'silver',
    logoType: 'dark',
  },
  'American Express Membership Rewards Credit Card': {
    primary: '#002663',
    secondary: '#00173A',
    text: '#FFFFFF',
    pattern: 'none',
    material: 'matte',
    network: 'amex',
    chipStyle: 'silver',
  },
};

export const ISSUER_THEMES: Record<string, IssuerTheme> = {
  'ICICI': { primary: '#8B0000', secondary: '#58111A', text: '#FFFFFF', chipStyle: 'silver' },
  'HDFC': { primary: '#002E6D', secondary: '#00193E', text: '#FFFFFF', chipStyle: 'gold' },
  'SBI': { primary: '#1878BC', secondary: '#0A2647', text: '#FFFFFF', chipStyle: 'silver' },
  'Axis': { primary: '#800020', secondary: '#4A0404', text: '#FFFFFF', chipStyle: 'silver' },
  'Kotak': { primary: '#D8232A', secondary: '#8B0000', text: '#FFFFFF', chipStyle: 'gold' },
  'IndusInd': { primary: '#4B0082', secondary: '#240046', text: '#FFFFFF', chipStyle: 'silver' },
  'IDFC': { primary: '#C8102E', secondary: '#7A0016', text: '#FFFFFF', chipStyle: 'silver' },
  'YES': { primary: '#0033A0', secondary: '#001A57', text: '#FFFFFF', chipStyle: 'silver' },
  'Amex': { primary: '#002663', secondary: '#00173A', text: '#FFFFFF', network: 'amex', chipStyle: 'silver' },
  'American Express': { primary: '#002663', secondary: '#00173A', text: '#FFFFFF', network: 'amex', chipStyle: 'silver' },
  'HSBC': { primary: '#DB0011', secondary: '#8A000A', text: '#FFFFFF', chipStyle: 'silver' },
  'Standard Chartered': { primary: '#002A54', secondary: '#001229', text: '#FFFFFF', chipStyle: 'silver' }, 
  'AU': { primary: '#C60C30', secondary: '#CC5500', text: '#FFFFFF', chipStyle: 'silver' },
  'RBL': { primary: '#B11F24', secondary: '#5C0F12', text: '#FFFFFF', chipStyle: 'silver' },
  'Federal': { primary: '#005AAA', secondary: '#002A54', text: '#FFFFFF', chipStyle: 'silver' },
  'Bank of Baroda': { primary: '#B22222', secondary: '#722F37', text: '#FFFFFF', chipStyle: 'silver' }, 
  'BOB': { primary: '#B22222', secondary: '#722F37', text: '#FFFFFF', chipStyle: 'silver' }, 
  'Unknown': { primary: '#1F2937', secondary: '#111827', text: '#FFFFFF', chipStyle: 'silver' },
};

export function getIssuerTheme(issuer?: string, product?: string): IssuerTheme {
  if (product) {
    const productKey = Object.keys(PRODUCT_THEMES).find(k => 
      product.toUpperCase().includes(k.toUpperCase())
    );
    if (productKey) return PRODUCT_THEMES[productKey];
  }

  if (!issuer) return ISSUER_THEMES['Unknown'];
  
  if (ISSUER_THEMES[issuer]) return ISSUER_THEMES[issuer];
  
  const key = Object.keys(ISSUER_THEMES).find(k => 
    issuer.toUpperCase().includes(k.toUpperCase())
  );
  
  if (key) return ISSUER_THEMES[key];

  return ISSUER_THEMES['Unknown'];
}

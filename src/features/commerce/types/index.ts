export interface CommerceCategory {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  icon: string | null;
  status: string | null;
}

export interface CommercePartner {
  id: string;
  slug: string;
  name: string;
  primaryCategoryId: string | null;
  description: string | null;
  logoUrl: string | null;
  status: string | null;
}

export interface CommerceEntity {
  id: string;
  partnerId: string;
  categoryId: string | null;
  entityType: string;
  name: string;
  basePrice: number;
  currency: string | null;
  destinationPath: string;
  imageUrl: string | null;
  sku: string | null;
  status: string | null;
}

export interface CommerceOffer {
  id: string;
  source: 'merchant' | 'bank' | 'card_network' | 'renocred';
  offerType: 'percentage_discount' | 'flat_discount' | 'cashback' | 'points' | 'miles';
  value: number;
  title: string;
  description: string;
  minSpend: number | null;
  maxDiscount: number | null;
  validFrom: string;
  validUntil: string;
  eligibilityRules: any; // Mapped from JSON
  status: string | null;
}

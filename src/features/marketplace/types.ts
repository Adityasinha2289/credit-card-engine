export type FilterConfig = {
  id: string;
  label: string;
  type: 'boolean' | 'options';
  options?: { value: string; label: string }[];
};

export type SubSubCategory = {
  id: string;
  slug: string;
  name: string;
};

export type SubCategory = {
  id: string;
  slug: string;
  name: string;
  subSubCategories?: SubSubCategory[];
};

export type MarketplaceCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  iconName: string;
  subcategories: SubCategory[];
  filters: FilterConfig[];
};

export type MarketplaceOffer = {
  id: string;
  partnerName: string;
  partnerLogo?: string;
  title?: string;
  description?: string;
  discountType?: 'percentage' | 'flat' | 'points_multiplier';
  discountValue?: number;
  categorySlug: string;
  subcategorySlug?: string;
  eligibleNetworks?: string[];
  minimumSpend?: number;
  validity?: string;
  affiliateUrl?: string;
  isDiscovery?: boolean;
};

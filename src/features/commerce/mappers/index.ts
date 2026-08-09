import type { Database } from '../../../lib/database.types';
import type { CommerceCategory, CommercePartner, CommerceEntity, CommerceOffer } from '../types';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type PartnerRow = Database['public']['Tables']['partners']['Row'];
type EntityRow = Database['public']['Tables']['commerce_entities']['Row'];
type OfferRow = Database['public']['Tables']['offers']['Row'];

export class CommerceMapper {
  static toCategory(row: CategoryRow): CommerceCategory {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      parentId: row.parent_id,
      icon: row.icon,
      status: row.status,
    };
  }

  static toPartner(row: PartnerRow): CommercePartner {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      primaryCategoryId: row.primary_category_id,
      description: row.description,
      logoUrl: row.logo_url,
      status: row.status,
    };
  }

  static toEntity(row: EntityRow): CommerceEntity {
    return {
      id: row.id,
      partnerId: row.partner_id,
      categoryId: row.category_id,
      entityType: row.entity_type,
      name: row.name,
      basePrice: row.base_price,
      currency: row.currency,
      destinationPath: row.destination_path,
      imageUrl: row.image_url,
      sku: row.sku,
      status: row.status,
    };
  }

  static toOffer(row: OfferRow): CommerceOffer {
    return {
      id: row.id,
      source: row.source as any,
      offerType: row.offer_type as any,
      value: row.value,
      title: row.title,
      description: row.description,
      minSpend: row.min_spend,
      maxDiscount: row.max_discount,
      validFrom: row.valid_from,
      validUntil: row.valid_until,
      eligibilityRules: row.eligibility_rules,
      status: row.status,
    };
  }
}

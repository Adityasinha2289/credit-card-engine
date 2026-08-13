import React from 'react';
import { PageContainer } from '../../components/shared/PageContainer';
import { MARKETPLACE_CATEGORIES } from '../../features/marketplace/taxonomy/categories';
import { MarketplaceCategoryCard } from '../../features/marketplace/components/MarketplaceCategoryCard';

export default function MarketplaceHome() {
  const heroCategory = MARKETPLACE_CATEGORIES[0]; // Travel & Flights
  const secondaryCategories = MARKETPLACE_CATEGORIES.slice(1, 4); // Lifestyle, Shopping, Dining
  const tertiaryCategories = MARKETPLACE_CATEGORIES.slice(4); // Learning, Debt, Investment, Hobbies

  return (
    <PageContainer
      eyebrow="Marketplace"
      title="Rewards & Experiences"
      subtitle="Curated offers and partner rewards across categories that matter to you."
      className="text-[#F2F4F2] font-body"
    >
      <div className="w-full flex flex-col gap-10 relative">
        <div className="fixed inset-0 pointer-events-none z-[-1] bg-[#050806]" />

        {heroCategory && (
          <section>
            <MarketplaceCategoryCard category={heroCategory} variant="hero" />
          </section>
        )}

        {secondaryCategories.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {secondaryCategories.map((cat) => (
              <MarketplaceCategoryCard key={cat.id} category={cat} variant="secondary" />
            ))}
          </section>
        )}

        {tertiaryCategories.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tertiaryCategories.map((cat) => (
              <MarketplaceCategoryCard key={cat.id} category={cat} variant="tertiary" />
            ))}
          </section>
        )}
      </div>
    </PageContainer>
  );
}

import { ButtonLink } from '../../public-platform/site/primitives';
import { PageContainer } from '../../components/shared/PageContainer';
import { MARKETPLACE_CATEGORIES } from '../../features/marketplace/taxonomy/categories';
import { MarketplaceCategoryCard } from '../../features/marketplace/components/MarketplaceCategoryCard';

export default function MarketplaceHome() {
  const heroCategory = MARKETPLACE_CATEGORIES[0]; // Travel & Flights
  const secondaryCategories = MARKETPLACE_CATEGORIES.slice(1, 4); // Lifestyle, Shopping, Dining
  const tertiaryCategories = MARKETPLACE_CATEGORIES.slice(4); // Learning, Debt, Investment, Hobbies

  return (
    <PageContainer
      eyebrow="Experiences"
      title={<>Rewards and <span className="italic">experiences.</span></>}
      subtitle="Partner offers for members, and plans for trips, dates and weekends that make the most of your cards."
    >
      <div className="w-full flex flex-col gap-10 relative">

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

        {/* plan something: trips, dates and the rest, priced against your cards */}
        <section className="flex flex-col justify-between gap-6 rounded-[32px] bg-rc-ink p-7 text-rc-cream md:flex-row md:items-center md:p-9">
          <div>
            <p className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] font-semibold leading-tight tracking-[-0.02em]">Plan something <span className="italic text-rc-pistachio">worth it.</span></p>
            <p className="mt-2 max-w-[48ch] text-[15px] text-rc-mist">A trip, a date, a weekend away: build the plan and see which of your cards to pay with at each step.</p>
          </div>
          <ButtonLink to="/app/plan" variant="cream">Start planning</ButtonLink>
        </section>

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

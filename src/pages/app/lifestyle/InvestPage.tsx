import React from 'react';
import { SmartSpendCard } from '../../../components/shared/SmartSpendCard';
import { MOCK_PRODUCTS } from '../../../features/lifestyle/mock/products';
import { useNavigate } from 'react-router-dom';

export default function InvestPage() {
  const navigate = useNavigate();

  // Filter fitness products
  const fitnessResults = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes('cult'));

  return (
    <div className="max-w-4xl mx-auto pb-24 text-text-primary min-h-screen pt-8">
      <header className="mb-12">
        <h1 className="text-4xl font-display font-medium tracking-tight text-white mb-4">
          Spend on the person you're becoming.
        </h1>
        <p className="text-lg text-text-muted font-light max-w-2xl">
          Upgrade your fitness, start a new hobby, or learn a skill. We'll handle the optimization.
        </p>
      </header>

      <div className="flex gap-4 mb-8 overflow-x-auto hide-scrollbar pb-2">
        {['Fitness', 'Hobbies', 'Learning', 'Wellness'].map((cat, i) => (
          <button key={cat} className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-text-primary text-surface-base' : 'bg-surface-elevated text-text-muted hover:text-text-primary'}`}>
            {cat}
          </button>
        ))}
      </div>

      <section>
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-text-muted mb-6">
          Recommended Providers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fitnessResults.map((product) => (
            <SmartSpendCard
              key={product.id}
              title={product.name}
              originalPrice={product.originalPrice}
              recommendation={product.recommendation}
              onViewDeal={() => navigate(`/app/lifestyle/partner/${product.partnerId}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { SmartSpendCard } from '../../../components/shared/SmartSpendCard';
import { MOCK_PRODUCTS } from '../../../features/lifestyle/mock/products';
import { useNavigate } from 'react-router-dom';

export default function ShopPage() {
  const [query, setQuery] = useState('Black sneakers');
  const navigate = useNavigate();

  // Filter out non-retail products (simulated search)
  const results = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes('nike'));

  return (
    <div className="max-w-4xl mx-auto pb-24 text-text-primary min-h-screen pt-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-display font-medium tracking-tight text-white mb-4">
          Shop Smarter
        </h1>
        <p className="text-lg text-text-muted font-light max-w-xl mx-auto">
          Don't just browse. RenoCred finds the smartest way to pay for exactly what you want.
        </p>
      </header>

      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-emerald" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to buy?"
            className="w-full bg-surface-elevated/50 backdrop-blur-xl border border-border-subtle rounded-2xl py-5 pl-14 pr-6 text-lg text-text-primary focus:outline-none focus:border-brand-emerald/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)]" 
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-text-muted">
            Curated Results
          </h2>
          <span className="text-xs text-text-muted">{results.length} items</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((product) => (
            <SmartSpendCard
              key={product.id}
              title={product.name}
              originalPrice={product.originalPrice}
              recommendation={product.recommendation}
              onViewDeal={() => navigate(`/app/lifestyle/partner/${product.partnerId}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

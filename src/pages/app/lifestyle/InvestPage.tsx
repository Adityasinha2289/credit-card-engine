import React, { useState, useEffect } from 'react';
import { SmartSpendCard } from '../../../components/shared/SmartSpendCard';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { CommerceOptimizationService } from '../../../features/commerce';
import type { CommerceEntity } from '../../../features/commerce/types';
import type { OptimizationResult } from '../../../features/optimization/types';

export default function InvestPage() {
  const navigate = useNavigate();
  const profile = useDashboardStore(state => state.profile);
  
  const [activeCategory, setActiveCategory] = useState('Fitness');
  const [results, setResults] = useState<{entity: CommerceEntity, result: OptimizationResult}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      try {
        const userId = profile?.id;
        if (!userId) return;
        const data = await CommerceOptimizationService.optimizeCollection(userId);
        // Basic fallback filtering for prototype categories
        setResults(data);
      } catch (err) {
        console.error("Failed to load commerce data", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResults();
  }, [profile?.id]);

  // Filter based on active category (naive prototype matching)
  const filteredResults = results.filter(({ entity }) => {
    if (activeCategory === 'Fitness') return entity.name.toLowerCase().includes('cult') || entity.partnerId === 'cult';
    if (activeCategory === 'Hobbies') return entity.partnerId === 'spotify' || entity.name.toLowerCase().includes('music');
    return true; // fallback
  });

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
        {['Fitness', 'Hobbies', 'Learning', 'Wellness'].map((cat) => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-text-primary text-surface-base' : 'bg-surface-elevated text-text-muted hover:text-text-primary'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <section>
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-text-muted mb-6">
          Recommended Providers
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[400px] rounded-3xl bg-surface-elevated animate-pulse border border-border-subtle" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map(({ entity, result }) => (
              <SmartSpendCard
                key={entity.id}
                title={entity.name}
                originalPrice={entity.basePrice}
                optimizationResult={result}
                recommendation={{
                  reason: result.reason.primary || 'Best overall value',
                  features: result.reason.supportingFactors || [],
                  badge: result.savings > 0 ? 'Best Value' : undefined
                }}
                onViewDeal={() => navigate(`/app/lifestyle/partner/${entity.partnerId}`)}
                entityId={entity.id}
                placement="invest"
                isSponsored={false}
              />
            ))}
            {filteredResults.length === 0 && (
              <div className="col-span-full text-center py-16 px-4 bg-surface-elevated/30 border border-border-subtle rounded-3xl">
                <p className="text-text-primary font-medium text-lg mb-2">No items found for {activeCategory}</p>
                <p className="text-text-muted">Check back later for optimized recommendations.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

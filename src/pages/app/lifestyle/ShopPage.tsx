import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { SmartSpendCard } from '../../../components/shared/SmartSpendCard';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { CommerceOptimizationService } from '../../../features/commerce';
import type { CommerceEntity } from '../../../features/commerce/types';
import type { OptimizationResult } from '../../../features/optimization/types';

export default function ShopPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const profile = useDashboardStore(state => state.profile);
  
  const [results, setResults] = useState<{entity: CommerceEntity, result: OptimizationResult}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      try {
        const userId = profile?.id;
        if (!userId) return;
        const data = await CommerceOptimizationService.optimizeCollection(userId);
        setResults(data);
      } catch (err) {
        console.error("Failed to load commerce data", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResults();
  }, [profile?.id]);

  return (
    <div className="max-w-4xl mx-auto pb-24 text-text-primary min-h-[100dvh] pt-8">
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] rounded-3xl bg-surface-elevated animate-pulse border border-border-subtle" />
            ))}
          </div>

        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.filter(r => r.entity.name.toLowerCase().includes(query.toLowerCase())).map(({ entity, result }) => (
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
                placement="shop"
                isSponsored={false}
              />
            ))}
            {results.filter(r => r.entity.name.toLowerCase().includes(query.toLowerCase())).length === 0 && (
              <div className="col-span-full text-center py-16 px-4 bg-surface-elevated/30 border border-border-subtle rounded-3xl">
                <p className="text-text-primary font-medium text-lg mb-2">No matching items found</p>
                <p className="text-text-muted">Try adjusting your search query.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

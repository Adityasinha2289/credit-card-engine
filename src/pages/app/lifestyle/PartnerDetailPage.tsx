import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { CommerceRepository } from '../../../features/commerce/repositories';
import { CommerceOptimizationService } from '../../../features/commerce';
import type { CommercePartner, CommerceEntity } from '../../../features/commerce/types';
import type { OptimizationResult } from '../../../features/optimization/types';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { SmartSpendCard } from '../../../components/shared/SmartSpendCard';

export default function PartnerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = useDashboardStore(state => state.profile);

  const [partner, setPartner] = useState<CommercePartner | null>(null);
  const [results, setResults] = useState<{entity: CommerceEntity, result: OptimizationResult}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPartnerData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const p = await CommerceRepository.getPartnerById(id);
        setPartner(p);

        if (p) {
          const userId = profile?.id || 'demo-user-id';
          const data = await CommerceOptimizationService.optimizeCollection(userId, p.id);
          setResults(data);
        }
      } catch (err) {
        console.error("Failed to fetch partner data", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPartnerData();
  }, [id, profile?.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40 min-h-screen text-brand-emerald">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!partner) {
    return <div className="text-white p-8">Partner not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 text-text-primary min-h-screen">
      
      {/* Hero */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden mb-8 rounded-b-3xl -mx-4 sm:mx-0 sm:mt-4 shadow-ag-base">
        <img src={partner.logoUrl || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=2000"} alt={partner.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6">
          <button onClick={() => navigate(-1)} className="mb-4 text-white/80 hover:text-white flex items-center gap-1 text-sm bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-md w-fit">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-brand-emerald text-black text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
              Official Partner
            </span>
          </div>
          <h1 className="text-4xl font-display font-medium text-white">{partner.name}</h1>
          <p className="text-white/80 mt-1 max-w-xl">{partner.description}</p>
        </div>
      </div>

      <div className="px-4 sm:px-0">
        <section className="mb-12">
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-text-muted mb-6">
            RenoCred Optimized Options
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map(({ entity, result }) => (
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
                entityId={entity.id}
                placement="partner_detail"
              />
            ))}
            {results.length === 0 && (
              <div className="glass-panel p-12 text-center col-span-full border-dashed">
                <p className="text-text-muted text-lg">No specific products currently available for optimization.</p>
              </div>
            )}
          </div>
        </section>

        {/* Trust / Disclosure */}
        <div className="bg-surface-secondary/50 border border-border-subtle rounded-2xl p-6 flex gap-4 mt-12">
          <ShieldCheck className="text-brand-400 shrink-0" size={24} />
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">Why RenoCred recommends this</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Our intelligence engine constantly calculates the best real-time effective cost based on your current wallet. 
              We may earn a small commission if you purchase through these links, but it never affects your rank or our math.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

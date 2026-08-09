import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { MOCK_PARTNERS } from '../../../features/lifestyle/mock/partners';
import { MOCK_PRODUCTS } from '../../../features/lifestyle/mock/products';
import { SmartSpendCard } from '../../../components/shared/SmartSpendCard';

export default function PartnerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const partner = MOCK_PARTNERS.find(p => p.id === id);
  const partnerProducts = MOCK_PRODUCTS.filter(p => p.partnerId === id);

  if (!partner) {
    return <div className="text-white p-8">Partner not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 text-text-primary min-h-screen">
      
      {/* Hero */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden mb-8 rounded-b-3xl -mx-4 sm:mx-0 sm:mt-4">
        <img src={partner.imageUrl} alt={partner.name} className="absolute inset-0 w-full h-full object-cover" />
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
            {partnerProducts.map(product => (
              <SmartSpendCard
                key={product.id}
                title={product.name}
                originalPrice={product.originalPrice}
                recommendation={product.recommendation}
                onViewDeal={() => {}}
                hideAction
              />
            ))}
            {partnerProducts.length === 0 && (
              <div className="glass-panel p-8 text-center border-dashed">
                <p className="text-text-muted">No specific products loaded for this partner in prototype mode.</p>
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
        
        <button className="w-full mt-6 bg-text-primary text-black hover:bg-white py-4 rounded-xl font-bold transition-colors">
          View all deals at {partner.name}
        </button>
      </div>

    </div>
  );
}

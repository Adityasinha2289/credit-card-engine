import { useParams, Link, Navigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { 
  getCategoryTaxonomy, 
  getCardsByCategory, 
  getAllPublicCards 
} from '../lib/cardKnowledgeGraph';
import { 
  getBreadcrumbSchema, 
  getOrganizationSchema, 
  getWebSiteSchema 
} from '../lib/schemaBuilders';
import { 
  Sparkles, Shield, ArrowRight, CheckCircle2, AlertTriangle, 
  Filter, Award, CreditCard as CreditCardIcon, HelpCircle 
} from 'lucide-react';

export function CategoryHubPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const taxonomy = categorySlug ? getCategoryTaxonomy(categorySlug) : undefined;

  if (!taxonomy) {
    return <Navigate to="/cards" replace />;
  }

  const categoryCards = getCardsByCategory(taxonomy.slug);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Categories', item: '/cards' },
    { name: taxonomy.name, item: `/compare/${taxonomy.slug}` },
  ]);

  // ItemList Schema for ranking cards
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best Credit Cards for ${taxonomy.name} in India`,
    description: taxonomy.description,
    itemListElement: categoryCards.map((card, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: card.cardName,
      url: card.url,
    })),
  };

  return (
    <div className="w-full relative min-h-[100dvh] bg-[#0A0A0A] text-white selection:bg-emerald-500/30 font-sans">
      <SEO
        title={`Best Credit Cards for ${taxonomy.name} in India (2026) | RenoCred`}
        description={taxonomy.description}
        canonicalUrl={`https://renocred.com/compare/${taxonomy.slug}`}
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema, itemListSchema]}
      />

      {/* Hero Section */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400 mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <Link to="/" className="hover:text-emerald-400 transition-colors shrink-0">Home</Link>
          <span className="shrink-0">/</span>
          <Link to="/cards" className="hover:text-emerald-400 transition-colors shrink-0">Categories</Link>
          <span className="shrink-0">/</span>
          <span className="text-white font-medium capitalize">{taxonomy.name}</span>
        </nav>

        <div className="space-y-4 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            <Sparkles size={13} /> Financial Category Hub
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight leading-tight">
            Best Credit Cards for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">{taxonomy.name}</span> in India
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-3xl leading-relaxed">
            {taxonomy.description}
          </p>
        </div>
      </section>

      {/* Short Answer / Executive Evaluation Box */}
      <main className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-10">
        <div className="p-6 rounded-2xl bg-[#0D120F] border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Shield size={18} />
            <span>RenoCred Evaluation Methodology Summary</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {taxonomy.evaluationMethodology}
          </p>
        </div>

        {/* Structured Category Comparison Table */}
        <section className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Award className="text-emerald-400" size={22} />
            Top Recommended Cards for {taxonomy.name}
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0D120F]">
            <table className="w-full text-left text-sm text-gray-300 ">
              <thead className="bg-white/5 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-4 px-6">Credit Card</th>
                  <th className="py-4 px-6">Issuer</th>
                  <th className="py-4 px-6">Annual Fee</th>
                  <th className="py-4 px-6">Reward Rate</th>
                  <th className="py-4 px-6">Key Benefit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categoryCards.map((card) => (
                  <tr key={card.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <Link to={`/cards/${card.slug}`} className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                        <span>{card.cardName}</span>
                        <ArrowRight size={14} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-300">{card.issuer}</td>
                    <td className="py-4 px-6 font-mono font-semibold text-white">{card.formattedAnnualFee}</td>
                    <td className="py-4 px-6 text-emerald-400 font-medium">{card.rewardRate}</td>
                    <td className="py-4 px-6 text-gray-300 text-xs">{card.topBenefit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Limitations & Exclusions */}
        <section className="p-6 rounded-2xl bg-[#140D0D] border border-red-500/20 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
            <AlertTriangle size={18} />
            <span>Category Exclusions & Terms to Consider</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {taxonomy.limitations}
          </p>
        </section>

        {/* Card Grid Links */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-bold text-white">Explore Detailed Card Entities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categoryCards.map((card) => (
              <Link
                key={card.id}
                to={`/cards/${card.slug}`}
                className="p-5 rounded-2xl bg-[#0D120F] border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between h-40 group"
              >
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{card.issuer}</span>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mt-1 line-clamp-1">
                    {card.cardName}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{card.topBenefit}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold pt-2 border-t border-white/5">
                  <span>View Details</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Product Conversion CTA */}
        <section className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 text-center space-y-4">
          <h2 className="text-2xl font-display font-bold text-white">
            Find the Optimal Card for Your Spending Profile
          </h2>
          <p className="text-sm text-gray-300 max-w-xl mx-auto">
            RenoCred's Taqdeer AI engine analyzes your specific card portfolio and monthly merchant spends to maximize cashback and reward point yield.
          </p>
          <div className="pt-2">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-[0_0_25px_rgba(52,211,153,0.3)] active:scale-95"
            >
              <span>Launch RenoCred Advisor</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

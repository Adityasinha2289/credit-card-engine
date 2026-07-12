import { SEO } from '../components/SEO';

export function AffiliateDisclosurePage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <SEO 
        title="Affiliate Disclosure | Renocred"
        description="Learn about our affiliate relationships and how Renocred maintains editorial independence."
        canonicalUrl="https://renocred.com/affiliate-disclosure"
      />
      <h1 className="text-4xl font-display font-bold mb-8 tracking-tight">Affiliate Disclosure</h1>
      <div className="prose prose-invert max-w-none text-gray-300 space-y-6 text-lg leading-relaxed">
        <p>Transparency is a core value at Renocred.</p>
        <p>As the platform grows, Renocred may establish commercial relationships with banks, issuers, and financial institutions. This means we may eventually earn compensation when users click on certain links or apply for products through our platform.</p>
        <p>This compensation may support the ongoing development and operation of our free tools.</p>
        <p>However, we intend to maintain a strict separation between commercial relationships and our core evaluation methodology. Our recommendation engine and comparison tools will continue to be driven by structured data and user-defined inputs, ensuring that we surface the products that actually align with your financial profile. For more details on how we maintain our independence, please refer to our <a href="/editorial-policy" className="text-[#5da08c] hover:underline">Editorial Policy</a>.</p>
        <p>Users should always review the official terms, conditions, and product details provided by the card issuer before making a final decision.</p>
      </div>
    </div>
  );
}

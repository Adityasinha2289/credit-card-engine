import { SEO } from '../components/SEO';
import { ContentMeta } from '../components/ContentMeta';

export function EditorialPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20">
      <SEO 
        title="Editorial Policy | Renocred"
        description="Learn about our commitment to providing clear, accurate, and objective financial information."
        canonicalUrl="https://renocred.com/editorial-policy"
      />
      <h1 className="text-4xl font-display font-bold mb-4 tracking-tight">Editorial Policy</h1>
      <div className="prose prose-invert max-w-none text-gray-300 space-y-6 text-lg leading-relaxed">
        <p>Renocred is committed to providing clear, accurate, and objective financial information.</p>
        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Accuracy and Verification</h2>
        <p>We aim to verify credit card features, fees, and reward structures directly from official issuer sources. However, the financial landscape changes rapidly, and discrepancies can occur.</p>
        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Updating Information</h2>
        <p>As we scale our platform, we are establishing processes for regular audits of our card database. If an error is identified, we are committed to correcting it promptly.</p>
        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Editorial Independence</h2>
        <p>Any commercial relationships we establish will be strictly separated from our core evaluation methodologies. Our objective recommendation tools and comparisons are driven by structured data and mathematical formulas, not by compensation. Learn more about <a href="/methodology" className="text-[#5da08c] hover:underline">Our Methodology</a>.</p>
      </div>
    </div>
  );
}

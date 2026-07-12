import { SEO } from '../components/SEO';

export function MethodologyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <SEO 
        title="Evaluation Methodology | How Renocred Compares Credit Cards"
        description="Read how Renocred uses structured data and rule-based models to evaluate and recommend credit cards."
        canonicalUrl="https://renocred.com/methodology"
      />
      <h1 className="text-4xl font-display font-bold mb-8 tracking-tight">Our Methodology</h1>
      <div className="prose prose-invert max-w-none text-gray-300 space-y-6 text-lg leading-relaxed">
        <p>Our goal is to help you make informed financial decisions through structured data and clear evaluation tools. Please read our <a href="/editorial-policy" className="text-[#5da08c] hover:underline">Editorial Policy</a> to understand how we maintain independence.</p>
        <h2 className="text-2xl font-bold text-white mt-12 mb-4">How We Structure Data</h2>
        <p>We collect and organize credit card information, such as fees, reward rates, category multipliers, and eligibility criteria. This data is the foundation of our comparison and recommendation tools.</p>
        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Evaluating Value</h2>
        <p>The "best" credit card depends entirely on the individual. A premium travel card might offer massive value to a frequent flyer, but result in a net loss for someone who rarely travels. Our tools aim to evaluate cards based on user-defined spending categories and habits.</p>
        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Rule-Based Recommendations</h2>
        <p>Our recommendation engine uses structured rules rather than opaque machine learning. By mapping your stated spending profile against known card reward structures, we estimate potential value and highlight cards that align with your lifestyle.</p>
        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Important Limitations</h2>
        <p>Our tools are designed to support your decisions, not replace personal financial judgment. Credit card terms, fees, and reward structures change frequently. We strongly encourage all users to verify complete product details directly with the official card issuer before applying. See our <a href="/disclaimer" className="text-[#5da08c] hover:underline">Disclaimer</a> for more information.</p>
      </div>
    </div>
  );
}

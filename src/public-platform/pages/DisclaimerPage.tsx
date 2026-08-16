import { SEO } from '../components/SEO';

export function DisclaimerPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20">
      <SEO 
        title="Financial Disclaimer | Renocred"
        description="Read the important financial disclaimers and limitations of liability for using Renocred."
        canonicalUrl="https://renocred.com/disclaimer"
      />
      <h1 className="text-4xl font-display font-bold mb-8 tracking-tight">Financial Disclaimer</h1>
      <div className="prose prose-invert max-w-none text-gray-300 space-y-6 text-lg leading-relaxed">
        <p>Renocred provides informational and analytical tools designed to help you understand credit cards and optimize your spending.</p>
        <p><strong>We are not financial advisors.</strong> The content, comparisons, and rule-based recommendations on this platform do not constitute professional financial, investment, or legal advice.</p>
        <p>The "value" or "savings" estimated by our tools are projections based on the information you provide and our structured data regarding card reward rates. These are estimates only, and actual outcomes depend on a variety of factors including your actual spending, redemption choices, card issuer terms, and account standing.</p>
        <p>Credit card terms, interest rates, fees, eligibility rules, and reward structures can change without notice. We strongly advise that you carefully review the official terms and conditions provided by the credit card issuer before applying for any financial product.</p>
        <p>You are solely responsible for your own financial decisions.</p>
      </div>
    </div>
  );
}

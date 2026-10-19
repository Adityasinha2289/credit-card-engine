import { SEO } from '../components/SEO';
import { ContentPage, RelatedLinks } from '../site/ContentPage';

export function DisclaimerPage() {
  return (
    <>
      <SEO
        title="Financial Disclaimer | RenoCred"
        description="Read the important financial disclaimers and limitations of liability for using RenoCred."
        canonicalUrl="https://renocred.com/disclaimer"
      />
      <ContentPage
        eyebrow="Legal"
        title="Financial disclaimer"
        lede="RenoCred provides informational and analytical tools designed to help you understand credit cards and optimise your spending."
        aside={<RelatedLinks links={[{ label: 'How we rank cards', to: '/methodology' }, { label: 'Terms of service', to: '/terms' }, { label: 'Editorial policy', to: '/editorial-policy' }]} />}
      >
        <p><strong>We are not financial advisors.</strong> The content, comparisons, and rule-based recommendations on this platform do not constitute professional financial, investment, or legal advice.</p>
        <p>The value or savings estimated by our tools are projections based on the information you provide and our structured data on card reward rates. They are estimates only. Actual outcomes depend on many factors, including your real spending, redemption choices, card issuer terms, and account standing.</p>
        <p>Credit card terms, interest rates, fees, eligibility rules, and reward structures can change without notice. Review the official terms and conditions provided by the card issuer before applying for any financial product.</p>
        <p>You are solely responsible for your own financial decisions.</p>
      </ContentPage>
    </>
  );
}

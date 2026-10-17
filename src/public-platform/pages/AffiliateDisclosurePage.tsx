import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ContentPage, RelatedLinks } from '../site/ContentPage';

export function AffiliateDisclosurePage() {
  return (
    <>
      <SEO
        title="Affiliate Disclosure | RenoCred"
        description="Learn about our affiliate relationships and how RenoCred maintains editorial independence."
        canonicalUrl="https://renocred.com/affiliate-disclosure"
      />
      <ContentPage
        eyebrow="Trust"
        title="Affiliate disclosure"
        lede="Transparency is a core value at RenoCred. Here is how we may earn money, and what it does not change."
        aside={<RelatedLinks links={[{ label: 'Editorial policy', to: '/editorial-policy' }, { label: 'How we rank cards', to: '/methodology' }]} />}
      >
        <p>As the platform grows, RenoCred may establish commercial relationships with banks, issuers, and financial institutions. This means we may earn compensation when users click on certain links or apply for products through our platform.</p>
        <p>This compensation may support the ongoing development and operation of our free tools.</p>
        <p>We keep a strict separation between commercial relationships and our evaluation methodology. Our recommendation engine and comparison tools are driven by structured data and the inputs you give us, so we surface the products that actually fit your profile. Read our <Link to="/editorial-policy">editorial policy</Link> for how we maintain that independence.</p>
        <p>Always review the official terms, conditions, and product details provided by the card issuer before making a final decision.</p>
      </ContentPage>
    </>
  );
}

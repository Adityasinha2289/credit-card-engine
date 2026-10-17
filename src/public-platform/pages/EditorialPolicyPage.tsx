import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ContentPage, RelatedLinks } from '../site/ContentPage';

export function EditorialPolicyPage() {
  return (
    <>
      <SEO
        title="Editorial Policy | RenoCred"
        description="Learn about our commitment to providing clear, accurate, and objective financial information."
        canonicalUrl="https://renocred.com/editorial-policy"
      />
      <ContentPage
        eyebrow="Trust"
        title="Editorial policy"
        lede="RenoCred is committed to providing clear, accurate, and objective financial information."
        aside={<RelatedLinks links={[{ label: 'How we rank cards', to: '/methodology' }, { label: 'Affiliate disclosure', to: '/affiliate-disclosure' }]} />}
      >
        <h2>Accuracy and verification</h2>
        <p>We aim to verify credit card features, fees, and reward structures directly from official issuer sources. The financial landscape changes quickly, and discrepancies can occur.</p>

        <h2>Updating information</h2>
        <p>As we scale the platform, we are establishing processes for regular audits of our card database. If an error is identified, we correct it promptly.</p>

        <h2>Editorial independence</h2>
        <p>Any commercial relationships we establish are kept separate from our evaluation methodology. Our recommendation tools and comparisons are driven by structured data and formulas, not by compensation. Read <Link to="/methodology">how we rank cards</Link>.</p>
      </ContentPage>
    </>
  );
}

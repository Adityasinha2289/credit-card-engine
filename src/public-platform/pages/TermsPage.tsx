import { SEO } from '../components/SEO';
import { ContentPage, RelatedLinks } from '../site/ContentPage';

export function TermsPage() {
  return (
    <>
      <SEO
        title="Terms of Service | RenoCred"
        description="Read the terms of service and conditions for using the RenoCred platform."
        canonicalUrl="https://renocred.com/terms"
      />
      <ContentPage
        eyebrow="Legal"
        title="Terms of service"
        lede="By accessing and using RenoCred, you agree to the following terms."
        aside={<RelatedLinks links={[{ label: 'Privacy policy', to: '/privacy' }, { label: 'Financial disclaimer', to: '/disclaimer' }, { label: 'Affiliate disclosure', to: '/affiliate-disclosure' }]} />}
      >
        <h2>Informational nature</h2>
        <p>RenoCred provides informational and analytical tools. We are not a financial institution, bank, or registered financial advisor. The information and recommendations provided by our platform are for educational and comparative purposes only.</p>

        <h2>Accuracy limitations</h2>
        <p>While we strive for accuracy, credit card terms, fees, rewards, and eligibility criteria change frequently. We do not guarantee the accuracy, completeness, or timeliness of any information on the platform. You are solely responsible for verifying product details with the official issuer before making financial decisions.</p>

        <h2>User responsibilities</h2>
        <p>You agree to use RenoCred for lawful purposes. You are responsible for any data or information you enter into the platform. Do not attempt to reverse engineer, scrape, or maliciously disrupt our services.</p>

        <h2>Third-party products</h2>
        <p>Our platform contains information about third-party financial products and may include links to third-party websites. We do not control these external sites and are not responsible for their content or their financial products.</p>

        <h2>Availability</h2>
        <p>RenoCred is currently in development. We do not guarantee uninterrupted access to the platform, and we reserve the right to modify or discontinue features at any time.</p>
      </ContentPage>
    </>
  );
}

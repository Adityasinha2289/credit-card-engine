import { SEO } from '../../components/SEO';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../../lib/schemaBuilders';
import { SwipeSimulator } from '../../components/landing/SwipeSimulator';

const ROUTE = '/calculators/which-card-to-use';

export function WhichCardPage() {
  return (
    <>
      <SEO
        title="Which Credit Card Should I Use? | RenoCred"
        description="Pick a spend and the cards you own; RenoCred ranks them by what you would actually get back, from each card's published reward rates."
        canonicalUrl={`https://renocred.com${ROUTE}`}
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), getBreadcrumbSchema([{ name: 'Home', item: '/' }, { name: 'Which card should I use?', item: ROUTE }])]}
      />
      <SwipeSimulator />
    </>
  );
}

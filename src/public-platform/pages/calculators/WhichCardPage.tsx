import { SEO } from '../../components/SEO';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../../lib/schemaBuilders';
import { SwipeSimulator } from '../../components/landing/SwipeSimulator';
import { PageBody, PageHero } from '../../site/PageHero';
import { ToolsNav } from '../../site/ToolsNav';

const ROUTE = '/calculators/which-card-to-use';

export function WhichCardPage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <SEO
        title="Which Credit Card Should I Use? | RenoCred"
        description="Pick a spend and the cards you own; RenoCred ranks them by what you would actually get back, from each card's published reward rates."
        canonicalUrl={`https://renocred.com${ROUTE}`}
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), getBreadcrumbSchema([{ name: 'Home', item: '/' }, { name: 'Which card should I use?', item: ROUTE }])]}
      />
      <PageHero
        eyebrow="Free tools"
        title={<>Which card <span className="italic">should I use?</span></>}
        lede="Pick what you're paying for and the cards in your wallet. We rank them by what each one actually gives back, from its published rates."
        actions={<ToolsNav current={ROUTE} />}
      />
      <PageBody>
        <SwipeSimulator embedded />
      </PageBody>
    </div>
  );
}

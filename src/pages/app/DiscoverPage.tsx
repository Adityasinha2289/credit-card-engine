/**
 * Picks for you: cards worth adding, ranked on your profile and wallet, and a
 * side-by-side comparison. The full directory and the calculators are website
 * pages (Cards, Tools in the header), open to everyone.
 */
import { PageContainer } from '../../components/shared/PageContainer';
import { AppTabs, useTab } from '../../components/shared/AppTabs';
import { RecommendTab, CompareTab } from './discoverViews';

const TABS = ['for-you', 'compare'] as const;

export default function DiscoverPage() {
  const [tab, setTab] = useTab(TABS, 'for-you');

  return (
    <PageContainer
      eyebrow="Picks for you"
      title={<>The card that would <span className="italic">pay you back.</span></>}
      subtitle="Ranked on what you spend and the cards you already hold, after the annual fee, and filtered to what you're likely to be approved for."
    >
      <AppTabs
        layoutId="picks-tabs"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'for-you', label: 'Recommended' },
          { id: 'compare', label: 'Compare' },
        ]}
      />
      {tab === 'for-you' && <RecommendTab onSwitchToCompare={() => setTab('compare')} />}
      {tab === 'compare' && <CompareTab />}
    </PageContainer>
  );
}

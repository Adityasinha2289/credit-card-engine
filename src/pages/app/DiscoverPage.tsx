/**
 * Discover: everything about cards you don't hold yet, in one place: picks for
 * you, a side-by-side comparison, the full directory and the calculators.
 */
import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Gauge, Scale, Sparkles } from 'lucide-react';
import { PageContainer } from '../../components/shared/PageContainer';
import { AppTabs, useTab } from '../../components/shared/AppTabs';
import { RecommendTab, CompareTab } from './discoverViews';
import { ArrowChip } from '../../public-platform/site/primitives';
import { CATALOG_STATS } from '../../public-platform/site/swipeMath';

const CardsDirectory = lazy(() => import('../../public-platform/pages/CardsDirectoryPage').then((m) => ({ default: m.CardsDirectoryPage })));

const TABS = ['for-you', 'compare', 'cards', 'tools'] as const;

const CALCULATORS = [
  { to: '/app/tools/which-card-to-use', icon: Sparkles, title: 'Which card to use', body: 'Rank any set of cards for a spend, with the rupee value of each.' },
  { to: '/app/tools/credit-card-reward-calculator', icon: Calculator, title: 'Reward calculator', body: 'A year of rewards on your spending, after caps and the annual fee.' },
  { to: '/app/tools/annual-fee-break-even', icon: Scale, title: 'Annual fee break-even', body: 'How much you need to spend before a fee pays for itself.' },
  { to: '/app/tools/credit-utilization', icon: Gauge, title: 'Credit utilisation', body: 'How much of your limit you use, and what that does to your score.' },
];

export default function DiscoverPage() {
  const [tab, setTab] = useTab(TABS, 'for-you');

  return (
    <PageContainer
      eyebrow="Discover"
      title={<>Find the card that <span className="italic">pays you back.</span></>}
      subtitle={`${CATALOG_STATS.cards} cards, ranked on what you spend, after the annual fee, and filtered to what you're likely to be approved for.`}
    >
      <AppTabs
        layoutId="discover-tabs"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'for-you', label: 'For you' },
          { id: 'compare', label: 'Compare' },
          { id: 'cards', label: 'All cards' },
          { id: 'tools', label: 'Calculators' },
        ]}
      />

      {tab === 'for-you' && <RecommendTab onSwitchToCompare={() => setTab('compare')} />}
      {tab === 'compare' && <CompareTab />}
      {tab === 'cards' && (
        <Suspense fallback={<p className="animate-pulse text-[14px] text-rc-muted">Loading cards…</p>}>
          <div className="-mx-4 md:-mx-8 lg:-mx-12"><CardsDirectory embedded /></div>
        </Suspense>
      )}
      {tab === 'tools' && (
        <ul className="grid gap-3 md:grid-cols-2">
          {CALCULATORS.map((t) => (
            <li key={t.to}>
              <Link
                to={t.to}
                className="group flex h-full items-start justify-between gap-6 rounded-[26px] border border-rc-ink/10 bg-rc-paper p-6 text-rc-ink transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-rc-ink/25"
              >
                <span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rc-ink/[0.06] text-rc-forest"><t.icon className="h-5 w-5" strokeWidth={1.8} /></span>
                  <span className="mt-5 block font-display text-[24px] font-semibold leading-tight tracking-[-0.02em]">{t.title}</span>
                  <span className="mt-1.5 block max-w-[38ch] text-[15px] leading-relaxed text-rc-muted">{t.body}</span>
                </span>
                <ArrowChip variant="ink" size="md" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}

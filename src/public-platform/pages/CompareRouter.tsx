import { Navigate, useParams } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { NotFoundPage } from './NotFoundPage';
import { CardComparisonPage } from './CardComparisonPage';
import { CategoryHubPage } from './CategoryHubPage';
import { getAllPublicCards, getCategoryTaxonomy, getComparisonPairBySlug, getComparisonPairSlug, type PublicCardEntity } from '../lib/cardKnowledgeGraph';

/**
 * Short or older names in a comparison URL ("hdfc-infinia-vs-axis-atlas") to the card
 * they mean: every word of the short name appears in the card's slug; curated
 * cards first, then the shortest slug.
 */
function resolveCard(part: string): PublicCardEntity | undefined {
  const words = part.split('-').filter(Boolean);
  if (words.length === 0) return undefined;
  return getAllPublicCards()
    .filter((c) => { const s = new Set(c.slug.split('-')); return words.every((w) => s.has(w)); })
    .sort((a, b) => Number(b.id.startsWith('card-')) - Number(a.id.startsWith('card-')) || a.slug.length - b.slug.length)[0];
}

export default function CompareRouter() {
  const { categoryOrPairSlug } = useParams<{ categoryOrPairSlug: string }>();
  if (!categoryOrPairSlug) return <PublicLayout><NotFoundPage /></PublicLayout>;

  if (categoryOrPairSlug.includes('-vs-')) {
    const pair = getComparisonPairBySlug(categoryOrPairSlug);
    if (!pair) {
      const [a, b] = categoryOrPairSlug.toLowerCase().split('-vs-').map(resolveCard);
      if (a && b && a.id !== b.id) return <Navigate to={`/compare/${getComparisonPairSlug(a, b)}`} replace />;
      return <PublicLayout><NotFoundPage /></PublicLayout>;
    }
    return <PublicLayout><CardComparisonPage /></PublicLayout>;
  }

  const category = getCategoryTaxonomy(categoryOrPairSlug);
  if (!category) return <PublicLayout><NotFoundPage /></PublicLayout>;
  return <PublicLayout><CategoryHubPage /></PublicLayout>;
}

import { useParams } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { NotFoundPage } from './NotFoundPage';
import { CardComparisonPage } from './CardComparisonPage';
import { CategoryHubPage } from './CategoryHubPage';
import { getCategoryTaxonomy, getComparisonPairBySlug } from '../lib/cardKnowledgeGraph';

export default function CompareRouter() {
  const { categoryOrPairSlug } = useParams<{ categoryOrPairSlug: string }>();
  if (!categoryOrPairSlug) return <PublicLayout><NotFoundPage /></PublicLayout>;

  if (categoryOrPairSlug.includes('-vs-')) {
    const pair = getComparisonPairBySlug(categoryOrPairSlug);
    if (!pair) return <PublicLayout><NotFoundPage /></PublicLayout>;
    return <PublicLayout><CardComparisonPage /></PublicLayout>;
  }

  const category = getCategoryTaxonomy(categoryOrPairSlug);
  if (!category) return <PublicLayout><NotFoundPage /></PublicLayout>;
  return <PublicLayout><CategoryHubPage /></PublicLayout>;
}

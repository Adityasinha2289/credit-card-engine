import { CommerceOptimizationService } from '../../features/commerce';
import type { CommerceEntity } from '../../features/commerce/types';
import type { OptimizationResult } from '../../features/optimization/types';

export async function loadWalletIntelligence(userId: string) {
  const results = await CommerceOptimizationService.optimizeCollection(userId);
  
  const catStats = new Map<string, { totalItems: number, coveredItems: number, maxValue: number, bestCard: string }>();
  
  results.forEach(r => {
    const cat = r.entity.categoryId || 'other';
    const stats = catStats.get(cat) || { totalItems: 0, coveredItems: 0, maxValue: 0, bestCard: 'Best Method' };
    
    stats.totalItems++;
    if (r.result.totalValue > 0) {
      stats.coveredItems++;
    }
    
    if (r.result.totalValue > stats.maxValue) {
      stats.maxValue = r.result.totalValue;
      stats.bestCard = r.result.bestCard?.name || 'Best Method';
    }
    
    catStats.set(cat, stats);
  });
  
  let coveredCategoriesCount = 0;
  let totalValueSum = 0;
  const allPaths: {category: string, card: string, value: number}[] = [];
  const covData: {name: string, value: number}[] = [];
  
  catStats.forEach((stats, cat) => {
    if (stats.coveredItems > 0) {
      coveredCategoriesCount++;
    }
    if (stats.maxValue > 0) {
      totalValueSum += stats.maxValue;
      allPaths.push({ category: cat, card: stats.bestCard, value: stats.maxValue });
    }
    covData.push({
       name: cat.charAt(0).toUpperCase() + cat.slice(1),
       value: Math.round((stats.coveredItems / stats.totalItems) * 100)
    });
  });
  
  allPaths.sort((a, b) => b.value - a.value);
  covData.sort((a, b) => b.value - a.value);
  
  const covPercent = catStats.size > 0 ? Math.round((coveredCategoriesCount / catStats.size) * 100) : 0;
  
  return {
    isEmpty: allPaths.length === 0,
    coveragePercent: covPercent,
    availableValue: totalValueSum,
    coverageData: covData.slice(0, 4),
    topPaths: allPaths.slice(0, 3)
  };
}

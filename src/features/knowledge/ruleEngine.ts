import { KnowledgeRepository } from './knowledgeRepository';
import type { KnowledgeRule, KnowledgeArticle } from './types';

export class KnowledgeRuleEngine {
  private static repo = KnowledgeRepository.getInstance();

  public static getRules(): KnowledgeRule[] {
    return this.repo.getRules();
  }

  public static getKnowledge(): KnowledgeArticle[] {
    return this.repo.getArticles();
  }

  /**
   * Evaluate active rules for context parameters
   */
  public static evaluateRules(_context?: Record<string, unknown>): KnowledgeRule[] {
    const rules = this.getRules();
    return rules;
  }

  /**
   * Search knowledge articles & rules by query
   */
  public static searchKnowledge(query: string): { rules: KnowledgeRule[]; articles: KnowledgeArticle[] } {
    const q = query.toLowerCase().trim();
    if (!q) return { rules: this.getRules(), articles: this.getKnowledge() };

    const rules = this.getRules().filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.explanation.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    );

    const articles = this.getKnowledge().filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q)
    );

    return { rules, articles };
  }

  /**
   * Find knowledge related to category or card ID
   */
  public static getRelatedKnowledge(categoryOrCardId: string): { rules: KnowledgeRule[]; articles: KnowledgeArticle[] } {
    const rules = this.getRules().filter(
      (r) => r.category === categoryOrCardId || r.tags.includes(categoryOrCardId)
    );

    const articles = this.getKnowledge().filter(
      (a) =>
        a.category === categoryOrCardId ||
        a.relatedCards.includes(categoryOrCardId) ||
        a.relatedCategories.includes(categoryOrCardId as any)
    );

    return { rules, articles };
  }

  /**
   * Get single featured tip of the day
   */
  public static getTipOfTheDay(): KnowledgeArticle {
    return this.getKnowledge()[0];
  }
}

/**
 * React hook wrapper for Knowledge Graph
 */
export function useKnowledgeGraph() {
  const articles = KnowledgeRuleEngine.getKnowledge();
  const rules = KnowledgeRuleEngine.getRules();
  const tipOfTheDay = KnowledgeRuleEngine.getTipOfTheDay();

  return {
    articles,
    rules,
    tipOfTheDay,
    searchKnowledge: KnowledgeRuleEngine.searchKnowledge,
    getRelatedKnowledge: KnowledgeRuleEngine.getRelatedKnowledge,
  };
}

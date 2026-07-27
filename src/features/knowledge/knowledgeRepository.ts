import type { KnowledgeRule, KnowledgeArticle, KnowledgeDataSource } from './types';
import { MOCK_KNOWLEDGE_RULES, MOCK_KNOWLEDGE_ARTICLES } from './mockKnowledge';

export class KnowledgeRepository implements KnowledgeDataSource {
  private static instance: KnowledgeRepository;
  private rules: KnowledgeRule[] = MOCK_KNOWLEDGE_RULES;
  private articles: KnowledgeArticle[] = MOCK_KNOWLEDGE_ARTICLES;

  public static getInstance(): KnowledgeRepository {
    if (!KnowledgeRepository.instance) {
      KnowledgeRepository.instance = new KnowledgeRepository();
    }
    return KnowledgeRepository.instance;
  }

  public getRules(): KnowledgeRule[] {
    return this.rules.filter((r) => r.active);
  }

  public getArticles(): KnowledgeArticle[] {
    return this.articles;
  }
}

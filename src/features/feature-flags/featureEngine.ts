import { FeatureRepository } from './featureRepository';
import { ExperimentEngine } from './experiments';
import type { FeatureFlag, FeatureAudience } from './types';

export class FeatureEngine {
  private static repo = FeatureRepository.getInstance();

  public static isEnabled(key: string, context?: { segment?: string; goal?: string }): boolean {
    const flag = this.repo.getFlag(key);
    if (!flag || !flag.enabled) return false;
    if (flag.rolloutPercentage <= 0) return false;
    if (flag.audience && context) {
      return this.evaluateAudience(flag.audience, context);
    }
    return true;
  }

  public static getFeature(key: string): FeatureFlag | undefined {
    return this.repo.getFlag(key);
  }

  public static getAllFeatures(): FeatureFlag[] {
    return this.repo.getFlags();
  }

  public static evaluateAudience(audience: FeatureAudience, context: { segment?: string; goal?: string }): boolean {
    if (audience.segments && context.segment && !audience.segments.includes(context.segment)) {
      return false;
    }
    if (audience.goals && context.goal && !audience.goals.includes(context.goal)) {
      return false;
    }
    return true;
  }

  public static getVariant(experimentId: string, userId?: string): string {
    return ExperimentEngine.getVariant(experimentId, userId);
  }
}

/**
 * React hook wrapper for consuming feature flags
 */
export function useFeatureFlag(key: string, context?: { segment?: string; goal?: string }): boolean {
  return FeatureEngine.isEnabled(key, context);
}

/**
 * React hook wrapper for consuming experiments
 */
export function useExperiment(experimentId: string, userId?: string): string {
  return FeatureEngine.getVariant(experimentId, userId);
}

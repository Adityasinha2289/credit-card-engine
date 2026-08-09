import type { FeatureFlag, FeatureFlagDataSource } from './types';

export const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'ff-1',
    key: 'taqdeer_v2',
    enabled: true,
    rolloutPercentage: 100,
    environments: ['development', 'staging', 'production'],
    description: 'Enables TAQDEER Financial Decision Engine v2',
  },
  {
    id: 'ff-2',
    key: 'financial_health_v2',
    enabled: true,
    rolloutPercentage: 100,
    environments: ['development', 'staging', 'production'],
    description: 'Enables RenoCred Financial Health Engine v2 Widget',
  },
  {
    id: 'ff-3',
    key: 'premium_dashboard',
    enabled: true,
    rolloutPercentage: 100,
    environments: ['development', 'staging', 'production'],
    description: 'Enables glassmorphic premium home dashboard features',
  },
  {
    id: 'ff-4',
    key: 'live_offers',
    enabled: true,
    rolloutPercentage: 100,
    environments: ['development', 'staging', 'production'],
    description: 'Enables Merchant Intelligence live cashback offers widget',
  },
  {
    id: 'ff-5',
    key: 'ai_copilot',
    enabled: false,
    rolloutPercentage: 0,
    environments: ['development'],
    description: 'Enables AI Copilot conversational assistant (Beta)',
  },
  {
    id: 'ff-6',
    key: 'referral_program',
    enabled: false,
    rolloutPercentage: 0,
    environments: ['development', 'staging'],
    description: 'Enables user referral and reward invite links',
  },
  {
    id: 'ff-7',
    key: 'commerce_production_data',
    enabled: false,
    rolloutPercentage: 0,
    environments: ['development', 'staging', 'production'],
    description: 'Enables real Supabase commerce data instead of local mocks',
  },
];

export class FeatureRepository implements FeatureFlagDataSource {
  private static instance: FeatureRepository;
  private flags: FeatureFlag[] = DEFAULT_FEATURE_FLAGS;

  public static getInstance(): FeatureRepository {
    if (!FeatureRepository.instance) {
      FeatureRepository.instance = new FeatureRepository();
    }
    return FeatureRepository.instance;
  }

  public getFlags(): FeatureFlag[] {
    return this.flags;
  }

  public getFlag(key: string): FeatureFlag | undefined {
    return this.flags.find((f) => f.key === key);
  }

  public setFlag(key: string, enabled: boolean): void {
    const flag = this.getFlag(key);
    if (flag) flag.enabled = enabled;
  }
}

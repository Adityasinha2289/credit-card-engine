export interface FeatureAudience {
  segments?: string[];
  goals?: string[];
  occupations?: string[];
}

export interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  rolloutPercentage: number;
  environments: string[];
  audience?: FeatureAudience;
  description: string;
}

export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed';

export interface Experiment {
  id: string;
  name: string;
  variants: string[];
  allocation: Record<string, number>;
  status: ExperimentStatus;
}

export interface FeatureFlagDataSource {
  getFlags(): Promise<FeatureFlag[]> | FeatureFlag[];
  getFlag(key: string): Promise<FeatureFlag | undefined> | FeatureFlag | undefined;
}

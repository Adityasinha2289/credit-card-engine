import type { Experiment } from './types';

export const MOCK_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-taqdeer-ui',
    name: 'TAQDEER Decision Card Design Variant',
    variants: ['control', 'glass_emerald'],
    allocation: { control: 50, glass_emerald: 50 },
    status: 'running',
  },
  {
    id: 'exp-offer-banner',
    name: 'Today Best Offer Placement Test',
    variants: ['control', 'compact_top'],
    allocation: { control: 50, compact_top: 50 },
    status: 'running',
  },
];

export class ExperimentEngine {
  public static getVariant(experimentId: string, userId = 'user-default'): string {
    const experiment = MOCK_EXPERIMENTS.find((e) => e.id === experimentId);
    if (!experiment || experiment.status !== 'running') return 'control';
    let hash = 0;
    const key = `${userId}-${experimentId}`;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    const bucket = Math.abs(hash) % 100;
    let accumulated = 0;
    for (const [variant, percentage] of Object.entries(experiment.allocation)) {
      accumulated += percentage;
      if (bucket < accumulated) return variant;
    }
    return 'control';
  }
}

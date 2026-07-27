import type {
  RecommendationContextInput,
  RecommendationTrace,
  TraceStage,
  RecommendationMode,
} from './evaluationTypes';

export class RecommendationTraceLogger {
  private traceId: string;
  private startTime: number;
  private mode: RecommendationMode;
  private input: RecommendationContextInput;
  private stages: TraceStage[] = [];

  constructor(input: RecommendationContextInput, mode: RecommendationMode = 'wallet_optimisation') {
    this.traceId = `trace-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    this.startTime = Date.now();
    this.input = input;
    this.mode = mode;
  }

  public recordStage(stageName: string, durationMs: number, details: Record<string, unknown>) {
    this.stages.push({
      stageName,
      durationMs,
      details,
    });
  }

  public finalize(): RecommendationTrace {
    return {
      traceId: this.traceId,
      timestamp: new Date().toISOString(),
      mode: this.mode,
      input: this.input,
      stages: this.stages,
      totalDurationMs: Date.now() - this.startTime,
    };
  }
}

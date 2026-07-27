import * as fs from 'fs';
import * as path from 'path';
import type { BenchmarkScenario } from './benchmarkTypes';

export class BenchmarkLoader {
  private static DEFAULT_BENCHMARK_PATH = path.resolve(
    process.cwd(),
    'benchmarks',
    'recommendation-benchmarks.json'
  );

  public static loadBenchmarks(filePath?: string): BenchmarkScenario[] {
    const targetPath = filePath || this.DEFAULT_BENCHMARK_PATH;

    if (!fs.existsSync(targetPath)) {
      throw new Error(`Benchmark dataset file not found at path: ${targetPath}`);
    }

    try {
      const fileContent = fs.readFileSync(targetPath, 'utf-8');
      const parsed = JSON.parse(fileContent);

      if (Array.isArray(parsed)) {
        return parsed as BenchmarkScenario[];
      } else if (parsed && Array.isArray(parsed.scenarios)) {
        return parsed.scenarios as BenchmarkScenario[];
      } else {
        throw new Error(`Invalid benchmark dataset structure in ${targetPath}. Expected array of scenarios.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to load benchmark dataset from ${targetPath}: ${msg}`);
    }
  }
}

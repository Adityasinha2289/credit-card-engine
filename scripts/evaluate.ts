import { EvaluationEngine } from '../src/features/recommendation/evaluation/evaluationEngine';
import { EvaluationReporter } from '../src/features/recommendation/evaluation/evaluationReporter';
import { EvaluationDashboard } from '../src/features/recommendation/evaluation/evaluationDashboard';

async function main() {
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

  try {
    const engine = new EvaluationEngine();
    const report = await engine.runEvaluation();

    // Save JSON and Markdown Reports
    const { jsonPath, mdPath } = EvaluationReporter.saveReports(report);

    // Print CLI Dashboard
    EvaluationDashboard.printConsoleReport(report);

    if (verbose) {
      EvaluationDashboard.printDetailedBreakdown(report);
    }

    console.log(`Reports saved successfully:`);
    console.log(`  - JSON: ${jsonPath}`);
    console.log(`  - Markdown: ${mdPath}`);
    console.log('');

    if (!report.qualityGatePassed) {
      console.error('❌ Build failed due to Quality Gate violation.');
      process.exit(1);
    }

    process.exit(0);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`💥 Fatal Evaluation Engine Error: ${msg}`);
    process.exit(1);
  }
}

main();

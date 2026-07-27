import { CardImporter } from '../src/features/data-import/cardImporter';

async function main() {
  console.log('🚀 Starting Card Data Import Pipeline...');
  const summary = await CardImporter.runAndPrintReport();
  if (summary.validationErrorsCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Import pipeline failed:', err);
  process.exit(1);
});

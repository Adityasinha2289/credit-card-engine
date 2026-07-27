import { MerchantImporter } from '../src/features/data-import/merchantImporter';

async function main() {
  console.log('🚀 Starting Merchant Intelligence Import Pipeline...');
  const summary = await MerchantImporter.runAndPrintReport();
  if (summary.validationErrorsCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Merchant import pipeline failed:', err);
  process.exit(1);
});

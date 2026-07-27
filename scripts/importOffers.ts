import { OfferImporter } from '../src/features/data-import/offerImporter';

async function main() {
  console.log('🚀 Starting Merchant Offers Import Pipeline...');
  const summary = await OfferImporter.runAndPrintReport();
  if (summary.validationErrorsCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Merchant offers import pipeline failed:', err);
  process.exit(1);
});

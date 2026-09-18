import * as fs from 'fs';
import * as path from 'path';
import { OfferImporter } from '../src/features/data-import/offerImporter';
import { MerchantReconciler } from '../src/features/data-import/reconciliation/merchantReconciler';
import { CardReconciler } from '../src/features/data-import/reconciliation/cardReconciler';

async function main() {
  console.log('🚀 Starting RenoCred Offers Dataset Import Pipeline...');
  
  // Initialize Reconcilers
  console.log('🔄 Initializing Production Reconcilers...');
  await MerchantReconciler.initialize();
  await CardReconciler.initialize();
  
  const datasetPath = path.join(process.cwd(), 'renocred-data/datasets/renocred_offer_master.json');
  console.log(`📂 Reading dataset from: ${datasetPath}`);
  
  const rawData = fs.readFileSync(datasetPath, 'utf8');
  const dataset = JSON.parse(rawData);
  const offersToImport = dataset.data || [];

  console.log(`📊 Found ${offersToImport.length} offers in dataset.`);

  const summary = await OfferImporter.runAndPrintReport(offersToImport);

  
  if (summary.validationErrorsCount > 0) {
    console.warn(`⚠️ Completed with ${summary.validationErrorsCount} validation errors.`);
    // Exit 0 so we don't crash the pipeline, we just log it
    process.exit(0); 
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Merchant offers import pipeline failed:', err);
  process.exit(1);
});


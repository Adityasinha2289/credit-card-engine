# COMMERCE & WALLET MIGRATION STRATEGY

RenoCred currently relies on `CardData` for the user's wallet. The new `OptimizationEngine` uses the `PaymentMethod` domain abstraction. To move to production without causing downtime or breaking existing user wallets, we must follow a phased migration.

## PHASE A: The Adapter Layer (Current State - Complete)
Currently, `CardData` remains the source of truth in the database and Zustand store. At runtime, the `cardAdapter.ts` maps `CardData` into `PaymentMethod[]` at the component boundary.
- **Action:** No database changes.
- **Benefit:** Validates the engine logic and UI in real-time.

## PHASE B: Dual Write (Future)
We will introduce a new `payment_methods` table in Supabase. This table will natively store all `PaymentMethod` fields, capable of representing credit cards, UPI, and store wallets.
- **Action:** Create `payment_methods` table.
- **Action:** When a user adds or deletes a card, write to BOTH the legacy `user_cards` table and the new `payment_methods` table.
- **Benefit:** Populates the new table with live data without switching the primary read path.

## PHASE C: Read Switch & Backfill (Future)
We will write a one-time migration script (or Supabase Edge Function) to backfill all existing records from `user_cards` into `payment_methods` for users who haven't logged in recently.
- **Action:** Execute the backfill script.
- **Action:** Update `dashboardStore.ts` to hydrate `PaymentMethod[]` directly from the `payment_methods` table on login.
- **Action:** Remove `cardAdapter.ts` as the data is natively in the correct format. The UI now consumes `PaymentMethod` natively.
- **Benefit:** Full cutover to the new architecture.

## PHASE D: Deprecation & Cleanup (Future)
Once Phase C is stable for 30 days, we remove the legacy systems.
- **Action:** Drop the `user_cards` table from Supabase.
- **Action:** Drop legacy `CardData` types and redundant store actions.
- **Action:** (Optional) Migrate legacy transactions to link to `payment_method_id` instead of `card_id`.

## MOCK TO PRODUCTION MAPPING

| Phase 5A/5B Mock Concept | Phase 5C Production Concept (SQL) |
| :--- | :--- |
| `MockPartner` | `partners` table |
| `MockProduct` / `MockDateVenue` | `commerce_entities` table |
| `MockOffer` (Presentational) | `offers` table (Mathematical) |
| `MockRecommendation` | Generated at runtime via `OptimizationEngine` |
| `Mock affiliate / links` | `affiliate_relationships` table + `tracking_events` |

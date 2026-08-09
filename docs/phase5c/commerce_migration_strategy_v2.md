# COMMERCE & WALLET MIGRATION STRATEGY V2 (HARDENED)

The previous migration strategy assumed a fast switch. To ensure zero downtime, absolute safety, and rollback capability, the migration from legacy `user_cards` to generic `payment_methods` must be heavily staged.

## PHASE 1: PREPARATION & ADAPTER (Current State)
The UI currently relies entirely on `CardData` and `user_cards`.
The Optimization Engine relies on `PaymentMethod`.
`cardAdapter.ts` bridges the gap purely in-memory.
**Status:** Complete and stable. No database modifications needed yet.

## PHASE 2: DUAL WRITE
Deploy the new `payment_methods` schema alongside the existing schema.
- **Action:** Update the backend API (or Supabase functions) handling wallet additions/deletions. When a user adds a card, write the data to BOTH `user_cards` and `payment_methods`.
- **Validation:** Monitor dual writes silently. Verify data integrity in the new table without changing the UI read path.

## PHASE 3: BACKFILL
For existing users who have not logged in or modified their wallet during Phase 2, backfill their data.
- **Action:** Run a secure backend script to map all existing rows in `user_cards` into `payment_methods`.
- **Safety:** The script is idempotent. It skips users who already have records in the new table from Phase 2.

## PHASE 4: READ CUTOVER & VALIDATION
Switch the frontend to read from the new table.
- **Action:** Update `dashboardStore.ts` to hydrate `PaymentMethod[]` directly from the `payment_methods` table.
- **Action:** Keep the old `user_cards` fetch logic as a fallback! If the `payment_methods` array returns empty for a legacy user, fallback to fetching `user_cards` and passing it through the adapter.
- **Validation:** Monitor frontend error rates.

## PHASE 5: EVENTUAL DEPRECATION
Only after Phase 4 has proven 100% stable for a full billing cycle (30+ days).
- **Action:** Drop the fallback read logic from the frontend.
- **Action:** Drop the dual-write logic from the backend.
- **Action:** Finally, drop the `user_cards` table and related unused Zustand store actions.

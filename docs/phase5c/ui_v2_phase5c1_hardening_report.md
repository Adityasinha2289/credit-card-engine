# RENO CRED 2.0 — PHASE 5C.1 ARCHITECTURE HARDENING REPORT

## 1. What changed from Phase 5C
The initial Phase 5C architecture was conceptually sound but lacked the strict security boundaries required for a production affiliate model. Phase 5C.1 hardens the architecture by separating internal tracking from public data, explicitly modeling commissions separate from conversions, and ensuring the client application can never fabricate attribution data. 

## 2. Offer visibility model
Offers contain highly sensitive commercial contracts. The frontend will only receive sanitized, public properties (`value`, `type`, `eligibility_rules`, `valid_until`) required for the Optimization Engine to do its math. Internal metadata (`commission_terms`, `affiliate_network_id`) remains strictly isolated on the backend.

## 3. Tracking security
The frontend is completely untrusted for tracking. The UI calls an internal endpoint (`POST /api/outbound`). The server generates the unique `click_id` (`tracking_event.id`), builds the secure affiliate URL natively, and issues a 302 redirect. Browsers cannot see or modify affiliate parameters.

## 4. Affiliate architecture
The `affiliate_relationships` table stores the tracking templates and commission models (`CPS`, `CPA`, `fixed`, `tiered`). A single partner can have multiple relationships. This table is strictly server-only.

## 5. Conversion architecture
Conversions represent the commercial event reported by the partner (e.g. "Order Placed"). The `conversions` table links the external transaction ID back to the originating `tracking_event`.

## 6. Commission architecture
Commission is now distinctly separate from Conversion. A `commissions` table handles the financial reconciliation. A conversion may be confirmed, but the commission might be adjusted, partially paid, or voided later. This allows accurate financial auditing.

## 7. Sponsored content architecture
Sponsored placements are driven purely by an `is_sponsored` boolean flag on the entity or partner. 
**The Golden Rule:** Sponsorship MUST NOT artificially alter the Optimization Engine's mathematical ranking. The UI will render sponsored items in a distinct "Featured Partner" section to preserve the integrity of the "Best For You" intelligence.

## 8. Commerce Entity model
`CommerceEntity` is the single generic abstraction for products, experiences, and services. It tracks the raw `destination_path` on the partner site and an external `sku` for catalog syncing, keeping tracking separate.

## 9. Price model
`base_price` exists on the `CommerceEntity` as a cached snapshot. The Optimization Engine relies on this snapshot. If the price changes dynamically at checkout, the backend commission logic is unharmed because commissions are calculated against the actual `order_value` from the postback.

## 10. Offer eligibility model
JSONB is retained for complex rules (e.g. `eligible_payment_method_types`), but universally queried attributes like `min_spend` and `max_discount` have been promoted to first-class indexed columns for performance.

## 11. Payment Method migration
Migration is staged in 5 phases:
1. **Adapter** (Current)
2. **Dual Write** (Both `user_cards` and `payment_methods`)
3. **Backfill** (Migrate legacy data safely)
4. **Read Cutover** (UI switches to `payment_methods` with fallback)
5. **Deprecation** (Legacy dropped after 30 days of stability)

## 12. Attribution model
The attribution chain is fully preserved: `User -> TrackingEvent -> CommerceEntity -> Partner -> Offer -> Conversion -> Commission`.

## 13. Recommendation snapshot
Because prices and offers change over time, the `tracking_event` table now captures a lightweight JSONB `recommendation_snapshot` at the exact moment of the click. This answers "What did we promise the user?" for dispute resolution.

## 14. RLS / access model
- **Frontend/Public:** Sanitized read-only access to entities, partners, and offers.
- **Frontend/User:** Read/write to own `payment_methods`. Read-only to own `tracking_events`.
- **Backend/Server:** Full access to all tables, including sensitive `affiliate_relationships` and `commissions`.

## 15. Security
The `payment_methods` table strictly stores metadata (network, bank, ID). It NEVER stores PANs, CVVs, or sensitive authentication credentials. 

## 16. Updated SQL proposal
A revised `commerce_supabase_proposal_v2.sql` has been documented, featuring the new `commissions` table, explicit JSONB columns for internal metadata, and first-class columns for fast indexing.

## 17. Migration risks
- **Stale Data:** If `base_price` snapshots go stale, the engine provides inaccurate savings estimates.
- **Ad Blockers:** Client-side tracking blockers may drop the redirect. Server-side redirect mitigates this but cannot prevent all cookie loss on the partner site.

## 18. Phase 5D implementation plan
Phase 5D is ready to begin. It will execute the database migration by deploying the V2 SQL proposal to Supabase, seeding the tables with the current mock data, and transitioning the frontend to read from the live database.

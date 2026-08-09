# RENO CRED 2.0 — PHASE 5C COMMERCE ARCHITECTURE REPORT

## Executive Summary
This report outlines the proposed data architecture to transform RenoCred from a purely calculative credit card recommender into a highly monetizable Lifestyle Commerce platform. This Phase establishes the domain boundaries between the core Intelligence Engine (which strictly serves the user's best interest) and the Affiliate Layer (which manages how RenoCred tracks and earns commissions from those recommendations).

## Current Commerce Architecture
Currently, RenoCred uses purely mock data separated arbitrarily into `lifestyle` (Venues, Products) and `optimization` (Offers, PaymentMethods). The UI tightly couples recommendations directly into product objects. There is no concept of a generic commerce entity, nor are there mechanisms for affiliate tracking or commission reconciliation.

## Proposed Domain Model
The new model standardizes all recommendable items into a generic `CommerceEntity` and abstracts the monetization via an `AffiliateRelationship`.

### Category Model
A hierarchical taxonomy (e.g., `Travel > Flights`, `Lifestyle > Fitness`). Instead of hardcoded enums, categories are stored in a self-referential `categories` table.

### Partner Model
Represents the commercial organization (e.g., Nike, Cult.fit). Partners can span multiple categories and serve as the parent to both Commerce Entities and Offers.

### Commerce Entity Model
A single abstraction (`commerce_entities`) for products, services, experiences, or bookings. This simplifies the frontend by ensuring the engine only has to evaluate one type of spendable target.

### Offer Model
The mathematical representation of a discount or benefit (`offers`). Offers are strictly decoupled from Commerce Entities and include dynamic `eligibility_rules` (stored as JSONB) to allow complex filtering by the Optimization Engine.

### Affiliate Model
The `affiliate_relationships` table defines the commercial contract with a partner (e.g., CPA, CPS, CPL) and stores the tracking template URLs required to properly attribute outbound traffic.

### Tracking Model
The `tracking_events` table logs every user click on an outbound deal. It generates a unique `id` (passed as a `subid` or `click_id` to the affiliate network) and tracks which user, which partner, and which UI placement drove the click.

### Conversion Model
The `conversions` table receives webhooks/postbacks from affiliate networks. It maps a confirmed partner sale back to the original `tracking_event_id`.

### Commission Model
Commission is represented as a state flow on the `Conversion` table (`pending`, `confirmed`, `paid`) along with the exact `commission_earned` value, allowing RenoCred to reconcile expected vs. actual revenue.

### Sponsored Content Model
Controlled via the `is_featured` flag on `partners` or `commerce_entities`. This allows the UI to explicitly disclose sponsored placements ("Featured Partner") without artificially boosting them in the pure, user-first Optimization Engine.

### User Payment Method Model
The generic abstraction of the user's wallet. Legacy `CardData` will be migrated to generic `PaymentMethods` (capable of representing UPI, store credit, points) in a new `payment_methods` table.

### Spending Opportunity Model
A transient representation of the user's immediate intent (e.g., "Plan a date for ₹5,000"). While the *opportunity* is processed by the engine in memory, the outbound *click* on a specific entity is persisted to `tracking_events`.

## RLS Strategy (Future Implementation)
- **Public:** `partners`, `commerce_entities`, `categories`, `offers`.
- **User-Specific:** `payment_methods`, `tracking_events` (read-only for user).
- **Internal/Admin Only:** `affiliate_relationships`, `conversions`.

## Data Ownership
- **RenoCred Admins:** Create/manage partners, entities, offers, affiliate relationships.
- **System/Webhooks:** Create/update conversions and tracking.
- **Users:** Create/manage their payment methods.

## Admin Requirements
A future internal admin panel is necessary to:
1. Manage partner metadata and featured status.
2. Configure affiliate tracking URLs and commission rates.
3. Manage time-bound offer expirations.
4. View reconciliation reports (Clicks vs. Conversions).

## Mock → Production Mapping
- `MockPartner` → `partners`
- `MockProduct` / `MockDateVenue` → `commerce_entities`
- `MockOffer` → `offers`
- `Mock affiliate logic` → `affiliate_relationships` + `tracking_events`

## Migration Strategy
1. **Phase A (Current):** `CardData` is adapted in-memory to `PaymentMethod`.
2. **Phase B (Dual Write):** Create `payment_methods` table and write to both legacy `user_cards` and the new table.
3. **Phase C (Switch):** Backfill old users, switch the UI to read natively from `payment_methods`.
4. **Phase D (Cleanup):** Drop legacy `user_cards` table.

## Optimization Engine Compatibility
The proposed schema perfectly aligns with the Phase 5B Optimization Engine. The engine requires `PaymentMethod[]`, `SpendingOpportunity`, and `Offer[]`. All of these can be constructed by querying the public `offers` table and the user's `payment_methods` table, completely ignoring the affiliate/tracking layer during calculation.

## Security Considerations
- Affiliate tracking URLs and network identifiers must never be exposed to the client to prevent scraping or hijacking.
- Clicks should be routed through a backend endpoint (e.g., `/api/outbound/:tracking_event_id`) which resolves the secret affiliate URL and redirects the user server-side.

## Proposed SQL
A full `commerce_supabase_proposal.sql` has been created outlining the exact table structures, foreign keys, and indexes.

## Risks
- **Data Stale-ness:** Offers expire rapidly. If the admin system cannot keep the `offers` table updated, the Optimization Engine will recommend invalid discounts, destroying user trust.
- **Attribution Loss:** Ad-blockers or privacy browsers may strip tracking parameters, reducing recorded conversions.

## Recommended Phase 5D
Phase 5D should focus on executing the **Database Migration**. This includes instantiating the proposed SQL schema in Supabase, writing seed scripts to port the mock data into the real tables, and connecting the UI to Supabase queries instead of static mock files.

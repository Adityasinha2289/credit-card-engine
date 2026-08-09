# RENO CRED COMMERCE ARCHITECTURE - HARDENED

## 1. COMMERCE ENTITY MODEL
The `CommerceEntity` serves as the foundational "thing" a user buys.
Fields:
- `id`
- `partner_id` (FK to Partner)
- `category_id` (FK to Category)
- `entity_type` (Enum: `product`, `service`, `experience`, `subscription`, `booking`, `venue`)
- `name`
- `description`
- `sku` / `external_reference` (For precise catalog syncing)
- `image_url`
- `base_price` (Decimal, cached snapshot of the current price)
- `currency` (Fixed to `INR`)
- `destination_path` (The raw canonical path on the partner's site, e.g. `/shop/shoes/air-max-270`, NOT the tracked affiliate link)
- `is_sponsored` (Boolean - purely for UI disclosure, ignored by Optimization Engine)
- `status` (Enum: `active`, `inactive`, `out_of_stock`)
- `created_at`, `updated_at`, `last_verified_at`

### Price Model
Price changes. The `base_price` on the `CommerceEntity` represents the current known price. For dynamic inventory (e.g. flights), this is a cached "snapshot". The Optimization Engine uses this `base_price` at calculation time. If the price changes during checkout at the merchant, RenoCred's commission logic remains robust because conversions are tracked on the *actual* `order_value` via postback, not the estimated `base_price`.

## 2. OFFER VISIBILITY & EXPIRATION
Offers contain both public and highly sensitive commercial data.

### Public (Sanitized) Offer Data (Sent to Engine/Frontend):
- `id`, `type`, `value`, `title`, `description`, `source`
- `eligibility_rules` (min_spend, category_ids, partner_ids)
- `valid_from`, `valid_until`

### Internal Offer Data (Strictly Server-Side):
- `affiliate_network_id`
- `commission_terms`
- `internal_campaign_metadata`

### Offer Expiration & Scope
- **Expiration:** Offers use `valid_from`, `valid_until`, and `status`. Backend scheduled jobs or database triggers flip `status = expired` past `valid_until`. The API strictly filters out expired offers before passing them to the Optimization Engine.
- **Scope:** Offers are scoped via the structured `eligibility_rules` JSONB (e.g. `eligible_partner_ids`, `eligible_payment_method_types`), avoiding the need for multiple offer tables. First-class columns are used for `min_spend` and `max_discount` as they are universally applicable and heavily indexed for query performance.

## 3. OUTBOUND DESTINATION MODEL
The flow from recommendation to partner must conceal tracking mechanics from the client.

1. **CommerceEntity Destination:** `/shop/shoes/air-max-270`
2. **Tracked Redirect (Client Sees):** `https://renocred.in/outbound/clk_123abc`
3. **Affiliate Destination (Server Resolves):** `https://tracking-network.com/click?aff_id=99&subid=clk_123abc&url=https://nike.com/shop/shoes/air-max-270`

## 4. PARTNER RELATIONSHIPS & SPONSORED CONTENT
Partners can have multiple overlapping commercial relationships (e.g. a CPA network relationship AND a direct CPL campaign).

### Separation of Concerns:
- **Organic Recommendation:** Selected strictly by the Optimization Engine because it yields the highest user savings.
- **Affiliate Relationship:** Merely the mechanism by which RenoCred earns revenue if the user acts on a recommendation.
- **Sponsored Placement:** A partner paid for visibility. Represented by `is_sponsored = true`.

### The Sponsored Ranking Rule:
Commission amount and Sponsored status **MUST NOT** automatically influence the Optimization Engine ranking. The engine remains purely mathematical. The UI handles `is_sponsored` by injecting a "Featured Partner" row separate from the engine's "Best For You" result, preserving trust.

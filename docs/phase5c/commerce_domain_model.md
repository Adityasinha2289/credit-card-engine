# RENO CRED COMMERCE DOMAIN MODEL

## 1. CATEGORY TAXONOMY
Categories should be hierarchical data, not hardcoded enums.

**Model: `Category`**
- `id`
- `slug` (e.g. `lifestyle-fitness`)
- `name` (e.g. `Fitness`)
- `parent_id` (Self-referential, allows nested sub-categories)
- `icon`
- `status` (active, inactive)

## 2. PARTNER
A Partner is any commercial entity RenoCred sends users to.

**Model: `Partner`**
- `id`
- `slug` (e.g. `nike-india`)
- `name` (e.g. `Nike`)
- `logo_url`
- `description`
- `primary_category_id` (FK to Category)
- `is_featured` (Boolean, used for sponsored/premium partners)
- `status` (active, inactive)

## 3. COMMERCE ENTITY
A single, generic abstraction for anything the user can spend money on (Products, Subscriptions, Bookings, Memberships, Venues).

**Model: `CommerceEntity`**
- `id`
- `partner_id` (FK to Partner)
- `category_id` (FK to Category)
- `entity_type` (Enum: `product`, `service`, `experience`, `subscription`, `booking`, `venue`)
- `name`
- `description`
- `image_url`
- `base_price` (Decimal)
- `currency` (Default: `INR`)
- `destination_url` (The raw canonical URL on the partner's site)
- `status` (active, inactive, out_of_stock)

## 4. OFFER
A distinct financial incentive that lowers the cost of a Commerce Entity or Partner purchase. Offers are separate from Entities.

**Model: `Offer`**
- `id`
- `source` (Enum: `merchant`, `bank`, `card_network`, `renocred`)
- `offer_type` (Enum: `percentage_discount`, `flat_discount`, `cashback`, `points`, `miles`)
- `value` (Decimal - percentage rate or flat amount)
- `title`
- `description`
- `valid_from` (Timestamp)
- `valid_until` (Timestamp)
- `status` (active, expired)

**Model: `OfferEligibility` (Rules)**
Stored either as a JSONB column on the `Offer` table or a separate relational table.
- `offer_id`
- `min_spend` (Decimal)
- `max_discount` (Decimal)
- `eligible_partner_ids` (Array)
- `eligible_category_ids` (Array)
- `eligible_payment_method_types` (Array, e.g., `['credit_card']`)
- `eligible_payment_method_identifiers` (Array, e.g., `['SBI Signature Rewards']`)
- `is_mutually_exclusive` (Boolean)

## 5. AFFILIATE RELATIONSHIP
Defines how RenoCred monetizes traffic sent to a Partner.

**Model: `AffiliateRelationship`**
- `id`
- `partner_id` (FK to Partner)
- `network` (Enum: `direct`, `cuelinks`, `admitad`, `bank_referral`)
- `tracking_template_url` (e.g. `https://tracking.com/?aff_id=123&url={{destination}}&subid={{click_id}}`)
- `commission_model` (Enum: `cpa`, `cps`, `cpl`, `cpc`, `fixed`)
- `commission_rate` (Decimal - percentage or flat rate depending on model)
- `status` (active, paused, terminated)

## 6. TRACKING EVENT (Click)
Logs every outbound intent to allow commission reconciliation.

**Model: `TrackingEvent`**
- `id` (The `click_id` passed as `subid` to affiliate networks)
- `user_id` (FK to User)
- `commerce_entity_id` (FK to CommerceEntity, optional)
- `partner_id` (FK to Partner)
- `offer_id` (FK to Offer, optional)
- `source_placement` (e.g. `home_smarter_purchases`, `shop_search`)
- `created_at` (Timestamp)

## 7. CONVERSION & COMMISSION
Records confirmed sales/leads and the revenue RenoCred earned.

**Model: `Conversion`**
- `id`
- `tracking_event_id` (FK to TrackingEvent)
- `partner_id` (FK to Partner)
- `external_transaction_id` (ID from the affiliate network)
- `order_value` (Decimal)
- `commission_earned` (Decimal)
- `currency`
- `status` (Enum: `pending`, `confirmed`, `rejected`, `paid`)
- `converted_at` (Timestamp)

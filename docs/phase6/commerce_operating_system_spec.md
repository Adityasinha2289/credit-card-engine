# Commerce Operating System Specification (Phase 6.0)

## Executive Summary
This document specifies the internal Admin Control Center (Commerce Operating System) required to run the RenoCred Marketplace. The system replaces manual database operations, providing business, operational, and financial controls over Partners, Catalog Entities, Offers, and Commissions, without exposing internal logic to the customer-facing frontend.

## Business Objective
To empower the RenoCred internal team to rapidly onboard partners, construct marketplace offers, verify tracking mechanisms, and reconcile revenues scalably—all without requiring engineering resources.

## Internal Users
Given the current stage of RenoCred, we recommend minimizing overhead by establishing three core internal roles:
1. **Admin / Founder**: Full read/write access to all configurations, analytics, and revenue numbers.
2. **Operations / Catalog Manager**: Read/write access to `partners`, `commerce_entities`, and `offers`. Read access to `affiliate_relationships` tracking URLs for QA. No access to revenue/financials.
3. **Finance**: Read access to `conversions` and `commissions`. Write access to update Commission states (e.g. marking `Paid`). No access to edit offers/entities.

## Information Architecture
The recommended minimum viable structure for the Admin dashboard:
- `/admin` (Dashboard)
- `/admin/catalog` (Partners, Entities, Categories)
- `/admin/offers` (Offer Management)
- `/admin/revenue` (Conversions, Commissions)
- `/admin/affiliate` (Affiliate Relationships)

*Note: Analytics can be embedded into the dashboard. Settings are omitted for MVP.*

## Dashboard
Key Performance Indicators (KPIs) relevant at the current stage:
- **Operations**: Active Offers, Active Commerce Entities.
- **Traction**: Outbound Clicks, Conversion Rate.
- **Financials (Finance/Admin only)**: Gross Order Value (GMV), Expected Commission, Paid Commission.

## Partner Management
Fields mapping directly to the `partners` schema:
- **Name**, **Slug**, **Description**, **Logo URL**
- **Category** (dropdown matching `categories`)
- **Status**: `active` or `inactive`
- **Sponsorship**: `is_sponsored` flag

*List view*, *Detail View*, *Create*, and *Edit* workflows are required. Deletions should be soft-deletes via `status = 'inactive'` to preserve historical tracking integrity.

## Commerce Entity Management
Using the `commerce_entities` table. Entities represent the actual things users spend money on.
Workflow:
1. Create Entity
2. Select Partner and Category
3. Select Entity Type (`product`, `service`, `experience`, `booking`, etc.)
4. Set Base Price & Currency
5. Define Destination URL
6. Set Status (`active`, `inactive`, `out_of_stock`)

## Offer Management
Crucial for the `OptimizationEngine`. An offer must be mapped accurately.
- **Offer Metadata**: Title, Description, Type (percentage, flat, cashback).
- **Financials**: Value (e.g., 10), Min Spend, Max Discount.
- **Validity**: `valid_from`, `valid_until`.
- **Eligibility**: JSONB builder interface to define Payment Method eligibility or User Tier rules.
- **Context Alert**: The UI must display an explicit warning near the "Save" button: *"Warning: Altering these values immediately impacts the RenoCred Optimization Engine's rankings."*

## Affiliate Management
Administers `affiliate_relationships`.
- **Partner & Network**: E.g. "Finix", "Amazon Associates".
- **Commission Model**: `cps`, `cpa`, `fixed`, `tiered`.
- **Tracking URL Template**: Must contain substitution variables (e.g., `{{CLICK_ID}}`).
- **Status**: `active`, `paused`, `terminated`.

## Conversion Operations
A view over the `conversions` table.
- **Columns**: Transaction ID, Partner, Tracking Event ID, Order Value, Currency, Status, Date.
- **Visibility**: Operations can view transaction states. Finance can view values. Admin sees all.
- **Status Flow**: `pending` -> `confirmed` -> `rejected`.

## Commission Ledger
A view over the `commissions` table mapping financial realization.
- **Concepts**:
  - `Expected Commission`: Derived automatically at conversion time.
  - `Actual Commission`: Derived manually or via API reconciliation when paid.
- **Columns**: Partner, Transaction, Order Value, Expected Comm, Actual Comm, Status (`pending`, `paid`, `adjusted`, `voided`), Date.
- *Gap Note*: The schema perfectly handles this separation.

## Reconciliation
Finance workflow:
1. Finance imports network report (or views network dashboard).
2. Finance filters RenoCred Ledger by `status = pending`.
3. Finance matches `external_transaction_id`.
4. Finance bulk updates matched commissions to `status = paid` and sets `actual_commission`.

## Partner Onboarding
1. **Agreement**: Commercial relationship agreed.
2. **Affiliate Setup**: Affiliate relationship configured with tracking URL.
3. **Catalog Creation**: Entities and Offers inputted.
4. **Test Run**: QA triggers test outbound click to verify Tracking Event generation and URL substitution.
5. **Live**: Status flipped to `active`.

## Partner QA
"Ready to Publish" Checklist:
- [ ] Partner active.
- [ ] At least 1 active commerce entity with working destination path.
- [ ] Offers have valid date ranges.
- [ ] `tracking_template_url` correctly substitutes variables.

## Catalog Import
1. **Manual Creation** (MVP, most important).
2. **CSV Import** (Next).
3. **API Import / Network Feed** (Phase 7+).

## Offer Freshness
- Offers are naturally filtered out of production views when `valid_until < NOW()`.
- The CMS should provide a "Expiring Soon" dashboard widget.
- The CMS should prevent users from setting `valid_until` in the past during creation.

## Sponsored Content
- Handled via `is_sponsored` flag on `partners` and `commerce_entities`.
- **UI Warning**: *"Sponsorship status flags items in the UI but DOES NOT influence the OptimizationEngine savings ranking calculation."*

## Revenue Analytics
Required data grouping capabilities (for Admin/Finance):
- GMV and Expected/Paid Commissions grouped by `partner_id`.
- GMV and Expected/Paid Commissions grouped by `commerce_entity_id`.
- Time-series aggregation (by month/week).

## Security
- All internal APIs must mandate an Admin-level JWT claim via Clerk.
- RLS Policies on `commerce_entities` and `offers` already protect against unauthorized public writes.
- Tables like `commissions` and `conversions` are strictly server-only. The Admin APIs will bypass RLS using the Supabase Service Role Key, governed by Clerk Role definitions in the API route logic.

## Customer/Admin Boundary
- **Customer App**: Strictly read-only access to Catalog and Offers. Triggers outbound events. Has NO knowledge of `affiliate_relationships`, `conversions`, or `commissions`.
- **Admin App**: Write access to Catalog/Offers. Read/Write access to Financials. Uses separate `/api/admin/*` endpoints.

## Database Gap Analysis
Based on `20260809130000_commerce_schema.sql`:
- **Partner Fields**: EXISTS.
- **Entity Status/Type**: EXISTS.
- **Offer Eligibility**: EXISTS (`eligibility_rules` JSONB).
- **Affiliate Models**: EXISTS (`commission_model`, `commission_terms`).
- **Expected vs Paid Commission**: EXISTS (`expected_commission`, `actual_commission`).
- **Gap**: Zero gaps. The database schema perfectly supports the proposed Admin CMS.

## API Requirements
Minimum required surface:
- `GET /api/admin/catalog` (Hydrates Partners, Entities, Categories)
- `POST /api/admin/partners`
- `POST /api/admin/entities`
- `GET /api/admin/offers`
- `POST /api/admin/offers`
- `PATCH /api/admin/offers/:id`
- `GET /api/admin/affiliate`
- `GET /api/admin/revenue` (Joins conversions + commissions)
- `PATCH /api/admin/commissions` (For reconciliation)

## Observability
Key events to track internally (Server logs):
- `admin_offer_created`
- `admin_offer_deactivated`
- `finance_commission_reconciled`

## Revenue Models
1. **CPS (Cost Per Sale)**: % of cart value. Tracks `order_value`. Highly scalable.
2. **CPA (Cost Per Action)**: Fixed fee. Highly scalable.
3. **Tiered**: Complex. Handled by `CommissionCalculator`.
4. **CPL / CPC**: Clicks/Leads. Requires high volume.
5. **Sponsored**: Flat placement fee (handled off-platform via invoicing).

## Admin MVP
**P0**: Partner, Entity, and Offer CRUD. Affiliate Relationship setup.
**P1**: Basic read-only views for Conversions and Commissions.
**P2**: Finance reconciliation workflow (marking as paid).
**P3**: CSV Imports, Analytics charts.

## Future Partner Portal
A dedicated `/partner` portal is **Phase 8+**. At the current scale, RenoCred Operations will fully manage the catalog on behalf of partners to ensure data quality and optimize the formatting of `eligibility_rules`.

## Recommended Implementation Sequence
1. Scaffolding Next.js `/admin` layout behind Clerk Admin Role guard.
2. Building the API boundaries (`/api/admin/*`).
3. Implementing Partner & Entity CRUD.
4. Implementing Offer Management (with JSONB eligibility builders).
5. Implementing Revenue Views.

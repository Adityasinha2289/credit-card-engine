# RENO CRED SECURITY & ACCESS MODEL

## 1. PAYMENT METHOD SECURITY
The `payment_methods` table is the core of the user's wallet. 
It must **NEVER** store:
- Full PAN (Primary Account Number)
- CVV
- Expiration dates (unless required for subscription reminders, but heavily restricted)
- Sensitive authentication tokens (e.g. netbanking passwords)

It **ONLY** stores metadata required for Optimization and UI rendering:
- `id` (UUID)
- `type` (credit_card, upi, wallet)
- `name` (e.g. "SBI Signature Rewards")
- `provider` (e.g. "SBI")
- `metadata` JSONB (network, last4 digits, reward capabilities, user preferences)

This guarantees that a database breach does not result in compromised payment credentials.

## 2. RLS (ROW LEVEL SECURITY) BOUNDARIES
The fundamental rule: **Never trust the frontend with internal commercial state.**

| Entity Table | Public Access | Authenticated User | Server / API Backend | Admin |
| :--- | :--- | :--- | :--- | :--- |
| `partners` | Read-only | Read-only | Full | Full |
| `commerce_entities` | Read-only | Read-only | Full | Full |
| `categories` | Read-only | Read-only | Full | Full |
| `offers` | Sanitized Read-only | Sanitized Read-only | Full | Full |
| `payment_methods` | No Access | Own Records Only (R/W) | Full Service Access | Restricted |
| `tracking_events` | No Direct Write | Own Records Only (Read) | Full | Full |
| `affiliate_relationships` | No Access | No Access | Full | Full |
| `conversions` | No Access | No Access | Full | Full |
| `commissions` | No Access | No Access | Full | Full |

## 3. OFFER SANITIZATION
The raw `offers` table contains internal `commission_terms` or `internal_campaign_metadata` stored in JSONB or secure columns.
A Supabase PostgreSQL View (e.g., `public_offers_view`) or a strict edge function will strip these sensitive fields, exposing only the mathematical properties required by the Optimization Engine (`value`, `type`, `eligibility_rules`).

## 4. TRACKING SECRETS
`affiliate_relationships` contains `tracking_template_url` which holds API keys or network-specific IDs. This table is strictly inaccessible from the client. Outbound clicks are routed entirely via backend proxy endpoints.

# RENO CRED ATTRIBUTION & COMMISSION MODEL

## 1. THE ATTRIBUTION CHAIN
To accurately measure business performance, RenoCred must trace revenue back to the exact intelligence decision that caused it. 

The attribution chain answers:
`User -> Click -> Recommendation -> Entity -> Partner -> Offer -> Conversion -> Commission`

## 2. TRACKING EVENTS (Security & Integrity)
The frontend CANNOT be trusted to create tracking records.
1. The UI requests an outbound link via an API: `POST /api/outbound { entity_id, offer_id, context }`.
2. The Server generates a unique `tracking_event` record (creating a UUID `click_id`).
3. The Server maps the `entity_id` to its Partner and corresponding `AffiliateRelationship`.
4. The Server constructs the final tracking URL (e.g. replacing `{{subid}}` with `click_id`).
5. The API returns a 302 Redirect to the frontend.

This ensures users/browsers cannot fabricate clicks, modify affiliate network parameters, or alter timestamps.

## 3. RECOMMENDATION SNAPSHOT
Because prices and offers change, a `tracking_event` must preserve what was shown to the user at click time.
Instead of duplicating massive JSON objects, the `tracking_event` stores a lightweight `recommendation_snapshot` JSONB column:
```json
{
  "base_price_inr": 12000,
  "recommended_payment_method_id": "card-001",
  "expected_savings_inr": 1350,
  "applied_offer_ids": ["offer-1", "offer-2"]
}
```
This is essential for dispute resolution and conversion accuracy tracking.

## 4. CONVERSION VS COMMISSION
They are separate concepts.
- **Conversion:** The actual commercial event. Occurs when the affiliate network fires a postback/webhook to RenoCred saying "Click ID 123abc resulted in a ₹12,000 purchase".
- **Commission Record:** The financial reconciliation. A conversion may be confirmed, but the commission might be adjusted, partially paid, or rejected later due to returns/cancellations.

**Flow:**
1. Affiliate network sends Server-to-Server Postback.
2. Server creates `Conversion` record linked to `tracking_event_id`. Status: `pending`.
3. End of month reconciliation: Network confirms sale. Status changes to `confirmed`.
4. Network issues payout. Status changes to `paid`.

This decoupled state machine supports delayed confirmations, rejected orders, and tiered payouts.

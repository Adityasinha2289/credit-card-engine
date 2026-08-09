# RenoCred Optimization Engine V2

The Optimization Engine is the pure domain core of RenoCred 2.0. It calculates the mathematically optimal combination of payment methods and merchant offers for any arbitrary spending opportunity.

## Core Concepts

- **Spending Opportunity**: An intent to spend (e.g. "Dining at Olive, ₹5000").
- **Payment Method**: Polymorphic methods (Credit, Debit, UPI, Wallet, Points).
- **Offer**: Discounts, cashback, or rewards originating from Merchant, Bank, or Network.
- **Optimization Result**: The final canonical output containing the selected payment method, stackable offers applied, effective cost, and value breakdown.

## Calculation Rules

The engine calculates value linearly. Upfront discounts reduce the base cost, which in turn reduces the base used for cashback calculations.
Example:
- Base Amount: ₹10,000
- Merchant Discount: ₹1,000
- Cashback: 5%
- Result: The cashback is calculated on ₹9,000, not ₹10,000. 5% of ₹9,000 = ₹450. Total Savings = ₹1,450.

### Benefit Valuation

- Cash equivalents (Flat discounts, Percentage discounts, Cashback) are valued at 1:1.
- Non-cash rewards are assigned a deterministic cash value.
  - **Points**: 1 point = ₹0.25 (by default)
  - **Miles**: 1 mile = ₹0.40 (by default)

## Eligibility & Stacking Rules

1. **Eligibility Filter**: An offer is only evaluated if it meets the minimum spend, category, partner, and payment method criteria.
2. **Mutually Exclusive Sources**: By default, if `mutuallyExclusiveSource` is true on an offer, the engine will only pick *one* offer from that source. It mathematically evaluates all valid subsets to find the highest total value.

## Ranking Strategy

All valid payment methods and offer combinations are evaluated and ranked.
1. **Primary Tie-Breaker**: Highest Total Value (Savings).
2. **Secondary Tie-Breaker**: Lowest Effective Cost (Prefers upfront discounts over deferred cashback/rewards when total values are equal).

## Edge Cases Safely Handled
- 0 or negative spend amounts.
- Missing payment methods / No eligible offers.
- Missing categories.
- Extreme combinations (cashback caps limiting actual applied values).

*This engine has absolutely zero dependencies on React, Supabase, Clerk, or the legacy `CardData` types.*

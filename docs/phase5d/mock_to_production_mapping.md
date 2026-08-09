# RENO CRED 2.0 — MOCK TO PRODUCTION MAPPING

## 1. Categories
The current UX represents the following categories across Lifestyle and Optimization flows:
- **Travel**: Flights, Hotels, Transport (`travel`, `accommodation`, `transport`)
- **Lifestyle**: Dining, Fitness, Entertainment (`dining`, `fitness`, `entertainment`)
- **Shopping**: Retail (`shopping`, `retail`)

**Mapping:**
We will seed the following stable categories into `categories`:
- `shopping` (Shopping & Retail)
- `fitness` (Health & Fitness)
- `dining` (Food & Dining)
- `travel` (Travel)
- `accommodation` (Hotels & Stays)
- `transport` (Cabs & Transport)
- `entertainment` (Movies & Events)

## 2. Partners
Existing Mock Partners (`MOCK_PARTNERS` from lifestyle & optimization):
1. `part-nike` -> Nike (Category: `shopping`)
2. `part-cultfit` -> Cult.fit (Category: `fitness`)
3. `part-uber` -> Uber (Category: `transport`)
4. `part-olive` -> Olive Bar & Kitchen (Category: `dining`)
5. `part-taj` -> Taj Hotels (Category: `accommodation`)
6. `part-makemytrip` -> MakeMyTrip (Category: `travel`)

*(Note: We will normalize IDs to UUIDs in Supabase, maintaining stable slug references).*

## 3. Commerce Entities (Products/Venues)
Existing Mock Products (`MOCK_PRODUCTS`):
1. **Nike Air Max 270** (`prod-nike-am270`) -> Maps to `part-nike`. Base Price: ₹12,000.
2. **Cultpass Pro** (`prod-cultfit-pro`) -> Maps to `part-cultfit`. Base Price: ₹15,000.

## 4. Offers
Existing Mock Offers (`MOCK_OFFERS`):
1. **Nike 10% Discount** (`off-nike-10`): Merchant Offer. 10% off (up to ₹500), Min Spend ₹3000. Target: `part-nike`.
2. **HDFC Diners 5X Rewards** (`off-hdfc-dining-5x`): Bank Offer. 16.5 value. Target: `dining` category.
3. **SBI Cashback** (`off-sbi-online-5`): Bank Offer. 5% cashback. Target: `shopping, travel, entertainment`.
4. **Axis Ace Flat Cashback** (`off-axis-ace-2`): Bank Offer. 2% flat cashback. Global.
5. **Cult.fit ₹1000 Off** (`off-cult-flat-1000`): Merchant Offer. Flat ₹1000 off. Min Spend ₹10000. Target: `part-cultfit`.
6. **Visa Dining Delights** (`off-visa-dining-15`): Network Offer. 15% off (up to ₹300). Target: `dining`.
7. **Nike Flat ₹200** (`off-nike-flat-200`): Merchant Offer. Flat ₹200 off. Target: `part-nike`.

## 5. Security & Isolation
- No mock users, payment methods, or cards will be inserted into production user tables.
- No real affiliate tracking credentials will be seeded.
- The `user_id` on user-owned records (which we are NOT seeding) will remain empty for this catalog seed.

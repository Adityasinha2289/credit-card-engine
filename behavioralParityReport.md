# Behavioral Parity Report

## Statistics
- **Total Scenarios:** 100
- **Exact Matches:** 0
- **Near Matches:** 0
- **Major Regressions:** 100
- **Cards Missing (ID mismatch):** 100
- **Adapter Assumptions Triggered:** 100% (Adapter forces FinixCard into CreditCardIntelligence)

### 🚨 Architectural Root Cause Analysis
The application currently contains **two disconnected recommendation engines**:
1. `RecommendationIntelligenceEngine` which consumes `CreditCardIntelligence` objects from `MOCK_CARDS_INTELLIGENCE`.
2. `taqdeerEngine.ts` / `recommendEngine.ts` which consumes `FinixCard` objects from `CARD_DATASET`.

In Phase 2 and 3, we successfully migrated the `FinixCard` dataset to the new `renocred-data` adapter. However, this test suite evaluates the `RecommendationIntelligenceEngine`. Because our adapter outputs `FinixCard`, we had to forcefully cast the schema to `CreditCardIntelligence` for this test. This extreme data-loss during casting (missing `forexMarkup`, `rewardType`, `fuelBenefits`) completely breaks the Scoring Engine, resulting in massive regressions.

## Scenario Details

### Scenario: Swiggy Small Food Order
- **Merchant:** Swiggy
- **Legacy Winner (Run A):** Swiggy HDFC Bank Credit Card (card-swiggy-hdfc)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹47 | **New Savings:** ₹7
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Swiggy Instamart Grocery
- **Merchant:** Swiggy Instamart
- **Legacy Winner (Run A):** Swiggy HDFC Bank Credit Card (card-swiggy-hdfc)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹246 | **New Savings:** ₹18
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Zomato Weekend Dinner
- **Merchant:** Zomato
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹308 | **New Savings:** ₹23
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Zomato Gourmet Dining
- **Merchant:** Zomato Food Delivery
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹574 | **New Savings:** ₹42
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Fine Dining Restaurant Payment
- **Merchant:** Swiggy
- **Legacy Winner (Run A):** Swiggy HDFC Bank Credit Card (card-swiggy-hdfc)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹923 | **New Savings:** ₹68
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Swiggy Gourmet Feast
- **Merchant:** Swiggy
- **Legacy Winner (Run A):** Swiggy HDFC Bank Credit Card (card-swiggy-hdfc)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹718 | **New Savings:** ₹53
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Zomato Breakfast Delivery
- **Merchant:** Zomato
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹37 | **New Savings:** ₹5
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Swiggy Late Night Snacks
- **Merchant:** Swiggy
- **Legacy Winner (Run A):** Swiggy HDFC Bank Credit Card (card-swiggy-hdfc)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹123 | **New Savings:** ₹9
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Zomato Cafe Order
- **Merchant:** Zomato
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹164 | **New Savings:** ₹12
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Swiggy Ice Cream Delivery
- **Merchant:** Swiggy
- **Legacy Winner (Run A):** Swiggy HDFC Bank Credit Card (card-swiggy-hdfc)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹113 | **New Savings:** ₹8
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Zomato Pizza Order
- **Merchant:** Zomato
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹226 | **New Savings:** ₹17
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Swiggy Lunch Box
- **Merchant:** Swiggy
- **Legacy Winner (Run A):** Swiggy HDFC Bank Credit Card (card-swiggy-hdfc)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹29 | **New Savings:** ₹4
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Zomato Bakery Order
- **Merchant:** Zomato
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹287 | **New Savings:** ₹21
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Swiggy Biryani Order
- **Merchant:** Swiggy
- **Legacy Winner (Run A):** Swiggy HDFC Bank Credit Card (card-swiggy-hdfc)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹369 | **New Savings:** ₹27
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Zomato Asian Food Order
- **Merchant:** Zomato
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹451 | **New Savings:** ₹33
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: MakeMyTrip Domestic Flight
- **Merchant:** MakeMyTrip
- **Legacy Winner (Run A):** Axis Bank Atlas Credit Card (card-axis-atlas)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹2168 | **New Savings:** ₹128
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: MakeMyTrip Luxury Hotel Stay
- **Merchant:** MakeMyTrip
- **Legacy Winner (Run A):** Axis Bank Atlas Credit Card (card-axis-atlas)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹6120 | **New Savings:** ₹360
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: IRCTC Train Ticket Booking
- **Merchant:** IRCTC
- **Legacy Winner (Run A):** SBI Cashback Credit Card (card-sbi-cashback)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹160 | **New Savings:** ₹48
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: MakeMyTrip International Flight
- **Merchant:** MakeMyTrip
- **Legacy Winner (Run A):** Axis Bank Atlas Credit Card (card-axis-atlas)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹10710 | **New Savings:** ₹630
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Uber Intercity Cab Ride
- **Merchant:** Uber Rides
- **Legacy Winner (Run A):** Axis Bank ACE Credit Card (card-axis-ace)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹72 | **New Savings:** ₹27
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: MakeMyTrip Resort Booking
- **Merchant:** MakeMyTrip
- **Legacy Winner (Run A):** Axis Bank Atlas Credit Card (card-axis-atlas)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹3825 | **New Savings:** ₹225
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: IRCTC Sleeper Train Ticket
- **Merchant:** IRCTC
- **Legacy Winner (Run A):** SBI Cashback Credit Card (card-sbi-cashback)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹70 | **New Savings:** ₹21
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: MakeMyTrip Homestay Booking
- **Merchant:** MakeMyTrip
- **Legacy Winner (Run A):** Axis Bank Atlas Credit Card (card-axis-atlas)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹2295 | **New Savings:** ₹135
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Uber Daily Commute
- **Merchant:** Uber Rides
- **Legacy Winner (Run A):** Axis Bank ACE Credit Card (card-axis-ace)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹18 | **New Savings:** ₹7
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: MakeMyTrip Holiday Package
- **Merchant:** MakeMyTrip
- **Legacy Winner (Run A):** Axis Bank Atlas Credit Card (card-axis-atlas)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹8925 | **New Savings:** ₹525
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: IRCTC Tejas Express
- **Merchant:** IRCTC
- **Legacy Winner (Run A):** SBI Cashback Credit Card (card-sbi-cashback)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹105 | **New Savings:** ₹32
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: MakeMyTrip Flight Cancellation Cover
- **Merchant:** MakeMyTrip
- **Legacy Winner (Run A):** Axis Bank Atlas Credit Card (card-axis-atlas)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹1734 | **New Savings:** ₹102
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Uber Airport Drop
- **Merchant:** Uber Rides
- **Legacy Winner (Run A):** Axis Bank ACE Credit Card (card-axis-ace)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹48 | **New Savings:** ₹18
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: MakeMyTrip Business Class Upgrade
- **Merchant:** MakeMyTrip
- **Legacy Winner (Run A):** Axis Bank Atlas Credit Card (card-axis-atlas)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹14790 | **New Savings:** ₹870
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: IRCTC Rajdhani Booking
- **Merchant:** IRCTC
- **Legacy Winner (Run A):** SBI Cashback Credit Card (card-sbi-cashback)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹225 | **New Savings:** ₹68
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: BPCL Octane Fuel Refill
- **Merchant:** BPCL Fuel Station
- **Legacy Winner (Run A):** BPCL SBI Card Octane (card-bpcl-octane-sbi)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹451 | **New Savings:** ₹45
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: HPCL Petrol Pump Spend
- **Merchant:** HPCL Fuel Station
- **Legacy Winner (Run A):** ICICI Bank HPCL Super Saver (card-icici-hpcl-super-saver)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹263 | **New Savings:** ₹38
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: IndianOil IOCL Fuel Refill
- **Merchant:** IndianOil Fuel Station
- **Legacy Winner (Run A):** IndianOil Axis Bank Credit Card (card-axis-indian-oil)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹68 | **New Savings:** ₹12
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: BPCL Diesel Refill
- **Merchant:** BPCL Fuel Station
- **Legacy Winner (Run A):** BPCL SBI Card Octane (card-bpcl-octane-sbi)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹675 | **New Savings:** ₹68
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: HPCL LPG Cylinder Booking
- **Merchant:** HPCL Fuel Station
- **Legacy Winner (Run A):** ICICI Bank HPCL Super Saver (card-icici-hpcl-super-saver)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹100 | **New Savings:** ₹14
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: IndianOil Highway Refill
- **Merchant:** IndianOil Fuel Station
- **Legacy Winner (Run A):** IndianOil Axis Bank Credit Card (card-axis-indian-oil)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹298 | **New Savings:** ₹53
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: BPCL Premium Petrol
- **Merchant:** BPCL Fuel Station
- **Legacy Winner (Run A):** BPCL SBI Card Octane (card-bpcl-octane-sbi)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹300 | **New Savings:** ₹30
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: HPCL Auto Gas CNG
- **Merchant:** HPCL Fuel Station
- **Legacy Winner (Run A):** ICICI Bank HPCL Super Saver (card-icici-hpcl-super-saver)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹69 | **New Savings:** ₹10
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: IndianOil XtraGreen Diesel
- **Merchant:** IndianOil Fuel Station
- **Legacy Winner (Run A):** IndianOil Axis Bank Credit Card (card-axis-indian-oil)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹272 | **New Savings:** ₹48
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: BPCL Scooter Tank Fill
- **Merchant:** BPCL Fuel Station
- **Legacy Winner (Run A):** BPCL SBI Card Octane (card-bpcl-octane-sbi)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹75 | **New Savings:** ₹8
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: HPCL Lubricant Oil Spend
- **Merchant:** HPCL Fuel Station
- **Legacy Winner (Run A):** ICICI Bank HPCL Super Saver (card-icici-hpcl-super-saver)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹158 | **New Savings:** ₹23
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: IndianOil City Petrol Pump
- **Merchant:** IndianOil Fuel Station
- **Legacy Winner (Run A):** IndianOil Axis Bank Credit Card (card-axis-indian-oil)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹153 | **New Savings:** ₹27
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Amazon Prime Electronics Order
- **Merchant:** Amazon.in
- **Legacy Winner (Run A):** Amazon Pay ICICI Card (card-icici-amazon)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹473 | **New Savings:** ₹68
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Amazon Household Goods
- **Merchant:** Amazon.in
- **Legacy Winner (Run A):** Amazon Pay ICICI Card (card-icici-amazon)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹336 | **New Savings:** ₹48
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Flipkart Big Billion Days Fashion
- **Merchant:** Flipkart
- **Legacy Winner (Run A):** SBI Cashback Credit Card (card-sbi-cashback)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹303 | **New Savings:** ₹83
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Myntra End of Reason Sale
- **Merchant:** Myntra Fashion
- **Legacy Winner (Run A):** HDFC Regalia Gold Credit Card (card-hdfc-regalia-gold)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹483 | **New Savings:** ₹102
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Amazon Books & Kindle Spend
- **Merchant:** Amazon.in
- **Legacy Winner (Run A):** Amazon Pay ICICI Card (card-icici-amazon)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹126 | **New Savings:** ₹18
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Flipkart Home Appliances
- **Merchant:** Flipkart
- **Legacy Winner (Run A):** SBI Cashback Credit Card (card-sbi-cashback)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹523 | **New Savings:** ₹143
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Myntra Winter Wear Sale
- **Merchant:** Myntra Fashion
- **Legacy Winner (Run A):** HDFC Regalia Gold Credit Card (card-hdfc-regalia-gold)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹298 | **New Savings:** ₹63
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Amazon Fresh Groceries
- **Merchant:** Amazon.in
- **Legacy Winner (Run A):** Amazon Pay ICICI Card (card-icici-amazon)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹189 | **New Savings:** ₹27
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Flipkart Footwear Order
- **Merchant:** Flipkart
- **Legacy Winner (Run A):** SBI Cashback Credit Card (card-sbi-cashback)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹187 | **New Savings:** ₹51
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Myntra Accessories Sale
- **Merchant:** Myntra Fashion
- **Legacy Winner (Run A):** HDFC Regalia Gold Credit Card (card-hdfc-regalia-gold)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹206 | **New Savings:** ₹44
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: DMart Supermarket Offline Retail
- **Merchant:** DMart Ready & Supermarket
- **Legacy Winner (Run A):** SBI Cashback Credit Card (card-sbi-cashback)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹98 | **New Savings:** ₹98
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Amazon Gaming Console Accessories
- **Merchant:** Amazon.in
- **Legacy Winner (Run A):** Amazon Pay ICICI Card (card-icici-amazon)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹609 | **New Savings:** ₹87
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Flipkart Furniture Order
- **Merchant:** Flipkart
- **Legacy Winner (Run A):** SBI Cashback Credit Card (card-sbi-cashback)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹451 | **New Savings:** ₹123
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Myntra Ethnic Wear
- **Merchant:** Myntra Fashion
- **Legacy Winner (Run A):** HDFC Regalia Gold Credit Card (card-hdfc-regalia-gold)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹270 | **New Savings:** ₹57
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Amazon Kitchenware
- **Merchant:** Amazon.in
- **Legacy Winner (Run A):** Amazon Pay ICICI Card (card-icici-amazon)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹284 | **New Savings:** ₹41
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: DMart Weekend Shopping
- **Merchant:** DMart Ready & Supermarket
- **Legacy Winner (Run A):** Axis Bank ACE Credit Card (card-axis-ace)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹48 | **New Savings:** ₹36
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Croma Smart TV Purchase
- **Merchant:** Croma Electronics
- **Legacy Winner (Run A):** Tata Neu Infinity HDFC Credit Card (card-tata-neu-infinity)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹3375 | **New Savings:** ₹675
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Reliance Digital Laptop
- **Merchant:** Reliance Digital
- **Legacy Winner (Run A):** HDFC Regalia Gold Credit Card (card-hdfc-regalia-gold)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹5325 | **New Savings:** ₹1125
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Amazon Apple iPhone Purchase
- **Merchant:** Amazon.in
- **Legacy Winner (Run A):** Amazon Pay ICICI Card (card-icici-amazon)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹8390 | **New Savings:** ₹1199
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Croma Microwave Oven
- **Merchant:** Croma Electronics
- **Legacy Winner (Run A):** Tata Neu Infinity HDFC Credit Card (card-tata-neu-infinity)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹938 | **New Savings:** ₹188
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Reliance Digital Wireless Earbuds
- **Merchant:** Reliance Digital
- **Legacy Winner (Run A):** HDFC Regalia Gold Credit Card (card-hdfc-regalia-gold)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹709 | **New Savings:** ₹150
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Croma iPad Purchase
- **Merchant:** Croma Electronics
- **Legacy Winner (Run A):** Tata Neu Infinity HDFC Credit Card (card-tata-neu-infinity)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹4493 | **New Savings:** ₹899
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Reliance Digital Refrigerator
- **Merchant:** Reliance Digital
- **Legacy Winner (Run A):** HDFC Regalia Gold Credit Card (card-hdfc-regalia-gold)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹2414 | **New Savings:** ₹510
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Airtel Fiber Broadband Bill
- **Merchant:** Airtel Fiber Broadband
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹757 | **New Savings:** ₹22
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: BESCOM Electricity Bill
- **Merchant:** Electricity Board (BESCOM / State)
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹434 | **New Savings:** ₹42
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Airtel Mobile Postpaid Bill
- **Merchant:** Airtel Fiber Broadband
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹606 | **New Savings:** ₹18
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: BESCOM Summer Electricity Bill
- **Merchant:** Electricity Board (BESCOM / State)
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹338 | **New Savings:** ₹78
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Airtel DTH Direct Recharge
- **Merchant:** Airtel Fiber Broadband
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹1818 | **New Savings:** ₹54
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: State Electricity Bill GPay
- **Merchant:** Electricity Board (BESCOM / State)
- **Legacy Winner (Run A):** Axis Bank ACE Credit Card (card-axis-ace)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹195 | **New Savings:** ₹28
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Airtel Prepaid Annual Plan
- **Merchant:** Airtel Fiber Broadband
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹1515 | **New Savings:** ₹45
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Piped Natural Gas Bill
- **Merchant:** Electricity Board (BESCOM / State)
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹117 | **New Savings:** ₹11
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Water Supply Board Bill
- **Merchant:** Electricity Board (BESCOM / State)
- **Legacy Winner (Run A):** Axis Bank ACE Credit Card (card-axis-ace)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹65 | **New Savings:** ₹9
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Airtel Black Combined Bill
- **Merchant:** Airtel Fiber Broadband
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹1262 | **New Savings:** ₹37
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Electricity Bill Off-Season
- **Merchant:** Electricity Board (BESCOM / State)
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹186 | **New Savings:** ₹18
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Airtel Wi-Fi Booster
- **Merchant:** Airtel Fiber Broadband
- **Legacy Winner (Run A):** Airtel Axis Bank Credit Card (card-airtel-axis)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹2020 | **New Savings:** ₹60
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Municipal Property Tax Utility
- **Merchant:** Electricity Board (BESCOM / State)
- **Legacy Winner (Run A):** Axis Bank ACE Credit Card (card-axis-ace)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹553 | **New Savings:** ₹128
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: LIC Life Insurance Premium
- **Merchant:** LIC / HDFC ERGO Insurance
- **Legacy Winner (Run A):** HDFC Infinia Metal Edition (card-hdfc-infinia)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹1064 | **New Savings:** ₹420
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: HDFC ERGO Health Insurance
- **Merchant:** LIC / HDFC ERGO Insurance
- **Legacy Winner (Run A):** HDFC Infinia Metal Edition (card-hdfc-infinia)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹703 | **New Savings:** ₹278
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Government Tax GST Portal Payment
- **Merchant:** Government GST & Tax Portal
- **Legacy Winner (Run A):** HDFC Infinia Metal Edition (card-hdfc-infinia)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹1710 | **New Savings:** ₹675
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Car Motor Insurance Renewal
- **Merchant:** LIC / HDFC ERGO Insurance
- **Legacy Winner (Run A):** HDFC Infinia Metal Edition (card-hdfc-infinia)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹471 | **New Savings:** ₹186
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Govt Stamp Duty Fee Payment
- **Merchant:** Government GST & Tax Portal
- **Legacy Winner (Run A):** HDFC Infinia Metal Edition (card-hdfc-infinia)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹1216 | **New Savings:** ₹480
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: LIC Pension Plan Premium
- **Merchant:** LIC / HDFC ERGO Insurance
- **Legacy Winner (Run A):** HDFC Infinia Metal Edition (card-hdfc-infinia)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹1900 | **New Savings:** ₹750
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Apollo Pharmacy Prescription Medicines
- **Merchant:** Apollo Pharmacy & Health
- **Legacy Winner (Run A):** SBI SimplyCLICK Credit Card (card-sbi-simplyclick)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹492 | **New Savings:** ₹24
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Apollo Health Checkup Package
- **Merchant:** Apollo Pharmacy & Health
- **Legacy Winner (Run A):** SBI SimplyCLICK Credit Card (card-sbi-simplyclick)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹923 | **New Savings:** ₹45
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Apollo Dental Care Spend
- **Merchant:** Apollo Pharmacy & Health
- **Legacy Winner (Run A):** SBI SimplyCLICK Credit Card (card-sbi-simplyclick)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹369 | **New Savings:** ₹18
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Apollo Supplements Purchase
- **Merchant:** Apollo Pharmacy & Health
- **Legacy Winner (Run A):** SBI SimplyCLICK Credit Card (card-sbi-simplyclick)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹738 | **New Savings:** ₹36
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Apollo First Aid Essentials
- **Merchant:** Apollo Pharmacy & Health
- **Legacy Winner (Run A):** SBI SimplyCLICK Credit Card (card-sbi-simplyclick)
- **New Winner (Run B):** SBM One Card credit card (sbm-one-card)
- **Legacy Savings:** ₹174 | **New Savings:** ₹9
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: BookMyShow IMAX Movie Tickets
- **Merchant:** BookMyShow
- **Legacy Winner (Run A):** SBI SimplyCLICK Credit Card (card-sbi-simplyclick)
- **New Winner (Run B):** Kotak 6E Rewards XL – Indigo credit card (kotak-6e-rewards-xl-indigo)
- **Legacy Savings:** ₹168 | **New Savings:** ₹24
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: BookMyShow Concert Pass
- **Merchant:** BookMyShow
- **Legacy Winner (Run A):** SBI SimplyCLICK Credit Card (card-sbi-simplyclick)
- **New Winner (Run B):** Kotak 6E Rewards XL – Indigo credit card (kotak-6e-rewards-xl-indigo)
- **Legacy Savings:** ₹504 | **New Savings:** ₹72
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: BookMyShow Standup Comedy
- **Merchant:** BookMyShow
- **Legacy Winner (Run A):** SBI SimplyCLICK Credit Card (card-sbi-simplyclick)
- **New Winner (Run B):** Kotak 6E Rewards XL – Indigo credit card (kotak-6e-rewards-xl-indigo)
- **Legacy Savings:** ₹126 | **New Savings:** ₹18
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: BookMyShow Theater Play
- **Merchant:** BookMyShow
- **Legacy Winner (Run A):** SBI SimplyCLICK Credit Card (card-sbi-simplyclick)
- **New Winner (Run B):** Kotak 6E Rewards XL – Indigo credit card (kotak-6e-rewards-xl-indigo)
- **Legacy Savings:** ₹231 | **New Savings:** ₹33
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: BookMyShow Sports Stadium Pass
- **Merchant:** BookMyShow
- **Legacy Winner (Run A):** SBI SimplyCLICK Credit Card (card-sbi-simplyclick)
- **New Winner (Run B):** Kotak 6E Rewards XL – Indigo credit card (kotak-6e-rewards-xl-indigo)
- **Legacy Savings:** ₹683 | **New Savings:** ₹98
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: RuPay UPI Chai Coffee Small Spend
- **Merchant:** Swiggy
- **Legacy Winner (Run A):** Axis Bank ACE Credit Card (card-axis-ace)
- **New Winner (Run B):** BOB Select credit card (bob-select)
- **Legacy Savings:** ₹3 | **New Savings:** ₹1
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: RuPay UPI Small Bakery Item
- **Merchant:** DMart Ready & Supermarket
- **Legacy Winner (Run A):** Tata Neu Infinity HDFC Credit Card (card-tata-neu-infinity)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹2 | **New Savings:** ₹2
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Large Purchase Gold Jewelry
- **Merchant:** Amazon.in
- **Legacy Winner (Run A):** Amazon Pay ICICI Card (card-icici-amazon)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹13125 | **New Savings:** ₹1875
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Large Purchase Luxury Watch
- **Merchant:** Amazon.in
- **Legacy Winner (Run A):** Amazon Pay ICICI Card (card-icici-amazon)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹8925 | **New Savings:** ₹1275
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: RuPay UPI Small Auto Rickshaw Fare
- **Merchant:** Uber Rides
- **Legacy Winner (Run A):** Axis Bank ACE Credit Card (card-axis-ace)
- **New Winner (Run B):** IDFC First Millennia credit card (idfc-first-millennia)
- **Legacy Savings:** ₹3 | **New Savings:** ₹1
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)

### Scenario: Large Purchase Home Solar Inverter
- **Merchant:** Croma Electronics
- **Legacy Winner (Run A):** Tata Neu Infinity HDFC Credit Card (card-tata-neu-infinity)
- **New Winner (Run B):** IndusInd EazyDiner Signature credit card (indusind-eazydiner-signature)
- **Legacy Savings:** ₹10875 | **New Savings:** ₹2175
- **Status:** Major Regression
- **Root Cause:** Card completely missing from new dataset (Schema ID mismatch)


# RenoCred Recommendation Evaluation Report

**Timestamp**: 2026-08-02T20:27:52.709Z  
**Total Scenarios Evaluated**: 100  
**Quality Gate**: 🔴 FAILED  

> [!CAUTION]
> **QUALITY GATE FAILED**: Top-1 Accuracy (0%) is below configured threshold (90%); Regression exceeds threshold: Top-1 Accuracy dropped by 66% (max allowed: 5%)

## Executive Summary

Recommendation Evaluation Platform evaluated 100 benchmark scenarios with Top-1 Accuracy 0% and Average Confidence 98.1%.

## Core Quality Metrics

| Metric | Value | Target / Benchmark |
| :--- | :---: | :---: |
| **Top-1 Accuracy** | **0%** | ≥ 90.0% |
| **Top-3 Accuracy** | **0%** | ≥ 95.0% |
| **Average Confidence** | **98.1%** | ≥ 80.0% |
| **Average Savings** | **₹177** | N/A |
| **Average Response Time** | **0.17 ms** | < 50 ms |
| **Merchant Resolution Accuracy** | **100%** | 100.0% |
| **Offer Resolution Accuracy** | **0%** | ≥ 90.0% |
| **Category Accuracy** | **100%** | 100.0% |
| **False Recommendation Count** | **100** | 0 |
| **Confidence Calibration Error** | **98.1** | Lower is better |

## Regression Analysis

| Status | Scenario Count | Details |
| :--- | :---: | :--- |
| **Improved** | 0 | Scenarios passing that previously failed |
| **Regressed** | 65 | Scenarios failing that previously passed |
| **Unchanged** | 35 | Scenarios with identical pass/fail status |

### Metric Deltas vs Previous Run
- **Top-1 Accuracy Delta**: `-66%`
- **Top-3 Accuracy Delta**: `-100%`
- **Average Confidence Delta**: `+0.5%`
- **Average Savings Delta**: `₹-1132207`
- **Average Response Time Delta**: `+0.14 ms`

## Category Performance & Leaderboard

| Category | Scenarios | Passed | Top-1 Acc | Top-3 Acc | Avg Conf | Avg Savings | Avg Time |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `dining` | 16 | 0 | 0% | 0% | 90.6% | ₹22 | 0.26 ms |
| `travel` | 16 | 0 | 0% | 0% | 97.5% | ₹200 | 0.17 ms |
| `fuel` | 12 | 0 | 0% | 0% | 100% | ₹31 | 0.14 ms |
| `shopping` | 27 | 0 | 0% | 0% | 100% | ₹413 | 0.15 ms |
| `utilities` | 19 | 0 | 0% | 0% | 100% | ₹117 | 0.16 ms |
| `medical` | 5 | 0 | 0% | 0% | 100% | ₹26 | 0.18 ms |
| `entertainment` | 5 | 0 | 0% | 0% | 100% | ₹49 | 0.14 ms |

## Confidence Distribution

| Confidence Range | Scenario Count | Percentage |
| :--- | :---: | :---: |
| 90-100% | 100 | 100% |
| 80-89% | 0 | 0% |
| 70-79% | 0 | 0% |
| 60-69% | 0 | 0% |
| <60% | 0 | 0% |

## Over-Recommended Cards

| Card Name | Actual Recs | Expected Recs | Share % | Over-Recommendation Ratio |
| :--- | :---: | :---: | :---: | :---: |
| **DBS 5X Plus Signature Supercard credit card** | 24 | 0 | 24% | 24× |
| **HDFC Swiggy credit card** | 18 | 0 | 18% | 18× |
| **RBL Platinum Maxima Plus credit card** | 16 | 0 | 16% | 16× |
| **ICICI Intermiles Sapphiro (Visa) credit card** | 16 | 0 | 16% | 16× |
| **BOB HPCL Energie credit card** | 12 | 0 | 12% | 12× |
| **HDFC Shoppers Stop credit card** | 9 | 0 | 9% | 9× |
| **RBL Play (BookMyShow) credit card** | 5 | 0 | 5% | 5× |

## Merchants with Poor Recommendation Quality (<80% Accuracy)

| Merchant | Scenario Count | Passed | Accuracy |
| :--- | :---: | :---: | :---: |
| **Swiggy** | 8 | 0 | 0% |
| **Swiggy Instamart** | 1 | 0 | 0% |
| **Zomato** | 6 | 0 | 0% |
| **Zomato Food Delivery** | 1 | 0 | 0% |
| **MakeMyTrip** | 8 | 0 | 0% |
| **IRCTC** | 4 | 0 | 0% |
| **Uber Rides** | 4 | 0 | 0% |
| **BPCL Fuel Station** | 4 | 0 | 0% |
| **HPCL Fuel Station** | 4 | 0 | 0% |
| **IndianOil Fuel Station** | 4 | 0 | 0% |
| **Amazon.in** | 9 | 0 | 0% |
| **Flipkart** | 4 | 0 | 0% |
| **Myntra Fashion** | 4 | 0 | 0% |
| **DMart Ready & Supermarket** | 3 | 0 | 0% |
| **Croma Electronics** | 4 | 0 | 0% |
| **Reliance Digital** | 3 | 0 | 0% |
| **Airtel Fiber Broadband** | 6 | 0 | 0% |
| **Electricity Board (BESCOM / State)** | 7 | 0 | 0% |
| **LIC / HDFC ERGO Insurance** | 4 | 0 | 0% |
| **Government GST & Tax Portal** | 2 | 0 | 0% |
| **Apollo Pharmacy & Health** | 5 | 0 | 0% |
| **BookMyShow** | 5 | 0 | 0% |

## Slowest Requests (Top 5)

| Scenario ID | Merchant | Amount | Execution Time |
| :--- | :--- | :---: | :---: |
| `scenario-001` | Swiggy | ₹450 | **1.41 ms** |
| `scenario-003` | Zomato | ₹1500 | **0.35 ms** |
| `scenario-016` | MakeMyTrip | ₹8500 | **0.31 ms** |
| `scenario-002` | Swiggy Instamart | ₹1200 | **0.3 ms** |
| `scenario-082` | LIC / HDFC ERGO Insurance | ₹12400 | **0.3 ms** |

## Failed Scenarios Breakdown

### Scenario `scenario-001`: Swiggy Small Food Order
- **Merchant**: Swiggy | **Amount**: ₹450 | **Category**: `dining`
- **Expected Winner**: **card-swiggy-hdfc** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹45 | **Actual Savings**: ₹7
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-swiggy-hdfc", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-002`: Swiggy Instamart Grocery
- **Merchant**: Swiggy Instamart | **Amount**: ₹1200 | **Category**: `dining`
- **Expected Winner**: **card-swiggy-hdfc** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹120 | **Actual Savings**: ₹18
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-swiggy-hdfc", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-003`: Zomato Weekend Dinner
- **Merchant**: Zomato | **Amount**: ₹1500 | **Category**: `dining`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹150 | **Actual Savings**: ₹23
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-004`: Zomato Gourmet Dining
- **Merchant**: Zomato Food Delivery | **Amount**: ₹2800 | **Category**: `dining`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹280 | **Actual Savings**: ₹42
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-005`: Fine Dining Restaurant Payment
- **Merchant**: Swiggy | **Amount**: ₹4500 | **Category**: `dining`
- **Expected Winner**: **card-swiggy-hdfc** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹450 | **Actual Savings**: ₹68
- **Confidence**: 90% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-swiggy-hdfc", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-006`: Swiggy Gourmet Feast
- **Merchant**: Swiggy | **Amount**: ₹3500 | **Category**: `dining`
- **Expected Winner**: **card-swiggy-hdfc** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹350 | **Actual Savings**: ₹53
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-swiggy-hdfc", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-007`: Zomato Breakfast Delivery
- **Merchant**: Zomato | **Amount**: ₹350 | **Category**: `dining`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹35 | **Actual Savings**: ₹5
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-008`: Swiggy Late Night Snacks
- **Merchant**: Swiggy | **Amount**: ₹600 | **Category**: `dining`
- **Expected Winner**: **card-swiggy-hdfc** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹60 | **Actual Savings**: ₹9
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-swiggy-hdfc", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-009`: Zomato Cafe Order
- **Merchant**: Zomato | **Amount**: ₹800 | **Category**: `dining`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹80 | **Actual Savings**: ₹12
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-010`: Swiggy Ice Cream Delivery
- **Merchant**: Swiggy | **Amount**: ₹550 | **Category**: `dining`
- **Expected Winner**: **card-swiggy-hdfc** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹55 | **Actual Savings**: ₹8
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-swiggy-hdfc", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-011`: Zomato Pizza Order
- **Merchant**: Zomato | **Amount**: ₹1100 | **Category**: `dining`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹110 | **Actual Savings**: ₹17
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-012`: Swiggy Lunch Box
- **Merchant**: Swiggy | **Amount**: ₹280 | **Category**: `dining`
- **Expected Winner**: **card-swiggy-hdfc** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹28 | **Actual Savings**: ₹4
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-swiggy-hdfc", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-013`: Zomato Bakery Order
- **Merchant**: Zomato | **Amount**: ₹1400 | **Category**: `dining`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹140 | **Actual Savings**: ₹21
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-014`: Swiggy Biryani Order
- **Merchant**: Swiggy | **Amount**: ₹1800 | **Category**: `dining`
- **Expected Winner**: **card-swiggy-hdfc** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹180 | **Actual Savings**: ₹27
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-swiggy-hdfc", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-015`: Zomato Asian Food Order
- **Merchant**: Zomato | **Amount**: ₹2200 | **Category**: `dining`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹220 | **Actual Savings**: ₹33
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-016`: MakeMyTrip Domestic Flight
- **Merchant**: MakeMyTrip | **Amount**: ₹8500 | **Category**: `travel`
- **Expected Winner**: **card-axis-atlas** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹1275 | **Actual Savings**: ₹128
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-atlas", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-017`: MakeMyTrip Luxury Hotel Stay
- **Merchant**: MakeMyTrip | **Amount**: ₹24000 | **Category**: `travel`
- **Expected Winner**: **card-axis-atlas** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹3600 | **Actual Savings**: ₹360
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-atlas", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-018`: IRCTC Train Ticket Booking
- **Merchant**: IRCTC | **Amount**: ₹3200 | **Category**: `travel`
- **Expected Winner**: **card-sbi-cashback** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹160 | **Actual Savings**: ₹48
- **Confidence**: 90% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-cashback", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-019`: MakeMyTrip International Flight
- **Merchant**: MakeMyTrip | **Amount**: ₹42000 | **Category**: `travel`
- **Expected Winner**: **card-axis-atlas** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹6300 | **Actual Savings**: ₹630
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-atlas", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-020`: Uber Intercity Cab Ride
- **Merchant**: Uber Rides | **Amount**: ₹1800 | **Category**: `travel`
- **Expected Winner**: **card-axis-ace** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹72 | **Actual Savings**: ₹27
- **Confidence**: 100% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-ace", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-021`: MakeMyTrip Resort Booking
- **Merchant**: MakeMyTrip | **Amount**: ₹15000 | **Category**: `travel`
- **Expected Winner**: **card-axis-atlas** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹2250 | **Actual Savings**: ₹225
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-atlas", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-022`: IRCTC Sleeper Train Ticket
- **Merchant**: IRCTC | **Amount**: ₹1400 | **Category**: `travel`
- **Expected Winner**: **card-sbi-cashback** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹70 | **Actual Savings**: ₹21
- **Confidence**: 90% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-cashback", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-023`: MakeMyTrip Homestay Booking
- **Merchant**: MakeMyTrip | **Amount**: ₹9000 | **Category**: `travel`
- **Expected Winner**: **card-axis-atlas** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹1350 | **Actual Savings**: ₹135
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-atlas", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-024`: Uber Daily Commute
- **Merchant**: Uber Rides | **Amount**: ₹450 | **Category**: `travel`
- **Expected Winner**: **card-axis-ace** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹18 | **Actual Savings**: ₹7
- **Confidence**: 100% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-ace", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-025`: MakeMyTrip Holiday Package
- **Merchant**: MakeMyTrip | **Amount**: ₹35000 | **Category**: `travel`
- **Expected Winner**: **card-axis-atlas** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹5250 | **Actual Savings**: ₹525
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-atlas", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-026`: IRCTC Tejas Express
- **Merchant**: IRCTC | **Amount**: ₹2100 | **Category**: `travel`
- **Expected Winner**: **card-sbi-cashback** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹105 | **Actual Savings**: ₹32
- **Confidence**: 90% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-cashback", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-027`: MakeMyTrip Flight Cancellation Cover
- **Merchant**: MakeMyTrip | **Amount**: ₹6800 | **Category**: `travel`
- **Expected Winner**: **card-axis-atlas** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹1020 | **Actual Savings**: ₹102
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-atlas", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-028`: Uber Airport Drop
- **Merchant**: Uber Rides | **Amount**: ₹1200 | **Category**: `travel`
- **Expected Winner**: **card-axis-ace** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹48 | **Actual Savings**: ₹18
- **Confidence**: 100% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-ace", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-029`: MakeMyTrip Business Class Upgrade
- **Merchant**: MakeMyTrip | **Amount**: ₹58000 | **Category**: `travel`
- **Expected Winner**: **card-axis-atlas** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹8700 | **Actual Savings**: ₹870
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-atlas", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-030`: IRCTC Rajdhani Booking
- **Merchant**: IRCTC | **Amount**: ₹4500 | **Category**: `travel`
- **Expected Winner**: **card-sbi-cashback** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹225 | **Actual Savings**: ₹68
- **Confidence**: 90% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-cashback", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-031`: BPCL Octane Fuel Refill
- **Merchant**: BPCL Fuel Station | **Amount**: ₹3000 | **Category**: `fuel`
- **Expected Winner**: **card-bpcl-octane-sbi** | **Actual Winner**: **BOB HPCL Energie credit card (bob-hpcl-energie)**
- **Expected Savings**: ₹218 | **Actual Savings**: ₹45
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-bpcl-octane-sbi", got"BOB HPCL Energie credit card (bob-hpcl-energie)"

### Scenario `scenario-032`: HPCL Petrol Pump Spend
- **Merchant**: HPCL Fuel Station | **Amount**: ₹2500 | **Category**: `fuel`
- **Expected Winner**: **card-icici-hpcl-super-saver** | **Actual Winner**: **BOB HPCL Energie credit card (bob-hpcl-energie)**
- **Expected Savings**: ₹125 | **Actual Savings**: ₹38
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-icici-hpcl-super-saver", got"BOB HPCL Energie credit card (bob-hpcl-energie)"

### Scenario `scenario-033`: IndianOil IOCL Fuel Refill
- **Merchant**: IndianOil Fuel Station | **Amount**: ₹800 | **Category**: `fuel`
- **Expected Winner**: **card-axis-indian-oil** | **Actual Winner**: **BOB HPCL Energie credit card (bob-hpcl-energie)**
- **Expected Savings**: ₹32 | **Actual Savings**: ₹12
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-indian-oil", got"BOB HPCL Energie credit card (bob-hpcl-energie)"

### Scenario `scenario-034`: BPCL Diesel Refill
- **Merchant**: BPCL Fuel Station | **Amount**: ₹4500 | **Category**: `fuel`
- **Expected Winner**: **card-bpcl-octane-sbi** | **Actual Winner**: **BOB HPCL Energie credit card (bob-hpcl-energie)**
- **Expected Savings**: ₹326 | **Actual Savings**: ₹68
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-bpcl-octane-sbi", got"BOB HPCL Energie credit card (bob-hpcl-energie)"

### Scenario `scenario-035`: HPCL LPG Cylinder Booking
- **Merchant**: HPCL Fuel Station | **Amount**: ₹950 | **Category**: `fuel`
- **Expected Winner**: **card-icici-hpcl-super-saver** | **Actual Winner**: **BOB HPCL Energie credit card (bob-hpcl-energie)**
- **Expected Savings**: ₹48 | **Actual Savings**: ₹14
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-icici-hpcl-super-saver", got"BOB HPCL Energie credit card (bob-hpcl-energie)"

### Scenario `scenario-036`: IndianOil Highway Refill
- **Merchant**: IndianOil Fuel Station | **Amount**: ₹3500 | **Category**: `fuel`
- **Expected Winner**: **card-axis-indian-oil** | **Actual Winner**: **BOB HPCL Energie credit card (bob-hpcl-energie)**
- **Expected Savings**: ₹140 | **Actual Savings**: ₹53
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-indian-oil", got"BOB HPCL Energie credit card (bob-hpcl-energie)"

### Scenario `scenario-037`: BPCL Premium Petrol
- **Merchant**: BPCL Fuel Station | **Amount**: ₹2000 | **Category**: `fuel`
- **Expected Winner**: **card-bpcl-octane-sbi** | **Actual Winner**: **BOB HPCL Energie credit card (bob-hpcl-energie)**
- **Expected Savings**: ₹145 | **Actual Savings**: ₹30
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-bpcl-octane-sbi", got"BOB HPCL Energie credit card (bob-hpcl-energie)"

### Scenario `scenario-038`: HPCL Auto Gas CNG
- **Merchant**: HPCL Fuel Station | **Amount**: ₹650 | **Category**: `fuel`
- **Expected Winner**: **card-icici-hpcl-super-saver** | **Actual Winner**: **BOB HPCL Energie credit card (bob-hpcl-energie)**
- **Expected Savings**: ₹33 | **Actual Savings**: ₹10
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-icici-hpcl-super-saver", got"BOB HPCL Energie credit card (bob-hpcl-energie)"

### Scenario `scenario-039`: IndianOil XtraGreen Diesel
- **Merchant**: IndianOil Fuel Station | **Amount**: ₹3200 | **Category**: `fuel`
- **Expected Winner**: **card-axis-indian-oil** | **Actual Winner**: **BOB HPCL Energie credit card (bob-hpcl-energie)**
- **Expected Savings**: ₹128 | **Actual Savings**: ₹48
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-indian-oil", got"BOB HPCL Energie credit card (bob-hpcl-energie)"

### Scenario `scenario-040`: BPCL Scooter Tank Fill
- **Merchant**: BPCL Fuel Station | **Amount**: ₹500 | **Category**: `fuel`
- **Expected Winner**: **card-bpcl-octane-sbi** | **Actual Winner**: **BOB HPCL Energie credit card (bob-hpcl-energie)**
- **Expected Savings**: ₹36 | **Actual Savings**: ₹8
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-bpcl-octane-sbi", got"BOB HPCL Energie credit card (bob-hpcl-energie)"

### Scenario `scenario-041`: HPCL Lubricant Oil Spend
- **Merchant**: HPCL Fuel Station | **Amount**: ₹1500 | **Category**: `fuel`
- **Expected Winner**: **card-icici-hpcl-super-saver** | **Actual Winner**: **BOB HPCL Energie credit card (bob-hpcl-energie)**
- **Expected Savings**: ₹75 | **Actual Savings**: ₹23
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-icici-hpcl-super-saver", got"BOB HPCL Energie credit card (bob-hpcl-energie)"

### Scenario `scenario-042`: IndianOil City Petrol Pump
- **Merchant**: IndianOil Fuel Station | **Amount**: ₹1800 | **Category**: `fuel`
- **Expected Winner**: **card-axis-indian-oil** | **Actual Winner**: **BOB HPCL Energie credit card (bob-hpcl-energie)**
- **Expected Savings**: ₹72 | **Actual Savings**: ₹27
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-indian-oil", got"BOB HPCL Energie credit card (bob-hpcl-energie)"

### Scenario `scenario-043`: Amazon Prime Electronics Order
- **Merchant**: Amazon.in | **Amount**: ₹4500 | **Category**: `shopping`
- **Expected Winner**: **card-icici-amazon** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹225 | **Actual Savings**: ₹68
- **Confidence**: 100% (Min Required: 90%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-icici-amazon", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-044`: Amazon Household Goods
- **Merchant**: Amazon.in | **Amount**: ₹3200 | **Category**: `shopping`
- **Expected Winner**: **card-icici-amazon** | **Actual Winner**: **HDFC Shoppers Stop credit card (hdfc-shoppers-stop)**
- **Expected Savings**: ₹160 | **Actual Savings**: ₹48
- **Confidence**: 100% (Min Required: 90%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-icici-amazon", got"HDFC Shoppers Stop credit card (hdfc-shoppers-stop)"

### Scenario `scenario-045`: Flipkart Big Billion Days Fashion
- **Merchant**: Flipkart | **Amount**: ₹5500 | **Category**: `shopping`
- **Expected Winner**: **card-sbi-cashback** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹275 | **Actual Savings**: ₹83
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-cashback", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-046`: Myntra End of Reason Sale
- **Merchant**: Myntra Fashion | **Amount**: ₹6800 | **Category**: `shopping`
- **Expected Winner**: **card-hdfc-regalia-gold** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹340 | **Actual Savings**: ₹102
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-hdfc-regalia-gold", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-047`: Amazon Books & Kindle Spend
- **Merchant**: Amazon.in | **Amount**: ₹1200 | **Category**: `shopping`
- **Expected Winner**: **card-icici-amazon** | **Actual Winner**: **HDFC Shoppers Stop credit card (hdfc-shoppers-stop)**
- **Expected Savings**: ₹60 | **Actual Savings**: ₹18
- **Confidence**: 100% (Min Required: 90%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-icici-amazon", got"HDFC Shoppers Stop credit card (hdfc-shoppers-stop)"

### Scenario `scenario-048`: Flipkart Home Appliances
- **Merchant**: Flipkart | **Amount**: ₹9500 | **Category**: `shopping`
- **Expected Winner**: **card-sbi-cashback** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹475 | **Actual Savings**: ₹143
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-cashback", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-049`: Myntra Winter Wear Sale
- **Merchant**: Myntra Fashion | **Amount**: ₹4200 | **Category**: `shopping`
- **Expected Winner**: **card-hdfc-regalia-gold** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹210 | **Actual Savings**: ₹63
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-hdfc-regalia-gold", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-050`: Amazon Fresh Groceries
- **Merchant**: Amazon.in | **Amount**: ₹1800 | **Category**: `shopping`
- **Expected Winner**: **card-icici-amazon** | **Actual Winner**: **HDFC Shoppers Stop credit card (hdfc-shoppers-stop)**
- **Expected Savings**: ₹90 | **Actual Savings**: ₹27
- **Confidence**: 100% (Min Required: 90%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-icici-amazon", got"HDFC Shoppers Stop credit card (hdfc-shoppers-stop)"

### Scenario `scenario-051`: Flipkart Footwear Order
- **Merchant**: Flipkart | **Amount**: ₹3400 | **Category**: `shopping`
- **Expected Winner**: **card-sbi-cashback** | **Actual Winner**: **HDFC Shoppers Stop credit card (hdfc-shoppers-stop)**
- **Expected Savings**: ₹170 | **Actual Savings**: ₹51
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-cashback", got"HDFC Shoppers Stop credit card (hdfc-shoppers-stop)"

### Scenario `scenario-052`: Myntra Accessories Sale
- **Merchant**: Myntra Fashion | **Amount**: ₹2900 | **Category**: `shopping`
- **Expected Winner**: **card-hdfc-regalia-gold** | **Actual Winner**: **HDFC Shoppers Stop credit card (hdfc-shoppers-stop)**
- **Expected Savings**: ₹145 | **Actual Savings**: ₹44
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-hdfc-regalia-gold", got"HDFC Shoppers Stop credit card (hdfc-shoppers-stop)"

### Scenario `scenario-053`: DMart Supermarket Offline Retail
- **Merchant**: DMart Ready & Supermarket | **Amount**: ₹6500 | **Category**: `shopping`
- **Expected Winner**: **card-axis-ace** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹130 | **Actual Savings**: ₹98
- **Confidence**: 100% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-ace", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-054`: Amazon Gaming Console Accessories
- **Merchant**: Amazon.in | **Amount**: ₹5800 | **Category**: `shopping`
- **Expected Winner**: **card-icici-amazon** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹290 | **Actual Savings**: ₹87
- **Confidence**: 100% (Min Required: 90%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-icici-amazon", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-055`: Flipkart Furniture Order
- **Merchant**: Flipkart | **Amount**: ₹8200 | **Category**: `shopping`
- **Expected Winner**: **card-sbi-cashback** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹410 | **Actual Savings**: ₹123
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-cashback", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-056`: Myntra Ethnic Wear
- **Merchant**: Myntra Fashion | **Amount**: ₹3800 | **Category**: `shopping`
- **Expected Winner**: **card-hdfc-regalia-gold** | **Actual Winner**: **HDFC Shoppers Stop credit card (hdfc-shoppers-stop)**
- **Expected Savings**: ₹190 | **Actual Savings**: ₹57
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-hdfc-regalia-gold", got"HDFC Shoppers Stop credit card (hdfc-shoppers-stop)"

### Scenario `scenario-057`: Amazon Kitchenware
- **Merchant**: Amazon.in | **Amount**: ₹2700 | **Category**: `shopping`
- **Expected Winner**: **card-icici-amazon** | **Actual Winner**: **HDFC Shoppers Stop credit card (hdfc-shoppers-stop)**
- **Expected Savings**: ₹135 | **Actual Savings**: ₹41
- **Confidence**: 100% (Min Required: 90%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-icici-amazon", got"HDFC Shoppers Stop credit card (hdfc-shoppers-stop)"

### Scenario `scenario-058`: DMart Weekend Shopping
- **Merchant**: DMart Ready & Supermarket | **Amount**: ₹2400 | **Category**: `shopping`
- **Expected Winner**: **card-axis-ace** | **Actual Winner**: **HDFC Shoppers Stop credit card (hdfc-shoppers-stop)**
- **Expected Savings**: ₹48 | **Actual Savings**: ₹36
- **Confidence**: 100% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-ace", got"HDFC Shoppers Stop credit card (hdfc-shoppers-stop)"

### Scenario `scenario-059`: Croma Smart TV Purchase
- **Merchant**: Croma Electronics | **Amount**: ₹45000 | **Category**: `shopping`
- **Expected Winner**: **card-tata-neu-infinity** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹2250 | **Actual Savings**: ₹675
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-tata-neu-infinity", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-060`: Reliance Digital Laptop
- **Merchant**: Reliance Digital | **Amount**: ₹75000 | **Category**: `shopping`
- **Expected Winner**: **card-hdfc-regalia-gold** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹3750 | **Actual Savings**: ₹1125
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-hdfc-regalia-gold", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-061`: Amazon Apple iPhone Purchase
- **Merchant**: Amazon.in | **Amount**: ₹79900 | **Category**: `shopping`
- **Expected Winner**: **card-icici-amazon** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹3995 | **Actual Savings**: ₹1199
- **Confidence**: 100% (Min Required: 90%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-icici-amazon", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-062`: Croma Microwave Oven
- **Merchant**: Croma Electronics | **Amount**: ₹12500 | **Category**: `shopping`
- **Expected Winner**: **card-tata-neu-infinity** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹625 | **Actual Savings**: ₹188
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-tata-neu-infinity", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-063`: Reliance Digital Wireless Earbuds
- **Merchant**: Reliance Digital | **Amount**: ₹9990 | **Category**: `shopping`
- **Expected Winner**: **card-hdfc-regalia-gold** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹500 | **Actual Savings**: ₹150
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-hdfc-regalia-gold", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-064`: Croma iPad Purchase
- **Merchant**: Croma Electronics | **Amount**: ₹59900 | **Category**: `shopping`
- **Expected Winner**: **card-tata-neu-infinity** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹2995 | **Actual Savings**: ₹899
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-tata-neu-infinity", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-065`: Reliance Digital Refrigerator
- **Merchant**: Reliance Digital | **Amount**: ₹34000 | **Category**: `shopping`
- **Expected Winner**: **card-hdfc-regalia-gold** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹1700 | **Actual Savings**: ₹510
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-hdfc-regalia-gold", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-066`: Airtel Fiber Broadband Bill
- **Merchant**: Airtel Fiber Broadband | **Amount**: ₹1499 | **Category**: `utilities`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹375 | **Actual Savings**: ₹15
- **Confidence**: 100% (Min Required: 90%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-067`: BESCOM Electricity Bill
- **Merchant**: Electricity Board (BESCOM / State) | **Amount**: ₹2800 | **Category**: `utilities`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹280 | **Actual Savings**: ₹28
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-068`: Airtel Mobile Postpaid Bill
- **Merchant**: Airtel Fiber Broadband | **Amount**: ₹1199 | **Category**: `utilities`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹300 | **Actual Savings**: ₹12
- **Confidence**: 100% (Min Required: 90%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-069`: BESCOM Summer Electricity Bill
- **Merchant**: Electricity Board (BESCOM / State) | **Amount**: ₹5200 | **Category**: `utilities`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹520 | **Actual Savings**: ₹52
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-070`: Airtel DTH Direct Recharge
- **Merchant**: Airtel Fiber Broadband | **Amount**: ₹3600 | **Category**: `utilities`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹900 | **Actual Savings**: ₹36
- **Confidence**: 100% (Min Required: 90%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-071`: State Electricity Bill GPay
- **Merchant**: Electricity Board (BESCOM / State) | **Amount**: ₹1850 | **Category**: `utilities`
- **Expected Winner**: **card-axis-ace** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹93 | **Actual Savings**: ₹19
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-ace", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-072`: Airtel Prepaid Annual Plan
- **Merchant**: Airtel Fiber Broadband | **Amount**: ₹2999 | **Category**: `utilities`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹750 | **Actual Savings**: ₹30
- **Confidence**: 100% (Min Required: 90%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-073`: Piped Natural Gas Bill
- **Merchant**: Electricity Board (BESCOM / State) | **Amount**: ₹750 | **Category**: `utilities`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹75 | **Actual Savings**: ₹8
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-074`: Water Supply Board Bill
- **Merchant**: Electricity Board (BESCOM / State) | **Amount**: ₹620 | **Category**: `utilities`
- **Expected Winner**: **card-axis-ace** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹31 | **Actual Savings**: ₹6
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-ace", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-075`: Airtel Black Combined Bill
- **Merchant**: Airtel Fiber Broadband | **Amount**: ₹2499 | **Category**: `utilities`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹625 | **Actual Savings**: ₹25
- **Confidence**: 100% (Min Required: 90%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-076`: Electricity Bill Off-Season
- **Merchant**: Electricity Board (BESCOM / State) | **Amount**: ₹1200 | **Category**: `utilities`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹120 | **Actual Savings**: ₹12
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-077`: Airtel Wi-Fi Booster
- **Merchant**: Airtel Fiber Broadband | **Amount**: ₹3999 | **Category**: `utilities`
- **Expected Winner**: **card-airtel-axis** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹1000 | **Actual Savings**: ₹40
- **Confidence**: 100% (Min Required: 90%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-airtel-axis", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-078`: Municipal Property Tax Utility
- **Merchant**: Electricity Board (BESCOM / State) | **Amount**: ₹8500 | **Category**: `utilities`
- **Expected Winner**: **card-axis-ace** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹425 | **Actual Savings**: ₹85
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-axis-ace", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-079`: LIC Life Insurance Premium
- **Merchant**: LIC / HDFC ERGO Insurance | **Amount**: ₹28000 | **Category**: `utilities`
- **Expected Winner**: **card-hdfc-infinia** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹924 | **Actual Savings**: ₹280
- **Confidence**: 100% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-hdfc-infinia", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-080`: HDFC ERGO Health Insurance
- **Merchant**: LIC / HDFC ERGO Insurance | **Amount**: ₹18500 | **Category**: `utilities`
- **Expected Winner**: **card-hdfc-infinia** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹611 | **Actual Savings**: ₹185
- **Confidence**: 100% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-hdfc-infinia", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-081`: Government Tax GST Portal Payment
- **Merchant**: Government GST & Tax Portal | **Amount**: ₹45000 | **Category**: `utilities`
- **Expected Winner**: **card-hdfc-infinia** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹1485 | **Actual Savings**: ₹450
- **Confidence**: 100% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-hdfc-infinia", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-082`: Car Motor Insurance Renewal
- **Merchant**: LIC / HDFC ERGO Insurance | **Amount**: ₹12400 | **Category**: `utilities`
- **Expected Winner**: **card-hdfc-infinia** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹409 | **Actual Savings**: ₹124
- **Confidence**: 100% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-hdfc-infinia", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-083`: Govt Stamp Duty Fee Payment
- **Merchant**: Government GST & Tax Portal | **Amount**: ₹32000 | **Category**: `utilities`
- **Expected Winner**: **card-hdfc-infinia** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹1056 | **Actual Savings**: ₹320
- **Confidence**: 100% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-hdfc-infinia", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-084`: LIC Pension Plan Premium
- **Merchant**: LIC / HDFC ERGO Insurance | **Amount**: ₹50000 | **Category**: `utilities`
- **Expected Winner**: **card-hdfc-infinia** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹1650 | **Actual Savings**: ₹500
- **Confidence**: 100% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-hdfc-infinia", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-085`: Apollo Pharmacy Prescription Medicines
- **Merchant**: Apollo Pharmacy & Health | **Amount**: ₹2400 | **Category**: `medical`
- **Expected Winner**: **card-sbi-simplyclick** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹240 | **Actual Savings**: ₹24
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-simplyclick", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-086`: Apollo Health Checkup Package
- **Merchant**: Apollo Pharmacy & Health | **Amount**: ₹4500 | **Category**: `medical`
- **Expected Winner**: **card-sbi-simplyclick** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹450 | **Actual Savings**: ₹45
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-simplyclick", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-087`: Apollo Dental Care Spend
- **Merchant**: Apollo Pharmacy & Health | **Amount**: ₹1800 | **Category**: `medical`
- **Expected Winner**: **card-sbi-simplyclick** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹180 | **Actual Savings**: ₹18
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-simplyclick", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-088`: Apollo Supplements Purchase
- **Merchant**: Apollo Pharmacy & Health | **Amount**: ₹3600 | **Category**: `medical`
- **Expected Winner**: **card-sbi-simplyclick** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹360 | **Actual Savings**: ₹36
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-simplyclick", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-089`: Apollo First Aid Essentials
- **Merchant**: Apollo Pharmacy & Health | **Amount**: ₹850 | **Category**: `medical`
- **Expected Winner**: **card-sbi-simplyclick** | **Actual Winner**: **DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)**
- **Expected Savings**: ₹85 | **Actual Savings**: ₹9
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-simplyclick", got"DBS 5X Plus Signature Supercard credit card (dbs-5x-plus-signature-supercard)"

### Scenario `scenario-090`: BookMyShow IMAX Movie Tickets
- **Merchant**: BookMyShow | **Amount**: ₹1600 | **Category**: `entertainment`
- **Expected Winner**: **card-sbi-simplyclick** | **Actual Winner**: **RBL Play (BookMyShow) credit card (rbl-play-bookmyshow)**
- **Expected Savings**: ₹160 | **Actual Savings**: ₹24
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-simplyclick", got"RBL Play (BookMyShow) credit card (rbl-play-bookmyshow)"

### Scenario `scenario-091`: BookMyShow Concert Pass
- **Merchant**: BookMyShow | **Amount**: ₹4800 | **Category**: `entertainment`
- **Expected Winner**: **card-sbi-simplyclick** | **Actual Winner**: **RBL Play (BookMyShow) credit card (rbl-play-bookmyshow)**
- **Expected Savings**: ₹480 | **Actual Savings**: ₹72
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-simplyclick", got"RBL Play (BookMyShow) credit card (rbl-play-bookmyshow)"

### Scenario `scenario-092`: BookMyShow Standup Comedy
- **Merchant**: BookMyShow | **Amount**: ₹1200 | **Category**: `entertainment`
- **Expected Winner**: **card-sbi-simplyclick** | **Actual Winner**: **RBL Play (BookMyShow) credit card (rbl-play-bookmyshow)**
- **Expected Savings**: ₹120 | **Actual Savings**: ₹18
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-simplyclick", got"RBL Play (BookMyShow) credit card (rbl-play-bookmyshow)"

### Scenario `scenario-093`: BookMyShow Theater Play
- **Merchant**: BookMyShow | **Amount**: ₹2200 | **Category**: `entertainment`
- **Expected Winner**: **card-sbi-simplyclick** | **Actual Winner**: **RBL Play (BookMyShow) credit card (rbl-play-bookmyshow)**
- **Expected Savings**: ₹220 | **Actual Savings**: ₹33
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-simplyclick", got"RBL Play (BookMyShow) credit card (rbl-play-bookmyshow)"

### Scenario `scenario-094`: BookMyShow Sports Stadium Pass
- **Merchant**: BookMyShow | **Amount**: ₹6500 | **Category**: `entertainment`
- **Expected Winner**: **card-sbi-simplyclick** | **Actual Winner**: **RBL Play (BookMyShow) credit card (rbl-play-bookmyshow)**
- **Expected Savings**: ₹650 | **Actual Savings**: ₹98
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-sbi-simplyclick", got"RBL Play (BookMyShow) credit card (rbl-play-bookmyshow)"

### Scenario `scenario-095`: RuPay UPI Chai Coffee Small Spend
- **Merchant**: Swiggy | **Amount**: ₹60 | **Category**: `dining`
- **Expected Winner**: **card-tata-neu-infinity** | **Actual Winner**: **RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)**
- **Expected Savings**: ₹6 | **Actual Savings**: ₹1
- **Confidence**: 90% (Min Required: 70%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-tata-neu-infinity", got"RBL Platinum Maxima Plus credit card (rbl-platinum-maxima-plus)"

### Scenario `scenario-096`: RuPay UPI Small Bakery Item
- **Merchant**: DMart Ready & Supermarket | **Amount**: ₹120 | **Category**: `shopping`
- **Expected Winner**: **card-tata-neu-infinity** | **Actual Winner**: **HDFC Shoppers Stop credit card (hdfc-shoppers-stop)**
- **Expected Savings**: ₹4 | **Actual Savings**: ₹2
- **Confidence**: 100% (Min Required: 70%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-tata-neu-infinity", got"HDFC Shoppers Stop credit card (hdfc-shoppers-stop)"

### Scenario `scenario-097`: Large Purchase Gold Jewelry
- **Merchant**: Amazon.in | **Amount**: ₹125000 | **Category**: `shopping`
- **Expected Winner**: **card-icici-amazon** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹6250 | **Actual Savings**: ₹1875
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-icici-amazon", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-098`: Large Purchase Luxury Watch
- **Merchant**: Amazon.in | **Amount**: ₹85000 | **Category**: `shopping`
- **Expected Winner**: **card-icici-amazon** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹4250 | **Actual Savings**: ₹1275
- **Confidence**: 100% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-icici-amazon", got"HDFC Swiggy credit card (hdfc-swiggy)"

### Scenario `scenario-099`: RuPay UPI Small Auto Rickshaw Fare
- **Merchant**: Uber Rides | **Amount**: ₹80 | **Category**: `travel`
- **Expected Winner**: **card-tata-neu-infinity** | **Actual Winner**: **ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)**
- **Expected Savings**: ₹3 | **Actual Savings**: ₹1
- **Confidence**: 100% (Min Required: 70%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-tata-neu-infinity", got"ICICI Intermiles Sapphiro (Visa) credit card (icici-intermiles-sapphiro-visa)"

### Scenario `scenario-100`: Large Purchase Home Solar Inverter
- **Merchant**: Croma Electronics | **Amount**: ₹145000 | **Category**: `shopping`
- **Expected Winner**: **card-tata-neu-infinity** | **Actual Winner**: **HDFC Swiggy credit card (hdfc-swiggy)**
- **Expected Savings**: ₹7250 | **Actual Savings**: ₹2175
- **Confidence**: 100% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"card-tata-neu-infinity", got"HDFC Swiggy credit card (hdfc-swiggy)"

## Recommendations for Quality Improvement

- 💡 Top-1 Accuracy is currently 0%. Tune card category reward weights to boost accuracy to >95%.
- 💡 Card"DBS 5X Plus Signature Supercard credit card" is over-recommended (24 times vs 0 expected). Review annual fee and composite score weighting.
- 💡 Merchant"Swiggy" has poor recommendation quality (0% accuracy). Verify merchant category tags and active offers.
- 💡 Investigate 100 failed benchmark scenario(s) in reports/recommendation-evaluation.json.


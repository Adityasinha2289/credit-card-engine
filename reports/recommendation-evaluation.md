# RenoCred Recommendation Evaluation Report

**Timestamp**: 2026-09-10T06:21:27.210Z  
**Total Scenarios Evaluated**: 100  
**Quality Gate**: 🟢 PASSED  

> [!NOTE]
> **QUALITY GATE PASSED**: All recommendation quality and performance thresholds met successfully.

## Executive Summary

Recommendation Evaluation Platform evaluated 100 benchmark scenarios with Top-1 Accuracy 93% and Average Confidence 90%.

## Core Quality Metrics

| Metric | Value | Target / Benchmark |
| :--- | :---: | :---: |
| **Top-1 Accuracy** | **93%** | ≥ 90.0% |
| **Top-3 Accuracy** | **100%** | ≥ 95.0% |
| **Average Confidence** | **90%** | ≥ 80.0% |
| **Average Savings** | **₹863** | N/A |
| **Average Response Time** | **0.03 ms** | < 50 ms |
| **Merchant Resolution Accuracy** | **100%** | 100.0% |
| **Offer Resolution Accuracy** | **0%** | ≥ 90.0% |
| **Category Accuracy** | **100%** | 100.0% |
| **False Recommendation Count** | **7** | 0 |
| **Confidence Calibration Error** | **15.6** | Lower is better |

## Regression Analysis

| Status | Scenario Count | Details |
| :--- | :---: | :--- |
| **Improved** | 33 | Scenarios passing that previously failed |
| **Regressed** | 5 | Scenarios failing that previously passed |
| **Unchanged** | 62 | Scenarios with identical pass/fail status |

### Metric Deltas vs Previous Run
- **Top-1 Accuracy Delta**: `+27%`
- **Top-3 Accuracy Delta**: `+0%`
- **Average Confidence Delta**: `-7.6%`
- **Average Savings Delta**: `₹-1131521`
- **Average Response Time Delta**: `+0 ms`

## Category Performance & Leaderboard

| Category | Scenarios | Passed | Top-1 Acc | Top-3 Acc | Avg Conf | Avg Savings | Avg Time |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `dining` | 16 | 14 | 87.5% | 100% | 90% | ₹148 | 0.09 ms |
| `travel` | 16 | 14 | 87.5% | 100% | 90% | ₹1519 | 0.01 ms |
| `utilities` | 31 | 28 | 90.3% | 100% | 90% | ₹397 | 0.01 ms |
| `shopping` | 37 | 37 | 100% | 100% | 90% | ₹1278 | 0.01 ms |

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
| **Airtel Axis Bank Credit Card** | 17 | 0 | 17% | 17× |
| **Axis Bank ACE Credit Card** | 11 | 0 | 11% | 11× |
| **Amazon Pay ICICI Bank Credit Card – Apply Online** | 10 | 0 | 10% | 10× |
| **Simply CLICK SBI Credit Card** | 10 | 0 | 10% | 10× |
| **Cashback SBI Card** | 8 | 0 | 8% | 8× |
| **Swiggy HDFC Bank Credit Card** | 7 | 0 | 7% | 7× |
| **Axis Bank Atlas Credit Card** | 7 | 0 | 7% | 7× |
| **Infinia Metal Credit Card** | 7 | 0 | 7% | 7× |
| **Regalia Gold Credit Card** | 7 | 0 | 7% | 7× |
| **Tata Neu Infinity Credit Card** | 5 | 0 | 5% | 5× |
| **BPCL SBI Credit Card OCTANE** | 4 | 0 | 4% | 4× |
| **ICICI Bank HPCL Super Saver Credit Card – 5% Fuel Cashback** | 4 | 0 | 4% | 4× |
| **INDIANOIL AXIS BANK Credit Card** | 3 | 0 | 3% | 3× |

## Merchants with Poor Recommendation Quality (<80% Accuracy)

| Merchant | Scenario Count | Passed | Accuracy |
| :--- | :---: | :---: | :---: |
| **Swiggy Instamart** | 1 | 0 | 0% |
| **Electricity Board (BESCOM / State)** | 7 | 5 | 71.4% |
| **Uber Rides** | 4 | 3 | 75% |
| **IndianOil Fuel Station** | 4 | 3 | 75% |

## Slowest Requests (Top 5)

| Scenario ID | Merchant | Amount | Execution Time |
| :--- | :--- | :---: | :---: |
| `scenario-001` | Swiggy | ₹450 | **1.05 ms** |
| `scenario-002` | Swiggy Instamart | ₹1200 | **0.07 ms** |
| `scenario-003` | Zomato | ₹1500 | **0.06 ms** |
| `scenario-004` | Zomato Food Delivery | ₹2800 | **0.06 ms** |
| `scenario-005` | Swiggy | ₹4500 | **0.04 ms** |

## Failed Scenarios Breakdown

### Scenario `scenario-002`: Swiggy Instamart Grocery
- **Merchant**: Swiggy Instamart | **Amount**: ₹1200 | **Category**: `dining`
- **Expected Winner**: **hdfc_swiggy_hdfc_bank_credit_card** | **Actual Winner**: **Airtel Axis Bank Credit Card (axis_airtel_axis_bank_credit_card)**
- **Expected Savings**: ₹120 | **Actual Savings**: ₹126
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"hdfc_swiggy_hdfc_bank_credit_card", got"Airtel Axis Bank Credit Card (axis_airtel_axis_bank_credit_card)"

### Scenario `scenario-029`: MakeMyTrip Business Class Upgrade
- **Merchant**: MakeMyTrip | **Amount**: ₹58000 | **Category**: `travel`
- **Expected Winner**: **axis_axis_bank_atlas_credit_card** | **Actual Winner**: **Infinia Metal Credit Card (hdfc_infinia_metal_credit_card)**
- **Expected Savings**: ₹8700 | **Actual Savings**: ₹9570
- **Confidence**: 90% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"axis_axis_bank_atlas_credit_card", got"Infinia Metal Credit Card (hdfc_infinia_metal_credit_card)"

### Scenario `scenario-033`: IndianOil IOCL Fuel Refill
- **Merchant**: IndianOil Fuel Station | **Amount**: ₹800 | **Category**: `utilities`
- **Expected Winner**: **axis_indianoil_axis_bank_credit_card** | **Actual Winner**: **Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)**
- **Expected Savings**: ₹32 | **Actual Savings**: ₹40
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"axis_indianoil_axis_bank_credit_card", got"Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)"

### Scenario `scenario-069`: BESCOM Summer Electricity Bill
- **Merchant**: Electricity Board (BESCOM / State) | **Amount**: ₹5200 | **Category**: `utilities`
- **Expected Winner**: **axis_airtel_axis_bank_credit_card** | **Actual Winner**: **Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)**
- **Expected Savings**: ₹520 | **Actual Savings**: ₹52
- **Confidence**: 90% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"axis_airtel_axis_bank_credit_card", got"Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)"

### Scenario `scenario-078`: Municipal Property Tax Utility
- **Merchant**: Electricity Board (BESCOM / State) | **Amount**: ₹8500 | **Category**: `utilities`
- **Expected Winner**: **axis_axis_bank_ace_credit_card** | **Actual Winner**: **Amazon Pay ICICI Bank Credit Card – Apply Online (icici_amazon_pay_icici_bank_credit_card_apply_online)**
- **Expected Savings**: ₹425 | **Actual Savings**: ₹170
- **Confidence**: 90% (Min Required: 80%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"axis_axis_bank_ace_credit_card", got"Amazon Pay ICICI Bank Credit Card – Apply Online (icici_amazon_pay_icici_bank_credit_card_apply_online)"

### Scenario `scenario-095`: RuPay UPI Chai Coffee Small Spend
- **Merchant**: Swiggy | **Amount**: ₹60 | **Category**: `dining`
- **Expected Winner**: **hdfc_tata_neu_infinity_credit_card** | **Actual Winner**: **Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)**
- **Expected Savings**: ₹6 | **Actual Savings**: ₹3
- **Confidence**: 90% (Min Required: 70%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"hdfc_tata_neu_infinity_credit_card", got"Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)"

### Scenario `scenario-099`: RuPay UPI Small Auto Rickshaw Fare
- **Merchant**: Uber Rides | **Amount**: ₹80 | **Category**: `travel`
- **Expected Winner**: **hdfc_tata_neu_infinity_credit_card** | **Actual Winner**: **Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)**
- **Expected Savings**: ₹3 | **Actual Savings**: ₹3
- **Confidence**: 90% (Min Required: 70%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"hdfc_tata_neu_infinity_credit_card", got"Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)"

## Recommendations for Quality Improvement

- 💡 Top-1 Accuracy is currently 93%. Tune card category reward weights to boost accuracy to >95%.
- 💡 Card"Airtel Axis Bank Credit Card" is over-recommended (17 times vs 0 expected). Review annual fee and composite score weighting.
- 💡 Merchant"Swiggy Instamart" has poor recommendation quality (0% accuracy). Verify merchant category tags and active offers.
- 💡 Investigate 7 failed benchmark scenario(s) in reports/recommendation-evaluation.json.


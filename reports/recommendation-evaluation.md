# RenoCred Recommendation Evaluation Report

**Timestamp**: 2026-10-16T17:53:09.170Z  
**Total Scenarios Evaluated**: 100  
**Quality Gate**: 🔴 FAILED  

> [!CAUTION]
> **QUALITY GATE FAILED**: Offer Resolution Accuracy (0%) is below configured threshold (90%); Confidence calibration error (17.2) exceeds threshold (10)

## Executive Summary

Recommendation Evaluation Platform evaluated 100 benchmark scenarios with Top-1 Accuracy 91% and Average Confidence 90%.

## Core Quality Metrics

| Metric | Value | Target / Benchmark |
| :--- | :---: | :---: |
| **Top-1 Accuracy** | **91%** | ≥ 90.0% |
| **Top-3 Accuracy** | **100%** | ≥ 95.0% |
| **Average Confidence** | **90%** | ≥ 80.0% |
| **Average Savings** | **₹824** | N/A |
| **Average Response Time** | **0.15 ms** | < 50 ms |
| **Merchant Resolution Accuracy** | **100%** | 100.0% |
| **Offer Resolution Accuracy** | **0%** | ≥ 90.0% |
| **Category Accuracy** | **100%** | 100.0% |
| **False Recommendation Count** | **9** | 0 |
| **Confidence Calibration Error** | **17.2** | Lower is better |

## Regression Analysis

| Status | Scenario Count | Details |
| :--- | :---: | :--- |
| **Improved** | 30 | Scenarios passing that previously failed |
| **Regressed** | 4 | Scenarios failing that previously passed |
| **Unchanged** | 66 | Scenarios with identical pass/fail status |

### Metric Deltas vs Previous Run
- **Top-1 Accuracy Delta**: `+25%`
- **Top-3 Accuracy Delta**: `+0%`
- **Average Confidence Delta**: `-7.6%`
- **Average Savings Delta**: `₹-1131560`
- **Average Response Time Delta**: `+0.12 ms`

## Category Performance & Leaderboard

| Category | Scenarios | Passed | Top-1 Acc | Top-3 Acc | Avg Conf | Avg Savings | Avg Time |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `dining` | 15 | 14 | 93.3% | 100% | 90% | ₹149 | 0.43 ms |
| `groceries` | 4 | 4 | 100% | 100% | 90% | ₹75 | 0.11 ms |
| `travel` | 12 | 11 | 91.7% | 100% | 90% | ₹2013 | 0.04 ms |
| `transport` | 4 | 3 | 75% | 100% | 90% | ₹35 | 0.43 ms |
| `fuel` | 12 | 12 | 100% | 100% | 90% | ₹119 | 0.14 ms |
| `shopping` | 24 | 24 | 100% | 100% | 90% | ₹1841 | 0.05 ms |
| `utilities` | 13 | 11 | 84.6% | 100% | 90% | ₹367 | 0.12 ms |
| `health` | 9 | 5 | 55.6% | 100% | 90% | ₹267 | 0.03 ms |
| `other` | 2 | 2 | 100% | 100% | 90% | ₹578 | 0.38 ms |
| `entertainment` | 5 | 5 | 100% | 100% | 90% | ₹326 | 0.03 ms |

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
| **Airtel Axis Bank Credit Card** | 16 | 0 | 16% | 16× |
| **Axis Bank ACE Credit Card** | 12 | 0 | 12% | 12× |
| **Cashback SBI Card** | 10 | 0 | 10% | 10× |
| **Amazon Pay ICICI Bank Credit Card – Apply Online** | 10 | 0 | 10% | 10× |
| **Simply CLICK SBI Credit Card** | 10 | 0 | 10% | 10× |
| **Swiggy HDFC Bank Credit Card** | 8 | 0 | 8% | 8× |
| **Axis Bank Atlas Credit Card** | 7 | 0 | 7% | 7× |
| **Regalia Gold Credit Card** | 7 | 0 | 7% | 7× |
| **Tata Neu Infinity Credit Card** | 5 | 0 | 5% | 5× |
| **BPCL SBI Credit Card OCTANE** | 4 | 0 | 4% | 4× |
| **ICICI Bank HPCL Super Saver Credit Card – 5% Fuel Cashback** | 4 | 0 | 4% | 4× |
| **INDIANOIL AXIS BANK Credit Card** | 4 | 0 | 4% | 4× |
| **Infinia Metal Credit Card** | 3 | 0 | 3% | 3× |

## Merchants with Poor Recommendation Quality (<80% Accuracy)

| Merchant | Scenario Count | Passed | Accuracy |
| :--- | :---: | :---: | :---: |
| **LIC / HDFC ERGO Insurance** | 4 | 0 | 0% |
| **Electricity Board (BESCOM / State)** | 7 | 5 | 71.4% |
| **Uber Rides** | 4 | 3 | 75% |

## Slowest Requests (Top 5)

| Scenario ID | Merchant | Amount | Execution Time |
| :--- | :--- | :---: | :---: |
| `scenario-004` | Zomato Food Delivery | ₹2800 | **2.93 ms** |
| `scenario-001` | Swiggy | ₹450 | **2.72 ms** |
| `scenario-020` | Uber Rides | ₹1800 | **1.46 ms** |
| `scenario-072` | Airtel Fiber Broadband | ₹2999 | **1.21 ms** |
| `scenario-081` | Government GST & Tax Portal | ₹45000 | **0.69 ms** |

## Failed Scenarios Breakdown

### Scenario `scenario-029`: MakeMyTrip Business Class Upgrade
- **Merchant**: MakeMyTrip | **Amount**: ₹58000 | **Category**: `travel`
- **Expected Winner**: **axis_axis_bank_atlas_credit_card** | **Actual Winner**: **Infinia Metal Credit Card (hdfc_infinia_metal_credit_card)**
- **Expected Savings**: ₹8700 | **Actual Savings**: ₹9570
- **Confidence**: 90% (Min Required: 85%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"axis_axis_bank_atlas_credit_card", got"Infinia Metal Credit Card (hdfc_infinia_metal_credit_card)"

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

### Scenario `scenario-079`: LIC Life Insurance Premium
- **Merchant**: LIC / HDFC ERGO Insurance | **Amount**: ₹28000 | **Category**: `health`
- **Expected Winner**: **hdfc_infinia_metal_credit_card** | **Actual Winner**: **Cashback SBI Card (sbi_cashback_sbi_card)**
- **Expected Savings**: ₹924 | **Actual Savings**: ₹280
- **Confidence**: 90% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"hdfc_infinia_metal_credit_card", got"Cashback SBI Card (sbi_cashback_sbi_card)"

### Scenario `scenario-080`: HDFC ERGO Health Insurance
- **Merchant**: LIC / HDFC ERGO Insurance | **Amount**: ₹18500 | **Category**: `health`
- **Expected Winner**: **hdfc_infinia_metal_credit_card** | **Actual Winner**: **Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)**
- **Expected Savings**: ₹611 | **Actual Savings**: ₹185
- **Confidence**: 90% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"hdfc_infinia_metal_credit_card", got"Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)"

### Scenario `scenario-082`: Car Motor Insurance Renewal
- **Merchant**: LIC / HDFC ERGO Insurance | **Amount**: ₹12400 | **Category**: `health`
- **Expected Winner**: **hdfc_infinia_metal_credit_card** | **Actual Winner**: **Cashback SBI Card (sbi_cashback_sbi_card)**
- **Expected Savings**: ₹409 | **Actual Savings**: ₹124
- **Confidence**: 90% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"hdfc_infinia_metal_credit_card", got"Cashback SBI Card (sbi_cashback_sbi_card)"

### Scenario `scenario-084`: LIC Pension Plan Premium
- **Merchant**: LIC / HDFC ERGO Insurance | **Amount**: ₹50000 | **Category**: `health`
- **Expected Winner**: **hdfc_infinia_metal_credit_card** | **Actual Winner**: **Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)**
- **Expected Savings**: ₹1650 | **Actual Savings**: ₹500
- **Confidence**: 90% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"hdfc_infinia_metal_credit_card", got"Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)"

### Scenario `scenario-095`: RuPay UPI Chai Coffee Small Spend
- **Merchant**: Swiggy | **Amount**: ₹60 | **Category**: `dining`
- **Expected Winner**: **hdfc_tata_neu_infinity_credit_card** | **Actual Winner**: **Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)**
- **Expected Savings**: ₹6 | **Actual Savings**: ₹3
- **Confidence**: 90% (Min Required: 70%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"hdfc_tata_neu_infinity_credit_card", got"Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)"

### Scenario `scenario-099`: RuPay UPI Small Auto Rickshaw Fare
- **Merchant**: Uber Rides | **Amount**: ₹80 | **Category**: `transport`
- **Expected Winner**: **hdfc_tata_neu_infinity_credit_card** | **Actual Winner**: **Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)**
- **Expected Savings**: ₹3 | **Actual Savings**: ₹3
- **Confidence**: 90% (Min Required: 70%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected"hdfc_tata_neu_infinity_credit_card", got"Axis Bank ACE Credit Card (axis_axis_bank_ace_credit_card)"

## Recommendations for Quality Improvement

- 💡 Top-1 Accuracy is currently 91%. Tune card category reward weights to boost accuracy to >95%.
- 💡 Card"Airtel Axis Bank Credit Card" is over-recommended (16 times vs 0 expected). Review annual fee and composite score weighting.
- 💡 Merchant"LIC / HDFC ERGO Insurance" has poor recommendation quality (0% accuracy). Verify merchant category tags and active offers.
- 💡 Investigate 9 failed benchmark scenario(s) in reports/recommendation-evaluation.json.


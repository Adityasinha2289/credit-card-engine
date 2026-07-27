# RenoCred Recommendation Evaluation Report

**Timestamp**: 2026-07-27T10:02:01.453Z  
**Total Scenarios Evaluated**: 100  
**Quality Gate**: 🟢 PASSED  

> [!NOTE]
> **QUALITY GATE PASSED**: All recommendation quality and performance thresholds met successfully.

## Executive Summary

Recommendation Evaluation Platform evaluated 100 benchmark scenarios with Top-1 Accuracy 97% and Average Confidence 98.1%.

## Core Quality Metrics

| Metric | Value | Target / Benchmark |
| :--- | :---: | :---: |
| **Top-1 Accuracy** | **97%** | ≥ 90.0% |
| **Top-3 Accuracy** | **100%** | ≥ 95.0% |
| **Average Confidence** | **98.1%** | ≥ 80.0% |
| **Average Savings** | **₹1436** | N/A |
| **Average Response Time** | **0.02 ms** | < 50 ms |
| **Merchant Resolution Accuracy** | **100%** | 100.0% |
| **Offer Resolution Accuracy** | **59%** | ≥ 90.0% |
| **Category Accuracy** | **100%** | 100.0% |
| **False Recommendation Count** | **3** | 0 |
| **Confidence Calibration Error** | **4.7** | Lower is better |

## Regression Analysis

| Status | Scenario Count | Details |
| :--- | :---: | :--- |
| **Improved** | 33 | Scenarios passing that previously failed |
| **Regressed** | 1 | Scenarios failing that previously passed |
| **Unchanged** | 66 | Scenarios with identical pass/fail status |

### Metric Deltas vs Previous Run
- **Top-1 Accuracy Delta**: `+31%`
- **Top-3 Accuracy Delta**: `+0%`
- **Average Confidence Delta**: `+0.5%`
- **Average Savings Delta**: `₹-1130948`
- **Average Response Time Delta**: `-0.01 ms`

## Category Performance & Leaderboard

| Category | Scenarios | Passed | Top-1 Acc | Top-3 Acc | Avg Conf | Avg Savings | Avg Time |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `dining` | 16 | 15 | 93.8% | 100% | 90.6% | ₹289 | 0.1 ms |
| `travel` | 16 | 15 | 93.8% | 100% | 97.5% | ₹3204 | 0.01 ms |
| `fuel` | 12 | 12 | 100% | 100% | 100% | ₹240 | 0.01 ms |
| `shopping` | 27 | 26 | 96.3% | 100% | 100% | ₹2350 | 0.01 ms |
| `utilities` | 19 | 19 | 100% | 100% | 100% | ₹891 | 0.01 ms |
| `medical` | 5 | 5 | 100% | 100% | 100% | ₹539 | 0.01 ms |
| `entertainment` | 5 | 5 | 100% | 100% | 100% | ₹342 | 0.01 ms |

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
| **SBI SimplyCLICK Credit Card** | 10 | 0 | 10% | 10× |
| **SBI Cashback Credit Card** | 9 | 0 | 9% | 9× |
| **Axis Bank ACE Credit Card** | 9 | 0 | 9% | 9× |
| **Amazon Pay ICICI Card** | 9 | 0 | 9% | 9× |
| **Swiggy HDFC Bank Credit Card** | 8 | 0 | 8% | 8× |
| **Axis Bank Atlas Credit Card** | 8 | 0 | 8% | 8× |
| **HDFC Regalia Gold Credit Card** | 7 | 0 | 7% | 7× |
| **HDFC Infinia Metal Edition** | 6 | 0 | 6% | 6× |
| **Tata Neu Infinity HDFC Credit Card** | 5 | 0 | 5% | 5× |
| **BPCL SBI Card Octane** | 4 | 0 | 4% | 4× |
| **ICICI Bank HPCL Super Saver** | 4 | 0 | 4% | 4× |
| **IndianOil Axis Bank Credit Card** | 4 | 0 | 4% | 4× |

## Merchants with Poor Recommendation Quality (<80% Accuracy)

| Merchant | Scenario Count | Passed | Accuracy |
| :--- | :---: | :---: | :---: |
| **DMart Ready & Supermarket** | 3 | 2 | 66.7% |
| **Uber Rides** | 4 | 3 | 75% |

## Slowest Requests (Top 5)

| Scenario ID | Merchant | Amount | Execution Time |
| :--- | :--- | :---: | :---: |
| `scenario-001` | Swiggy | ₹450 | **0.92 ms** |
| `scenario-009` | Zomato | ₹800 | **0.34 ms** |
| `scenario-002` | Swiggy Instamart | ₹1200 | **0.06 ms** |
| `scenario-004` | Zomato Food Delivery | ₹2800 | **0.06 ms** |
| `scenario-003` | Zomato | ₹1500 | **0.05 ms** |

## Failed Scenarios Breakdown

### Scenario `scenario-053`: DMart Supermarket Offline Retail
- **Merchant**: DMart Ready & Supermarket | **Amount**: ₹6500 | **Category**: `shopping`
- **Expected Winner**: **card-axis-ace** | **Actual Winner**: **SBI Cashback Credit Card (card-sbi-cashback)**
- **Expected Savings**: ₹130 | **Actual Savings**: ₹98
- **Confidence**: 100% (Min Required: 75%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected "card-axis-ace", got "SBI Cashback Credit Card (card-sbi-cashback)"

### Scenario `scenario-095`: RuPay UPI Chai Coffee Small Spend
- **Merchant**: Swiggy | **Amount**: ₹60 | **Category**: `dining`
- **Expected Winner**: **card-tata-neu-infinity** | **Actual Winner**: **Axis Bank ACE Credit Card (card-axis-ace)**
- **Expected Savings**: ₹6 | **Actual Savings**: ₹3
- **Confidence**: 90% (Min Required: 70%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected "card-tata-neu-infinity", got "Axis Bank ACE Credit Card (card-axis-ace)"

### Scenario `scenario-099`: RuPay UPI Small Auto Rickshaw Fare
- **Merchant**: Uber Rides | **Amount**: ₹80 | **Category**: `travel`
- **Expected Winner**: **card-tata-neu-infinity** | **Actual Winner**: **Axis Bank ACE Credit Card (card-axis-ace)**
- **Expected Savings**: ₹3 | **Actual Savings**: ₹3
- **Confidence**: 100% (Min Required: 70%)
- **Failure Reasons**:
  - ❌ Card mismatch: Expected "card-tata-neu-infinity", got "Axis Bank ACE Credit Card (card-axis-ace)"

## Recommendations for Quality Improvement

- 💡 Card "Airtel Axis Bank Credit Card" is over-recommended (17 times vs 0 expected). Review annual fee and composite score weighting.
- 💡 Merchant "DMart Ready & Supermarket" has poor recommendation quality (66.7% accuracy). Verify merchant category tags and active offers.
- 💡 Investigate 3 failed benchmark scenario(s) in reports/recommendation-evaluation.json.


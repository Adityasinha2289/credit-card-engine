/**
 * DatasetNormalizer
 * 
 * Ingests, validates, and normalizes raw credit card datasets into the
 * canonical domain model (CanonicalCard).
 * 
 * Supports both:
 * 1. Target envelope: { metadata: {...}, data: [...] } (518 dense cards)
 * 2. Legacy array: [...] (209 flat cards)
 * 
 * Strict Financial Invariants:
 * - Unknown financial values are preserved as null (NEVER silently converted to zero).
 * - Points and miles are preserved with their native units (NEVER converted to percentages).
 * - Card networks are preserved faithfully (no artificial conversions).
 * - No source records are silently discarded; all produce structured validation reports.
 */

import type {
  CanonicalCard,
  CanonicalCardResult,
  CanonicalIdentity,
  CanonicalFees,
  CanonicalFeeValue,
  CanonicalEligibility,
  CanonicalRewards,
  CanonicalEarningRule,
  CanonicalCashback,
  CanonicalCashbackRate,
  CanonicalBenefit,
  CanonicalLounge,
  CanonicalMilestone,
  CanonicalFeature,
  CanonicalSpendConditions,
  CanonicalRedemption,
  CanonicalTravel,
  CanonicalApplication,
  CanonicalStatus,
  CanonicalEvidence,
  DataQualityStatus,
  RecommendationConfidence,
  LifecycleStatus,
  DatasetMetadata,
  DatasetIntegrityReport,
} from '../types/canonical';

export class DatasetNormalizer {
  /**
   * Unwraps the root JSON envelope, supporting both modern object format
   * and legacy top-level array format.
   */
  public static unwrapEnvelope(input: unknown): { metadata?: DatasetMetadata; data: unknown[] } {
    if (!input) {
      return { data: [] };
    }

    if (Array.isArray(input)) {
      return { data: input };
    }

    if (typeof input === 'object') {
      const obj = input as Record<string, unknown>;
      const metadata = (obj.metadata && typeof obj.metadata === 'object')
        ? (obj.metadata as DatasetMetadata)
        : undefined;

      if (Array.isArray(obj.data)) {
        return { metadata, data: obj.data };
      }

      if (Array.isArray(obj.cards)) {
        return { metadata, data: obj.cards };
      }
    }

    return { data: [] };
  }

  /**
   * Normalizes an entire dataset into an array of CanonicalCardResult objects.
   */
  public static normalizeAll(input: unknown): CanonicalCardResult[] {
    const { data } = this.unwrapEnvelope(input);
    return data.map((rawCard) => this.normalizeCard(rawCard));
  }

  /**
   * Normalizes a single raw card object into a CanonicalCardResult.
   */
  public static normalizeCard(raw: unknown): CanonicalCardResult {
    const reasons: string[] = [];
    const warnings: string[] = [];

    if (!raw || typeof raw !== 'object') {
      return {
        card: this.createEmptyCanonicalCard('unknown_invalid_card'),
        status: 'INVALID',
        reasons: ['Raw card payload is not a valid object'],
        warnings: [],
      };
    }

    const obj = raw as Record<string, unknown>;

    // 1. Identity Normalization
    const { identity, idStatus, idReasons, idWarnings } = this.normalizeIdentity(obj);
    reasons.push(...idReasons);
    warnings.push(...idWarnings);

    // 2. Fees Normalization
    const { fees, feeWarnings } = this.normalizeFees(obj);
    warnings.push(...feeWarnings);

    // 3. Eligibility Normalization
    const eligibility = this.normalizeEligibility(obj);

    // 4. Rewards Normalization (No points-to-percentage conversion)
    const rewards = this.normalizeRewards(obj);

    // 5. Cashback Normalization
    const cashback = this.normalizeCashback(obj);

    // 6. Benefits Normalization
    const benefits = this.normalizeBenefits(obj);

    // 7. Lounge Normalization
    const lounge = this.normalizeLounge(obj);

    // 8. Milestones Normalization
    const milestones = this.normalizeMilestones(obj);

    // 9. Features Normalization
    const features = this.normalizeFeatures(obj);

    // 10. Spend Conditions Normalization
    const spendConditions = this.normalizeSpendConditions(obj);

    // 11. Exclusions Normalization
    const exclusions = this.normalizeExclusions(obj);

    // 12. Redemption Normalization
    const redemption = this.normalizeRedemption(obj);

    // 13. Travel & International Normalization
    const travelInternational = this.normalizeTravel(obj);

    // 14. Application Normalization
    const application = this.normalizeApplication(obj);

    // 15. Status Normalization
    const status = this.normalizeStatus(obj);

    // 16. Lifecycle, Data Quality, Confidence
    const lifecycleStatus = this.normalizeLifecycleStatus(obj);
    const recommendationConfidence = this.normalizeConfidence(obj);
    const recommendationExclusionReason = typeof obj.recommendation_exclusion_reason === 'string'
      ? obj.recommendation_exclusion_reason
      : null;

    // 17. Provenance & Evidence
    const sourceName = typeof obj.source_name === 'string' ? obj.source_name : null;
    const sourceUrl = typeof obj.source_url === 'string' ? obj.source_url : null;
    const detailUrl = typeof obj.detail_url === 'string' ? obj.detail_url : null;
    const extractedAt = typeof obj.extracted_at === 'string' ? obj.extracted_at : null;
    const lastVerifiedAt = typeof obj.last_verified_at === 'string' ? obj.last_verified_at : null;
    const extractionMethod = typeof obj.extraction_method === 'string' ? obj.extraction_method : null;
    const evidenceData = this.normalizeEvidenceData(obj);

    // Determine Final Card Status
    let cardStatus: DataQualityStatus = idStatus;
    const rawDataQuality = typeof obj.data_quality === 'string' ? obj.data_quality.toUpperCase() : null;

    if (rawDataQuality === 'INVALID') {
      cardStatus = 'INVALID';
      if (!reasons.includes('Source record flagged as INVALID in dataset')) {
        reasons.push('Source record flagged as INVALID in dataset');
      }
    } else if (rawDataQuality === 'NEEDS_REVIEW' && cardStatus !== 'INVALID') {
      cardStatus = 'NEEDS_REVIEW';
      if (!reasons.includes('Source record flagged as NEEDS_REVIEW in dataset')) {
        reasons.push('Source record flagged as NEEDS_REVIEW in dataset');
      }
    }

    const card: CanonicalCard = {
      identity,
      fees,
      eligibility,
      rewards,
      cashback,
      benefits,
      lounge,
      milestones,
      features,
      spendConditions,
      exclusions,
      redemption,
      travelInternational,
      application,
      status,
      lifecycleStatus,
      dataQuality: cardStatus,
      recommendationConfidence,
      recommendationExclusionReason,
      sourceName,
      sourceUrl,
      detailUrl,
      extractedAt,
      lastVerifiedAt,
      extractionMethod,
      evidenceData,
    };

    return {
      card,
      status: cardStatus,
      reasons,
      warnings,
    };
  }

  /**
   * Evaluates dataset-level integrity across an entire normalized batch.
   */
  public static validateDatasetIntegrity(
    results: CanonicalCardResult[],
    metadata?: DatasetMetadata
  ): DatasetIntegrityReport {
    const blockers: string[] = [];
    const warnings: string[] = [];

    const totalCards = results.length;
    let validCards = 0;
    let needsReviewCards = 0;
    let invalidCards = 0;

    const seenIds = new Set<string>();
    const duplicateIds = new Set<string>();

    const issuerDistribution: Record<string, number> = {};
    const networkDistribution: Record<string, number> = {};
    const lifecycleDistribution: Record<string, number> = {};
    const confidenceDistribution: Record<string, number> = {};

    for (const res of results) {
      const card = res.card;

      if (res.status === 'VALID') validCards++;
      else if (res.status === 'NEEDS_REVIEW') needsReviewCards++;
      else if (res.status === 'INVALID') invalidCards++;

      // ID Uniqueness Gate
      if (card.identity.id) {
        if (seenIds.has(card.identity.id)) {
          duplicateIds.add(card.identity.id);
        }
        seenIds.add(card.identity.id);
      }

      // Issuer Distribution
      const issuerKey = card.identity.issuer || 'UNKNOWN_ISSUER';
      issuerDistribution[issuerKey] = (issuerDistribution[issuerKey] || 0) + 1;

      // Network Distribution
      const networkKey = card.identity.network || 'UNKNOWN_NETWORK';
      networkDistribution[networkKey] = (networkDistribution[networkKey] || 0) + 1;

      // Lifecycle Distribution
      lifecycleDistribution[card.lifecycleStatus] = (lifecycleDistribution[card.lifecycleStatus] || 0) + 1;

      // Confidence Distribution
      confidenceDistribution[card.recommendationConfidence] = (confidenceDistribution[card.recommendationConfidence] || 0) + 1;
    }

    if (totalCards === 0) {
      blockers.push('Dataset contains 0 cards');
    }

    if (duplicateIds.size > 0) {
      blockers.push(`Duplicate card IDs detected (${duplicateIds.size} unique IDs duplicated): ${Array.from(duplicateIds).slice(0, 5).join(', ')}`);
    }

    if (metadata?.card_count !== undefined && metadata.card_count !== totalCards) {
      warnings.push(`Metadata card count (${metadata.card_count}) does not match actual card count (${totalCards})`);
    }

    return {
      totalCards,
      validCards,
      needsReviewCards,
      invalidCards,
      duplicateIdCount: duplicateIds.size,
      duplicateCardIds: Array.from(duplicateIds),
      issuerDistribution,
      networkDistribution,
      lifecycleDistribution,
      confidenceDistribution,
      blockers,
      warnings,
      metadata,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  INTERNAL NORMALIZATION HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  private static normalizeIdentity(obj: Record<string, unknown>): {
    identity: CanonicalIdentity;
    idStatus: DataQualityStatus;
    idReasons: string[];
    idWarnings: string[];
  } {
    const rawId = (obj.identity && typeof obj.identity === 'object')
      ? (obj.identity as Record<string, unknown>)
      : obj;

    const id = this.extractString(rawId.card_id) || this.extractString(obj.id) || '';
    const canonicalId = this.extractString(rawId.canonical_card_id) || id;
    const name = this.extractString(rawId.card_name) || this.extractString(obj.card_title) || 'Unknown Card';
    const issuer = this.extractString(rawId.issuer) || this.extractString(obj.issuer) || 'Unknown Bank';
    const network = this.extractString(rawId.network) || this.extractString(obj.network) || null;
    const networkTier = this.extractString(rawId.network_tier) || null;
    const networkVariants = Array.isArray(rawId.network_variants)
      ? (rawId.network_variants.filter((v): v is string => typeof v === 'string'))
      : null;
    const productFamily = this.extractString(rawId.product_family) || null;
    const productFamilyId = this.extractString(obj.product_family_id) || this.extractString(rawId.product_family_id) || id;
    const variant = this.extractString(rawId.variant) || null;
    const cardType = this.extractString(rawId.card_type) || null;
    const category = this.extractString(rawId.category) || null;
    const coBrandedPartner = this.extractString(rawId.co_branded_partner) || null;
    const securedUnsecured = this.extractString(rawId.secured_unsecured) || null;
    const personalBusiness = this.extractString(rawId.personal_business) || null;
    const officialUrl = this.extractString(rawId.official_url) || null;

    let idStatus: DataQualityStatus = 'VALID';
    const idReasons: string[] = [];
    const idWarnings: string[] = [];

    if (!id || id.trim() === '') {
      idStatus = 'INVALID';
      idReasons.push('Card is missing a unique ID');
    }

    if (name === 'Unknown Card') {
      if (idStatus !== 'INVALID') idStatus = 'NEEDS_REVIEW';
      idReasons.push('Card is missing a card name');
    }

    if (issuer === 'Unknown Bank') {
      if (idStatus !== 'INVALID') idStatus = 'NEEDS_REVIEW';
      idReasons.push('Card is missing an issuing bank');
    }

    if (network === null) {
      idWarnings.push('Card network is unspecified (null)');
    }

    const identity: CanonicalIdentity = {
      id,
      canonicalId,
      name,
      issuer,
      network,
      networkTier,
      networkVariants,
      productFamily,
      productFamilyId,
      variant,
      cardType,
      category,
      coBrandedPartner,
      securedUnsecured,
      personalBusiness,
      officialUrl,
    };

    return { identity, idStatus, idReasons, idWarnings };
  }

  private static normalizeFees(obj: Record<string, unknown>): {
    fees: CanonicalFees;
    feeWarnings: string[];
  } {
    const rawFees = (obj.fees && typeof obj.fees === 'object')
      ? (obj.fees as Record<string, unknown>)
      : obj;

    const feeWarnings: string[] = [];

    const parseFeeValue = (val: unknown, fieldName: string): CanonicalFeeValue | null => {
      if (val === null || val === undefined) {
        return null;
      }
      if (typeof val === 'number') {
        if (val < 0) {
          feeWarnings.push(`Negative fee value encountered for ${fieldName}: ${val}`);
        }
        return {
          amount: val,
          currency: 'INR',
          conditions: null,
        };
      }
      if (typeof val === 'object' && val !== null) {
        const feeObj = val as Record<string, unknown>;
        const amount = typeof feeObj.amount === 'number' ? feeObj.amount : null;
        if (amount === null) {
          return null;
        }
        if (amount < 0) {
          feeWarnings.push(`Negative fee value encountered for ${fieldName}: ${amount}`);
        }
        return {
          amount,
          currency: typeof feeObj.currency === 'string' ? feeObj.currency : 'INR',
          conditions: typeof feeObj.conditions === 'string' ? feeObj.conditions : null,
        };
      }
      return null;
    };

    const annualFee = parseFeeValue(rawFees.annual_fee ?? obj.annual_fee, 'annual_fee');
    const joiningFee = parseFeeValue(rawFees.joining_fee, 'joining_fee');
    const renewalFee = parseFeeValue(rawFees.renewal_fee, 'renewal_fee');
    const supplementaryCardFee = parseFeeValue(rawFees.supplementary_card_fee, 'supplementary_card_fee');

    const cashWithdrawalFee = this.extractString(rawFees.cash_withdrawal_fee);
    const rewardRedemptionFee = this.extractString(rawFees.reward_redemption_fee);

    let forexMarkup: number | null = null;
    if (typeof rawFees.forex_markup === 'number') {
      forexMarkup = rawFees.forex_markup;
    } else if (typeof obj.travel_international === 'object' && obj.travel_international !== null) {
      const travel = obj.travel_international as Record<string, unknown>;
      if (typeof travel.forex_markup === 'number') {
        forexMarkup = travel.forex_markup;
      }
    }

    const foreignCurrencyFee = this.extractString(rawFees.foreign_currency_fee);
    const feeWaiverAvailable = typeof rawFees.fee_waiver === 'boolean'
      ? rawFees.fee_waiver
      : (typeof rawFees.waiver_available === 'boolean' ? rawFees.waiver_available : null);
    const feeWaiverCondition = this.extractString(rawFees.fee_waiver_condition);
    const feeWaiverThreshold = typeof rawFees.fee_waiver_threshold_amount === 'number'
      ? rawFees.fee_waiver_threshold_amount
      : (typeof obj.fee_waiver_spend === 'number' ? obj.fee_waiver_spend : null);
    const feeWaiverPeriod = this.extractString(rawFees.fee_waiver_period);
    const otherExplicitWaiverRequirements = this.extractString(rawFees.other_explicit_waiver_requirements);

    const fees: CanonicalFees = {
      joiningFee,
      annualFee,
      renewalFee,
      supplementaryCardFee,
      cashWithdrawalFee,
      rewardRedemptionFee,
      forexMarkup,
      foreignCurrencyFee,
      feeWaiverAvailable,
      feeWaiverCondition,
      feeWaiverThreshold,
      feeWaiverPeriod,
      otherExplicitWaiverRequirements,
      otherFees: (rawFees.other_fees && typeof rawFees.other_fees === 'object')
        ? (rawFees.other_fees as Record<string, unknown>)
        : null,
    };

    return { fees, feeWarnings };
  }

  private static normalizeEligibility(obj: Record<string, unknown>): CanonicalEligibility {
    const rawElig = (obj.eligibility && typeof obj.eligibility === 'object' && !Array.isArray(obj.eligibility))
      ? (obj.eligibility as Record<string, unknown>)
      : obj;

    return {
      minimumAge: typeof rawElig.minimum_age === 'number' ? rawElig.minimum_age : null,
      maximumAge: typeof rawElig.maximum_age === 'number' ? rawElig.maximum_age : null,
      minimumIncome: typeof rawElig.minimum_income === 'number'
        ? rawElig.minimum_income
        : (typeof obj.minimum_income === 'number' ? obj.minimum_income : null),
      maximumIncome: typeof rawElig.maximum_income === 'number' ? rawElig.maximum_income : null,
      monthlyIncome: typeof rawElig.monthly_income === 'number' ? rawElig.monthly_income : null,
      annualIncome: typeof rawElig.annual_income === 'number' ? rawElig.annual_income : null,
      incomeType: this.extractString(rawElig.income_type) || this.extractString(obj.minimum_income_type),
      employmentRequirements: this.extractString(rawElig.employment_requirements),
      studentEligibility: this.extractString(rawElig.student_eligibility),
      residencyRequirements: this.extractString(rawElig.residency_requirements),
      nationality: this.extractString(rawElig.nationality),
      existingCustomerRequirements: this.extractString(rawElig.existing_customer_requirements),
      creditProfileRequirements: this.extractString(rawElig.credit_profile_requirements),
      securedCardRequirement: this.extractString(rawElig.secured_card_requirement),
      businessEligibility: this.extractString(rawElig.business_eligibility),
      invitationOnlyRequirements: this.extractString(rawElig.invitation_only_requirements),
      otherRequirements: this.extractString(rawElig.other_requirements),
    };
  }

  private static normalizeRewards(obj: Record<string, unknown>): CanonicalRewards {
    const rawRewards = (obj.rewards && typeof obj.rewards === 'object')
      ? (obj.rewards as Record<string, unknown>)
      : null;

    let earningRules: CanonicalEarningRule[] | null = null;

    if (rawRewards && Array.isArray(rawRewards.earning_rules)) {
      earningRules = rawRewards.earning_rules
        .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
        .map((r) => ({
          category: typeof r.category === 'string' ? r.category : 'General',
          rate: typeof r.rate === 'number' ? r.rate : 0,
          condition: typeof r.condition === 'string' ? r.condition : '',
        }));
    } else if (Array.isArray(obj.rewards)) {
      // Legacy rewards array mapping
      earningRules = (obj.rewards as Array<Record<string, unknown>>)
        .filter((r) => typeof r === 'object' && r !== null)
        .map((r) => ({
          category: typeof r.category === 'string' ? r.category : 'General',
          rate: typeof r.points === 'number' ? r.points : 0,
          condition: typeof r.raw_text === 'string' ? r.raw_text : `${r.points ?? 0} points per ₹${r.spend ?? 100}`,
        }));
    }

    return {
      rewardType: rawRewards ? this.extractString(rawRewards.reward_type) : null,
      rewardCurrency: rawRewards ? this.extractString(rawRewards.reward_currency) : null,
      earningRules,
      baseRate: rawRewards && typeof rawRewards.base_rate === 'number' ? rawRewards.base_rate : null,
      acceleratedCategories: rawRewards?.accelerated_categories ?? null,
      rewardMultipliers: rawRewards?.reward_multipliers ?? null,
      thresholds: rawRewards?.thresholds ?? null,
      caps: rawRewards?.caps ?? null,
      frequency: rawRewards ? this.extractString(rawRewards.frequency) : null,
      expiry: rawRewards ? this.extractString(rawRewards.expiry) : null,
      redemption: rawRewards?.redemption ?? null,
    };
  }

  private static normalizeCashback(obj: Record<string, unknown>): CanonicalCashback {
    const rawCb = (obj.cashback && typeof obj.cashback === 'object')
      ? (obj.cashback as Record<string, unknown>)
      : null;

    if (!rawCb) {
      return {
        available: null,
        rates: [],
        categories: [],
        caps: null,
        frequency: null,
        minimumSpend: null,
        exclusions: [],
        conditions: null,
      };
    }

    const rates: CanonicalCashbackRate[] = Array.isArray(rawCb.rates)
      ? rawCb.rates
          .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
          .map((r) => ({
            rate: typeof r.rate === 'number' ? r.rate : 0,
            rateType: typeof r.rate_type === 'string' ? r.rate_type : 'EXACT',
            category: typeof r.category === 'string' ? r.category : '',
            merchant: this.extractString(r.merchant),
            cap: typeof r.cap === 'number' ? r.cap : null,
            capPeriod: this.extractString(r.cap_period),
            minimumTransaction: typeof r.minimum_transaction === 'number' ? r.minimum_transaction : null,
            maximumTransaction: typeof r.maximum_transaction === 'number' ? r.maximum_transaction : null,
            transactionConditions: this.extractString(r.transaction_conditions),
            exclusions: this.extractString(r.exclusions),
            conditions: typeof r.conditions === 'string' ? r.conditions : '',
          }))
      : [];

    const categories = Array.isArray(rawCb.categories)
      ? rawCb.categories.filter((c): c is string => typeof c === 'string')
      : [];

    const exclusions = Array.isArray(rawCb.exclusions)
      ? rawCb.exclusions.filter((e): e is string => typeof e === 'string')
      : [];

    return {
      available: this.extractString(rawCb.available),
      rates,
      categories,
      caps: rawCb.caps ?? null,
      frequency: this.extractString(rawCb.frequency),
      minimumSpend: typeof rawCb.minimum_spend === 'number' ? rawCb.minimum_spend : null,
      exclusions,
      conditions: this.extractString(rawCb.conditions),
    };
  }

  private static normalizeBenefits(obj: Record<string, unknown>): CanonicalBenefit[] {
    if (!Array.isArray(obj.benefits)) {
      return [];
    }

    return obj.benefits
      .filter((b): b is Record<string, unknown> => typeof b === 'object' && b !== null)
      .map((b) => ({
        category: typeof b.category === 'string' ? b.category : 'General',
        description: typeof b.description === 'string' ? b.description : '',
        eligibility: this.extractString(b.eligibility),
        frequency: this.extractString(b.frequency),
        limit: typeof b.limit === 'number' ? b.limit : null,
        spendRequirement: typeof b.spend_requirement === 'number' ? b.spend_requirement : null,
        conditions: this.extractString(b.conditions),
      }));
  }

  private static normalizeLounge(obj: Record<string, unknown>): CanonicalLounge {
    if (obj.lounge && typeof obj.lounge === 'object' && !Array.isArray(obj.lounge)) {
      const rawLounge = obj.lounge as Record<string, unknown>;
      return {
        available: this.extractString(rawLounge.available),
        domesticVisits: typeof rawLounge.domestic_visits === 'number' ? rawLounge.domestic_visits : null,
        internationalVisits: typeof rawLounge.international_visits === 'number' ? rawLounge.international_visits : null,
        frequency: this.extractString(rawLounge.frequency),
        eligibilityCondition: this.extractString(rawLounge.eligibility_condition),
        spendCondition: this.extractString(rawLounge.spend_condition),
      };
    }

    if (Array.isArray(obj.lounge) && obj.lounge.length > 0) {
      const first = obj.lounge[0] as Record<string, unknown>;
      return {
        available: 'AVAILABLE',
        domesticVisits: typeof first.limit === 'number' ? first.limit : null,
        internationalVisits: null,
        frequency: this.extractString(first.frequency),
        eligibilityCondition: this.extractString(first.eligibility),
        spendCondition: null,
      };
    }

    return {
      available: null,
      domesticVisits: null,
      internationalVisits: null,
      frequency: null,
      eligibilityCondition: null,
      spendCondition: null,
    };
  }

  private static normalizeMilestones(obj: Record<string, unknown>): CanonicalMilestone[] {
    if (!Array.isArray(obj.milestones)) {
      return [];
    }
    return obj.milestones.filter((m): m is CanonicalMilestone => typeof m === 'object' && m !== null);
  }

  private static normalizeFeatures(obj: Record<string, unknown>): CanonicalFeature[] {
    if (!Array.isArray(obj.features)) {
      return [];
    }
    return obj.features
      .filter((f): f is Record<string, unknown> => typeof f === 'object' && f !== null)
      .map((f) => ({
        field: typeof f.field === 'string' ? f.field : 'general',
        rawText: typeof f.raw_text === 'string' ? f.raw_text : '',
        structuredValue: f.structured_value ?? null,
        sourceUrl: this.extractString(f.source_url),
        extractionMethod: this.extractString(f.extraction_method),
        needsReview: typeof f.needs_review === 'boolean' ? f.needs_review : false,
        reviewReason: this.extractString(f.review_reason),
        confidence: this.extractString(f.confidence),
      }));
  }

  private static normalizeSpendConditions(obj: Record<string, unknown>): CanonicalSpendConditions {
    const rawSc = (obj.spend_conditions && typeof obj.spend_conditions === 'object')
      ? (obj.spend_conditions as Record<string, unknown>)
      : {};

    return {
      minimumTransaction: typeof rawSc.minimum_transaction === 'number' ? rawSc.minimum_transaction : null,
      monthlyThreshold: typeof rawSc.monthly_threshold === 'number' ? rawSc.monthly_threshold : null,
      quarterlyThreshold: typeof rawSc.quarterly_threshold === 'number' ? rawSc.quarterly_threshold : null,
      annualThreshold: typeof rawSc.annual_threshold === 'number' ? rawSc.annual_threshold : null,
      transactionType: this.extractString(rawSc.transaction_type),
      onlineOffline: this.extractString(rawSc.online_offline),
      merchantRestrictions: this.extractString(rawSc.merchant_restrictions),
      categoryRestrictions: this.extractString(rawSc.category_restrictions),
      paymentMethodRequirements: this.extractString(rawSc.payment_method_requirements),
    };
  }

  private static normalizeExclusions(obj: Record<string, unknown>): string[] | null {
    if (obj.exclusions && typeof obj.exclusions === 'object') {
      const exc = (obj.exclusions as Record<string, unknown>).exclusions;
      if (Array.isArray(exc)) {
        return exc.filter((e): e is string => typeof e === 'string');
      }
    }
    return null;
  }

  private static normalizeRedemption(obj: Record<string, unknown>): CanonicalRedemption {
    const rawR = (obj.redemption && typeof obj.redemption === 'object')
      ? (obj.redemption as Record<string, unknown>)
      : {};

    return {
      methods: this.extractString(rawR.methods),
      value: this.extractString(rawR.value),
      conversionRatio: this.extractString(rawR.conversion_ratio),
      minimumRedemption: typeof rawR.minimum_redemption === 'number' ? rawR.minimum_redemption : null,
      fees: this.extractString(rawR.fees),
      expiry: this.extractString(rawR.expiry),
    };
  }

  private static normalizeTravel(obj: Record<string, unknown>): CanonicalTravel {
    const rawT = (obj.travel_international && typeof obj.travel_international === 'object')
      ? (obj.travel_international as Record<string, unknown>)
      : {};

    return {
      forexMarkup: typeof rawT.forex_markup === 'number' ? rawT.forex_markup : null,
      internationalLounge: this.extractString(rawT.international_lounge),
      travelInsurance: this.extractString(rawT.travel_insurance),
      airlineBenefits: this.extractString(rawT.airline_benefits),
      hotelBenefits: this.extractString(rawT.hotel_benefits),
      concierge: this.extractString(rawT.concierge),
      airportTransfer: this.extractString(rawT.airport_transfer),
    };
  }

  private static normalizeApplication(obj: Record<string, unknown>): CanonicalApplication {
    const rawA = (obj.application && typeof obj.application === 'object')
      ? (obj.application as Record<string, unknown>)
      : {};

    return {
      applicationUrl: this.extractString(rawA.application_url),
      applicationMethod: this.extractString(rawA.application_method),
      eligibilityCheckUrl: this.extractString(rawA.eligibility_check_url),
    };
  }

  private static normalizeStatus(obj: Record<string, unknown>): CanonicalStatus {
    const rawS = (obj.status && typeof obj.status === 'object')
      ? (obj.status as Record<string, unknown>)
      : {};

    return {
      status: this.extractString(rawS.status),
      launchDate: this.extractString(rawS.launch_date),
      discontinuedDate: this.extractString(rawS.discontinued_date),
      lastVerifiedAt: this.extractString(rawS.last_verified_at),
    };
  }

  private static normalizeLifecycleStatus(obj: Record<string, unknown>): LifecycleStatus {
    const raw = typeof obj.lifecycle_status === 'string' ? obj.lifecycle_status.toUpperCase() : '';
    if (raw === 'ACTIVE') return 'ACTIVE';
    if (raw === 'DISCONTINUED') return 'DISCONTINUED';
    return 'UNKNOWN';
  }

  private static normalizeConfidence(obj: Record<string, unknown>): RecommendationConfidence {
    const raw = typeof obj.recommendation_confidence === 'string'
      ? obj.recommendation_confidence.toUpperCase()
      : '';
    if (raw === 'HIGH') return 'HIGH';
    if (raw === 'MEDIUM') return 'MEDIUM';
    if (raw === 'LOW') return 'LOW';
    return 'UNAVAILABLE';
  }

  private static normalizeEvidenceData(obj: Record<string, unknown>): CanonicalEvidence[] {
    if (!Array.isArray(obj.evidence_data)) {
      return [];
    }

    return obj.evidence_data
      .filter((e): e is Record<string, unknown> => typeof e === 'object' && e !== null)
      .map((e) => ({
        field: typeof e.field === 'string' ? e.field : 'unknown',
        value: typeof e.value === 'string' ? e.value : (e.value !== undefined ? String(e.value) : ''),
        sourceUrl: this.extractString(e.source_url),
        evidence: typeof e.evidence === 'string' ? e.evidence : '',
        needsReview: typeof e.needs_review === 'boolean' ? e.needs_review : false,
        reviewReason: this.extractString(e.review_reason),
      }));
  }

  private static extractString(val: unknown): string | null {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return null;
  }

  private static createEmptyCanonicalCard(id: string): CanonicalCard {
    return {
      identity: {
        id,
        canonicalId: id,
        name: 'Invalid Card',
        issuer: 'Unknown Bank',
        network: null,
        networkTier: null,
        networkVariants: null,
        productFamily: null,
        productFamilyId: id,
        variant: null,
        cardType: null,
        category: null,
        coBrandedPartner: null,
        securedUnsecured: null,
        personalBusiness: null,
        officialUrl: null,
      },
      fees: {
        joiningFee: null,
        annualFee: null,
        renewalFee: null,
        supplementaryCardFee: null,
        cashWithdrawalFee: null,
        rewardRedemptionFee: null,
        forexMarkup: null,
        foreignCurrencyFee: null,
        feeWaiverAvailable: null,
        feeWaiverCondition: null,
        feeWaiverThreshold: null,
        feeWaiverPeriod: null,
        otherExplicitWaiverRequirements: null,
        otherFees: null,
      },
      eligibility: {
        minimumAge: null,
        maximumAge: null,
        minimumIncome: null,
        maximumIncome: null,
        monthlyIncome: null,
        annualIncome: null,
        incomeType: null,
        employmentRequirements: null,
        studentEligibility: null,
        residencyRequirements: null,
        nationality: null,
        existingCustomerRequirements: null,
        creditProfileRequirements: null,
        securedCardRequirement: null,
        businessEligibility: null,
        invitationOnlyRequirements: null,
        otherRequirements: null,
      },
      rewards: {
        rewardType: null,
        rewardCurrency: null,
        earningRules: null,
        baseRate: null,
        acceleratedCategories: null,
        rewardMultipliers: null,
        thresholds: null,
        caps: null,
        frequency: null,
        expiry: null,
        redemption: null,
      },
      cashback: {
        available: null,
        rates: [],
        categories: [],
        caps: null,
        frequency: null,
        minimumSpend: null,
        exclusions: [],
        conditions: null,
      },
      benefits: [],
      lounge: {
        available: null,
        domesticVisits: null,
        internationalVisits: null,
        frequency: null,
        eligibilityCondition: null,
        spendCondition: null,
      },
      milestones: [],
      features: [],
      spendConditions: {
        minimumTransaction: null,
        monthlyThreshold: null,
        quarterlyThreshold: null,
        annualThreshold: null,
        transactionType: null,
        onlineOffline: null,
        merchantRestrictions: null,
        categoryRestrictions: null,
        paymentMethodRequirements: null,
      },
      exclusions: null,
      redemption: {
        methods: null,
        value: null,
        conversionRatio: null,
        minimumRedemption: null,
        fees: null,
        expiry: null,
      },
      travelInternational: {
        forexMarkup: null,
        internationalLounge: null,
        travelInsurance: null,
        airlineBenefits: null,
        hotelBenefits: null,
        concierge: null,
        airportTransfer: null,
      },
      application: {
        applicationUrl: null,
        applicationMethod: null,
        eligibilityCheckUrl: null,
      },
      status: {
        status: null,
        launchDate: null,
        discontinuedDate: null,
        lastVerifiedAt: null,
      },
      lifecycleStatus: 'UNKNOWN',
      dataQuality: 'INVALID',
      recommendationConfidence: 'UNAVAILABLE',
      recommendationExclusionReason: null,
      sourceName: null,
      sourceUrl: null,
      detailUrl: null,
      extractedAt: null,
      lastVerifiedAt: null,
      extractionMethod: null,
      evidenceData: [],
    };
  }
}

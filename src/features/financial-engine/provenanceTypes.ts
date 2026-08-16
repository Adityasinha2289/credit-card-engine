/**
 * Provenance & Verification Types for RenoCred Data Intelligence Layer
 */

export type VerificationStatus =
  | 'DRAFT'
  | 'EXTRACTED'
  | 'VALIDATED'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'ACTIVE'
  | 'SUPERSEDED'
  | 'REJECTED';

export type SourceType =
  | 'ISSUER_MITC'
  | 'ISSUER_PRODUCT_PAGE'
  | 'ISSUER_REWARD_PORTAL'
  | 'ISSUER_FEE_SCHEDULE'
  | 'REGULATORY_FILING';

export type SnapshotStatus =
  | 'ARCHIVED'
  | 'VERIFIED'
  | 'DEPRECATED'
  | 'FAILED_FETCH';

export interface SourceSnapshot {
  id: string;
  sourceUrl: string;
  sourceType: SourceType;
  issuer: string;
  documentTitle?: string;
  contentSha256: string;
  storageUri?: string;
  effectiveDate?: string;
  status: SnapshotStatus;
  retrievedAt: string;
}

export interface VerificationRecord {
  verificationStatus: VerificationStatus;
  snapshotId?: string;
  sourceSnapshot?: SourceSnapshot;
  rawSourceExcerpt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface TemporalVersion {
  effectiveFrom: string; // ISO Date YYYY-MM-DD
  effectiveUntil?: string | null; // ISO Date YYYY-MM-DD, null = currently active
  version: number;
  isActive: boolean;
}

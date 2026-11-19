/**
 * The truth model. Every business fact the site renders is one of these records.
 * Components never hold business facts as literals; they ask `render/facts.ts`
 * whether a fact may appear in the current build mode and how to mark it.
 */

export const LOCALES = ['th', 'en', 'vi'] as const;
export type Locale = (typeof LOCALES)[number];
export const PRIMARY_LOCALE: Locale = 'th';

export type Mode = 'preview' | 'production';

export type EvidenceStatus =
  | 'owner-confirmed'
  | 'first-party-current'
  | 'first-party-stale'
  | 'government-current'
  | 'government-historical'
  | 'directory-secondary'
  | 'marketplace-secondary'
  | 'research-lead'
  | 'conflicted'
  | 'unverified'
  /** O2 default value for the presentation preview; never owner-approvable, never in production. */
  | 'sample';

/** Report labels the brief requires (Part 1.3). */
export type ReportLabel =
  | 'OBSERVED — CURRENT'
  | 'OBSERVED — LEGACY SITE'
  | 'DOCUMENTED — GOVERNMENT SOURCE'
  | 'DOCUMENTED — SECONDARY SOURCE'
  | 'OWNER CONFIRMED'
  | 'SOURCE CONFLICT'
  | 'RESEARCH LEAD — VERIFY'
  | 'DESIGNED — NOT IMPLEMENTED'
  | 'IMPLEMENTED — NOT VERIFIED'
  | 'VERIFIED LOCALLY'
  | 'VERIFIED IN PRIVATE STAGING'
  | 'PUBLISHED — LIVE CHECK PENDING'
  | 'LIVE — VERIFIED'
  | 'BLOCKED — OWNER/PROVIDER INPUT';

/** Same value in every locale (a phone number), or one value per locale. */
export type Localized<T = string> = { th: T; en: T; vi: T };
export type Value<T = string> = T | Localized<T>;

/**
 * How a fact may be shown.
 * - `public`: may appear on a preview page (with its status marker) and, once
 *   owner-approved, in production.
 * - `review`: appears only inside review notes of the private preview (hidden
 *   unless the reviewer turns notes on). Never in production.
 * - `private`: never rendered; kept for the ledger only.
 */
export type Visibility = 'public' | 'review' | 'private';

export type Fact<T = string> = {
  id: string;
  value: Value<T>;
  status: EvidenceStatus;
  sourceIds: string[];
  checkedAt: string; // ISO date the source was read
  visibility: Visibility;
  /** Set true only from a written owner confirmation (record its reference). */
  ownerApproved: boolean;
  ownerApprovalRef?: string;
  note?: string;
};

export type SourceType =
  | 'first-party'
  | 'government'
  | 'government-derived'
  | 'directory'
  | 'aggregator'
  | 'marketplace'
  | 'catalogue'
  | 'benchmark'
  | 'rejected';

export type Source = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  sourceType: SourceType;
  retrievedAt: string;
  publishedOrEffectiveAt?: string;
  appliesToEntity: 'manufacturer' | 'rejected-restaurant' | 'competitor' | 'category';
  claimsSupported: string[];
  limitations: string;
  supersedes?: string;
  rejectedReason?: string;
};

export type RejectedEntity = {
  id: string;
  reason: string;
  sourceIds: string[];
  /** Every string that must never reach public output. Checked by the build. */
  forbiddenStrings: string[];
};

/** Locale review status for every copy entry (Part 9.5). */
export type LocaleReview =
  | 'translated-and-reviewed'
  | 'authored-not-reviewed'
  | 'translated-not-reviewed'
  | 'source-identical-legal-name'
  | 'intentionally-omitted-with-reason';

export type CopyEntry = {
  th: string;
  en: string;
  vi: string;
  /** Defaults: th/en authored-not-reviewed, vi translated-not-reviewed. */
  review?: Partial<Record<Locale, LocaleReview>>;
  /**
   * Fact IDs this sentence asserts. In production the sentence renders only when every
   * fact is owner-approved; in the preview it carries the weakest fact's status marker.
   * Copy without `facts` describes the website itself (its rules, labels, controls).
   */
  facts?: string[];
};

export type Tone = 'gold' | 'wheat' | 'cream' | 'brown';

export type ProductFormat = 'vermicelli' | 'rice-stick' | 'flake' | 'brown-rice' | 'brand';

export type AssetRights =
  | 'manufacturer-approved'
  | 'first-party-legacy-unconfirmed'
  | 'commissioned'
  | 'licensed-stock'
  | 'generated'
  | 'research-only';

export type Asset = {
  id: string;
  /** Path under media-source/ (git-ignored), produced by `npm run media`. */
  file: string;
  sourceUrl: string;
  sourceOwner: string;
  retrievedAt: string;
  rightsBasis: AssetRights;
  permissionReference?: string;
  subject: string;
  actualPankaoOrGeneric: 'actual-pankao' | 'generic';
  generationDisclosure?: string;
  width: number;
  height: number;
  /** The widest slot the image may fill, in CSS px at 1x. Never larger than `width`. */
  maxDisplayWidth: number;
  cropLimits?: string;
  alt: Localized;
  caption?: Localized;
  credit?: Localized;
  /** Text baked into the raster (must not carry meaning the page needs). */
  rasterText?: string;
  productionApproved: boolean;
  reviewOrExpiryDate: string;
};

export type Certificate = {
  id: string;
  standard: string;
  scope: Localized;
  operator: string;
  facility: string;
  issuer: string;
  number: string;
  issuedOn: string;
  expiresOn: string;
  status: 'current' | 'expired' | 'superseded' | 'pending' | 'private' | 'sample';
  verificationUrl?: string;
  documentId?: string;
  markAssetId?: string;
  markUseApproved: boolean;
  sourceIds: string[];
  ownerApproved: boolean;
  group: 'food-safety' | 'market-religious' | 'process-programme';
};

export type DocumentRecord = {
  id: string;
  title: Localized;
  locale: Locale | 'multi';
  version: string;
  date: string;
  fileType: 'PDF';
  bytes: number;
  file: string;
  scope: Localized;
  reviewOrExpiry?: string;
  productIds: string[];
  ownerApproved: boolean;
  status: 'current' | 'superseded' | 'private' | 'sample';
};

/** A claim is stored at company OR SKU level and never inherited between them. */
export type Claim = {
  id: string;
  level: 'company' | 'product';
  productId?: string;
  text: Localized;
  kind: 'ingredient' | 'dietary' | 'additive' | 'nutrition' | 'origin' | 'process' | 'quality' | 'market';
  status: EvidenceStatus;
  sourceIds: string[];
  certificateIds: string[];
  ownerApproved: boolean;
  /** What would make this publishable. */
  evidenceNeeded: string;
};

export type Product = {
  id: string;
  slug: string;
  format: ProductFormat;
  /** Relative strand width for the visual code only; never shown as a dimension. */
  strand: 'hair' | 'fine' | 'flat' | 'sheet' | 'mixed';
  /** Tonal code for the format (natural rice colours), used on cards and filters. */
  tone: Tone;
  name: Fact<string>;
  altNames: Localized<string[]>;
  brand: Fact<string> | null;
  summary: Fact<string>;
  uses: Fact<string[]>;
  /** SKU-level fields. `null` means unknown — never rendered as zero/no/false. */
  technical: {
    ingredients: Fact<string> | null;
    allergen: Fact<string> | null;
    packWeights: Fact<string[]> | null;
    shelfLife: Fact<string> | null;
    storage: Fact<string> | null;
    cooking: Fact<string> | null;
    origin: Fact<string> | null;
    widthMm: Fact<string> | null;
    caseConfiguration: Fact<string> | null;
  };
  brandedOrOem: Fact<string> | null;
  claimIds: string[];
  documentIds: string[];
  media: { pack?: string; dish?: string };
  related: string[];
  legacyStems: string[];
  /** Verification slot: exists only as a review card until confirmed. */
  slot?: boolean;
};

export type Decision = {
  id: string;
  decision: string;
  whyItMatters: string;
  safeDefault: string;
  options: string;
  evidenceNeeded: string;
  releaseConsequence: string;
  gate: 'A' | 'B' | 'C' | 'D' | 'E';
  resolved: boolean;
  resolution?: string;
};

/**
 * Source ledger (Part 9.7). The JSON is the Phase 0 research record of 19 Nov 2026
 * (documents/research/SOURCE_LEDGER.md is its readable form). Loaded, normalised and
 * validated here so every fact's sourceIds must point at a real entry.
 */
import raw from './data/sources.json' with { type: 'json' };
import blockedRaw from './data/blocked-strings.json' with { type: 'json' };
import type { RejectedEntity, Source, SourceType } from './types.ts';

type RawSource = {
  source_id: string;
  title: string;
  url: string;
  publisher: string;
  source_type: string;
  retrieved_at: string;
  published_or_effective_at: string | null;
  applies_to_entity: string;
  claims_supported: string[];
  limitations: string;
  supersedes: string | null;
  rejected_reason: string | null;
  access_status?: string;
};

const typeMap: Record<string, SourceType> = {
  aggregator: 'government-derived',
  government: 'government',
  directory: 'directory',
  catalogue: 'catalogue',
  marketplace: 'marketplace',
  'first-party': 'first-party',
  benchmark: 'benchmark',
};

export const sources: Source[] = (raw as RawSource[]).map((s) => {
  const rejected = s.applies_to_entity.toUpperCase().includes('REJECTED');
  const entity: Source['appliesToEntity'] = rejected
    ? 'rejected-restaurant'
    : s.applies_to_entity === 'competitor'
      ? 'competitor'
      : 'manufacturer';
  return {
    id: s.source_id,
    title: s.title,
    url: s.url,
    publisher: s.publisher,
    sourceType: rejected ? 'rejected' : (typeMap[s.source_type] ?? 'directory'),
    retrievedAt: s.retrieved_at,
    publishedOrEffectiveAt: s.published_or_effective_at ?? undefined,
    appliesToEntity: entity,
    claimsSupported: s.claims_supported,
    limitations: s.access_status && s.access_status !== 'read' ? `${s.limitations} [access: ${s.access_status}]` : s.limitations,
    supersedes: s.supersedes ?? undefined,
    rejectedReason: s.rejected_reason ?? undefined,
  };
});

sources.push({
  id: 'O2',
  title: 'O2 Design Studio draft wording, for the company to confirm',
  url: 'documents/brief/ (Pankao master prompt, 19 Nov 2026)',
  publisher: 'O2 Design Studio',
  sourceType: 'first-party',
  retrievedAt: '2026-11-19',
  appliesToEntity: 'manufacturer',
  claimsSupported: ['Proposed OEM engagement path', 'Privacy notice structure', 'Neutral history wording'],
  limitations: 'Not evidence of anything the company does. Every fact citing it stays unapproved until the company confirms it.',
});

sources.push({
  id: 'O2-SAMPLE',
  title: 'O2 sample values for the client presentation preview (not company data)',
  url: 'src/content/samples.ts',
  publisher: 'O2 Design Studio',
  sourceType: 'first-party',
  retrievedAt: '2026-11-19',
  appliesToEntity: 'manufacturer',
  claimsSupported: ['Typical specification values, sample certificate and document entries, sample timeline and OEM terms'],
  limitations: 'Illustrative only. Shown in the private preview with a Sample tag; never owner-approvable; never in a production build.',
});

export const sourceById = new Map(sources.map((s) => [s.id, s]));

/** The unrelated 2024 company: kept only as a blocked record. Its strings are decoded here so that the public
 *  repository never carries them as searchable text (Codex audit, fourth edition, F19.2). */
const blockedStrings = JSON.parse(Buffer.from(blockedRaw.strings, 'base64').toString('utf8')) as string[];

export const rejectedEntities: RejectedEntity[] = [
  {
    id: 'rejected-restaurant-2024',
    reason:
      'Separate company (restaurant/food service, TSIC 56101) registered in Bangkok in September 2024. Its Thai name is identical to the manufacturer’s pre-2017 name, so identity is decided by registration number and address, never by name.',
    sourceIds: ['R01', 'R01-B', 'R01-C'],
    // Deliberately NOT forbidden: the bare stem "ปั้นข้าว" / "Pankao", which is the manufacturer's own brand.
    forbiddenStrings: blockedStrings,
  },
];

/** The manufacturer's identity anchor: only this registration may be rendered. */
export const MANUFACTURER_REGISTRATION = '0125550039493';

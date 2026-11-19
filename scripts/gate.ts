/**
 * Release gate (Part VI). Exits 1 while anything that controls publication is open.
 * Passing this gate is necessary, not sufficient: publication still needs the owner's
 * token APPROVE_PANKAO_PRODUCTION_DEPLOY and the steps in docs/RUNBOOK.md.
 */
import { copy, factRegistry } from '../src/build/context.ts';
import { factApprovalSummary } from '../src/build/validate.ts';
import { assets } from '../src/content/assets.ts';
import { openDecisions } from '../src/content/decisions.ts';
import { LOCALES } from '../src/content/types.ts';

const lines: string[] = [];
const fail = (s: string) => lines.push(`  ✘ ${s}`);

const byGate: Record<string, string[]> = {};
for (const d of openDecisions()) (byGate[d.gate] ??= []).push(`${d.id} ${d.decision}`);
for (const g of ['A', 'B', 'C', 'D', 'E']) for (const d of byGate[g] ?? []) fail(`Gate ${g}: ${d}`);

const facts = factApprovalSummary();
if (facts.unapproved.length) fail(`Gate B: ${facts.unapproved.length}/${facts.total} public facts not owner-approved (e.g. ${facts.unapproved.slice(0, 4).map((f) => f.id).join(', ')})`);
const unapprovedAssets = assets.filter((a) => !a.productionApproved);
if (unapprovedAssets.length) fail(`Gate B: ${unapprovedAssets.length}/${assets.length} images lack a rights basis/permission`);
let unreviewed = 0;
for (const e of Object.values(copy)) for (const l of LOCALES) {
  const r = e.review?.[l] ?? (l === 'vi' ? 'translated-not-reviewed' : 'authored-not-reviewed');
  if (r === 'authored-not-reviewed' || r === 'translated-not-reviewed') unreviewed++;
}
if (unreviewed) fail(`Gate D: ${unreviewed} copy strings not natively reviewed (D16)`);
void factRegistry;

console.log(`Pankao release gate — ${lines.length ? 'BLOCKED' : 'PASSED (owner token still required)'}`);
console.log(lines.join('\n'));
console.log('\nLocal status: build, tests, crawl and browser checks are separate (npm run check, npm run e2e). Nothing is deployed by any script.');
process.exit(lines.length ? 1 : 0);

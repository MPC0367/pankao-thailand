/**
 * Presentation switches for the client preview (one-word ways back, as on Bella's preview).
 *   PANKAO_SAMPLES=off      hide every O2 sample value (the honest "not yet published" view)
 *   PANKAO_SAMPLE_TAGS=off  keep sample values but hide their small "Sample" tags
 *   PANKAO_LOADER=off       no loading animation
 * None of these affects a production build: samples never render there.
 */
const env = (k: string) => (typeof process !== 'undefined' ? process.env[k] : undefined);

export const SHOW_SAMPLES = env('PANKAO_SAMPLES') !== 'off';
export const SHOW_SAMPLE_TAGS = env('PANKAO_SAMPLE_TAGS') !== 'off';
export const SHOW_LOADER = env('PANKAO_LOADER') !== 'off';
/** The company's current website in its own words, tagged, preview only (owner, 19 Nov 2026). */
export const SHOW_LEGACY = env('PANKAO_LEGACY') !== 'off';

/**
 * Public preview on GitHub Pages (owner: "publish live", 19 Nov 2026). Same content as the client preview
 * (samples and their tags), served under a sub-path, without O2's review notes, with the form showing its
 * copy/download/email fallbacks (no backend), and noindex.
 *   PANKAO_BASE=/pankao-thailand  PANKAO_ORIGIN=https://mpc0367.github.io  PANKAO_PUBLIC_PREVIEW=on
 */
export const BASE = (env('PANKAO_BASE') ?? '').replace(/\/$/, '');
export const ORIGIN = env('PANKAO_ORIGIN') ?? 'https://www.pankaothai.com';
export const PUBLIC_PREVIEW = env('PANKAO_PUBLIC_PREVIEW') === 'on';

/** The recoloured PK mark is O2's working treatment; production uses it only once the company approves it (D21). */
export const MARK_APPROVED = false;

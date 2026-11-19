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

/** The recoloured PK mark is O2's working treatment; production uses it only once the company approves it (D21). */
export const MARK_APPROVED = false;

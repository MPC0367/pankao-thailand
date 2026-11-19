/** Fingerprinted output paths, produced by build.ts and passed to every template. */
export type MediaOut = { src: string; webp?: string; width: number; height: number };

export type Assets = {
  css: string;
  headJs: string;
  siteJs: string;
  /** Glisse liquid-glass island for the header (React), loaded after first paint. */
  glassJs?: string;
  /** Glisse's stylesheet as a file (id="glisse-styles" stops its inline injection; strict CSP stays). */
  glisseCss?: string;
  media: Map<string, MediaOut>;
};

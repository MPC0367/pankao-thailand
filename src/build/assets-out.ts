/** Fingerprinted output paths, produced by build.ts and passed to every template. */
/** `webpSmall`: an 800 px WebP for images wider than 1000 px, offered through srcset (Codex F17.5). */
export type MediaOut = { src: string; webp?: string; webpSmall?: string; width: number; height: number };

export type Assets = {
  css: string;
  headJs: string;
  siteJs: string;
  /** Swaps the root 404 to the address's language (hosts that serve one 404 for every path). */
  notFoundJs?: string;
  /** Glisse liquid-glass island for the header (React), loaded after first paint. */
  glassJs?: string;
  /** Glisse's stylesheet as a file (id="glisse-styles" stops its inline injection; strict CSP stays). */
  glisseCss?: string;
  media: Map<string, MediaOut>;
};

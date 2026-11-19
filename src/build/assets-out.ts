/** Fingerprinted output paths, produced by build.ts and passed to every template. */
export type MediaOut = { src: string; webp?: string; width: number; height: number };

export type Assets = {
  css: string;
  headJs: string;
  siteJs: string;
  media: Map<string, MediaOut>;
};

/**
 * Prepares preview images from the research copies of the 2014 site's files
 * (../documents/research/legacy-site/images/) into media-source/ (git-ignored).
 * Crops, and (owner, 20 Nov 2026: "make the images clearer") enlarges the small 2014 close-ups once
 * with Lanczos resampling and a light sharpen, so photographs that fill their frames are not
 * stretched by the browser. No generative upscaling: nothing is added to a real product photo.
 * Client photographs never enter the repository.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const research = resolve(root, '../documents/research/legacy-site/images');
const out = join(root, 'media-source/legacy');
mkdirSync(out, { recursive: true });

if (!existsSync(research)) {
  console.error(`media: research images not found at ${research}`);
  process.exit(1);
}

type Job = { from: string; to: string; vf?: string };
/** The 186x210 close-ups (owner, 20 Nov 2026: "make the dry noodle photos clearer too"): deblock and lightly
 * denoise the 2014 JPEG, enlarge in two Lanczos steps with contrast-adaptive sharpening (AMD CAS) after
 * each, to 632x714 so the browser barely scales them. Not generative: no detail is invented. */
const CLEAN = 'deblock=filter=strong:block=8,nlmeans=s=1.4:p=5:r=9,scale=344:388:flags=lanczos+accurate_rnd+full_chroma_int,cas=strength=0.5,scale=632:714:flags=lanczos+accurate_rnd+full_chroma_int,cas=strength=0.65';
const jobs: Job[] = [
  { from: 'pankao_logo.gif', to: 'logo.png' },
  { from: 'mr_noodles_package.jpg', to: 'hero-pack.jpg', vf: 'crop=190:258:25:5,scale=418:568:flags=lanczos+accurate_rnd+full_chroma_int,cas=strength=0.55' },
  { from: 'mr_noodles_package.jpg', to: 'mrnoodles-packs.jpg', vf: 'crop=460:262:0:0' },
  { from: 'product_noodle_dish.jpg', to: 'dish-thin-noodles.jpg', vf: CLEAN },
  { from: 'process_rice.jpg', to: 'process-rice.jpg' },
  { from: 'process_factory.jpg', to: 'process-factory.jpg' },
  { from: 'history_img01.jpg', to: 'process-drying.jpg' },
  { from: 'process_lab.jpg', to: 'process-lab.jpg' },
  { from: 'process_noodle.jpg', to: 'process-noodle.jpg' },
  { from: 'contact_img01.jpg', to: 'contact-building.jpg' },
];
for (const [key, stem] of [['vermicelli', 'rice_vermicelli'], ['ricestick', 'rice_stick'], ['flake', 'rice_flake'], ['brown', 'rice_brown']] as const) {
  jobs.push({ from: `${stem}.jpg`, to: `${key}-dry.jpg`, vf: CLEAN });
  // The dish photographs are 460x400 page backgrounds: used whole, at their own size.
  jobs.push({ from: `${stem}_bg.jpg`, to: `${key}-dish.jpg` });
}

for (const j of jobs) {
  const src = join(research, j.from);
  const dst = join(out, j.to);
  const args = ['-v', 'error', '-y', '-i', src, '-frames:v', '1', '-update', '1'];
  if (j.vf) args.push('-vf', j.vf);
  if (dst.endsWith('.jpg')) args.push('-q:v', '2');
  args.push(dst);
  execFileSync('ffmpeg', args);
  console.log(`media: ${j.to}`);
}

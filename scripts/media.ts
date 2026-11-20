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

type Job = { from: string; to: string; vf?: string; fc?: string; dir?: string };
/** The 186x210 close-ups (owner, 20 Nov 2026: "make the dry noodle photos clearer too"): deblock and lightly
 * denoise the 2014 JPEG, enlarge in two Lanczos steps with contrast-adaptive sharpening (AMD CAS) after
 * each, to 632x714 so the browser barely scales them. Not generative: no detail is invented. */
/** The 102x107 process details: the same cleaning, enlarged 3x to 306x321. */
const CLEAN_SMALL = 'deblock=filter=strong:block=8,nlmeans=s=1.2:p=3:r=7,scale=204:214:flags=lanczos+accurate_rnd+full_chroma_int,cas=strength=0.45,scale=306:321:flags=lanczos+accurate_rnd+full_chroma_int,cas=strength=0.55';
/** The real Mr. Noodles pack re-staged (premium audit: "replace or re-stage the pack image"): the flat lime backdrop of the
 * 2014 photo is keyed out and the pack set on cream, its cut-off lower edge faded into the cream. Background only:
 * the pack, its print and the noodles are not altered (audit, AI guardrails: green). */
const HERO_STAGED = '[0:v]crop=210:262:15:0,scale=630:786:flags=lanczos+accurate_rnd+full_chroma_int,cas=strength=0.45,format=rgba,colorkey=0xCBCB4F:similarity=0.13:blend=0.08[k];color=c=0xF6EEDF:s=630x786,format=rgba[bg];[bg][k]overlay=0:0[o];color=c=0xF6EEDF:s=630x786,format=rgba,geq=r=246:g=238:b=223:a=\'if(gt(Y,H*0.8),255*pow((Y-H*0.8)/(H*0.2),1.4),0)\'[fade];[o][fade]overlay=0:0,format=rgb24';
/** Both packs re-staged the same way (lime backdrop to cream, the cut-off lower edge faded); background only. */
const PACKS_STAGED = '[0:v]crop=460:262:0:0,scale=920:524:flags=lanczos+accurate_rnd+full_chroma_int,cas=strength=0.4,format=rgba,colorkey=0xCBCB4F:similarity=0.13:blend=0.08[k];color=c=0xF6EEDF:s=920x524,format=rgba[bg];[bg][k]overlay=0:0[o];color=c=0xF6EEDF:s=920x524,format=rgba,geq=r=246:g=238:b=223:a=\'if(gt(Y,H*0.76),255*pow((Y-H*0.76)/(H*0.24),1.4),0)\'[fade];[o][fade]overlay=0:0,format=rgb24';
const CLEAN = 'deblock=filter=strong:block=8,nlmeans=s=1.4:p=5:r=9,scale=344:388:flags=lanczos+accurate_rnd+full_chroma_int,cas=strength=0.5,scale=632:714:flags=lanczos+accurate_rnd+full_chroma_int,cas=strength=0.65';
const jobs: Job[] = [
  { from: 'pankao_logo.gif', to: 'logo.png' },
  { from: 'mr_noodles_package.jpg', to: 'hero-pack.jpg', fc: HERO_STAGED },
  { from: 'mr_noodles_package.jpg', to: 'mrnoodles-packs.jpg', fc: PACKS_STAGED },
  { from: 'product_noodle_dish.jpg', to: 'dish-thin-noodles.jpg', vf: CLEAN },
  { from: 'process_rice.jpg', to: 'process-rice.jpg', vf: CLEAN_SMALL },
  { from: 'process_factory.jpg', to: 'process-factory.jpg', vf: CLEAN },
  { from: 'history_img01.jpg', to: 'process-drying.jpg', vf: CLEAN },
  { from: 'process_lab.jpg', to: 'process-lab.jpg', vf: CLEAN_SMALL },
  { from: 'process_noodle.jpg', to: 'process-noodle.jpg', vf: CLEAN_SMALL },
  { from: 'contact_img01.jpg', to: 'contact-building.jpg', vf: CLEAN },
];
for (const [key, stem] of [['vermicelli', 'rice_vermicelli'], ['ricestick', 'rice_stick'], ['flake', 'rice_flake'], ['brown', 'rice_brown']] as const) {
  jobs.push({ from: `${stem}.jpg`, to: `${key}-dry.jpg`, vf: CLEAN });
  // The dish photographs are 460x400 page backgrounds: used whole, enlarged once to the widest card (624 px) so no slot stretches them.
  jobs.push({ from: `${stem}_bg.jpg`, to: `${key}-dish.jpg`, vf: 'deblock=filter=weak:block=8,scale=632:550:flags=lanczos+accurate_rnd+full_chroma_int,cas=strength=0.4' });
}

/* Illustrative photographs with free commercial licences (owner, 20 Nov 2026: "with photos to add to the website
   you may use the internet to do research add what is appropriate for each page"). Sources and licences:
   ../documents/photos/illustrative-2026-11-20/README.md. Resized to 1600 px wide; never shown as Pankao's own. */
const ILLUS = resolve(root, '../documents/photos/illustrative-2026-11-20');
if (existsSync(ILLUS)) {
  for (const name of ['ricefield-thailand', 'jasmine-rice', 'dish-vermicelli', 'dish-padthai', 'dish-guayjub', 'brown-rice', 'nonthaburi-canal']) {
    jobs.push({ dir: ILLUS, from: `${name}.jpg`, to: `../illus/${name}.jpg`, vf: 'scale=1600:-2:flags=lanczos+accurate_rnd+full_chroma_int' });
  }
}
mkdirSync(join(root, 'media-source/illus'), { recursive: true });
/* Two more close-ups for the format specimens (redesign, 20 Nov 2026), Wikimedia Commons, CC BY-SA; cropped to 4:5. */
if (existsSync(ILLUS)) {
  jobs.push({ dir: ILLUS, from: 'dry-vermicelli-commons.jpg', to: '../illus/dry-vermicelli-commons.jpg', vf: 'crop=1728:2160:1056:0,scale=720:900:flags=lanczos+accurate_rnd+full_chroma_int' });
  jobs.push({ dir: ILLUS, from: 'dry-ricestick-commons.jpg', to: '../illus/dry-ricestick-commons.jpg', vf: 'crop=667:834:290:0' });
}

/* The company's own packs as photographed by shops and importers (owner, 20 Nov 2026: "look on the internet to find pictures
   of their product and replace any subpar images"). Third-party pictures with no permission recorded: preview only, each
   captioned with its publisher and linked to the page it came from. Sources: ../documents/photos/web-2026-11-20/SOURCES.md.
   Cropped to the pack's edges; nothing in the pictures is changed. */
const WEB = resolve(root, '../documents/photos/web-2026-11-20');
if (existsSync(WEB)) {
  mkdirSync(join(root, 'media-source/web'), { recursive: true });
  for (const [from, to, vf] of [
    ['mrnoodles-ricestick-green-454g-front-white-daraz-3.jpg', 'pack-green-front.jpg', 'crop=602:1112:320:74'],
    ['mrnoodles-ricestick-green-454g-two-packs-daraz.jpg', 'packs-green-pair.jpg', 'crop=928:994:146:88'],
    ['mrnoodles-ricestick-green-454g-front-grey-daraz.jpg', 'pack-green-studio.jpg', 'crop=960:1200:120:0'],
    ['mrnoodles-ricestick-green-454g-back-label-bacchakaccha.jpg', 'pack-green-back.jpg', 'null'],
  ] as const) jobs.push({ dir: WEB, from, to: `../web/${to}`, vf });
}

for (const j of jobs) {
  const src = join(j.dir ?? research, j.from);
  const dst = join(out, j.to);
  const args = ['-v', 'error', '-y', '-i', src, '-frames:v', '1', '-update', '1'];
  if (j.vf) args.push('-vf', j.vf);
  if (j.fc) args.push('-filter_complex', j.fc);
  if (dst.endsWith('.jpg')) args.push('-q:v', '2');
  args.push(dst);
  execFileSync('ffmpeg', args);
  console.log(`media: ${j.to}`);
}

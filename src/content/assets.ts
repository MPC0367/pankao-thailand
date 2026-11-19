/**
 * Asset ledger (Part 10.6). Every rendered image must have an entry here.
 * All current images are the manufacturer's own 2014 website files: rights basis
 * "first-party-legacy-unconfirmed" until Pankao confirms ownership and reuse. They render
 * only in the preview (the small close-ups enlarged 2.5x by Lanczos with a light sharpen, owner
 * 20 Nov 2026), and never in a production build
 * (MED-01). Files are produced into media-source/ by `npm run media` (git-ignored).
 */
import type { Asset, Localized } from './types.ts';

const RETRIEVED = '2026-11-19';
const REVIEW = '2027-05-19';
const SITE = 'https://www.pankaothai.com/images/';

type Spec = {
  id: string;
  from: string;
  file: string;
  w: number;
  h: number;
  subject: string;
  alt: Localized;
  rasterText?: string;
  crop?: string;
  caption?: Localized;
};

const LEGACY_CREDIT: Localized = {
  th: 'ภาพจากเว็บไซต์เดิมของบริษัท (2557)',
  en: 'Image from the company’s 2014 website',
  vi: 'Ảnh từ trang web cũ của công ty (2014)',
};

const legacy = (s: Spec): Asset => ({
  id: s.id,
  file: s.file,
  sourceUrl: SITE + s.from,
  sourceOwner: 'The manufacturer (published on pankaothai.com); photographer and licence not stated',
  retrievedAt: RETRIEVED,
  rightsBasis: 'first-party-legacy-unconfirmed',
  subject: s.subject,
  actualPankaoOrGeneric: s.id.includes('dish') ? 'generic' : 'actual-pankao',
  width: s.w,
  height: s.h,
  maxDisplayWidth: s.w,
  cropLimits: s.crop,
  alt: s.alt,
  caption: s.caption,
  credit: LEGACY_CREDIT,
  rasterText: s.rasterText,
  productionApproved: false,
  reviewOrExpiryDate: REVIEW,
});

export const assets: Asset[] = [
  legacy({
    id: 'legacy.logo', from: 'pankao_logo.gif', file: 'legacy/logo.png', w: 88, h: 61,
    subject: 'PK oval mark from the 2014 header (shown cropped to the oval; never upscaled or redrawn).',
    alt: { th: '', en: '', vi: '' },
    rasterText: '[removed] / [removed] (former company name, too small to read at display size)',
    crop: 'Elliptical clip to the oval only; the brown page ground is outside the mark.',
  }),
  legacy({
    id: 'legacy.hero.pack', from: 'mr_noodles_package.jpg', file: 'legacy/hero-pack.jpg', w: 418, h: 568,
    subject: 'The blue Mr. Noodles dried rice-vermicelli pack (crop from the 2014 two-pack photograph).',
    alt: {
      th: 'ถุงเส้นหมี่อบแห้งมิสเตอร์นู้ดเดิ้ล ถุงใสแถบสีน้ำเงิน',
      en: 'A clear Mr. Noodles bag of dried rice vermicelli with blue stripes',
      vi: 'Túi bún gạo khô Mr. Noodles trong suốt, sọc xanh dương',
    },
    rasterText: 'Pack print: Mr.NOODLES, BEST QUALITY, 米粉, เส้นหมี่อบแห้ง, RICE VERMICELLI',
    crop: 'x 25–215, y 5–263 of the 460×380 original: the blue pack only; excludes the generic food strip. Enlarged 2.2× (Lanczos, contrast-adaptive sharpening).',
  }),
  legacy({
    id: 'legacy.mrnoodles.pack', from: 'mr_noodles_package.jpg', file: 'legacy/mrnoodles-packs.jpg', w: 460, h: 262,
    subject: 'Two Mr. Noodles packs: blue rice vermicelli, green rice stick.',
    alt: {
      th: 'ถุงมิสเตอร์นู้ดเดิ้ลสองแบบ: เส้นหมี่อบแห้งแถบสีน้ำเงิน และเส้นจันทร์อบแห้งแถบสีเขียว',
      en: 'Two Mr. Noodles bags: dried rice vermicelli with blue stripes and dried rice stick with green stripes',
      vi: 'Hai túi Mr. Noodles: bún gạo khô sọc xanh dương và bánh phở khô sọc xanh lá',
    },
    rasterText: 'Pack print incl. [removed] and PRODUCT OF THAILAND (former company name on the pack)',
    crop: 'Top 262 px of the 460×380 original; the lower strip of generic food photographs is excluded.',
  }),
  legacy({
    id: 'legacy.mrnoodles.tile.dish', from: 'product_noodle_dish.jpg', file: 'legacy/dish-thin-noodles.jpg', w: 632, h: 714,
    subject: 'Stir-fried thin rice noodles with shiitake, carrot and greens (styled dish; origin not stated).',
    alt: { th: 'เส้นเล็กผัดกับเห็ดหอม แครอท และผักใบเขียว', en: 'Thin rice noodles stir-fried with shiitake, carrot and greens', vi: 'Sợi gạo nhỏ xào nấm hương, cà rốt và rau xanh' },
  }),
  ...(
    [
      ['vermicelli', 'rice_vermicelli', { th: 'เส้นหมี่แห้ง เส้นกลมเล็กสีขาวนวล', en: 'Dry rice vermicelli: fine, round, ivory strands', vi: 'Bún gạo khô: sợi tròn, nhỏ, màu ngà' }, { th: 'จานเส้นหมี่ โรยต้นหอม', en: 'A plate of rice vermicelli with spring onion', vi: 'Đĩa bún gạo với hành lá' }],
      ['ricestick', 'rice_stick', { th: 'เส้นจันทร์แห้ง เส้นแบนสีขาวโปร่งแสง', en: 'Dry rice stick: flat, translucent white strands', vi: 'Bánh phở khô: sợi dẹt, trắng trong' }, { th: 'ผัดไทยกุ้ง', en: 'Pad Thai with prawns', vi: 'Pad Thai với tôm' }],
      ['flake', 'rice_flake', { th: 'แผ่นก๋วยจั๊บแห้ง สี่เหลี่ยมโปร่งแสง', en: 'Dry rice flakes: translucent square sheets', vi: 'Bánh đa khô: miếng vuông trong' }, { th: 'ก๋วยจั๊บน้ำ ไข่ต้ม และเต้าหู้', en: 'Guay Jub soup with boiled egg and tofu', vi: 'Súp Guay Jub với trứng luộc và đậu phụ' }],
      ['brown', 'rice_brown', { th: 'เส้นข้าวกล้องแห้ง เส้นแบนสีน้ำตาลอ่อน', en: 'Dry brown-rice noodles: flat, light-brown strands', vi: 'Bún gạo lứt khô: sợi dẹt, màu nâu nhạt' }, { th: 'เส้นข้าวกล้องผัดกับเห็ดและผัก', en: 'Brown-rice noodles stir-fried with mushrooms and vegetables', vi: 'Bún gạo lứt xào nấm và rau' }],
    ] as const
  ).flatMap(([key, stem, dryAlt, dishAlt]) => [
    legacy({
      id: `legacy.tile.${key}`, from: `${stem}.jpg`, file: `legacy/${key}-dry.jpg`, w: 632, h: 714,
      subject: `Close-up of the dry ${stem.replace('_', ' ')} product (2014 product page).`,
      alt: dryAlt,
      crop: 'The 186×210 original deblocked, lightly denoised and enlarged 3.4× in two Lanczos steps with contrast-adaptive sharpening; nothing generated.',
    }),
    legacy({
      id: `legacy.tile.${key}.dish`, from: `${stem}_bg.jpg`, file: `legacy/${key}-dish.jpg`, w: 460, h: 400,
      subject: `Prepared dish for ${stem.replace('_', ' ')} (2014 page background, used whole at its own size).`,
      alt: dishAlt,
      crop: 'The whole 460×400 background at its own size (reduced to 186×210 until 20 Nov 2026).',
    }),
  ]),
  legacy({
    id: 'legacy.process.rice', from: 'process_rice.jpg', file: 'legacy/process-rice.jpg', w: 102, h: 107,
    subject: 'Rice grains with a rice stalk.', alt: { th: 'เมล็ดข้าวกับรวงข้าว', en: 'Rice grains and a rice stalk', vi: 'Hạt gạo và bông lúa' },
  }),
  legacy({
    id: 'legacy.process.factory', from: 'process_factory.jpg', file: 'legacy/process-factory.jpg', w: 186, h: 210,
    subject: 'Plant interior: a green-and-steel machine tower with stairs (2014).',
    alt: { th: 'เครื่องจักรในโรงงาน โครงเหล็กสีเขียวพร้อมบันได', en: 'Production machinery inside the plant: a green steel tower with stairs', vi: 'Máy móc trong nhà máy: tháp thép xanh có cầu thang' },
  }),
  legacy({
    id: 'legacy.process.drying', from: 'history_img01.jpg', file: 'legacy/process-drying.jpg', w: 186, h: 210,
    subject: 'Skeins of pale dried noodles laid on trays (2014 history page).',
    alt: { th: 'เส้นหมี่เป็นไจวางบนถาด', en: 'Skeins of pale noodles laid out on trays', vi: 'Những bó sợi gạo trắng xếp trên khay' },
  }),
  legacy({
    id: 'legacy.process.lab', from: 'process_lab.jpg', file: 'legacy/process-lab.jpg', w: 102, h: 107,
    subject: 'Petri dishes of rice grains and lab glassware.', alt: { th: 'จานเพาะเชื้อใส่เมล็ดข้าวและเครื่องแก้วในห้องปฏิบัติการ', en: 'Petri dishes of rice grains and laboratory glassware', vi: 'Đĩa petri đựng hạt gạo và dụng cụ thủy tinh phòng thí nghiệm' },
  }),
  legacy({
    id: 'legacy.process.noodle', from: 'process_noodle.jpg', file: 'legacy/process-noodle.jpg', w: 102, h: 107,
    subject: 'Close-up of dried noodle strands.', alt: { th: 'เส้นแห้งระยะใกล้', en: 'Dried noodle strands, close up', vi: 'Cận cảnh sợi gạo khô' },
  }),
  legacy({
    id: 'legacy.contact.building', from: 'contact_img01.jpg', file: 'legacy/contact-building.jpg', w: 186, h: 210,
    subject: 'White factory building behind a rice field (2014 contact page; no signage legible).',
    alt: { th: 'อาคารโรงงานสีขาวหลังทุ่งนา', en: 'A white factory building behind a rice field', vi: 'Tòa nhà nhà máy màu trắng phía sau cánh đồng lúa' },
  }),
];

export const assetById = new Map(assets.map((a) => [a.id, a]));

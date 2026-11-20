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

/** "Archive" in every language: the company's own picture, but not current proof (Codex audit F18.1). */
const LEGACY_CREDIT: Localized = {
  th: 'ภาพเก่าจากเว็บไซต์ของบริษัท (2557)',
  en: 'Archive photo from the company’s 2014 website',
  vi: 'Ảnh lưu trữ từ website năm 2014 của công ty',
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
  currentness: 'archival',
  era: 'published on pankaothai.com by 2014; capture date unknown',
});

/**
 * Illustrative photographs (owner, 20 Nov 2026: "with photos to add to the website you may use the internet
 * to do research add what is appropriate for each page"). Free licences that allow commercial use; none
 * shows Pankao, its plant or its products, and each renders with an "Illustrative photo" tag and its
 * photographer's credit, in the preview only. Record: ../documents/photos/illustrative-2026-11-20/README.md.
 */
type StockSpec = {
  id: string; file: string; w: number; h: number; page: string; author: string;
  site: 'Pexels' | 'Unsplash' | 'Wikimedia Commons'; licence: string; licenceUrl: string;
  subject: string; alt: Localized; caption: Localized;
};
const LICENCE = {
  pexels: ['Pexels License', 'https://www.pexels.com/license/'],
  unsplash: ['Unsplash License', 'https://unsplash.com/license'],
  cc0: ['CC0 1.0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
} as const;
const stock = (s: StockSpec): Asset => ({
  id: s.id,
  file: s.file,
  sourceUrl: s.page,
  sourceOwner: `${s.author} (${s.site})`,
  retrievedAt: '2026-11-20',
  rightsBasis: 'licensed-stock',
  permissionReference: `${s.licence}: ${s.licenceUrl}`,
  subject: s.subject,
  actualPankaoOrGeneric: 'generic',
  width: s.w,
  height: s.h,
  maxDisplayWidth: s.w,
  alt: s.alt,
  caption: s.caption,
  credit: { th: `ภาพ: ${s.author} / ${s.site}`, en: `Photo: ${s.author} / ${s.site}`, vi: `Ảnh: ${s.author} / ${s.site}` },
  productionApproved: false,
  reviewOrExpiryDate: REVIEW,
  currentness: 'illustrative',
  era: 'licensed stock, retrieved 2026-11-20',
});
const P = LICENCE.pexels, U = LICENCE.unsplash;
const STOCK: Asset[] = [
  stock({ id: 'illus.ricefield', file: 'illus/ricefield-thailand.jpg', w: 1600, h: 1066, page: 'https://www.pexels.com/photo/scenic-view-of-lush-green-rice-fields-with-canal-38849279/', author: 'Sinan KRIYA', site: 'Pexels', licence: P[0], licenceUrl: P[1],
    subject: 'Green rice paddy with a field canal and sugar palms, Thailand.',
    alt: { th: 'ทุ่งนาเขียวขจีมีคูน้ำและต้นตาล', en: 'A green rice paddy with a field canal and sugar palms', vi: 'Cánh đồng lúa xanh với mương nước và hàng thốt nốt' },
    caption: { th: 'ทุ่งนาในประเทศไทย', en: 'Rice fields in Thailand', vi: 'Ruộng lúa ở Thái Lan' } }),
  stock({ id: 'illus.jasmine', file: 'illus/jasmine-rice.jpg', w: 1600, h: 1066, page: 'https://unsplash.com/photos/M5hX7319EBA', author: 'Kseniya Nekrasova', site: 'Unsplash', licence: U[0], licenceUrl: U[1],
    subject: 'Uncooked jasmine rice, full frame.',
    alt: { th: 'เมล็ดข้าวสารหอมมะลิ', en: 'Uncooked jasmine rice grains', vi: 'Hạt gạo lài chưa nấu' },
    caption: { th: 'ข้าวสารก่อนเข้าสู่การผลิต', en: 'Rice before it becomes noodles', vi: 'Gạo trước khi thành sợi' } }),
  stock({ id: 'illus.dish.vermicelli', file: 'illus/dish-vermicelli.jpg', w: 1600, h: 1068, page: 'https://unsplash.com/photos/V2rH_Ed0teI', author: 'Lee Milo', site: 'Unsplash', licence: U[0], licenceUrl: U[1],
    subject: 'Stir-fried rice vermicelli with mushroom, carrot and prawn.',
    alt: { th: 'เส้นหมี่ผัดกับเห็ด แครอท และกุ้ง ในชามใหญ่', en: 'A large bowl of rice vermicelli stir-fried with mushroom, carrot and prawns', vi: 'Một tô lớn bún gạo xào nấm, cà rốt và tôm' },
    caption: { th: 'ตัวอย่างเมนู: เส้นหมี่ผัดกุ้งกับผัก', en: 'Serving idea: rice vermicelli stir-fried with prawns and vegetables', vi: 'Gợi ý món: bún gạo xào tôm và rau' } }),
  stock({ id: 'illus.dish.padthai', file: 'illus/dish-padthai.jpg', w: 1600, h: 1066, page: 'https://www.pexels.com/photo/authentic-pad-thai-dish-with-shrimp-and-bean-sprouts-34723305/', author: 'UNDO KIM', site: 'Pexels', licence: P[0], licenceUrl: P[1],
    subject: 'Prawn pad thai with bean sprouts, peanuts and lime.',
    alt: { th: 'ผัดไทยกุ้ง ถั่วงอก ถั่วลิสง และมะนาว', en: 'Prawn pad thai with bean sprouts, peanuts and lime', vi: 'Pad thai tôm với giá, đậu phộng và chanh' },
    caption: { th: 'ตัวอย่างเมนู: ผัดไทยกุ้ง', en: 'Serving idea: prawn pad thai', vi: 'Gợi ý món: pad thai tôm' } }),
  stock({ id: 'illus.dish.guayjub', file: 'illus/dish-guayjub.jpg', w: 1600, h: 1200, page: 'https://commons.wikimedia.org/wiki/File:Kuaichap_(rolled_noodle_soup_with_intestines),_Chiang_Mai,_2018-07-28_(4).jpg', author: 'Bitterschoko', site: 'Wikimedia Commons', licence: LICENCE.cc0[0], licenceUrl: LICENCE.cc0[1],
    subject: 'Guay jub (rolled rice-noodle soup) with crispy pork and egg, Chiang Mai.',
    alt: { th: 'ก๋วยจั๊บเส้นม้วน หมูกรอบ และไข่', en: 'Guay jub: rolled rice noodles in broth with crispy pork and egg', vi: 'Guay jub: bánh cuộn trong nước dùng với heo giòn và trứng' },
    caption: { th: 'ตัวอย่างเมนู: ก๋วยจั๊บหมูกรอบ', en: 'Serving idea: guay jub with crispy pork', vi: 'Gợi ý món: guay jub với heo giòn' } }),
  stock({ id: 'illus.brownrice', file: 'illus/brown-rice.jpg', w: 1600, h: 1066, page: 'https://www.pexels.com/photo/extreme-close-up-photo-of-rice-grain-pile-18358661/', author: 'Petr Ganaj', site: 'Pexels', licence: P[0], licenceUrl: P[1],
    subject: 'Uncooked long-grain brown rice, macro.',
    alt: { th: 'เมล็ดข้าวกล้องระยะใกล้', en: 'Uncooked brown rice grains, close up', vi: 'Hạt gạo lứt chưa nấu, cận cảnh' },
    caption: { th: 'ข้าวกล้อง วัตถุดิบของเส้นข้าวกล้อง', en: 'Brown rice, the grain behind brown-rice noodles', vi: 'Gạo lứt, nguyên liệu của bún gạo lứt' } }),
  stock({ id: 'illus.nonthaburi', file: 'illus/nonthaburi-canal.jpg', w: 1600, h: 1064, page: 'https://www.pexels.com/photo/serene-canal-landscape-with-lush-greenery-38189663/', author: 'Worawat Li', site: 'Pexels', licence: P[0], licenceUrl: P[1],
    subject: 'A canal in Bang Khu Rat, Nonthaburi (not Sai Noi).',
    alt: { th: 'คลองกว้าง ริมฝั่งหญ้าเขียว ใต้ท้องฟ้าโปร่ง', en: 'A wide canal with green banks under an open sky', vi: 'Một con kênh rộng, bờ cỏ xanh dưới bầu trời rộng' },
    caption: { th: 'คลองในจังหวัดนนทบุรี (บางคูรัด)', en: 'A canal in Nonthaburi (Bang Khu Rat)', vi: 'Một con kênh ở Nonthaburi (Bang Khu Rat)' } }),
];

export const assets: Asset[] = [
  legacy({
    id: 'legacy.logo', from: 'pankao_logo.gif', file: 'legacy/logo.png', w: 88, h: 61,
    subject: 'PK oval mark from the 2014 header (shown cropped to the oval; never upscaled or redrawn).',
    alt: { th: '', en: '', vi: '' },
    rasterText: 'The pre-2017 company name in Thai and English, in the 2014 artwork (not transcribed; too small to read at display size)',
    crop: 'Elliptical clip to the oval only; the brown page ground is outside the mark.',
  }),
  legacy({
    id: 'legacy.hero.pack', from: 'mr_noodles_package.jpg', file: 'legacy/hero-pack.jpg', w: 630, h: 786,
    subject: 'The blue Mr. Noodles dried rice-vermicelli pack (crop from the 2014 two-pack photograph).',
    alt: {
      th: 'ถุงเส้นหมี่อบแห้งมิสเตอร์นู้ดเดิ้ล ถุงใสแถบสีน้ำเงิน',
      en: 'A clear Mr. Noodles bag of dried rice vermicelli with blue stripes',
      vi: 'Túi bún gạo khô Mr. Noodles trong suốt, sọc xanh dương',
    },
    rasterText: 'Pack print: Mr.NOODLES, BEST QUALITY, 米粉, เส้นหมี่อบแห้ง, RICE VERMICELLI',
    crop: 'Edit log (20 Nov 2026): x 15–225, y 0–262 of the 460×380 original (the blue pack; the generic food strip excluded); enlarged 3× (Lanczos) with contrast-adaptive sharpening; the flat lime backdrop keyed out and replaced with cream #F6EEDF; the cut-off lower 20% faded into the cream. Pack, print and noodles unaltered (background only).',
  }),
  legacy({
    id: 'legacy.mrnoodles.pack', from: 'mr_noodles_package.jpg', file: 'legacy/mrnoodles-packs.jpg', w: 920, h: 524,
    subject: 'Two Mr. Noodles packs: blue rice vermicelli, green rice stick.',
    alt: {
      th: 'ถุงมิสเตอร์นู้ดเดิ้ลสองแบบ: เส้นหมี่อบแห้งแถบสีน้ำเงิน และเส้นจันทร์อบแห้งแถบสีเขียว',
      en: 'Two Mr. Noodles bags: dried rice vermicelli with blue stripes and dried rice stick with green stripes',
      vi: 'Hai túi Mr. Noodles: bún gạo khô sọc xanh dương và bánh phở khô sọc xanh lá',
    },
    rasterText: 'Pack print incl. the former English company name and PRODUCT OF THAILAND (not transcribed)',
    crop: 'Edit log (20 Nov 2026): top 262 px of the 460×380 original (the generic food strip excluded); enlarged 2× (Lanczos) with contrast-adaptive sharpening; the flat lime backdrop keyed out and replaced with cream #F6EEDF; the cut-off lower 24% faded into the cream. Packs, print and noodles unaltered (background only).',
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
      id: `legacy.tile.${key}.dish`, from: `${stem}_bg.jpg`, file: `legacy/${key}-dish.jpg`, w: 632, h: 550,
      subject: `Prepared dish for ${stem.replace('_', ' ')} (2014 page background, used whole at its own size).`,
      alt: dishAlt,
      crop: 'Edit log (20 Nov 2026): the whole 460×400 background, lightly deblocked and enlarged 1.37× (Lanczos) with contrast-adaptive sharpening so no card stretches it; nothing generated.',
    }),
  ]),
  legacy({
    id: 'legacy.process.rice', from: 'process_rice.jpg', file: 'legacy/process-rice.jpg', w: 306, h: 321,
    crop: 'Edit log (20 Nov 2026): the 102×107 original deblocked, lightly denoised and enlarged 3× in two Lanczos steps with contrast-adaptive sharpening; nothing generated.',
    subject: 'Rice grains with a rice stalk.', alt: { th: 'เมล็ดข้าวกับรวงข้าว', en: 'Rice grains and a rice stalk', vi: 'Hạt gạo và bông lúa' },
  }),
  legacy({
    id: 'legacy.process.factory', from: 'process_factory.jpg', file: 'legacy/process-factory.jpg', w: 632, h: 714,
    crop: 'Edit log (20 Nov 2026): the 186×210 original deblocked, lightly denoised and enlarged 3.4× in two Lanczos steps with contrast-adaptive sharpening; nothing generated.',
    subject: 'Plant interior: a green-and-steel machine tower with stairs (2014).',
    alt: { th: 'เครื่องจักรในโรงงาน โครงเหล็กสีเขียวพร้อมบันได', en: 'Production machinery inside the plant: a green steel tower with stairs', vi: 'Máy móc trong nhà máy: tháp thép xanh có cầu thang' },
  }),
  legacy({
    id: 'legacy.process.drying', from: 'history_img01.jpg', file: 'legacy/process-drying.jpg', w: 632, h: 714,
    crop: 'Edit log (20 Nov 2026): the 186×210 original deblocked, lightly denoised and enlarged 3.4× in two Lanczos steps with contrast-adaptive sharpening; nothing generated.',
    subject: 'Skeins of pale dried noodles laid on trays (2014 history page).',
    alt: { th: 'เส้นหมี่เป็นไจวางบนถาด', en: 'Skeins of pale noodles laid out on trays', vi: 'Những bó sợi gạo trắng xếp trên khay' },
  }),
  legacy({
    id: 'legacy.process.lab', from: 'process_lab.jpg', file: 'legacy/process-lab.jpg', w: 306, h: 321,
    crop: 'Edit log (20 Nov 2026): the 102×107 original deblocked, lightly denoised and enlarged 3× in two Lanczos steps with contrast-adaptive sharpening; nothing generated.',
    subject: 'Petri dishes of rice grains and lab glassware.', alt: { th: 'จานเพาะเชื้อใส่เมล็ดข้าวและเครื่องแก้วในห้องปฏิบัติการ', en: 'Petri dishes of rice grains and laboratory glassware', vi: 'Đĩa petri đựng hạt gạo và dụng cụ thủy tinh phòng thí nghiệm' },
  }),
  legacy({
    id: 'legacy.process.noodle', from: 'process_noodle.jpg', file: 'legacy/process-noodle.jpg', w: 306, h: 321,
    crop: 'Edit log (20 Nov 2026): the 102×107 original deblocked, lightly denoised and enlarged 3× in two Lanczos steps with contrast-adaptive sharpening; nothing generated.',
    subject: 'Close-up of dried noodle strands.', alt: { th: 'เส้นแห้งระยะใกล้', en: 'Dried noodle strands, close up', vi: 'Cận cảnh sợi gạo khô' },
  }),
  legacy({
    id: 'legacy.contact.building', from: 'contact_img01.jpg', file: 'legacy/contact-building.jpg', w: 632, h: 714,
    crop: 'Edit log (20 Nov 2026): the 186×210 original deblocked, lightly denoised and enlarged 3.4× in two Lanczos steps with contrast-adaptive sharpening; nothing generated.',
    subject: 'White factory building behind a rice field (2014 contact page; no signage legible).',
    alt: { th: 'อาคารโรงงานสีขาวหลังทุ่งนา', en: 'A white factory building behind a rice field', vi: 'Tòa nhà nhà máy màu trắng phía sau cánh đồng lúa' },
  }),
  ...STOCK,
];

export const assetById = new Map(assets.map((a) => [a.id, a]));

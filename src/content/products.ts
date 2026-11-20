/**
 * Product families. Stable IDs; slugs are shared across locales (one canonical product ID
 * per slug). Every SKU-level field is `null` until a current label or specification is
 * supplied — null renders as "not yet published", never as zero, "no" or "free from".
 */
import { CHECKED } from './facts.ts';
import { sampleTechnical } from './samples.ts';
import type { Fact, Localized, Product } from './types.ts';

function f<T>(id: string, value: T | Localized<T>, status: Fact<T>['status'], sourceIds: string[], note?: string, visibility: Fact<T>['visibility'] = 'public'): Fact<T> {
  return { id, value, status, sourceIds, checkedAt: CHECKED, visibility, ownerApproved: false, note };
}

export const products: Product[] = [
  {
    id: 'rice-vermicelli',
    slug: 'rice-vermicelli',
    format: 'vermicelli',
    strand: 'hair',
    tone: 'gold',
    name: f('p.vermicelli.name', { th: 'เส้นหมี่อบแห้ง', en: 'Rice vermicelli', vi: 'Bún gạo khô' }, 'government-current', ['S03', 'S12']),
    altNames: { th: ['เส้นหมี่'], en: ['dried rice vermicelli', 'rice noodles (fine)'], vi: ['bún gạo', 'bún khô'] },
    brand: f('p.vermicelli.brand', { th: 'มิสเตอร์นู้ดเดิ้ล และ OEM', en: 'Mr. Noodles and OEM', vi: 'Mr. Noodles và OEM' }, 'first-party-stale', ['S12']),
    summary: f(
      'p.vermicelli.summary',
      {
        th: 'เส้นกลม สีขาว เส้นเล็กและยาวสม่ำเสมอ ทำจากข้าว ใช้ได้กับอาหารหลายประเภท',
        en: 'Fine, round, white rice noodles, close in size to angel-hair pasta. Fine in texture and at their best in broth.',
        vi: 'Sợi gạo trắng, tròn và nhỏ đều như sợi chỉ. Mềm mịn, ngon nhất khi dùng với nước dùng.',
      },
      'first-party-stale',
      ['S12'],
    ),
    uses: f('p.vermicelli.uses', { th: ['อาหารประเภทน้ำ', 'เมนูผัด', 'อาหารหลายประเภท'], en: ['Noodle soups', 'Stir-fries'], vi: ['Món nước', 'Món xào'] }, 'first-party-stale', ['S12']),
    technical: sampleTechnical('rice-vermicelli'),
    brandedOrOem: f('p.vermicelli.channel', { th: 'แบรนด์ของเรา และรับผลิต OEM', en: 'Own brand and OEM', vi: 'Thương hiệu riêng và OEM' }, 'government-current', ['S03', 'S12']),
    claimIds: ['c.p.mrnoodles.ricewhite'],
    documentIds: [],
    media: { pack: 'illus.dry.vermicelli', dish: 'illus.dish.vermicelli' },
    related: ['rice-stick-pad-thai', 'mr-noodles'],
    legacyStems: ['rice_vermicelli'],
  },
  {
    id: 'rice-stick-pad-thai',
    slug: 'rice-stick-pad-thai',
    format: 'rice-stick',
    strand: 'flat',
    tone: 'wheat',
    name: f('p.ricestick.name', { th: 'เส้นจันทร์อบแห้ง', en: 'Rice stick', vi: 'Bánh phở khô' }, 'government-current', ['S03', 'S12']),
    altNames: {
      th: ['เส้นเล็ก', 'เส้นผัดไทย', 'ก๋วยเตี๋ยวจันทร์'],
      en: ['Chanthaburi rice noodles', 'Pad Thai noodles', 'flat rice noodles'],
      vi: ['hủ tiếu khô', 'sợi Pad Thai', 'sợi kiểu Chanthaburi'],
    },
    brand: f('p.ricestick.brand', { th: 'มิสเตอร์นู้ดเดิ้ล และ OEM', en: 'Mr. Noodles and OEM', vi: 'Mr. Noodles và OEM' }, 'first-party-stale', ['S12']),
    summary: f(
      'p.ricestick.summary',
      {
        th: 'เส้นแบน กว้างกว่าเส้นหมี่ ตัดเป็นท่อนให้รับประทานง่าย เมื่อลวกแล้วเหนียวกว่าเส้นก๋วยเตี๋ยวชนิดอื่น',
        en: 'Flat rice noodles, wider than vermicelli and cut to length. Chewier than finer rice noodles once blanched, and good with or without broth.',
        vi: 'Sợi gạo dẹt, to hơn bún và được cắt thành đoạn. Dai hơn các loại sợi nhỏ sau khi trụng, ngon cả món nước lẫn món khô.',
      },
      'first-party-stale',
      ['S12'],
    ),
    uses: f('p.ricestick.uses', { th: ['ผัดไทย', 'ก๋วยเตี๋ยวเรือ', 'ก๋วยเตี๋ยวน้ำตก'], en: ['Pad Thai', 'Boat noodles', 'Noodle soups'], vi: ['Pad Thai', 'Hủ tiếu nước', 'Phở xào'] }, 'first-party-stale', ['S12']),
    technical: sampleTechnical('rice-stick-pad-thai'),
    brandedOrOem: f('p.ricestick.channel', { th: 'แบรนด์ของเรา และรับผลิต OEM', en: 'Own brand and OEM', vi: 'Thương hiệu riêng và OEM' }, 'government-current', ['S03', 'S12']),
    claimIds: ['c.p.mrnoodles.ricewhite'],
    documentIds: [],
    media: { pack: 'illus.dry.ricestick', dish: 'illus.dish.padthai' },
    related: ['rice-vermicelli', 'rice-flake-guay-jub'],
    legacyStems: ['rice_stick'],
  },
  {
    id: 'rice-flake-guay-jub',
    slug: 'rice-flake-guay-jub',
    format: 'flake',
    strand: 'sheet',
    tone: 'cream',
    name: f('p.flake.name', { th: 'ก๋วยจั๊บ', en: 'Rice flake (Guay Jub)', vi: 'Bánh đa Guay Jub' }, 'first-party-stale', ['S12', 'S05']),
    altNames: { th: ['เส้นก๋วยจั๊บแผ่น'], en: ['Guay Jub sheets', 'rice flake noodles'], vi: ['bánh đa', 'hủ tiếu cuộn'] },
    brand: null,
    summary: f(
      'p.flake.summary',
      {
        th: 'แผ่นสี่เหลี่ยมหรือสามเหลี่ยม เมื่อต้มในน้ำร้อนจะม้วนตัวเป็นหลอด',
        en: 'Square or triangular sheets that curl into rolls in boiling water.',
        vi: 'Miếng hình vuông hoặc tam giác, tự cuộn tròn lại khi cho vào nước sôi.',
      },
      'first-party-stale',
      ['S12'],
    ),
    uses: f('p.flake.uses', { th: ['ก๋วยจั๊บ', 'ผัดขี้เมา', 'เมนูเส้นผัด'], en: ['Guay Jub (five-spice pork soup)', 'Pad Kee Mao', 'Fried-noodle dishes'], vi: ['Súp Guay Jub ngũ vị', 'Pad Kee Mao', 'Các món xào'] }, 'first-party-stale', ['S12']),
    technical: sampleTechnical('rice-flake-guay-jub'),
    brandedOrOem: null,
    claimIds: [],
    documentIds: [],
    media: { pack: 'legacy.tile.flake', dish: 'illus.dish.guayjub' },
    related: ['rice-stick-pad-thai', 'brown-rice-noodles'],
    legacyStems: ['rice_flake'],
  },
  {
    id: 'brown-rice-noodles',
    slug: 'brown-rice-noodles',
    format: 'brown-rice',
    strand: 'flat',
    tone: 'brown',
    name: f('p.brown.name', { th: 'เส้นข้าวกล้อง', en: 'Brown-rice noodles', vi: 'Bún gạo lứt' }, 'first-party-stale', ['S12', 'S05', 'S06']),
    altNames: { th: ['ก๋วยเตี๋ยวข้าวกล้อง'], en: ['brown rice noodles'], vi: ['sợi gạo lứt'] },
    brand: null,
    summary: f(
      'p.brown.summary',
      {
        th: 'เส้นก๋วยเตี๋ยวที่ผลิตจากข้าวกล้อง ซึ่งไม่ผ่านการขัดสี',
        en: 'Rice noodles made from unpolished brown rice.',
        vi: 'Sợi gạo được làm từ gạo lứt chưa xát trắng.',
      },
      'first-party-stale',
      ['S12'],
    ),
    uses: f('p.brown.uses', { th: ['เมนูผัด', 'อาหารประเภทน้ำ'], en: ['Stir-fries', 'Noodle soups'], vi: ['Phở xào', 'Món nước'] }, 'first-party-stale', ['S12']),
    technical: sampleTechnical('brown-rice-noodles'),
    brandedOrOem: null,
    claimIds: ['c.p.brown.nutrition'],
    documentIds: [],
    media: { pack: 'legacy.tile.brown', dish: 'legacy.tile.brown.dish' },
    related: ['rice-vermicelli', 'rice-flake-guay-jub'],
    legacyStems: ['rice_brown'],
  },
  {
    id: 'mr-noodles',
    slug: 'mr-noodles',
    format: 'brand',
    strand: 'mixed',
    tone: 'gold',
    name: f('p.mrnoodles.name', { th: 'มิสเตอร์นู้ดเดิ้ล', en: 'Mr. Noodles', vi: 'Mr. Noodles' }, 'first-party-stale', ['S12', 'S09']),
    altNames: { th: ['Mr. Noodles'], en: ['Mr. Noodles rice noodles'], vi: ['Mr. Noodles'] },
    brand: f('p.mrnoodles.brand', { th: 'มิสเตอร์นู้ดเดิ้ล', en: 'Mr. Noodles', vi: 'Mr. Noodles' }, 'first-party-stale', ['S12']),
    summary: f(
      'p.mrnoodles.summary',
      {
        th: 'แบรนด์ของเราเองสำหรับเส้นหมี่อบแห้งและเส้นจันทร์อบแห้ง บรรจุในถุงใส แถบสีน้ำเงินคือเส้นหมี่ แถบสีเขียวคือเส้นจันทร์',
        en: 'Our own brand of dried rice vermicelli and dried rice stick, in clear bags: blue stripes for vermicelli, green for rice stick.',
        vi: 'Thương hiệu riêng của chúng tôi cho bún gạo khô và bánh phở khô, đựng trong túi trong: sọc xanh dương là bún, sọc xanh lá là bánh phở.',
      },
      'first-party-stale',
      ['S12'],
      'Pack colours observed on the 2014 pack photograph; current pack design to confirm.',
    ),
    uses: f('p.mrnoodles.uses', { th: ['อาหารได้หลากหลาย'], en: ['Everyday Thai noodle dishes'], vi: ['Nhiều món ăn hằng ngày'] }, 'first-party-stale', ['S12']),
    technical: sampleTechnical('mr-noodles'),
    brandedOrOem: f('p.mrnoodles.channel', { th: 'แบรนด์ของเรา', en: 'Own brand', vi: 'Thương hiệu riêng' }, 'first-party-stale', ['S12']),
    claimIds: ['c.p.mrnoodles.ricewhite', 'c.p.mrnoodles.baked'],
    documentIds: [],
    media: { pack: 'web.packs.pair', dish: 'legacy.mrnoodles.tile.dish' },
    related: ['rice-vermicelli', 'rice-stick-pad-thai'],
    legacyStems: ['mrnoodles'],
  },
];

/** Verification slots (brief 3.3): never public until confirmed; shown as review cards. */
export const productSlots: { id: string; name: Localized; sourceIds: string[]; note: string }[] = [
  { id: 'slot.rice-pasta', name: { th: 'พาสต้าข้าว / พาสต้าอบแห้ง', en: 'Dried rice pasta', vi: 'Pasta gạo khô' }, sourceIds: ['S03', 'S06', 'S05', 'S14'], note: 'Named by DIPROM 2024 and the 2017 catalogue; FDA list shows rice-pasta registrations. Strongest candidate for a new product page.' },
  { id: 'slot.pumpkin', name: { th: 'เส้นฟักทอง', en: 'Pumpkin noodles', vi: 'Sợi bí đỏ' }, sourceIds: ['S12', 'S05'], note: '2014 Thai home page list and Yellow Pages; no page, no FDA record found.' },
  { id: 'slot.yanang', name: { th: 'เส้นใบย่านาง', en: 'Yanang-leaf noodles', vi: 'Sợi lá yanang' }, sourceIds: ['S05'], note: 'Yellow Pages only.' },
  { id: 'slot.widths', name: { th: 'เส้นจันทร์ขนาดอื่น ๆ', en: 'Rice stick in other widths', vi: 'Bánh phở các cỡ khác' }, sourceIds: ['S12'], note: '2014 lists เส้นเล็ก / เส้นผัดไทย / เส้นจันทร์; widths in mm unknown.' },
  { id: 'slot.instant', name: { th: 'ก๋วยเตี๋ยวกึ่งสำเร็จรูป / ก๋วยเตี๋ยวเรือ', en: 'Semi-instant and boat-noodle kits', vi: 'Hủ tiếu ăn liền' }, sourceIds: ['S14'], note: 'FDA registrations via TaeJing, partly under other brands; OEM confidentiality applies.' },
  { id: 'slot.kanomjeen', name: { th: 'ขนมจีน', en: 'Khanom jeen', vi: 'Bún kiểu Thái (khanom jeen)' }, sourceIds: ['S14'], note: 'FDA registrations via TaeJing; not on the 2014 site.' },
];

export const productById = new Map(products.map((p) => [p.id, p]));
export const formatProducts = products.filter((p) => p.format !== 'brand');

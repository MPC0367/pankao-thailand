/**
 * O2 sample values for the client presentation preview ("generate default info", owner,
 * 19 Nov 2026). Typical values for dried rice noodles, written so the preview reads as a
 * finished site. Every record has status 'sample' and source 'O2-SAMPLE': it renders only
 * in the preview (with a small "Sample" tag unless PANKAO_SAMPLE_TAGS=off), can never be
 * owner-approved, and never reaches a production build. Replace each with the company's
 * confirmed value (and its own status) when it arrives.
 */
import type { Certificate, DocumentRecord, Fact, Localized, Product } from './types.ts';

const D = '2026-11-19';
export const SAMPLE_SOURCE = 'O2-SAMPLE';

function s<T>(id: string, value: T | Localized<T>): Fact<T> {
  return { id, value, status: 'sample', sourceIds: [SAMPLE_SOURCE], checkedAt: D, visibility: 'public', ownerApproved: false, note: 'O2 sample value for the preview; replace with the confirmed value.' };
}
const L = (th: string, en: string, vi: string): Localized => ({ th, en, vi });
const LA = (th: string[], en: string[], vi: string[]): Localized<string[]> => ({ th, en, vi });

const RICE = L('ข้าวเจ้า น้ำ', 'Rice, water', 'Gạo, nước');
/** What the back of the current 454 g Mr. Noodles rice-stick pack prints (shop photograph, 20 Nov 2026,
 *  ../documents/photos/web-2026-11-20/): still a sample until the company confirms it for each product. */
const RICE_TAPIOCA = L('ข้าวขาว 90% แป้งมันสำปะหลัง 10% (ตามฉลากถุง 454 ก.)', 'White rice 90%, tapioca starch 10% (as printed on the 454 g pack)', 'Gạo trắng 90%, tinh bột sắn 10% (theo nhãn túi 454 g)');
const ALLERGEN = L('ไม่มีสารก่อภูมิแพ้ที่ต้องแจ้งบนฉลาก', 'No declared allergens', 'Không có chất gây dị ứng phải khai báo');
const STORAGE = L('เก็บในที่แห้งและเย็น หลีกเลี่ยงแสงแดด ปิดถุงให้สนิทหลังเปิด', 'Keep in a cool, dry place away from sunlight; reseal after opening', 'Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng; đóng kín sau khi mở');
const ORIGIN = L('ประเทศไทย', 'Thailand', 'Thái Lan');
const SHELF24 = L('24 เดือนนับจากวันผลิต', '24 months from production', '24 tháng kể từ ngày sản xuất');
const PACKS = LA(['200 ก.', '400 ก.', '454 ก.', '1 กก.', '5 กก. (ฟู้ดเซอร์วิส)'], ['200 g', '400 g', '454 g', '1 kg', '5 kg (food service)'], ['200 g', '400 g', '454 g', '1 kg', '5 kg (dịch vụ ăn uống)']);

export function sampleTechnical(id: string): Product['technical'] {
  const base = {
    ingredients: s(`sx.${id}.ingredients`, RICE),
    allergen: s(`sx.${id}.allergen`, ALLERGEN),
    packWeights: s<string[]>(`sx.${id}.packs`, PACKS),
    shelfLife: s(`sx.${id}.shelf`, SHELF24),
    storage: s(`sx.${id}.storage`, STORAGE),
    origin: s(`sx.${id}.origin`, ORIGIN),
    caseConfiguration: s(`sx.${id}.case`, L('400 ก. × 30 ถุงต่อลัง', '30 × 400 g per carton', '30 túi × 400 g mỗi thùng')),
    cooking: null as Fact<string> | null,
    widthMm: null as Fact<string> | null,
  };
  switch (id) {
    case 'rice-vermicelli':
      return { ...base,
        widthMm: s(`sx.${id}.width`, L('ประมาณ 0.8 มม.', 'About 0.8 mm', 'Khoảng 0,8 mm')),
        cooking: s(`sx.${id}.cooking`, L('แช่น้ำอุณหภูมิห้อง 10 นาที หรือลวกในน้ำเดือด 1–2 นาที แล้วสะเด็ดน้ำ', 'Soak in room-temperature water for 10 minutes, or blanch in boiling water for 1–2 minutes, then drain.', 'Ngâm nước ở nhiệt độ phòng 10 phút, hoặc trụng nước sôi 1–2 phút rồi để ráo.')) };
    case 'rice-stick-pad-thai':
      return { ...base,
        ingredients: s(`sx.${id}.ingredients`, RICE_TAPIOCA),
        widthMm: s(`sx.${id}.width`, L('3 มม. (เส้นเล็ก) · 5 มม. (เส้นผัดไทย) · 10 มม. (เส้นใหญ่)', '3 mm (small) · 5 mm (Pad Thai) · 10 mm (large)', '3 mm (nhỏ) · 5 mm (Pad Thai) · 10 mm (lớn)')),
        cooking: s(`sx.${id}.cooking`, L('แช่น้ำอุ่น 15–20 นาทีจนนิ่ม หรือลวก 2–3 นาที', 'Soak in warm water for 15–20 minutes until soft, or blanch for 2–3 minutes.', 'Ngâm nước ấm 15–20 phút đến khi mềm, hoặc trụng 2–3 phút.')) };
    case 'rice-flake-guay-jub':
      return { ...base,
        packWeights: s<string[]>(`sx.${id}.packs`, LA(['200 ก.', '400 ก.', '1 กก.'], ['200 g', '400 g', '1 kg'], ['200 g', '400 g', '1 kg'])),
        caseConfiguration: s(`sx.${id}.case`, L('200 ก. × 40 ถุงต่อลัง', '40 × 200 g per carton', '40 túi × 200 g mỗi thùng')),
        widthMm: s(`sx.${id}.width`, L('แผ่นประมาณ 3 × 3 ซม.', 'Sheets about 3 × 3 cm', 'Miếng khoảng 3 × 3 cm')),
        cooking: s(`sx.${id}.cooking`, L('ต้มในน้ำเดือด 3–4 นาทีจนแผ่นม้วนตัว', 'Boil for 3–4 minutes until the sheets roll.', 'Luộc 3–4 phút đến khi miếng bánh cuộn lại.')) };
    case 'brown-rice-noodles':
      return { ...base,
        ingredients: s(`sx.${id}.ingredients`, L('ข้าวกล้อง น้ำ', 'Brown rice, water', 'Gạo lứt, nước')),
        packWeights: s<string[]>(`sx.${id}.packs`, LA(['200 ก.', '400 ก.'], ['200 g', '400 g'], ['200 g', '400 g'])),
        shelfLife: s(`sx.${id}.shelf`, L('12 เดือนนับจากวันผลิต', '12 months from production', '12 tháng kể từ ngày sản xuất')),
        widthMm: s(`sx.${id}.width`, L('ประมาณ 5 มม.', 'About 5 mm', 'Khoảng 5 mm')),
        cooking: s(`sx.${id}.cooking`, L('ลวกในน้ำเดือด 3–5 นาที แล้วสะเด็ดน้ำ', 'Blanch in boiling water for 3–5 minutes, then drain.', 'Trụng nước sôi 3–5 phút rồi để ráo.')) };
    default: // mr-noodles
      return { ...base,
        ingredients: s(`sx.${id}.ingredients`, RICE_TAPIOCA),
        packWeights: s<string[]>(`sx.${id}.packs`, LA(['400 ก.', '454 ก.'], ['400 g', '454 g'], ['400 g', '454 g'])),
        widthMm: s(`sx.${id}.width`, L('เส้นหมี่ประมาณ 0.8 มม. · เส้นจันทร์ 3–5 มม.', 'Vermicelli about 0.8 mm · rice stick 3–5 mm', 'Bún khoảng 0,8 mm · bánh phở 3–5 mm')),
        cooking: s(`sx.${id}.cooking`, L('ดูวิธีปรุงบนหน้าของเส้นแต่ละแบบ', 'See each format’s page for preparation.', 'Xem cách chế biến ở trang của từng loại.')) };
  }
}

export const sampleCertificates: Certificate[] = [
  ['brc', 'BRCGS Global Standard Food Safety', 'food-safety'],
  ['haccp', 'HACCP (Codex Alimentarius)', 'food-safety'],
  ['gmp', 'GMP — Good Manufacturing Practice', 'food-safety'],
  ['halal', 'Halal', 'market-religious'],
].map(([k, std, group], i) => ({
  id: `sample.cert.${k}`,
  standard: std!,
  scope: L('การผลิตและบรรจุเส้นหมี่และเส้นก๋วยเตี๋ยวอบแห้ง', 'Manufacture and packing of dried rice noodles', 'Sản xuất và đóng gói sợi gạo khô'),
  operator: 'Pankao Thailand',
  facility: 'Sai Noi, Nonthaburi',
  issuer: 'Certification body (sample)',
  number: `SAMPLE-${String(i + 1).padStart(4, '0')}`,
  issuedOn: '2026-03-01',
  expiresOn: '2027-02-28',
  status: 'sample',
  markUseApproved: false,
  sourceIds: [SAMPLE_SOURCE],
  ownerApproved: false,
  group: group as Certificate['group'],
}));

export const sampleDocuments: DocumentRecord[] = [
  { id: 'sample.doc.profile', title: L('ข้อมูลบริษัท', 'Company profile', 'Hồ sơ công ty'), locale: 'multi', version: '2026.1', date: '2026-11-01', fileType: 'PDF', bytes: 2_450_000, file: '', scope: L('โรงงาน กระบวนการผลิต และผลิตภัณฑ์', 'Factory, process and product range', 'Nhà máy, quy trình và sản phẩm'), productIds: [], ownerApproved: false, status: 'sample' },
  { id: 'sample.doc.spec.vermicelli', title: L('ข้อมูลจำเพาะ เส้นหมี่อบแห้ง 400 ก.', 'Specification — rice vermicelli 400 g', 'Thông số — bún gạo khô 400 g'), locale: 'en', version: '1.0', date: '2026-11-01', fileType: 'PDF', bytes: 640_000, file: '', scope: L('ส่วนผสม โภชนาการ การบรรจุ', 'Ingredients, nutrition, packing', 'Thành phần, dinh dưỡng, đóng gói'), productIds: ['rice-vermicelli', 'mr-noodles'], ownerApproved: false, status: 'sample' },
  { id: 'sample.doc.spec.ricestick', title: L('ข้อมูลจำเพาะ เส้นจันทร์อบแห้ง 400 ก.', 'Specification — rice stick 400 g', 'Thông số — bánh phở khô 400 g'), locale: 'en', version: '1.0', date: '2026-11-01', fileType: 'PDF', bytes: 655_000, file: '', scope: L('ขนาดเส้น ส่วนผสม การบรรจุ', 'Widths, ingredients, packing', 'Độ rộng, thành phần, đóng gói'), productIds: ['rice-stick-pad-thai', 'mr-noodles'], ownerApproved: false, status: 'sample' },
];

/** Sample heritage timeline: stories from the 2014 site / 2017 catalogue and dated public records, worded neutrally. */
export const sampleTimeline: Fact<{ when: Localized; what: Localized }>[] = [
  s('sx.tl.origin', { when: L('จุดเริ่มต้น', 'The beginning', 'Khởi đầu'), what: L('ร้านทำเส้นริมคลองบางหลวง ฝั่งธนบุรี', 'A noodle-making shop beside Bang Luang canal, Thonburi', 'Một cửa hàng làm sợi bên kênh Bang Luang, Thonburi') }),
  s('sx.tl.brand', { when: L('มิสเตอร์นู้ดเดิ้ล', 'Mr. Noodles', 'Mr. Noodles'), what: L('แบรนด์เส้นหมี่และเส้นจันทร์อบแห้งของเราเอง', 'Our own brand of dried rice vermicelli and rice stick', 'Thương hiệu bún và bánh phở khô của chúng tôi') }),
  s('sx.tl.2007', { when: L('2550', '2007', '2007'), what: L('จดทะเบียนบริษัทที่ไทรน้อย นนทบุรี', 'Company registered in Sai Noi, Nonthaburi', 'Đăng ký công ty tại Sai Noi, Nonthaburi') }),
  s('sx.tl.2017', { when: L('2560', '2017', '2017'), what: L('ปรับชื่อบริษัทเป็นชื่อปัจจุบัน', 'Company name updated to its present form', 'Đổi tên công ty thành tên hiện nay') }),
  s('sx.tl.2024', { when: L('2567', '2024', '2024'), what: L('ร่วมโครงการพัฒนาดิจิทัลอุตสาหกรรมอาหาร ของกรมส่งเสริมอุตสาหกรรม', 'Joined the Department of Industrial Promotion’s digital programme for food manufacturers', 'Tham gia chương trình số hóa ngành thực phẩm của Cục Xúc tiến Công nghiệp') }),
];

/** Sample OEM terms shown "at a glance" on the OEM page. */
export const sampleOemTerms: Fact<{ label: Localized; value: Localized }>[] = [
  s('sx.oem.moq', { label: L('ขั้นต่ำการสั่งผลิต', 'Minimum order', 'Đơn hàng tối thiểu'), value: L('เริ่มต้นหนึ่งพาเลทต่อรูปแบบเส้น', 'From one pallet per format', 'Từ một pallet cho mỗi loại sợi') }),
  s('sx.oem.lead', { label: L('ระยะเวลาผลิต', 'Lead time', 'Thời gian sản xuất'), value: L('30–45 วันหลังอนุมัติอาร์ตเวิร์ก', '30–45 days after artwork approval', '30–45 ngày sau khi duyệt thiết kế bao bì') }),
  s('sx.oem.samples', { label: L('ตัวอย่างสินค้า', 'Samples', 'Mẫu sản phẩm'), value: L('มีตัวอย่างสำหรับผู้ซื้อที่ผ่านการพิจารณา', 'Sample packs for qualified buyers', 'Có mẫu cho khách hàng đủ điều kiện') }),
  s('sx.oem.packaging', { label: L('บรรจุภัณฑ์', 'Packaging', 'Bao bì'), value: L('ถุงขายปลีก 200 ก.–1 กก. ถุงฟู้ดเซอร์วิส 3–10 กก. หรือตามสเปกของคุณ', 'Retail bags 200 g–1 kg, food-service bags 3–10 kg, or to your specification', 'Túi bán lẻ 200 g–1 kg, túi dịch vụ ăn uống 3–10 kg, hoặc theo yêu cầu') }),
  s('sx.oem.docs', { label: L('เอกสาร', 'Documents', 'Tài liệu'), value: L('ข้อมูลจำเพาะ ใบรับรอง และเอกสารส่งออกตามคำขอ', 'Specifications, certificates and export documents on request', 'Thông số, chứng nhận và chứng từ xuất khẩu theo yêu cầu') }),
  s('sx.oem.markets', { label: L('ตลาด', 'Markets', 'Thị trường'), value: L('ในประเทศ เอเชีย อเมริกา ยุโรป และออสเตรเลีย', 'Thailand, Asia, the Americas, Europe and Australia', 'Thái Lan, châu Á, châu Mỹ, châu Âu và Úc') }),
];

export const sampleHours = s('sx.hours', L('จันทร์–เสาร์ 08:00–18:00 น.', 'Monday–Saturday, 08:00–18:00', 'Thứ Hai–Thứ Bảy, 08:00–18:00'));

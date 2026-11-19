/**
 * The truth ledger for company-level facts (identity, contact, OEM, markets, process,
 * heritage). Product facts live in products.ts, claims in claims.ts.
 *
 * Status vocabulary: types.ts → EvidenceStatus. Nothing here is owner-approved yet:
 * every `ownerApproved: false` is a production blocker listed by `npm run gate`.
 */
import type { Fact, Localized } from './types.ts';

export const CHECKED = '2026-11-19';

type Opts = Partial<Omit<Fact<unknown>, 'id' | 'value'>>;

function fact<T>(id: string, value: T | Localized<T>, opts: Opts & Pick<Fact<T>, 'status' | 'sourceIds'>): Fact<T> {
  return { visibility: 'public', ownerApproved: false, checkedAt: CHECKED, ...opts, id, value } as Fact<T>;
}

/* ---------------- identity ---------------- */

export const brandName = fact<string>(
  'brand.name',
  { th: 'ปั้นข้าวไทย', en: 'Pankao Thailand', vi: 'Pankao Thailand' },
  {
    status: 'unverified',
    sourceIds: ['S12'],
    // A reversible working label (brief 0.2). Public in the preview so the site can be read,
    // marked in review notes, and a release blocker until the owner chooses the public name.
    visibility: 'public',
    note: 'Working label. The 2014 site used ปั้นข้าว / PAN KAO; the register says สหปั้นข้าว / SAHA PANKAO; the domain is pankaothai.com. Owner to choose.',
  },
);

export const brandDescriptor = fact<string>(
  'brand.descriptor',
  { th: 'โรงงานผลิตเส้นจากข้าว', en: 'Rice-noodle manufacturer', vi: 'Nhà sản xuất sợi gạo' },
  { status: 'government-current', sourceIds: ['S03', 'S07', 'S13'], note: 'Registered activity TSIC 10742; DIPROM 2024 calls it an OEM factory.' },
);

export const legalNameTh = fact<string>('legal.name.th', 'บริษัท สหปั้นข้าว จำกัด', {
  status: 'government-current',
  sourceIds: ['S03', 'S07', 'S13'],
  visibility: 'review',
  note: 'DBD-derived records (DataForThai blocked automated reading; TaeJing and Creden read). Legal footer wording needs owner confirmation.',
});

export const legalNameEn = fact<string>('legal.name.en', 'SAHA PANKAO COMPANY LIMITED', {
  status: 'government-current',
  sourceIds: ['S07', 'S13'],
  visibility: 'review',
});

export const registration = fact<string>('legal.registration', '0125550039493', {
  status: 'government-current',
  sourceIds: ['S07', 'S13', 'S12'],
  visibility: 'review',
  note: 'Also printed as the tax number on the 2014 Thai contact page (0-1255-50039-49-3).',
});

export const legalFacts = fact<string>(
  'legal.record',
  {
    th: 'จดทะเบียน 25 พ.ค. 2550 · ทุนจดทะเบียน 16 ล้านบาท · ประเภทธุรกิจ TSIC 10742 (ผลิตก๋วยเตี๋ยว เส้นหมี่ และวุ้นเส้น) · สถานะดำเนินกิจการ',
    en: 'Registered 25 May 2007 · registered capital THB 16 million · TSIC 10742 (noodles, rice vermicelli and glass noodles) · active',
    vi: 'Đăng ký ngày 25/5/2007 · vốn điều lệ 16 triệu baht · mã ngành TSIC 10742 (sản xuất mì, bún, miến) · đang hoạt động',
  },
  { status: 'government-current', sourceIds: ['S07', 'S13'], visibility: 'review', note: 'Name change ปั้นข้าว → สหปั้นข้าว (25 Jan 2017) is reported by the brief from DataForThai, which blocked our reader; not re-verified.' },
);

/* ---------------- facility & contact ---------------- */

export const location = fact<string>(
  'facility.location',
  { th: 'ไทรใหญ่ อ.ไทรน้อย จ.นนทบุรี', en: 'Sai Yai, Sai Noi, Nonthaburi, Thailand', vi: 'Sai Yai, Sai Noi, Nonthaburi, Thái Lan' },
  { status: 'government-current', sourceIds: ['S07', 'S13', 'S04', 'S05', 'S12'], note: 'Every manufacturer source agrees on 45 Moo 9, Sai Yai, Sai Noi, Nonthaburi 11150.' },
);

export const address = fact<string[]>(
  'contact.address',
  {
    th: ['45 หมู่ที่ 9 ซอยวัดสโมสร', 'ถนนปทุมธานี–บางเลน ตำบลไทรใหญ่', 'อำเภอไทรน้อย จังหวัดนนทบุรี 11150'],
    en: ['45 Moo 9, Soi Wat Samosorn', 'Pathum Thani–Bang Len Road, Sai Yai', 'Sai Noi, Nonthaburi 11150, Thailand'],
    vi: ['45 Moo 9, Soi Wat Samosorn', 'Đường Pathum Thani–Bang Len, Sai Yai', 'Sai Noi, Nonthaburi 11150, Thái Lan'],
  },
  {
    status: 'government-current',
    sourceIds: ['S07', 'S13', 'S12', 'S05'],
    note: 'Thai wording from the register. The English is O2’s transliteration (2014 site: “45 M.9, Soi Wat Samosorn, Patumthanee-Banglane road, Sai-Yai, Sai-Noi”); owner to approve.',
  },
);

/** Used for the directions link and the consented map query. */
export const mapQuery = fact<string>('contact.mapQuery', '45 หมู่ 9 ซอยวัดสโมสร ถนนปทุมธานี-บางเลน ไทรใหญ่ ไทรน้อย นนทบุรี 11150', {
  status: 'government-current',
  sourceIds: ['S07', 'S13'],
  note: 'Address search, not a verified map pin. Location accuracy is a human check before release.',
});

export const phone = fact<{ display: Localized; tel: string }>(
  'contact.phone',
  { display: { th: '0 2150 6697', en: '+66 2 150 6697', vi: '+66 2 150 6697' }, tel: '+6621506697' },
  { status: 'directory-secondary', sourceIds: ['S12', 'S05', 'S04', 'S13'], note: 'The landline agrees across the 2014 site, Yellow Pages and THIC.' },
);

export const fax = fact<{ display: Localized; tel: string }>(
  'contact.fax',
  { display: { th: '0 2150 6640', en: '+66 2 150 6640', vi: '+66 2 150 6640' }, tel: '+6621506640' },
  { status: 'first-party-stale', sourceIds: ['S12', 'S05'] },
);

export const email = fact<string>('contact.email', 'pk_pankao@hotmail.com', {
  status: 'first-party-stale',
  sourceIds: ['S12', 'S04'],
  note: 'Printed on every 2014 page. A company-domain address may be preferred; owner to confirm which inbox is monitored.',
});

export const mobile = fact<string>('contact.mobile', '—', {
  status: 'conflicted',
  sourceIds: ['S12', 'S04'],
  visibility: 'private',
  note: '2014 site and THIC give two different mobile numbers; may belong to individuals. Never shown.',
});

export const hours = fact<string>(
  'contact.hours',
  { th: 'จันทร์–เสาร์ 08:00–18:00', en: 'Mon–Sat 08:00–18:00', vi: 'Thứ Hai–Thứ Bảy 08:00–18:00' },
  { status: 'directory-secondary', sourceIds: ['S05'], visibility: 'review', note: 'Only Yellow Pages states hours; self-reported and undated. Omitted until confirmed.' },
);

/* ---------------- capability, OEM & markets ---------------- */

export const oemCapability = fact<string>(
  'oem.capability',
  {
    th: 'รับผลิตเส้นภายใต้แบรนด์ของลูกค้า (OEM)',
    en: 'Produces rice noodles under other companies’ brands (OEM / private label)',
    vi: 'Gia công sợi gạo dưới thương hiệu của khách hàng (OEM / nhãn riêng)',
  },
  { status: 'government-current', sourceIds: ['S03', 'S12', 'S14'], note: 'DIPROM 2024 (OEM contract factory); 2014 site (“รับผลิตภายใต้เครื่องหมายการค้าต่าง ๆ”); FDA registrations for other brands via TaeJing (brands not named publicly).' },
);

export const ownBrand = fact<string>(
  'brand.own',
  { th: 'มิสเตอร์นู้ดเดิ้ล (Mr. Noodles)', en: 'Mr. Noodles', vi: 'Mr. Noodles' },
  { status: 'first-party-stale', sourceIds: ['S12', 'S09'], note: 'On the 2014 site and on packs sold in Bangladesh; not a registered product name in the FDA list we could read. Current use to confirm.' },
);

export const marketsScope = fact<string>(
  'markets.scope',
  { th: 'ตลาดในประเทศและต่างประเทศ', en: 'Thailand and export markets', vi: 'Thị trường trong nước và quốc tế' },
  { status: 'government-current', sourceIds: ['S03'], note: 'DIPROM 2024: “ค้าภายในประเทศและต่างประเทศ”.' },
);

export const marketsRegions = fact<string>(
  'markets.regions',
  { th: 'เอเชีย อเมริกา ยุโรป และออสเตรเลีย', en: 'Asia, America, Europe and Australia', vi: 'Châu Á, Mỹ, Châu Âu và Úc' },
  { status: 'first-party-stale', sourceIds: ['S12', 'S08', 'S09'], visibility: 'review', note: '2014 history page. Korea (2026 import record, blocked to our reader) and Bangladesh (retail listings) are signals only. Needs a current market ledger.' },
);

export const diprom2024 = fact<string>(
  'evidence.diprom2024',
  {
    th: 'กรมส่งเสริมอุตสาหกรรม (20 ก.พ. 2567) ระบุว่าบริษัทเป็นโรงงานรับผลิต OEM ผลิตเส้นหมี่ เส้นก๋วยเตี๋ยวจันทร์ และพาสต้าอบแห้ง สำหรับตลาดในประเทศและต่างประเทศ',
    en: 'Thailand’s Department of Industrial Promotion (20 February 2024) describes the company as an OEM factory producing rice vermicelli, Chanthaburi-style rice noodles and dried pasta for the domestic and international trade.',
    vi: 'Cục Xúc tiến Công nghiệp Thái Lan (20/2/2024) mô tả công ty là nhà máy gia công OEM, sản xuất bún gạo, sợi phở kiểu Chanthaburi và pasta khô cho thị trường trong nước và quốc tế.',
  },
  { status: 'government-current', sourceIds: ['S03'], note: 'Paraphrase of a government news item; attributed, linked.' },
);

/* ---------------- process ---------------- */

export const processSteps = [
  fact<{ title: Localized; body: Localized }>(
    'process.select',
    {
      title: { th: 'คัดข้าว', en: 'Selecting the rice', vi: 'Chọn gạo' },
      body: {
        th: 'เส้นของเราเริ่มจากข้าวเจ้าที่คัดเลือกมาเพื่อทำเส้นโดยเฉพาะ',
        en: 'Each run starts with white rice selected for noodle-making.',
        vi: 'Mỗi mẻ bắt đầu từ gạo tẻ được chọn riêng để làm sợi.',
      },
    },
    { status: 'first-party-stale', sourceIds: ['S12'], note: '2014: “คัดสรรข้าวพันธุ์ดี” / “pure white rice”.' },
  ),
  fact<{ title: Localized; body: Localized }>(
    'process.form',
    {
      title: { th: 'ปั้นเป็นเส้น', en: 'Forming the strand', vi: 'Tạo sợi' },
      body: {
        th: 'ข้าวผ่านกรรมวิธีการผลิตที่ถูกสุขลักษณะ ด้วยเครื่องจักรอัตโนมัติ จนเป็นเส้นตามแบบที่ต้องการ',
        en: 'The rice goes through a hygienic, machine-led process until it becomes the required strand.',
        vi: 'Gạo đi qua quy trình hợp vệ sinh trên dây chuyền tự động cho đến khi thành sợi theo yêu cầu.',
      },
    },
    { status: 'first-party-stale', sourceIds: ['S12'], note: '2014: “กรรมวิธีการผลิตที่ถูกสุขลักษณะ”; EN/VI mention automatic machines. Stage details are the owner’s to confirm; no trade secrets.' },
  ),
  fact<{ title: Localized; body: Localized }>(
    'process.dry',
    {
      title: { th: 'อบแห้ง', en: 'Oven-drying', vi: 'Sấy khô' },
      body: {
        th: 'เส้นอบให้แห้งแทนการตากแดด จึงเป็นที่มาของชื่อ “เส้นหมี่อบแห้ง” และ “เส้นจันทร์อบแห้ง” บนถุง',
        en: 'Strands are dried by baking rather than in the sun — the “อบแห้ง” (oven-dried) on our pack names.',
        vi: 'Sợi được sấy bằng nhiệt thay vì phơi nắng — chữ “อบแห้ง” (sấy khô) trên bao bì.',
      },
    },
    { status: 'first-party-stale', sourceIds: ['S12'], note: '2014 Mr. Noodles page (EN): “dried by means of baking instead of exposing to the sun”; pack names say อบแห้ง.' },
  ),
  fact<{ title: Localized; body: Localized }>(
    'process.check',
    {
      title: { th: 'ตรวจคุณภาพ', en: 'Quality checks', vi: 'Kiểm tra chất lượng' },
      body: {
        th: 'ตรวจสอบคุณภาพอย่างเข้มงวดก่อนเส้นจะไปถึงขั้นบรรจุ',
        en: 'Strict quality checks before the noodles move on to packing.',
        vi: 'Kiểm tra chất lượng nghiêm ngặt trước khi sợi được đóng gói.',
      },
    },
    { status: 'first-party-stale', sourceIds: ['S12'], note: '2014: “มีการตรวจสอบคุณภาพอย่างเข้มงวด”. Which checks, and against what standard, is for the owner to state.' },
  ),
  fact<{ title: Localized; body: Localized }>(
    'process.pack',
    {
      title: { th: 'บรรจุ', en: 'Packing', vi: 'Đóng gói' },
      body: {
        th: 'บรรจุในถุงของแบรนด์เราเอง หรือตามบรรจุภัณฑ์ของแบรนด์ลูกค้า',
        en: 'Packed in our own bags, or in the packaging of the brand we produce for.',
        vi: 'Đóng gói trong bao bì của chúng tôi, hoặc theo bao bì của thương hiệu khách hàng.',
      },
    },
    { status: 'first-party-stale', sourceIds: ['S12', 'S14'], note: 'Inferred from the packs (2014) and other-brand registrations; packing details to confirm.' },
  ),
];

export const brandMeaning = fact<string>(
  'brand.meaning',
  { th: 'ปั้น = ขึ้นรูป, ข้าว = ข้าว', en: 'pan = to shape, khao = rice', vi: 'pan = nặn, khao = gạo' },
  { status: 'first-party-stale', sourceIds: ['S12'], note: 'Thai meaning of the words; the 2014 site itself used the play on words (วิธีปั้นข้าว, ตำนานปั้นข้าว, ที่ปั้นข้าว). Owner to approve as brand story.' },
);

/* ---------------- O2 drafts awaiting the company's confirmation ---------------- */

export const oemPath = fact<string>('oem.path', { th: 'ขั้นตอน OEM 5 ขั้น (ร่าง)', en: 'Five-step OEM path (draft)', vi: 'Quy trình OEM 5 bước (nháp)' }, {
  status: 'research-lead', sourceIds: ['O2'], note: 'O2’s proposed engagement path (brief 7.4). The factory must confirm its real sequence (D09).',
});

export const privacyText = fact<string>('privacy.text', { th: 'ร่างนโยบายความเป็นส่วนตัว', en: 'Privacy notice draft', vi: 'Bản nháp thông báo quyền riêng tư' }, {
  status: 'research-lead', sourceIds: ['O2'], note: 'O2 draft structure (brief 7.9); controller, recipients, retention and legal basis need the company and an adviser (D02, D11, D19).',
});

export const historyStatement = fact<string>('about.historyStatement', { th: 'ข้อความประวัติแบบเป็นกลาง', en: 'Neutral history statement', vi: 'Câu lịch sử trung lập' }, {
  status: 'research-lead', sourceIds: ['O2'], note: 'Says the history is being gathered. Needs the owner’s approval of the wording (brief 7.7).',
});

/* ---------------- heritage candidates (review only) ---------------- */

export const heritageCandidates = [
  fact<string>('heritage.30years', { th: 'กว่า 30 ปี (เว็บไซต์เดิม 2557)', en: '“More than 30 years” (2014 site)', vi: '“Hơn 30 năm” (trang 2014)' }, {
    status: 'conflicted', sourceIds: ['S12'], visibility: 'review', note: 'Conflicts with the 2017 catalogue and the 2007 registration.',
  }),
  fact<string>('heritage.80years', { th: 'กว่า 8 ทศวรรษ ร้านแรกริมคลองบางหลวง ฝั่งธนบุรี (แคตตาล็อก 2560)', en: '“Eight decades”, first shop by Bang Luang canal, Thonburi (2017 catalogue)', vi: '“Tám thập kỷ”, cửa hàng đầu tiên bên kênh Bang Luang (catalogue 2017)' }, {
    status: 'conflicted', sourceIds: ['S06'], visibility: 'review', note: 'Also claims “first rice-vermicelli factory in Thailand”; founder name not legible in the source. Needs archive documents.',
  }),
  fact<string>('heritage.2007', { th: 'จดทะเบียนบริษัท 25 พ.ค. 2550', en: 'Company registered 25 May 2007', vi: 'Đăng ký công ty 25/5/2007' }, {
    status: 'government-current', sourceIds: ['S07', 'S13'], visibility: 'review', note: 'A legal date, not the start of the factory story. Showing it alone would mislead.',
  }),
  fact<string>('heritage.2017', { th: 'เปลี่ยนชื่อเป็น สหปั้นข้าว (2560)', en: 'Renamed Saha Pankao (2017)', vi: 'Đổi tên thành Saha Pankao (2017)' }, {
    status: 'research-lead', sourceIds: ['S01'], visibility: 'review', note: 'Reported in the brief from DataForThai; not re-read (blocked).',
  }),
  fact<string>('heritage.2024', { th: 'ร่วมกิจกรรมระบบนิเวศดิจิทัลอุตสาหกรรมอาหาร กรมส่งเสริมอุตสาหกรรม (2567)', en: 'Joined DIPROM’s food-industry digital ecosystem activity (2024)', vi: 'Tham gia chương trình hệ sinh thái số ngành thực phẩm của DIPROM (2024)' }, {
    status: 'government-current', sourceIds: ['S03'], visibility: 'review', note: 'Public only if the owner wants it in the timeline.',
  }),
];

export const allCompanyFacts: Fact<unknown>[] = [
  brandName, brandDescriptor, legalNameTh, legalNameEn, registration, legalFacts,
  location, address, mapQuery, phone, fax, email, mobile, hours,
  oemCapability, ownBrand, marketsScope, marketsRegions, diprom2024, brandMeaning,
  oemPath, privacyText, historyStatement,
  ...processSteps, ...heritageCandidates,
] as Fact<unknown>[];

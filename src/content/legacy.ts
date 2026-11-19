/**
 * Everything the company's current website (pankaothai.com, 2014) says, in its own three
 * languages (owner, 19 Nov 2026: "add all the information on their current website … everything
 * in their side bars and tabs but make the layout feel less squashed and more intuitive").
 *
 * These are Pankao's own words, carried over as written: English grammar and Vietnamese
 * diacritics lightly corrected, nothing added. The one change of substance: the company is
 * named by its brand (ปั้นข้าว / PAN KAO), never by the pre-2017 legal name, which now belongs
 * to an unrelated company (sources.ts). They render in the preview with a "From the current
 * website" tag and never in a production build until the company confirms them (the claims
 * among them are also in claims.ts with the evidence each one needs). The second mobile number
 * on the 2014 pages is left out: it may belong to a person (facts.ts → contact.mobile).
 * Source: S12 (archived pages in documents/research/legacy-site/).
 */
import type { Localized } from './types.ts';

type L = Localized<string>;
type LL = Localized<string[]>;

export const LEGACY_SOURCE = 'S12';

/** Home page: the welcome block and the slogan from the 2014 banner image. */
export const welcome = {
  h: { th: 'ปั้นข้าว ยินดีต้อนรับ', en: 'Welcome to PAN KAO', vi: 'Chào mừng tới PAN KAO' } as L,
  body: {
    th: 'กว่า 30 ปีที่โรงงานปั้นข้าวผลิตเส้นหมี่และเส้นก๋วยเตี๋ยวคุณภาพภายใต้เครื่องหมายการค้า “มิสเตอร์นู้ดเดิ้ล” รวมทั้งรับผลิตภายใต้เครื่องหมายการค้าต่าง ๆ',
    en: 'For more than 30 years PAN KAO has produced quality rice vermicelli and rice noodles under the “Mr. NOODLES” trademark, and also produces to order (OEM).',
    vi: 'Với hơn 30 năm kinh nghiệm, PAN KAO đã cho ra đời những sản phẩm chất lượng như bún gạo, bánh phở với tên nhãn hiệu “Mr.NOODLES”.',
  } as L,
  slogan: {
    th: ['จากข้าวไทยสู่ครัวโลก', 'โรงงานผลิตเส้นหมี่ เส้นก๋วยเตี๋ยวจันทร์อบแห้ง', 'ภายใต้การผลิตที่ถูกสุขลักษณะมาตรฐานสากล', 'เหนียวนุ่มทุกเส้น อร่อยทุกคำ'],
    en: ['From Thai rice to world kitchen', 'Rice vermicelli and rice stick noodle factory', 'Under international hygienic standards', 'Healthy and tasty every dish'],
    vi: ['Từ những hạt gạo trắng của Thái Lan', 'được chế biến thành những món ăn thế giới', 'Chúng tôi sản xuất bún gạo, bánh phở, hủ tiếu, bánh đa', 'Theo tiêu chuẩn vệ sinh quốc tế', 'Thơm ngon bổ dưỡng'],
  } as LL,
};

/** Home page "BEST Quality" list (the English and Vietnamese pages list five, the Thai four). */
export const best = {
  h: { th: 'BEST Quality', en: 'BEST Quality', vi: 'Chất lượng tốt nhất' } as L,
  items: {
    th: ['ผลิตจากวัตถุดิบ ธรรมชาติ 100%', 'เหนียวนุ่ม น่ารับประทาน', 'ปราศจากวัตถุกันเสียและสารปรุงแต่ง', 'ไม่มีคอเลสเตอรอลและไขมันอิ่มตัว'],
    en: ['Nature 100%', 'Gluten free', 'No MSG and preservatives', 'No cholesterol and trans fat', 'Product of Thailand'],
    vi: ['100% tự nhiên', 'Không gluten', 'Không bột ngọt và không chất bảo quản', 'Không cholesterol và không mỡ thực vật', 'Sản phẩm của Thái Lan'],
  } as LL,
};

/** Home page "quality certifications" paragraph and the marks in its badge image (named, not reproduced). */
export const certs = {
  h: { th: 'เครื่องหมายรับรองคุณภาพ', en: 'Quality certifications', vi: 'Những chứng nhận chất lượng' } as L,
  body: {
    th: 'ด้วยความมุ่งมั่นที่จะผลิตเส้นหมี่และเส้นก๋วยเตี๋ยวให้มีคุณภาพ จนวันนี้โรงงานปั้นข้าวได้รับการรับรองคุณภาพจากสถาบันต่าง ๆ อันเป็นแรงขับดันให้เรามุ่งมั่นพัฒนาต่อไปอย่างไม่หยุดยั้ง',
    en: 'With the intention to make the best noodles for decades, we are proud to say that we are now certified by many institutes, and this drives us never to stop making better noodles.',
    vi: 'Với phương châm tạo ra những sản phẩm tốt nhất, chúng tôi tự hào những sản phẩm của công ty đã được công nhận trên thị trường, điều đó làm cho công ty ngày càng không ngừng phát triển để tạo ra những sản phẩm tốt hơn.',
  } as L,
  /** Read from the 2014 badge image; logos are not copied (their use needs each body's permission). */
  marks: [
    { name: { th: 'BRC Food', en: 'BRC Food', vi: 'BRC Food' } as L, by: { th: 'มาตรฐานความปลอดภัยอาหาร', en: 'Food safety standard', vi: 'Tiêu chuẩn an toàn thực phẩm' } as L },
    { name: { th: 'HACCP', en: 'HACCP', vi: 'HACCP' } as L, by: { th: 'ตรวจรับรองโดย Intertek', en: 'Certified by Intertek', vi: 'Chứng nhận bởi Intertek' } as L },
    { name: { th: 'GMP', en: 'GMP', vi: 'GMP' } as L, by: { th: 'ตรวจรับรองโดย Intertek', en: 'Certified by Intertek', vi: 'Chứng nhận bởi Intertek' } as L },
    { name: { th: 'เชลล์ชวนชิม', en: 'Shell Chuan Chim', vi: 'Shell Chuan Chim' } as L, by: { th: 'ตราสัญลักษณ์ความอร่อย', en: 'Thai food guide mark', vi: 'Biểu tượng ẩm thực Thái' } as L },
    { name: { th: 'เทคโนโลยีสะอาด', en: 'Cleaner Technology', vi: 'Công nghệ sạch' } as L, by: { th: 'สถาบันสิ่งแวดล้อมไทย', en: 'Thailand Environment Institute', vi: 'Viện Môi trường Thái Lan' } as L },
    { name: { th: 'DANCED', en: 'DANCED', vi: 'DANCED' } as L, by: { th: 'โครงการความร่วมมือไทย–เดนมาร์ก', en: 'Danish–Thai environment programme', vi: 'Chương trình môi trường Đan Mạch – Thái Lan' } as L },
  ],
};

/** "ปั้นข้าวของเรา": the range as the 2014 home and products pages list it. */
export const range = {
  h: { th: 'ปั้นข้าวของเรา', en: 'Our noodles', vi: 'Bún PAN KAO' } as L,
  items: {
    th: ['เส้นหมี่', 'เส้นจันทร์', 'เส้นเล็ก', 'เส้นผัดไทย', 'ก๋วยจั๊บ', 'เส้นข้าวกล้อง', 'เส้นฟักทอง'],
    en: ['Rice vermicelli', 'Rice stick', 'Pad Thai', 'Rice flake', 'Brown rice'],
    vi: ['Bún gạo', 'Bánh phở', 'Hủ tiếu', 'Bánh đa', 'Bún gạo lứt'],
  } as LL,
  promises: {
    th: ['ผลิตจากวัตถุดิบ ธรรมชาติ 100%', 'เหนียวนุ่ม น่ารับประทาน', 'ปราศจากวัตถุกันเสียและสารปรุงแต่ง', 'ไม่มีคอเลสเตอรอลและไขมันอิ่มตัว'],
    en: ['100% Organic Food', 'Gluten free, no cholesterol and trans fat', 'No MSG and preservatives', 'Healthy and tasty'],
    vi: ['100% tự nhiên', 'Không gluten, không bột ngọt, không chất bảo quản', 'Không cholesterol và không mỡ động vật', 'Thơm ngon bổ dưỡng'],
  } as LL,
};

/** "ตำนานปั้นข้าว" (History). */
export const history = {
  h: { th: 'ตำนานปั้นข้าว', en: 'History', vi: 'Lịch sử của PAN KAO' } as L,
  body: {
    th: 'กว่า 30 ปีที่โรงงานปั้นข้าวผลิตเส้นหมี่และเส้นก๋วยเตี๋ยวคุณภาพภายใต้เครื่องหมายการค้า “มิสเตอร์นู้ดเดิ้ล” รวมทั้งรับผลิตภายใต้เครื่องหมายการค้าต่าง ๆ ทั้งจากภายในประเทศและประเทศอื่น ๆ ทั่วโลก ทั้งในเอเชีย อเมริกา ยุโรป และออสเตรเลีย',
    en: 'For more than 30 years PAN KAO has produced quality rice vermicelli and rice noodles under the “Mr. NOODLES” trademark, and also produces to order (OEM) for customers in Thailand and in other countries around the world: in Asia, America, Europe and Australia.',
    vi: 'Với hơn 30 năm kinh nghiệm, PAN KAO đã tạo ra những sản phẩm chất lượng như bún gạo, hủ tiếu, bánh phở với tên nhãn hiệu “Mr.NOODLES” và sản xuất theo đơn đặt hàng trong nước và nhiều quốc gia khác ở châu Á, Mỹ, châu Âu và Úc.',
  } as L,
};

/** "วิธีปั้นข้าว" (Process): the intro and the three captioned photographs. */
export const process = {
  h: { th: 'วิธีปั้นข้าว', en: 'PAN KAO’s process', vi: 'Quy trình của PAN KAO' } as L,
  intro: {
    th: 'ปั้นข้าวคัดสรรข้าวพันธุ์ดีผ่านกรรมวิธีการผลิตที่ถูกสุขลักษณะ ภายใต้การควบคุมคุณภาพระดับมาตรฐานสากล',
    en: 'PAN KAO chooses the best pure white rice without any chemical components, produced on modern automatic machines under international quality control.',
    vi: 'Chúng tôi chọn lựa những hạt gạo trắng thơm không có một thành phần hóa chất, với quy trình sản xuất tự động và sự giám sát chất lượng quốc tế.',
  } as L,
  /** Keyed by the process step whose photograph the 2014 page captioned. */
  captions: {
    'process.select': { th: 'จากข้าวพันธุ์ดี', en: 'From pure white rice.', vi: 'Từ những hạt gạo trắng tinh.' },
    'process.check': { th: 'มีการตรวจสอบคุณภาพอย่างเข้มงวด', en: 'Under strict quality control.', vi: 'Dưới sự kiểm tra chất lượng nghiêm ngặt.' },
    'process.pack': { th: 'จนได้เส้นก๋วยเตี๋ยวที่เหนียวนุ่มน่ารับประทาน', en: 'To get healthy and tasty noodles.', vi: 'Tạo ra những sản phẩm bổ dưỡng và tốt cho sức khỏe.' },
  } as Record<string, L>,
};

/** "ที่ปั้นข้าว" (Contact): the tax number printed on the 2014 Thai contact page. */
export const contact = {
  h: { th: 'ที่ปั้นข้าว', en: 'Contact PAN KAO', vi: 'Liên hệ' } as L,
  taxLabel: { th: 'เลขประจำตัวผู้เสียภาษี', en: 'Tax ID', vi: 'Mã số thuế' } as L,
  tax: '0-1255-50039-49-3',
};

/** Each product page of the 2014 site, in its own words. */
export const productText: Record<string, { lead?: L; body: L }> = {
  'rice-vermicelli': {
    body: {
      th: 'เส้นหมี่คือเส้นก๋วยเตี๋ยวที่ทำจากข้าว มีลักษณะเป็นเส้นกลมสม่ำเสมอสีขาว เส้นเล็กและยาว ใช้ประกอบอาหารหลายประเภท ทั้งนี้คำว่า ‘หมี่’ มาจากภาษาจีนแปลว่า ‘ข้าว’',
      en: 'Rice vermicelli are very fine white noodles made of rice flour, about the size of Italian ‘angel hair’ pasta. They are very fine textured and tasty when eaten with broth.',
      vi: 'Sản phẩm bún gạo được làm từ loại bột gạo trắng tinh khiết, sợi bún nhỏ tròn giống sợi chỉ. Loại bún này rất thích hợp chế biến với nước dùng xương.',
    },
  },
  'rice-stick-pad-thai': {
    body: {
      th: 'ลักษณะแบนและกว้างกว่าเส้นหมี่ มีการตัดเป็นท่อน ๆ เพื่อความง่ายในการรับประทาน เมื่อลวกเสร็จแล้วจะเหนียวกว่าเส้นก๋วยเตี๋ยวอื่น ๆ มักจะใช้นำไปทำผัดไทย ก๋วยเตี๋ยวเรือ ก๋วยเตี๋ยวน้ำตก',
      en: 'Rice stick and Pad Thai noodles are medium-sized rice-flour noodles and are chewier than the smaller sort. They are equally tasty eaten with broth, or without.',
      vi: 'Sợi bánh trắng trung bình. Rất ngon chế biến món phở và chế biến món hủ tiếu xào.',
    },
  },
  'rice-flake-guay-jub': {
    body: {
      th: 'เส้นมีลักษณะเป็นแผ่นสี่เหลี่ยมหรือสามเหลี่ยม เมื่อนำไปต้มในน้ำร้อนก็จะม้วนตัวเป็นหลอด',
      en: 'Square or triangular in shape; in boiling water each piece rolls into a tube. They are great in Pad Kee Mao, Pad Thai and other Thai fried noodle dishes. Most often they feature in a Chinese-style pork soup spiced with five-spice powder (with cinnamon stick and star anise) and boiled eggs, called Guay Jup.',
      vi: 'Với hình dáng tam giác hoặc hình vuông. Khi nấu chín, bánh cuộn tròn lại. Rất ngon khi chế biến món Pad Kee Mao, món hủ tiếu xào hoặc món bánh đa cua. Thường được dùng trong món súp heo cay nồng kiểu Trung Hoa (ngũ vị hương, quế, hồi và trứng luộc) gọi là Guay Jup, rất giống món trứng thịt kho tàu.',
    },
  },
  'brown-rice-noodles': {
    body: {
      th: 'คือเส้นก๋วยเตี๋ยวที่ผลิตจากข้าวกล้องที่ไม่ได้ผ่านการขัดสี ให้คุณค่าทางโภชนาการ วิตามิน และใยอาหารสูงมากกว่าข้าวปกติโดยทั่วไป เหมาะสำหรับนำไปประกอบอาหารเพื่อสุขภาพ',
      en: 'Brown rice noodles are made from brown rice, which has more nutrition, vitamins and fibre than white rice. Good to cook for healthy dishes.',
      vi: 'Loại bún được chế biến từ gạo lứt, rất giàu dinh dưỡng và vitamin hơn gạo trắng bình thường. Loại bún này rất tốt cho sức khỏe. Rất ngon để chế biến món phở hoặc hủ tiếu xào.',
    },
  },
  'mr-noodles': {
    lead: { th: 'เส้นหมี่อบแห้ง · เส้นจันทร์อบแห้ง', en: 'Rice vermicelli · Rice stick / Pad Thai', vi: 'Bún gạo · Bánh phở / Hủ tiếu' },
    body: {
      th: 'ผลิตจากข้าวเจ้าบริสุทธิ์ปราศจากสารเคมีเจือปน ผ่านขั้นตอนกรรมวิธีที่ถูกหลักอนามัย และรักษาคุณค่าทางโภชนาการ เนื้อเส้นขาว เหนียวนุ่ม เหมาะอย่างยิ่งสำหรับนำไปประกอบอาหาร',
      en: 'Made from pure white rice without any chemical components, on modern automatic machines. Our noodles are dried by baking instead of in the sun, so they are more hygienic and keep the rice’s nutrition and natural fragrance. Good to cook for tasty dishes.',
      vi: 'Sản phẩm được làm từ những hạt gạo trắng sạch, không có một thành phần hóa học, được chế biến trên dây chuyền công nghệ hiện đại và sấy khô qua hệ thống dây chuyền tự động. Sản phẩm đảm bảo an toàn vệ sinh và giữ được giá trị dinh dưỡng và hương thơm ngon của hạt gạo. Thích hợp chế biến nhiều món ăn.',
    },
  },
};

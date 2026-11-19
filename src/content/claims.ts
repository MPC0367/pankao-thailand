/**
 * Claims register. Company-level and product-level claims are separate records; a product
 * never inherits a company claim and vice versa (QLT-04). Every claim below was found on the
 * 2014 site and none is owner-approved, so none renders publicly: they appear only in review
 * notes, where the owner can confirm or strike each one against a current label.
 */
import type { Certificate, Claim, DocumentRecord, Localized } from './types.ts';

const c = (
  id: string,
  level: Claim['level'],
  kind: Claim['kind'],
  text: Localized,
  sourceIds: string[],
  evidenceNeeded: string,
  productId?: string,
): Claim => ({ id, level, kind, text, sourceIds, evidenceNeeded, productId, status: 'first-party-stale', certificateIds: [], ownerApproved: false });

const LABEL = 'Current label or specification for each SKU it applies to.';

export const claims: Claim[] = [
  c('c.co.natural', 'company', 'ingredient', { th: 'ผลิตจากวัตถุดิบธรรมชาติ 100%', en: '100% natural ingredients', vi: '100% tự nhiên' }, ['S12'], LABEL),
  c('c.co.organic', 'company', 'dietary', { th: '(ภาษาอังกฤษเท่านั้น) 100% Organic Food', en: '“100% Organic Food” (2014 English products page)', vi: '(chỉ bản tiếng Anh) 100% Organic Food' }, ['S12'], 'An organic certificate with scope; otherwise strike. Appears only on the English page.'),
  c('c.co.glutenfree', 'company', 'dietary', { th: '(ภาษาอังกฤษ/เวียดนาม) ไม่มีกลูเตน', en: 'Gluten free', vi: 'Không gluten' }, ['S12'], 'Per-SKU test or label statement (some sources mention tapioca starch in a 400 g export SKU).'),
  c('c.co.nomsg', 'company', 'additive', { th: '(ภาษาอังกฤษ/เวียดนาม) ไม่ใส่ผงชูรส', en: 'No MSG', vi: 'Không bột ngọt' }, ['S12'], LABEL),
  c('c.co.nopreservatives', 'company', 'additive', { th: 'ปราศจากวัตถุกันเสียและสารปรุงแต่ง', en: 'No preservatives or additives', vi: 'Không chất bảo quản' }, ['S12'], LABEL),
  c('c.co.cholesterol', 'company', 'nutrition', { th: 'ไม่มีคอเลสเตอรอลและไขมันอิ่มตัว', en: 'No cholesterol and trans fat', vi: 'Không cholesterol; “không mỡ thực vật” (trang chủ) / “không mỡ động vật” (trang sản phẩm)' }, ['S12'], 'Nutrition panel per SKU. The three locales disagree (saturated fat / trans fat / vegetable or animal fat).'),
  c('c.co.origin', 'company', 'origin', { th: 'จากข้าวไทยสู่ครัวโลก', en: 'Product of Thailand; “from Thai rice to world kitchen”', vi: 'Sản phẩm của Thái Lan' }, ['S12'], 'Country-of-origin labelling per SKU; rice sourcing evidence for any “Thai rice” statement.'),
  c('c.co.hygiene', 'company', 'quality', { th: 'การผลิตที่ถูกสุขลักษณะ มาตรฐานสากล', en: '“International hygienic standards”, “international quality control”', vi: '“Tiêu chuẩn vệ sinh quốc tế”' }, ['S12'], 'A named current standard with certificate (see the certificate register).'),
  c('c.co.texture', 'company', 'quality', { th: 'เหนียวนุ่ม น่ารับประทาน', en: 'Soft and chewy; “healthy and tasty”', vi: 'Thơm ngon bổ dưỡng' }, ['S12'], 'Descriptive; acceptable as product description per format once the owner approves wording. “Healthy” needs support.'),
  c('c.p.mrnoodles.ricewhite', 'product', 'ingredient', { th: 'ผลิตจากข้าวเจ้าบริสุทธิ์ ปราศจากสารเคมีเจือปน', en: 'Made from pure white rice without chemical components', vi: 'Làm từ gạo trắng sạch, không thành phần hóa học' }, ['S12'], 'Ingredient list on the current Mr. Noodles labels.', 'mr-noodles'),
  c('c.p.mrnoodles.baked', 'product', 'process', { th: 'อบแห้ง ไม่ตากแดด รักษาคุณค่าทางโภชนาการและกลิ่นหอมของข้าว', en: 'Dried by baking, not sun-dried; keeps rice nutrition and natural fragrance', vi: 'Sấy khô bằng dây chuyền tự động; giữ dinh dưỡng và hương thơm' }, ['S12'], 'Drying is used in public copy as a process step; the nutrition/fragrance part needs support.', 'mr-noodles'),
  c('c.p.brown.nutrition', 'product', 'nutrition', { th: 'คุณค่าทางโภชนาการ วิตามิน และใยอาหารสูงกว่าข้าวทั่วไป', en: 'More nutritious, with more vitamins and fibre than white rice', vi: 'Giàu dinh dưỡng và vitamin hơn gạo trắng' }, ['S12'], 'A nutrition comparison on the label; health-claim rules for each market.', 'brown-rice-noodles'),
  c('c.co.markets', 'company', 'market', { th: 'ส่งออกเอเชีย อเมริกา ยุโรป ออสเตรเลีย', en: 'Exports to Asia, America, Europe and Australia', vi: 'Xuất khẩu sang châu Á, Mỹ, châu Âu, Úc' }, ['S12'], 'A current, owner-approved market ledger.'),
];

/**
 * Certificate register. Empty: no certificate's holder, scope, number or validity has been
 * seen. The observed marks are recorded below as review items only (EV-01, QLT-01..07).
 */
export const certificates: Certificate[] = [];

export const observedMarks: { name: string; seenOn: string; missing: string }[] = [
  { name: 'BRC Food', seenOn: '2014 site mark image; 2017 catalogue', missing: 'holder, site, scope, grade, number, certification body, issue/expiry, logo-use permission' },
  { name: 'HACCP (Intertek mark)', seenOn: '2014 site mark image; 2017 catalogue', missing: 'holder, site, scope, number, issue/expiry, verification route' },
  { name: 'GMP (Intertek mark)', seenOn: '2014 site mark image; 2017 catalogue', missing: 'holder, site, scope, number, issue/expiry, verification route' },
  { name: 'Halal', seenOn: '2017 catalogue; THIC lists the operator (no certificate shown)', missing: 'certificate number, product scope, issuer, validity — operator listing is not product certification (QLT-03)' },
  { name: 'Green Productivity', seenOn: '2017 catalogue', missing: 'programme, year, issuer, whether current' },
  { name: 'เชลล์ชวนชิม (Shell Chuan Chim)', seenOn: '2014 site mark image; small mark on packs', missing: 'what was awarded, to which product, which year; permission to use the mark' },
  { name: 'Cleaner Technology (Thailand Environment Institute)', seenOn: '2014 site mark image', missing: 'programme, year, scope — likely historical' },
  { name: 'DANCED; Federation of Thai Industries; Department of Industrial Works (unclear)', seenOn: '2014 site mark image (low resolution)', missing: 'identification, meaning, year — likely programme logos, not certificates' },
];

/** Approved downloadable documents (company profile, specifications, certificates). None yet. */
export const documents: DocumentRecord[] = [];

export const QUALITY_REGISTER_REVIEWED = '2026-11-19';

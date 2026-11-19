/**
 * Enquiry forms (OEM brief and general contact). Labels above fields, required by default
 * with optional ones marked, honeypot, no uploads (D12). States are driven by site.js;
 * success is shown only after a verified 201/409 from the backend (OEM-05).
 */
import { diprom2024, email, phone } from '../content/facts.ts';
import { formatProducts } from '../content/products.ts';
import { canShow, href, ROUTES, t, val, type Ctx } from './context.ts';
import { BASE, PUBLIC_PREVIEW } from '../content/presentation.ts';
import { attrs, html, raw, type Raw } from './html.ts';

export type FormKind = 'oem' | 'general';

const MAX = { short: 120, email: 160, medium: 300, message: 4000 };

function field(ctx: Ctx, kind: FormKind, name: string, labelKey: string, control: Raw, opts: { optional?: boolean; hintKey?: string } = {}): Raw {
  const id = `${kind}-${name}`;
  return html`<div class="field" data-field="${name}">
    <label for="${id}">${t(ctx, labelKey)}${opts.optional ? html` <span class="req">${t(ctx, 'form.optional')}</span>` : ''}</label>
    ${opts.hintKey ? html`<p class="hint" id="${id}-hint">${t(ctx, opts.hintKey)}</p>` : ''}
    ${control}
    <p class="error" id="${id}-error" hidden></p>
  </div>`;
}

function input(kind: FormKind, name: string, type: string, opts: { required?: boolean; autocomplete?: string; max: number; hint?: boolean; inputmode?: string; placeholder?: string }): Raw {
  const id = `${kind}-${name}`;
  return html`<input${attrs({
    id, name, type, required: opts.required ?? false, autocomplete: opts.autocomplete ?? null, maxlength: opts.max,
    'aria-describedby': opts.hint ? `${id}-hint` : null, inputmode: opts.inputmode ?? null, placeholder: opts.placeholder ?? null,
    spellcheck: type === 'email' ? 'false' : null,
  })}>`;
}

function select(ctx: Ctx, kind: FormKind, name: string, options: [string, string][], required: boolean): Raw {
  const id = `${kind}-${name}`;
  return html`<select id="${id}" name="${name}"${attrs({ required })}>
    <option value="">${t(ctx, 'form.choose')}</option>
    ${options.map(([v, k]) => html`<option value="${v}">${t(ctx, k)}</option>`)}
  </select>`;
}

export function enquiryForm(ctx: Ctx, kind: FormKind): Raw {
  const backend = ctx.mode === 'preview' && !PUBLIC_PREVIEW ? 'mock' : 'none';
  const formats = formatProducts.filter((p) => canShow(p.name, ctx));
  const tel = canShow(phone, ctx) ? (val(phone, ctx.locale) as { tel: string; display: Record<string, string> }) : null;
  const mail = canShow(email, ctx) ? String(val(email, ctx.locale)) : null;

  const you = html`<fieldset>
    <legend>${t(ctx, 'form.legend.you')}</legend>
    <div class="form-row form-row--2">
      ${kind === 'oem' ? field(ctx, kind, 'company', 'form.company', input(kind, 'company', 'text', { required: true, autocomplete: 'organization', max: MAX.short })) : field(ctx, kind, 'company', 'form.company', input(kind, 'company', 'text', { autocomplete: 'organization', max: MAX.short }), { optional: true })}
      ${field(ctx, kind, 'name', 'form.name', input(kind, 'name', 'text', { required: true, autocomplete: 'name', max: MAX.short }))}
    </div>
    ${kind === 'oem' ? field(ctx, kind, 'role', 'form.role', input(kind, 'role', 'text', { autocomplete: 'organization-title', max: MAX.short }), { optional: true }) : ''}
    <div class="form-row form-row--2">
      ${field(ctx, kind, 'email', 'form.email', input(kind, 'email', 'email', { required: true, autocomplete: 'email', max: MAX.email }))}
      ${field(ctx, kind, 'phone', 'form.phone', input(kind, 'phone', 'tel', { autocomplete: 'tel', max: 40, hint: true, inputmode: 'tel' }), { optional: true, hintKey: 'form.phone.hint' })}
    </div>
    ${field(ctx, kind, 'country', 'form.country', input(kind, 'country', 'text', { required: kind === 'oem', autocomplete: 'country-name', max: MAX.short }), { optional: kind !== 'oem' })}
    ${kind === 'oem'
      ? field(ctx, kind, 'buyerType', 'form.buyerType', select(ctx, kind, 'buyerType', [
          ['importer', 'form.buyer.importer'], ['retail', 'form.buyer.retail'], ['foodservice', 'form.buyer.foodservice'],
          ['brand', 'form.buyer.brand'], ['manufacturer', 'form.buyer.manufacturer'], ['other', 'form.buyer.other'],
        ], true))
      : field(ctx, kind, 'subject', 'form.subject', select(ctx, kind, 'subject', [
          ['product', 'form.subject.product'], ['documents', 'form.subject.documents'], ['oem', 'form.subject.oem'],
          ['supplier', 'form.subject.supplier'], ['other', 'form.subject.other'],
        ], true))}
  </fieldset>`;

  const product = kind === 'oem'
    ? html`<fieldset>
    <legend>${t(ctx, 'form.legend.product')}</legend>
    <fieldset class="field" data-field="formats">
      <legend class="label">${t(ctx, 'form.formats')} <span class="req">${t(ctx, 'form.optional')}</span></legend>
      <div class="choice-group choice-group--2">
        ${formats.map((p) => html`<label class="choice"><input type="checkbox" name="formats" value="${p.id}"><span>${String(val(p.name, ctx.locale))}</span></label>`)}
        ${canShow(diprom2024, ctx) ? html`<label class="choice"><input type="checkbox" name="formats" value="dried-pasta"><span>${t(ctx, 'form.formats.pasta')}</span></label>` : ''}
        <label class="choice"><input type="checkbox" name="formats" value="unsure"><span>${t(ctx, 'form.formats.unsure')}</span></label>
      </div>
    </fieldset>
    ${field(ctx, kind, 'application', 'form.application', input(kind, 'application', 'text', { max: MAX.medium, hint: true }), { optional: true, hintKey: 'form.application.hint' })}
    <fieldset class="field" data-field="need">
      <legend class="label">${t(ctx, 'form.need')} <span class="req">${t(ctx, 'form.optional')}</span></legend>
      <div class="choice-group">
        <label class="choice"><input type="radio" name="need" value="private"><span>${t(ctx, 'form.need.private')}</span></label>
        <label class="choice"><input type="radio" name="need" value="own"><span>${t(ctx, 'form.need.own')}</span></label>
        <label class="choice"><input type="radio" name="need" value="unsure"><span>${t(ctx, 'form.need.unsure')}</span></label>
      </div>
    </fieldset>
    ${field(ctx, kind, 'packaging', 'form.packaging', input(kind, 'packaging', 'text', { max: MAX.medium, hint: true }), { optional: true, hintKey: 'form.packaging.hint' })}
    <div class="form-row form-row--2">
      ${field(ctx, kind, 'volume', 'form.volume', select(ctx, kind, 'volume', [
        ['unsure', 'form.volume.unsure'], ['trial', 'form.volume.trial'], ['pallet', 'form.volume.pallet'], ['container', 'form.volume.container'], ['regular', 'form.volume.regular'],
      ], false), { optional: true })}
      ${field(ctx, kind, 'timeline', 'form.timeline', select(ctx, kind, 'timeline', [
        ['exploring', 'form.timeline.exploring'], ['3m', 'form.timeline.3m'], ['6m', 'form.timeline.6m'], ['later', 'form.timeline.later'],
      ], false), { optional: true })}
    </div>
    ${field(ctx, kind, 'documents', 'form.documents', input(kind, 'documents', 'text', { max: MAX.medium, hint: true }), { optional: true, hintKey: 'form.documents.hint' })}
  </fieldset>`
    : raw('');

  const id = `${kind}-message`;
  const message = html`<fieldset>
    <legend>${t(ctx, 'form.legend.message')}</legend>
    <div class="field" data-field="message">
      <label for="${id}">${t(ctx, 'form.message')}</label>
      <p class="hint" id="${id}-hint">${t(ctx, kind === 'oem' ? 'form.message.hint.oem' : 'form.message.hint.general')}</p>
      <textarea id="${id}" name="message" required maxlength="${MAX.message}" aria-describedby="${id}-hint" rows="6"></textarea>
      <p class="error" id="${id}-error" hidden></p>
    </div>
    <p class="small muted">${t(ctx, 'form.noFiles')}</p>
    <div class="field" data-field="consent">
      <label class="choice" for="${kind}-consent"><input id="${kind}-consent" type="checkbox" name="consent" value="yes" required><span>${raw(
        t(ctx, 'form.consent').replace('{privacy}', `<a href="${href(ctx.locale, ROUTES.privacy)}">${t(ctx, 'form.consent.link')}</a>`),
      )}</span></label>
      <p class="error" id="${kind}-consent-error" hidden></p>
    </div>
    <div class="hp" aria-hidden="true"><label for="${kind}-website">${t(ctx, 'form.hp')}</label><input id="${kind}-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
  </fieldset>`;

  const strings = {
    errSummaryOne: t(ctx, 'err.summary.one'), errSummaryOther: t(ctx, 'err.summary.other'),
    company: t(ctx, 'err.company'), name: t(ctx, 'err.name'), emailRequired: t(ctx, 'err.email.required'), emailInvalid: t(ctx, 'err.email.invalid'),
    country: t(ctx, 'err.country'), buyerType: t(ctx, 'err.buyerType'), subject: t(ctx, 'err.subject'), message: t(ctx, 'err.message'), consent: t(ctx, 'err.consent'),
    tooLong: t(ctx, 'err.tooLong'), sending: t(ctx, 'form.sending'), slow: t(ctx, 'state.slow'),
    okH: t(ctx, 'state.ok.h'), okBody: t(ctx, 'state.ok.body'), dupH: t(ctx, 'state.dup.h'), dupBody: t(ctx, 'state.dup.body'),
    failH: t(ctx, 'state.fail.h'), failBody: t(ctx, 'state.fail.body'), rateH: t(ctx, 'state.rate.h'), rateBody: t(ctx, 'state.rate.body'),
    offlineH: t(ctx, 'state.offline.h'), offlineBody: t(ctx, 'state.offline.body'), unavailableH: t(ctx, 'state.unavailable.h'), unavailableBody: t(ctx, 'state.unavailable.body'),
    retry: t(ctx, 'act.retry'), copy: t(ctx, 'act.copy'), copied: t(ctx, 'act.copied'), download: t(ctx, 'act.download'), emailIt: t(ctx, 'act.email'),
    call: tel ? t(ctx, 'act.call', { phone: tel.display[ctx.locale] ?? '' }) : '', restored: t(ctx, 'form.restored'), clear: t(ctx, 'form.clear'),
    briefTitle: t(ctx, kind === 'oem' ? 'brief.title.oem' : 'brief.title.general'),
  };

  return html`<form class="form" id="${kind}-form" action="${BASE}/api/enquiries" method="post" novalidate data-enquiry-form="${kind}" data-backend="${backend}" data-locale="${ctx.locale}"${attrs({ 'data-tel': tel?.tel ?? null, 'data-mail': mail })}>
  <p class="form-notice">${t(ctx, backend === 'mock' ? 'form.preview' : 'form.notConnected')}</p>
  <p class="form-notice no-js-only">${t(ctx, 'form.noJs')}</p>
  <div class="form-status js-only" data-restored hidden><p>${t(ctx, 'form.restored')}</p><div class="btn-row"><button class="btn btn--line" type="button" data-clear-draft>${t(ctx, 'form.clear')}</button></div></div>
  <div class="error-summary" data-error-summary tabindex="-1" hidden aria-labelledby="${kind}-error-title"><h2 id="${kind}-error-title"></h2><ul></ul></div>
  <p class="small muted">${t(ctx, 'form.allRequired')}</p>
  <input type="hidden" name="kind" value="${kind}">
  <input type="hidden" name="locale" value="${ctx.locale}">
  ${you}
  ${product}
  ${message}
  <div class="btn-row js-only"><button class="btn btn--primary" type="submit" data-submit>${t(ctx, kind === 'oem' ? 'form.submit.oem' : 'form.submit.general')}</button></div>
  <div class="form-status" data-form-status role="status" aria-live="polite" hidden></div>
  <script type="application/json" data-form-strings>${raw(JSON.stringify(strings).replace(/</g, '\\u003c'))}</script>
</form>`;
}

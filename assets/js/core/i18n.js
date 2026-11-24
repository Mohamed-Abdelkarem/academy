// Site language: Arabic (default, RTL) or English (LTR). Saved per device.
// Pages call boot-lang.js in <head> first, so dir/lang are right before anything paints.
import { load, save } from './storage.js';

export const LANGS = ['ar', 'en'];

export function getLang() {
  const l = load('lang', 'ar');
  return LANGS.includes(l) ? l : 'ar';
}

export function setLang(l) {
  save('lang', LANGS.includes(l) ? l : 'ar');
  location.reload();
}

export const isRtl = () => getLang() === 'ar';

/** Pick the current language from a { ar, en } dictionary. */
export function pick(dict) {
  return dict[getLang()] ?? dict.ar;
}

/** Fill every [data-i18n="key"] element from a { ar: {...}, en: {...} } table. */
export function applyStrings(table) {
  const s = pick(table);
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const v = s[el.dataset.i18n];
    if (v !== undefined) el.textContent = v;
  });
  if (s.pageTitle) document.title = s.pageTitle;
}

/** Wire a header button that switches between Arabic and English. */
export function wireLangButton(btn) {
  btn.textContent = getLang() === 'ar' ? 'English' : 'عربي';
  btn.addEventListener('click', () => setLang(getLang() === 'ar' ? 'en' : 'ar'));
}

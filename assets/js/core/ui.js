// Small shared UI pieces: the code dialog and a generic message dialog.
import { redeem } from './access.js';
import { pick } from './i18n.js';

const UI = {
  ar: {
    codeTitle: 'اكتب كود الحصة 🔑', codeNote: 'المدرس هيقولك الكود', codeLabel: 'الكود',
    open: 'افتح', back: 'رجوع', opened: 'اتفتح! 🎉', wrong: 'الكود ده مش صح. اسأل المدرس', ok: 'تمام',
  },
  en: {
    codeTitle: 'Enter the class code 🔑', codeNote: 'Your teacher will tell you the code', codeLabel: 'Code',
    open: 'Open', back: 'Back', opened: 'Unlocked! 🎉', wrong: "That code isn't right. Ask your teacher", ok: 'OK',
  },
};


function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) node.append(c);
  return node;
}

/**
 * Ask for a session code. Resolves with the redeemed entry, or null if closed.
 */
export function askForCode({ title, note } = {}) {
  const t = pick(UI);
  title = title ?? t.codeTitle;
  note = note ?? t.codeNote;
  return new Promise((resolve) => {
    const input = el('input', {
      class: 'code-input',
      inputmode: 'text',
      autocomplete: 'off',
      autocapitalize: 'off',
      spellcheck: 'false',
      'aria-label': t.codeLabel,
    });
    const msg = el('div', { class: 'form-msg', role: 'status' });
    const ok = el('button', { class: 'btn btn-primary', type: 'submit', text: t.open });
    const cancel = el('button', { class: 'btn', type: 'button', text: t.back });
    const form = el('form', { method: 'dialog' }, [
      el('div', { class: 'big', text: '🔒' }),
      el('h2', { text: title }),
      el('p', { class: 'muted', text: note }),
      input,
      msg,
      el('div', { class: 'actions' }, [ok, cancel]),
    ]);
    const dialog = el('dialog', { class: 'modal' }, [form]);
    document.body.append(dialog);

    let result = null;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      ok.disabled = true;
      const entry = await redeem(input.value);
      ok.disabled = false;
      if (entry) {
        result = entry;
        msg.className = 'form-msg ok';
        msg.textContent = t.opened;
        setTimeout(() => dialog.close(), 600);
      } else {
        msg.className = 'form-msg error';
        msg.textContent = t.wrong;
        input.select();
      }
    });
    cancel.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      dialog.remove();
      resolve(result);
    });
    dialog.showModal();
    input.focus();
  });
}

/**
 * Show a message with buttons. Resolves with the value of the clicked button.
 * @param {{icon?:string,title:string,text?:string,buttons:Array<{label:string,value:any,kind?:string}>}} opts
 */
export function showMessage({ icon = '', title, text = '', buttons = [{ label: pick(UI).ok, value: true, kind: 'primary' }] }) {
  return new Promise((resolve) => {
    let value = null;
    const btns = buttons.map((b) => {
      const btn = el('button', { class: `btn ${b.kind ? 'btn-' + b.kind : ''}`, type: 'button', text: b.label });
      btn.addEventListener('click', () => {
        value = b.value;
        dialog.close();
      });
      return btn;
    });
    const dialog = el('dialog', { class: 'modal' }, [
      icon ? el('div', { class: 'big', text: icon }) : '',
      el('h2', { text: title }),
      text ? el('p', { text }) : '',
      el('div', { class: 'actions' }, btns),
    ]);
    document.body.append(dialog);
    dialog.addEventListener('close', () => {
      dialog.remove();
      resolve(value);
    });
    dialog.showModal();
  });
}

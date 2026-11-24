// Small shared UI pieces: the code dialog and a generic message dialog.
import { redeem } from './access.js';

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
export function askForCode({ title = 'اكتب كود الحصة 🔑', note = 'المدرس هيقولك الكود' } = {}) {
  return new Promise((resolve) => {
    const input = el('input', {
      class: 'code-input',
      inputmode: 'text',
      autocomplete: 'off',
      autocapitalize: 'off',
      spellcheck: 'false',
      'aria-label': 'الكود',
    });
    const msg = el('div', { class: 'form-msg', role: 'status' });
    const ok = el('button', { class: 'btn btn-primary', type: 'submit', text: 'افتح' });
    const cancel = el('button', { class: 'btn', type: 'button', text: 'رجوع' });
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
        msg.textContent = 'اتفتح! 🎉';
        setTimeout(() => dialog.close(), 600);
      } else {
        msg.className = 'form-msg error';
        msg.textContent = 'الكود ده مش صح. اسأل المدرس';
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
export function showMessage({ icon = '', title, text = '', buttons = [{ label: 'تمام', value: true, kind: 'primary' }] }) {
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

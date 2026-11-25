// 🤖 AI lab: one mission at a time (?m=draw|see|fool|home), the kid ticks what they finished.
import { MISSIONS, STRINGS, TOOLS } from './content.js';
import { pick, applyStrings, wireLangButton } from '../../../assets/js/core/i18n.js';
import { load, save } from '../../../assets/js/core/storage.js';

applyStrings(STRINGS);
wireLangButton(document.getElementById('lang-btn'));
const T = pick(STRINGS);
const KEY = 'ailab:done';
const done = new Set(load(KEY, []));
const want = new URLSearchParams(location.search).get('m');
const mission = MISSIONS.find((m) => m.id === want) ?? MISSIONS[0];

// text with [[Button]] and {{term}} marks → safe HTML
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const rich = (s) => esc(s).replace(/\[\[(.+?)\]\]/g, '<span class="ui">$1</span>').replace(/\{\{(.+?)\}\}/g, '<span class="en">$1</span>');
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};
const allDone = (m) => (m.ar.challenges ?? []).every((_, i) => done.has(`${m.id}:${i}`)) && (m.ar.challenges ?? []).length > 0;

function bar() {
  const nav = document.getElementById('mission-bar');
  nav.innerHTML = '';
  for (const m of MISSIONS) {
    const a = el('a', 'm-dot' + (m === mission ? ' current' : '') + (allDone(m) ? ' done' : ''));
    a.href = `?m=${m.id}`;
    a.innerHTML = `<span class="m-ico">${m.icon}</span><span>${esc(pick(m).name)}</span>`;
    nav.append(a);
  }
}

function render() {
  const S = pick(mission);
  const app = document.getElementById('app');
  app.innerHTML = '';
  const head = el('section', 'm-head');
  head.append(el('div', 'm-big', mission.icon), el('h1', '', esc(S.title)), el('p', 'muted', rich(S.story)));
  app.append(head);

  if (mission.tool) {
    const go = el('div', 'go');
    const a = el('a', 'btn btn-accent', esc(S.go));
    a.href = TOOLS[mission.tool];
    a.target = '_blank';
    a.rel = 'noopener';
    go.append(a);
    app.append(go);
  }
  if (mission.safe) {
    const s = el('div', 'safe');
    s.append(el('span', '', esc(T.safeT)), el('span', '', esc(T.safe1)), el('span', '', esc(T.safe2)));
    app.append(s);
  }
  const ol = el('ol', 'steps');
  S.steps.forEach((t) => ol.append(el('li', '', `<span>${rich(t)}</span>`)));
  app.append(ol);

  if (S.links) {
    const go = el('div', 'go');
    for (const [tool, label] of S.links) {
      const a = el('a', 'btn btn-primary', esc(label));
      a.href = TOOLS[tool];
      a.target = '_blank';
      a.rel = 'noopener';
      go.append(a);
    }
    app.append(go);
  }

  if (S.challenges) {
    app.append(el('h2', 'section-t', esc(T.challenges)));
    S.challenges.forEach((c, i) => {
      const id = `${mission.id}:${i}`;
      const card = el('div', `card ch ${c.kind === 'ch' ? '' : c.kind}`);
      const top = el('div', 'ch-top');
      top.append(el('h3', '', rich(c.t)));
      card.append(top, el('p', '', rich(c.p)));
      if (c.tips) {
        const ul = el('ul');
        c.tips.forEach((t) => ul.append(el('li', '', rich(t))));
        card.append(ul);
      }
      if (c.det) {
        const d = el('div', 'det');
        T.detective.forEach((t) => d.append(el('span', '', esc(t))));
        card.append(d);
      }
      const actions = el('div', 'ch-actions');
      const b = el('button', 'btn done-btn' + (done.has(id) ? ' on' : ''), esc(done.has(id) ? T.done : T.notDone));
      b.type = 'button';
      b.addEventListener('click', () => {
        done.has(id) ? done.delete(id) : done.add(id);
        save(KEY, [...done]);
        render();
        bar();
      });
      actions.append(b);
      if (c.hint) {
        const hb = el('button', 'btn', esc(T.hint));
        hb.type = 'button';
        const hint = el('div', 'hint', rich(c.hint));
        hint.hidden = true;
        hb.addEventListener('click', () => { hint.hidden = !hint.hidden; });
        actions.append(hb);
        card.append(actions, hint);
      } else {
        card.append(actions);
      }
      app.append(card);
    });
  }
}

bar();
render();

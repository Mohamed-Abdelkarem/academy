// Level access with session codes.
// This is a "drawer lock", not a safe: the check runs in the browser, so a programmer
// could get around it. It's meant to stop a child opening next week's levels early.
import { ACCESS_CODES } from '../../../config/access-codes.js';
import { SALT, normalizeCode } from './code-format.js';
import { load, save } from './storage.js';

const KEY = 'access';

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function state() {
  return load(KEY, { all: false, grants: {} });
}

/** Is a level of an activity open on this device? */
export function isUnlocked(activity, levelId) {
  const s = state();
  return s.all || (s.grants[activity] || []).includes(levelId);
}

export function isTeacher() {
  return state().all === true;
}

/**
 * Try a code. On success the grants are saved on this device.
 * @returns {Promise<null | { label: {ar:string,en:string}, all: boolean, grants: object }>}
 */
export async function redeem(rawCode) {
  const code = normalizeCode(rawCode);
  if (!code) return null;
  const hash = await sha256Hex(SALT + code);
  const entry = ACCESS_CODES.find((e) => e.hash === hash);
  if (!entry) return null;

  const s = state();
  if (entry.all) s.all = true;
  for (const [activity, levels] of Object.entries(entry.grants || {})) {
    const set = new Set([...(s.grants[activity] || []), ...levels]);
    s.grants[activity] = [...set].sort((a, b) => a - b);
  }
  save(KEY, s);
  return { label: entry.label, all: !!entry.all, grants: entry.grants || {} };
}

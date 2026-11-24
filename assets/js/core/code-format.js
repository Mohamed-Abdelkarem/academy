// Shared by the browser (access.js) and Node (tools/hash-code.mjs) so both hash codes the same way.
export const SALT = 'academy:v1:';

/** Trim, lowercase, convert Arabic-Indic digits to Latin, drop spaces. */
export function normalizeCode(raw) {
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\s+/g, '');
}

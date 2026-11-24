// Usage: node tools/hash-code.mjs <code> [<code> ...]
// Prints the hash to paste into config/access-codes.js.
// Codes are never stored in the repo, only their hashes.
import { createHash } from 'node:crypto';
import { SALT, normalizeCode } from '../assets/js/core/code-format.js';

const codes = process.argv.slice(2);
if (!codes.length) {
  console.error('Usage: node tools/hash-code.mjs <code> [<code> ...]');
  process.exit(1);
}
for (const c of codes) {
  const h = createHash('sha256').update(SALT + normalizeCode(c)).digest('hex');
  console.log(`${c}\t${h}`);
}

// Guards against FUNCTION_INVOCATION_FAILED on Vercel: package.json is
// "type":"module", so deployed functions run as native ESM and every relative
// runtime import needs an explicit `.js` (or `/index.js`). This compiles api/
// the way Vercel does (plain tsc, no bundling) and imports each deployed entry.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repo = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'api-esm-'));
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? (e.name === '__tests__' ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);

const ignored = fs.readFileSync(path.join(repo, '.vercelignore'), 'utf8')
  .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#') && !l.includes('*'));
const entries = walk(path.join(repo, 'api'))
  .map((f) => path.relative(repo, f).split(path.sep).join('/'))
  .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && !f.includes('/_') && !ignored.includes(f));

try {
  execFileSync(process.execPath, [path.join(repo, 'node_modules/typescript/bin/tsc'), '-p', path.join(repo, 'scripts/tsconfig.api-esm.json'), '--outDir', out], { stdio: 'ignore' });
} catch {
  // type errors are tsc -p api/tsconfig.json's job; we only need the emitted JS
}
fs.writeFileSync(path.join(out, 'package.json'), '{"type":"module"}');
// Let the emitted files resolve packages from the repo's node_modules.
fs.symlinkSync(path.join(repo, 'node_modules'), path.join(out, 'node_modules'), 'junction');

let failed = 0;
for (const entry of entries) {
  const js = path.join(out, entry.replace(/\.ts$/, '.js'));
  try {
    const mod = await import(pathToFileURL(js).href);
    if (typeof mod.default !== 'function') throw new Error('no default export');
    console.log(`ok    ${entry}`);
  } catch (err) {
    failed += 1;
    console.log(`FAIL  ${entry}: ${err.code ?? ''} ${String(err.message).split('\n')[0]}`);
  }
}
fs.rmSync(out, { recursive: true, force: true });
console.log(`\n${entries.length - failed}/${entries.length} deployed functions load as ESM`);
process.exit(failed ? 1 : 0);

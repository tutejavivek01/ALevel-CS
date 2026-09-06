// Copies the Pyodide runtime's binary assets (wasm, stdlib, package
// lock) from node_modules into public/pyodide, where they're served as
// static files. These are large (~14MB) and pinned to the installed
// pyodide version, so they're generated here rather than committed to
// git - same reasoning as .next or node_modules itself. Runs via
// "postinstall" so they exist before the first `dev`/`build`.
//
// Self-hosted rather than loaded from a CDN: this pyodide version
// (see package.json) doesn't correspond to a published jsdelivr CDN
// path, and self-hosting also means the deployed app doesn't depend on
// a third party staying up - matching tech-stack.md's "one-time ~10MB+
// download" being an accepted cost, not an assumption about where from.
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_DIR = path.join(process.cwd(), 'node_modules', 'pyodide');
const DEST_DIR = path.join(process.cwd(), 'public', 'pyodide');

const FILES = [
  'pyodide.asm.wasm',
  'pyodide.asm.mjs',
  'python_stdlib.zip',
  'pyodide-lock.json',
  // The ESM loader - lib/python/pyodide-worker.ts dynamic-imports this
  // by URL (bypassing the bundler entirely, see its comment for why).
  'pyodide.mjs',
];

async function main() {
  await mkdir(DEST_DIR, { recursive: true });
  for (const file of FILES) {
    await copyFile(path.join(SOURCE_DIR, file), path.join(DEST_DIR, file));
  }
  console.log(`Copied ${FILES.length} Pyodide asset(s) to public/pyodide/`);
}

main();

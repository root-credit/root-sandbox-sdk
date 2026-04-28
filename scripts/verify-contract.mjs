#!/usr/bin/env node
/**
 * verify-contract.mjs
 *
 * Mechanical enforcement of the rules in AGENTS.md. Fails (exit 1) if any of
 * the following are violated:
 *
 *   1. A component (under app/** or components/**) calls fetch('/api/...').
 *      → Use a hook in lib/hooks/* or a server action in app/actions/*.
 *
 *   2. A 'use client' module imports `@root-credit/root-sdk`.
 *      → SDK access is server-only. Expose it via app/actions/*.
 *
 *   3. A 'use client' module imports `@/lib/root-api` (or `lib/root-api`).
 *      → Same reason; this module instantiates the SDK with secrets.
 *
 * Run with:
 *   pnpm verify-contract
 *   node scripts/verify-contract.mjs
 *
 * Designed to be dependency-free (Node 20+ stdlib only) so it runs in any CI.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');

/** Directories whose contents must obey the contract rules. */
const SCANNED_DIRS = ['app', 'components', 'lib/hooks'];

/** Always-skipped subdirectories. */
const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  'dist',
  'build',
  '.turbo',
  '.vercel',
]);

/** File extensions we lint. */
const SCANNED_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

/** Server-only files inside the scanned tree (route handlers + server actions). */
function isServerOnlyPath(rel) {
  // app/api/**/*  → route handlers
  // app/actions/**/*  → server actions
  return rel.startsWith(`app${sep}api${sep}`) || rel.startsWith(`app${sep}actions${sep}`);
}

/**
 * Hooks under `lib/hooks/*` are the sanctioned place to call `fetch('/api/...')`.
 * They wrap that I/O so components never need to. They are still subject to the
 * "no SDK in client code" rules.
 */
function isHookPath(rel) {
  return rel.startsWith(`lib${sep}hooks${sep}`);
}

const violations = [];

function record(file, line, rule, snippet) {
  violations.push({ file, line, rule, snippet });
}

/**
 * Walk a directory tree and return absolute file paths matching SCANNED_EXT.
 */
async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out);
    } else if (SCANNED_EXT.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Detects the `'use client'` directive at the top of a module. Tolerates
 * BOM, leading comments, and either single or double quotes.
 */
function isUseClient(source) {
  // Strip BOM + leading whitespace, trailing comments, then look at the very
  // first non-comment token.
  let i = 0;
  const len = source.length;
  // skip BOM
  if (source.charCodeAt(0) === 0xfeff) i = 1;
  while (i < len) {
    // skip whitespace
    while (i < len && /\s/.test(source[i])) i++;
    // skip line comments
    if (source.startsWith('//', i)) {
      const eol = source.indexOf('\n', i);
      if (eol === -1) return false;
      i = eol + 1;
      continue;
    }
    // skip block comments
    if (source.startsWith('/*', i)) {
      const end = source.indexOf('*/', i + 2);
      if (end === -1) return false;
      i = end + 2;
      continue;
    }
    break;
  }
  if (i >= len) return false;
  const head = source.slice(i, i + 14);
  return /^["']use client["']/.test(head);
}

/**
 * Strip block comments and line comments from a JS/TS source so we don't
 * flag patterns that appear only in documentation comments.
 */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + '');
}

const RULES = [
  {
    id: 'no-client-api-fetch',
    label: "fetch('/api/...') from a UI module",
    /**
     * Match `fetch('/api/...')` and `fetch("/api/...")` (with optional
     * whitespace). Allowed in:
     *   - route handlers / server actions (server-side anyway)
     *   - lib/hooks/* (the sanctioned wrapper layer for HTTP-only routes)
     */
    pattern: /\bfetch\s*\(\s*["'`]\/api\//,
    appliesTo: ({ rel }) => !isServerOnlyPath(rel) && !isHookPath(rel),
  },
  {
    id: 'no-client-sdk-import',
    label: "`@root-credit/root-sdk` imported from a 'use client' module",
    pattern: /from\s+["']@root-credit\/root-sdk["']/,
    appliesTo: ({ rel, source }) => !isServerOnlyPath(rel) && isUseClient(source),
  },
  {
    id: 'no-client-root-api-import',
    label: "`lib/root-api` imported from a 'use client' module",
    pattern: /from\s+["'](?:@\/)?lib\/root-api["']/,
    appliesTo: ({ rel, source }) => !isServerOnlyPath(rel) && isUseClient(source),
  },
];

async function lintFile(file) {
  const rel = relative(ROOT, file);
  let source;
  try {
    source = await readFile(file, 'utf8');
  } catch {
    return;
  }
  const cleaned = stripComments(source);
  const ctx = { rel, source };
  for (const rule of RULES) {
    if (!rule.appliesTo(ctx)) continue;
    const lines = cleaned.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!rule.pattern.test(line)) continue;
      record(rel, i + 1, rule.label, line.trim());
    }
  }
}

async function main() {
  const files = [];
  for (const dir of SCANNED_DIRS) {
    const full = join(ROOT, dir);
    try {
      await stat(full);
    } catch {
      continue;
    }
    await walk(full, files);
  }

  await Promise.all(files.map(lintFile));

  if (violations.length === 0) {
    console.log(
      `verify-contract: PASS — scanned ${files.length} files, no contract violations.`,
    );
    return;
  }

  console.error('verify-contract: FAIL\n');
  for (const v of violations) {
    console.error(`  ✖ ${v.file}:${v.line}`);
    console.error(`     ${v.rule}`);
    console.error(`     > ${v.snippet}\n`);
  }
  console.error(
    `Total: ${violations.length} violation${violations.length === 1 ? '' : 's'} ` +
      `across ${files.length} scanned files.\n` +
      'See AGENTS.md for the rules and the recommended fix per pattern.',
  );
  process.exit(1);
}

main().catch((err) => {
  console.error('verify-contract: ERROR', err);
  process.exit(2);
});

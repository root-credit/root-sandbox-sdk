#!/usr/bin/env node
/**
 * npm/yarn/pnpm run this after installing the package from git or `file:`.
 * Vercel often omits nested devDependencies, so `tsup` is not in PATH — use npx.
 * If dist/ already exists (npm tarball or committed build), skip.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const marker = path.join(root, 'dist', 'index.js')

if (fs.existsSync(marker)) {
  console.log('[@useroot/sandbox-sdk] dist/ already present — skipping prepare build')
  process.exit(0)
}

console.log('[@useroot/sandbox-sdk] building dist/ (prepare hook)…')
try {
  execSync('npm run build', {
    stdio: 'inherit',
    cwd: root,
    env: process.env,
    shell: true,
  })
} catch (err) {
  console.error(
    '[@useroot/sandbox-sdk] prepare failed. For file:/workspace installs, package.json "files" must include src/, tsconfig.json, and tsup.config.ts so tsup can compile.',
  )
  throw err
}

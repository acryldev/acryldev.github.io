#!/usr/bin/env node
// Copy the framework docs (docs/framework of the acrylblends repository, a generated copy of ACRYL's text) into src/docs/framework, where the site renders them.
//
//   node scripts/sync-framework-docs.mjs <path to a docs/framework folder>
//
// Never edit the copy: change the text upstream and sync again.
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const source = process.argv[2]
if (!source || !existsSync(join(source, 'README.md'))) {
  console.error('usage: node scripts/sync-framework-docs.mjs <path to a docs/framework folder>')
  process.exit(2)
}
const target = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'docs', 'framework')
rmSync(target, { recursive: true, force: true })
mkdirSync(target, { recursive: true })
cpSync(resolve(source), target, {
  recursive: true,
  filter: (path) => !/(upstream\.json|UPSTREAM\.md)$/.test(path),
})
console.log(`copied ${resolve(source)} to ${target}`)

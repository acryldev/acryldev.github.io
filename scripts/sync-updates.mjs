/**
 * The Updates page's data: ACRYL's GitHub releases and the features and fixes landed on `main`, read from the GitHub API at build time
 * (the Pages workflow runs this every 15 minutes) and written to src/data/updates.json. Only `feat` and `fix` commits are listed; a commit
 * subject is "<type>(<scope>): <title> - <details>", so the title is what comes before the first " - ".
 */
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCommit } from './lib/updates.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src', 'data', 'updates.json')
const repo = 'acryldev/acryl'
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'ACRYL-Updates-Sync/0.1 (+https://acryl.dev)',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
}

async function fetchJson(url) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(20_000) })
  if (!response.ok) throw new Error(`${url} responded with ${response.status}`)
  return response.json()
}

const releases = (await fetchJson(`https://api.github.com/repos/${repo}/releases?per_page=30`))
  .filter(release => !release.draft)
  .map(release => ({
    tag: release.tag_name,
    name: release.name || release.tag_name,
    date: release.published_at,
    url: release.html_url,
    prerelease: release.prerelease,
  }))

const commits = []
for (let page = 1; page <= 3; page += 1) {
  const batch = await fetchJson(`https://api.github.com/repos/${repo}/commits?sha=main&per_page=100&page=${page}`)
  for (const item of batch) {
    const entry = parseCommit(item.commit.message.split('\n')[0])
    if (entry === undefined) continue
    commits.push({ ...entry, sha: item.sha.slice(0, 8), date: item.commit.committer.date, url: item.html_url })
  }
  if (batch.length < 100) break
}

await writeFile(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), repo, releases, commits }, null, 2)}\n`)
console.log(`updates: ${releases.length} releases, ${commits.length} features and fixes`)

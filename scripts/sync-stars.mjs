// Writes public/stars.json with acryldev/acryl's star count, read with the workflow's token at build time. The header reads this file, not the
// GitHub API: an unauthenticated browser shares 60 requests an hour per address, and a busy office or our own agents use that up (the count vanished).
import { writeFileSync } from 'node:fs'

const repository = 'acryldev/acryl'
const headers = { Accept: 'application/vnd.github+json', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) }
const response = await fetch(`https://api.github.com/repos/${repository}`, { headers })
if (!response.ok) {
  // Keep the committed file: a stale count beats none, and the deploy must not fail on GitHub's answer.
  console.warn(`sync-stars: GitHub answered ${response.status}; public/stars.json left as it is`)
} else {
  const { stargazers_count: stars } = await response.json()
  if (typeof stars !== 'number') throw new Error('sync-stars: no stargazers_count in the answer')
  writeFileSync(new URL('../public/stars.json', import.meta.url), `${JSON.stringify({ repository, stars })}\n`)
  console.log(`sync-stars: ${repository} has ${stars} stars`)
}

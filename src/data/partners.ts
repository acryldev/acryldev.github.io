/** OrcaRouter, an ACRYL partner. The link carries ACRYL's referral code, so every place that shows it says so. */
export const orcaRouter = {
  name: 'OrcaRouter',
  url: 'https://www.orcarouter.ai/ref/ref_2bfa348e557d434a67c1',
  headline: '200+ models, one API, no markup',
  summary: 'OrcaRouter gives you 200+ models through a single OpenAI-compatible API, with dynamic routing between them. It adds no markup on tokens: you pay the same prices as from the direct providers.',
  disclosure: 'This is a referral link: if you sign up through it, ACRYL earns a share of what you spend. You pay nothing extra.',
} as const

/** Announcements written by hand. Newest first. The commit list on the Updates page is generated from git and has no room for these. */
export interface NewsItem {
  readonly date: string
  readonly title: string
  readonly body: string
  readonly href: string
  readonly cta: string
}

export const news: readonly NewsItem[] = [
  {
    date: '2026-11-13',
    title: 'OrcaRouter is now an ACRYL partner',
    body: `${orcaRouter.summary} ${orcaRouter.disclosure}`,
    href: orcaRouter.url,
    cta: 'Get a key at OrcaRouter',
  },
]

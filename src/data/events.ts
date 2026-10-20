/** ACRYL events: what /events lists and what /events/<slug> pages read. A new event is one entry here. */

export interface AcrylEvent {
  readonly slug: string
  readonly title: string
  /** ISO date (YYYY-MM-DD) in Vienna time; the day the event happens. */
  readonly date: string
  /** Shown next to the date, e.g. "Friday" or "18:00 to 21:00". */
  readonly when: string
  /** Null while the place is not fixed yet. */
  readonly place: string | null
  readonly summary: string
  /** Where the card links: our own page (starts with /) or the organizer's page. */
  readonly href: string
  readonly links?: readonly { readonly label: string; readonly href: string }[]
}

export const EVENTS: readonly AcrylEvent[] = [
  {
    slug: 'acrylbootcamp',
    title: 'ACRYL Bootcamp',
    date: '2026-11-20',
    when: 'Friday, projected date',
    place: null,
    summary: 'A hands-on day with ACRYL: build your own app with an agent inside, write a plugin for it while it runs, and share it. Bring a laptop.',
    href: '/events/acrylbootcamp',
  },
  {
    slug: 'ownmyai-5',
    title: 'Own Your AI #5',
    date: '2026-10-20',
    when: 'Tuesday, 18:00 to 21:00',
    place: 'IT-Services der Sozialversicherung, Johann-Böhm-Platz 1, 1020 Vienna',
    summary: 'A practitioner story: an IDE that writes its own plugins while it runs, and real apps grown from one blank starting point, shown live.',
    href: 'https://luma.com/2mxma8s0',
    links: [{ label: 'Slides', href: '/demo/ownmyai/' }],
  },
]

/** The bootcamp's registration database: a PocketBase on our own server in Vienna. Anyone may add a row; only we can read one. */
export const REGISTRATIONS_ENDPOINT = 'https://acryl-events.5oyoufxtiwypemsxvsca58rs.213.47.80.26.sslip.io/api/collections/event_registrations/records'

/** Today's date in Vienna as YYYY-MM-DD, so an event stays "upcoming" for its whole day. */
export function viennaToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Vienna', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

export function formatEventDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}

import { ArrowLeft, CalendarDays, Laptop, MapPin } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'
import { BootcampRecap } from '../components/BootcampRecap'
import { ContactCard } from '../components/ContactCard'
import { EVENTS, REGISTRATIONS_ENDPOINT, formatEventDate } from '../data/events'

const EVENT_SLUG = 'acrylbootcamp'
const PAGE_URL = 'https://acryl.dev/events/acrylbootcamp'

type Submission =
  | { readonly state: 'idle' }
  | { readonly state: 'sending' }
  | { readonly state: 'done' }
  | { readonly state: 'failed'; readonly reason: string }

/** Sends one registration (the form closed after the bootcamp; kept for the next one). A second one for the same email counts as done: the person is already on the list. */
export async function register(email: string, name: string, fetcher: typeof fetch = fetch): Promise<Submission> {
  try {
    const response = await fetcher(REGISTRATIONS_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event: EVENT_SLUG, email, name, consent: true }),
      // The database sleeps when idle and needs a few seconds to wake.
      signal: AbortSignal.timeout(30_000),
    })
    if (response.ok) return { state: 'done' }
    const payload: unknown = await response.json().catch(() => undefined)
    const fields = typeof payload === 'object' && payload !== null && 'data' in payload ? (payload as { data?: Record<string, { code?: string }> }).data : undefined
    if (fields?.email?.code === 'validation_not_unique') return { state: 'done' }
    if (fields?.email !== undefined) return { state: 'failed', reason: 'That email address does not look right.' }
    if (response.status === 429) return { state: 'failed', reason: 'Too many tries in a short time. Please wait a minute.' }
    return { state: 'failed', reason: 'The registration did not go through. Please try again, or write to office@web-boxes.com.' }
  } catch {
    return { state: 'failed', reason: 'The registration server did not answer. Please try again in a moment, or write to office@web-boxes.com.' }
  }
}

export function BootcampPage() {
  const event = EVENTS.find(entry => entry.slug === EVENT_SLUG)!

  return (
    <div className="bootcamp-page page-width">
      <Link className="back-link" to="/events"><ArrowLeft aria-hidden="true" /> All events</Link>
      <header className="bootcamp-hero">
        <div>
          <p className="eyebrow">Hands-on evening · Held on 20 November 2026</p>
          <h1>{event.title}</h1>
          <p className="bootcamp-lede">{event.summary}</p>
          <ul className="bootcamp-facts">
            <li><CalendarDays aria-hidden="true" /><span><strong>{formatEventDate(event.date)}</strong>, a Friday evening.</span></li>
            <li><MapPin aria-hidden="true" /><span><strong>{event.place}</strong>. Thank you Julius Gontschar and <a href="https://e3-hub.eu" target="_blank" rel="noreferrer">E3 Hub</a> for the space.</span></li>
            <li><Laptop aria-hidden="true" /><span>Everyone installed ACRYL Control Center, picked a starter and built an app with an agent inside. <a href="https://orcarouter.ai" target="_blank" rel="noreferrer">OrcaRouter</a> sponsored half of the tokens, WebBoxes the other half.</span></li>
          </ul>
        </div>
        <figure className="bootcamp-qr">
          <QRCodeSVG value={PAGE_URL} size={176} level="M" bgColor="#ffffff" fgColor="#171717" />
          <figcaption>acryl.dev/events/acrylbootcamp</figcaption>
        </figure>
      </header>

      <BootcampRecap headingId="bootcamp-recording" />

      <ContactCard />
    </div>
  )
}

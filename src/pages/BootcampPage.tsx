import { ArrowLeft, CalendarDays, Check, Laptop, MapPin, ShieldCheck } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ContactCard } from '../components/ContactCard'
import { EVENTS, REGISTRATIONS_ENDPOINT, formatEventDate } from '../data/events'

const EVENT_SLUG = 'acrylbootcamp'
const PAGE_URL = 'https://acryl.dev/events/acrylbootcamp'

type Submission =
  | { readonly state: 'idle' }
  | { readonly state: 'sending' }
  | { readonly state: 'done' }
  | { readonly state: 'failed'; readonly reason: string }

/** Sends one registration. A second one for the same email counts as done: the person is already on the list. */
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
  const [submission, setSubmission] = useState<Submission>({ state: 'idle' })
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [consent, setConsent] = useState(false)

  const onSubmit = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault()
    if (!consent || submission.state === 'sending') return
    setSubmission({ state: 'sending' })
    setSubmission(await register(email.trim(), name.trim()))
  }

  return (
    <div className="bootcamp-page page-width">
      <Link className="back-link" to="/events"><ArrowLeft aria-hidden="true" /> All events</Link>
      <header className="bootcamp-hero">
        <div>
          <p className="eyebrow">Hands-on day · Projected date</p>
          <h1>{event.title}</h1>
          <p className="bootcamp-lede">{event.summary}</p>
          <ul className="bootcamp-facts">
            <li><CalendarDays aria-hidden="true" /><span><strong>{formatEventDate(event.date)}</strong>, a Friday. The date is projected and may still move.</span></li>
            <li><MapPin aria-hidden="true" /><span><strong>Location to be announced.</strong> We will tell you where in the invitation.</span></li>
            <li><Laptop aria-hidden="true" /><span>Bring a laptop. A model key (for example DeepSeek) helps; we will help you get one.</span></li>
          </ul>
        </div>
        <figure className="bootcamp-qr">
          <QRCodeSVG value={PAGE_URL} size={176} level="M" bgColor="#ffffff" fgColor="#171717" />
          <figcaption>acryl.dev/events/acrylbootcamp</figcaption>
        </figure>
      </header>

      <section className="bootcamp-signup" aria-labelledby="signup-heading">
        <div className="signup-form-wrap">
          <h2 id="signup-heading">Get one invitation</h2>
          <p className="signup-sub">Leave your email and we write to you once, when the date and the place are fixed. That is all.</p>
          {submission.state === 'done' ? (
            <div className="signup-done" role="status">
              <Check aria-hidden="true" />
              <div>
                <strong>You are on the list.</strong>
                <p>We will send you one invitation for the ACRYL Bootcamp. Nothing else.</p>
              </div>
            </div>
          ) : (
            <form className="signup-form" onSubmit={onSubmit}>
              <label>
                <span>Email</span>
                <input type="email" required autoComplete="email" value={email} onChange={change => setEmail(change.target.value)} placeholder="you@example.com" maxLength={200} />
              </label>
              <label>
                <span>Name <em>optional</em></span>
                <input type="text" autoComplete="name" value={name} onChange={change => setName(change.target.value)} maxLength={120} />
              </label>
              <label className="signup-consent">
                <input type="checkbox" required checked={consent} onChange={change => setConsent(change.target.checked)} />
                <span>Yes, send me one invitation to the ACRYL Bootcamp. I have read the privacy note.</span>
              </label>
              <button className="button" type="submit" disabled={submission.state === 'sending'}>
                {submission.state === 'sending' ? 'Sending…' : 'Remind me once'}
              </button>
              {submission.state === 'failed' && <p className="signup-error" role="alert">{submission.reason}</p>}
            </form>
          )}
        </div>
        <aside className="privacy-note" aria-labelledby="privacy-heading">
          <h3 id="privacy-heading"><ShieldCheck aria-hidden="true" /> Privacy (DSGVO / GDPR)</h3>
          <ul>
            <li><strong>Only for one reminder.</strong> We use your email (and your name, if you give it) for a single purpose: to send you one invitation to this bootcamp.</li>
            <li><strong>No mailing list.</strong> You will not get a newsletter, marketing, or any other email from us. No spam.</li>
            <li><strong>Not collected, not used, not shared.</strong> We do not build a contact list from it, do not use it for anything else, and never pass it on.</li>
            <li><strong>Deleted afterwards.</strong> Once the invitation is sent, we delete your entry, and at the latest right after the bootcamp.</li>
            <li><strong>Our own server.</strong> The entry sits on our own server in Vienna, Austria, not with a third-party service. This page sets no cookies and has no tracking.</li>
            <li><strong>Your rights.</strong> Write to <a href="mailto:office@web-boxes.com">office@web-boxes.com</a> and we delete it at once, or tell you what we hold. Responsible: Alex Muzychenko.</li>
          </ul>
        </aside>
      </section>

      <ContactCard />
    </div>
  )
}

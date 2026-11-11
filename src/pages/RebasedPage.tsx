import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin, Presentation, Zap } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'
import { ContactCard } from '../components/ContactCard'
import { EVENTS, formatEventDate } from '../data/events'

const EVENT_SLUG = 'rebaseddotwtf'
const SLIDES_URL = 'https://acryl.dev/demo/rebaseddotwtf/'
const LUMA_URL = 'https://luma.com/e4dvctf5'

/** The talk at rebased Meetup #3: what it is about, where it happens, and the slides. */
export function RebasedPage() {
  const event = EVENTS.find(entry => entry.slug === EVENT_SLUG)!
  return (
    <div className="bootcamp-page page-width">
      <Link className="back-link" to="/events"><ArrowLeft aria-hidden="true" /> All events</Link>
      <header className="bootcamp-hero">
        <div>
          <p className="eyebrow">Lightning talk · Vienna</p>
          <h1>{event.title}</h1>
          <p className="bootcamp-lede">{event.summary}</p>
          <ul className="bootcamp-facts">
            <li><CalendarDays aria-hidden="true" /><span><strong>{formatEventDate(event.date)}</strong>, a Wednesday, from 18:30.</span></li>
            <li><MapPin aria-hidden="true" /><span><strong>Sentry</strong>, Jakov-Lind-Straße 5, 4th floor, 1020 Vienna. The entry door is next to Max &amp; Benito.</span></li>
            <li><Zap aria-hidden="true" /><span>Five minutes, one weird idea: an app that writes its own plugins, and the open framework behind it.</span></li>
          </ul>
          <div className="package-links" style={{ marginTop: 28 }}>
            <a href="/demo/rebaseddotwtf/"><Presentation aria-hidden="true" /> Slides <ArrowUpRight aria-hidden="true" /></a>
            <a href={LUMA_URL} target="_blank" rel="noreferrer">Register on Luma <ArrowUpRight aria-hidden="true" /></a>
            <a href="https://rebased.wtf" target="_blank" rel="noreferrer">rebased.wtf <ArrowUpRight aria-hidden="true" /></a>
          </div>
        </div>
        <figure className="bootcamp-qr">
          <QRCodeSVG value={SLIDES_URL} size={176} level="M" bgColor="#ffffff" fgColor="#171717" />
          <figcaption>acryl.dev/demo/rebaseddotwtf</figcaption>
        </figure>
      </header>
      <ContactCard />
    </div>
  )
}

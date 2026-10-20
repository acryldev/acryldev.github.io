import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ContactCard } from '../components/ContactCard'
import { EVENTS, formatEventDate, viennaToday, type AcrylEvent } from '../data/events'

function EventCard({ event, past }: { readonly event: AcrylEvent; readonly past: boolean }) {
  const internal = event.href.startsWith('/')
  const title = <h3>{event.title}</h3>
  return (
    <article className={past ? 'event-card past' : 'event-card'}>
      <div className="event-date">
        <span className="event-day">{event.date.slice(8, 10)}</span>
        <span>{formatEventDate(event.date).replace(/^\d+ /u, '')}</span>
      </div>
      <div className="event-body">
        {internal ? <Link to={event.href}>{title}</Link> : <a href={event.href} target="_blank" rel="noreferrer">{title}</a>}
        <p className="event-facts">
          <span><CalendarDays aria-hidden="true" /> {event.when}</span>
          <span><MapPin aria-hidden="true" /> {event.place ?? 'Location to be announced'}</span>
        </p>
        <p>{event.summary}</p>
        <div className="package-links">
          {internal
            ? <Link to={event.href}>{past ? 'details' : 'get an invitation'} <ArrowUpRight aria-hidden="true" /></Link>
            : <a href={event.href} target="_blank" rel="noreferrer">event page <ArrowUpRight aria-hidden="true" /></a>}
          {event.links?.map(link => <a key={link.href} href={link.href}>{link.label} <ArrowUpRight aria-hidden="true" /></a>)}
        </div>
      </div>
    </article>
  )
}

export function EventsPage() {
  const today = viennaToday()
  const upcoming = [...EVENTS.filter(event => event.date >= today)].sort((a, b) => a.date.localeCompare(b.date))
  const past = [...EVENTS.filter(event => event.date < today)].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="events-page page-width">
      <header className="page-intro">
        <p className="eyebrow">Events</p>
        <h1>Meet ACRYL in person.</h1>
        <p>Talks, demos and hands-on days where we build apps with an agent inside. Come and bring your questions.</p>
      </header>
      <section className="event-list" aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading" className="eyebrow">Upcoming</h2>
        {upcoming.length === 0 ? <p className="empty-note">Nothing scheduled right now.</p> : upcoming.map(event => <EventCard key={event.slug} event={event} past={false} />)}
      </section>
      {past.length > 0 && (
        <section className="event-list" aria-labelledby="past-heading">
          <h2 id="past-heading" className="eyebrow">Past</h2>
          {past.map(event => <EventCard key={event.slug} event={event} past />)}
        </section>
      )}
      <ContactCard />
    </div>
  )
}

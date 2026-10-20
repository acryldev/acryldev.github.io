import { ArrowUpRight, CalendarDays, Linkedin, Mail, Send } from 'lucide-react'

const channels = [
  { icon: Linkedin, label: 'LinkedIn', value: 'alexandermusichen', href: 'https://www.linkedin.com/in/alexandermusichen/' },
  { icon: CalendarDays, label: 'Book a call', value: 'all0e.com/@alex', href: 'https://all0e.com/@alex' },
  { icon: Send, label: 'Telegram', value: 't.me/musichen', href: 'https://t.me/musichen' },
  { icon: Mail, label: 'Email', value: 'office@web-boxes.com', href: 'mailto:office@web-boxes.com' },
  { icon: Mail, label: 'Email', value: 'alex.musichen@gmail.com', href: 'mailto:alex.musichen@gmail.com' },
] as const

/** Who to talk to about ACRYL and its events. */
export function ContactCard() {
  return (
    <section className="contact-card" aria-labelledby="contact-name">
      <img className="contact-photo" src="/people/alex-muzychenko.jpg" alt="Alex Muzychenko" width="160" height="160" />
      <div className="contact-copy">
        <p className="eyebrow">Talk to the maker</p>
        <h2 id="contact-name">Alex Muzychenko</h2>
        <p className="contact-role">Builds ACRYL. Happy to talk about agents, plugins and apps you want to grow.</p>
        <ul className="contact-channels">
          {channels.map(channel => (
            <li key={channel.value}>
              <a href={channel.href} target={channel.href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">
                <channel.icon aria-hidden="true" />
                <span className="contact-label">{channel.label}</span>
                <span className="contact-value">{channel.value}</span>
                {channel.href.startsWith('mailto:') ? null : <ArrowUpRight className="contact-out" aria-hidden="true" />}
              </a>
            </li>
          ))}
        </ul>
        <p className="contact-note">The call booking runs on All0e, our own app: its agent books the call in my calendar.</p>
      </div>
    </section>
  )
}

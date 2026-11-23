import { ArrowUpRight, Play } from 'lucide-react'
import { BOOTCAMP_APPS_URL, BOOTCAMP_LUMA_URL, BOOTCAMP_SHORTS, BOOTCAMP_VIDEO_ID, BOOTCAMP_VIDEO_URL } from '../data/bootcampRecap'

/** The bootcamp recording, embedded without cookies until it plays, with the Shorts and the shared apps beside it. */
export function BootcampRecap({ headingId }: { readonly headingId: string }) {
  return (
    <section className="bootcamp-recap" aria-labelledby={headingId}>
      <div className="bootcamp-recap-head">
        <p className="eyebrow">Recording · 31 min</p>
        <h2 id={headingId}>Watch the bootcamp</h2>
        <p>Friday 20 November 2026 at E3 Hub, Vienna: a room of builders made their own apps with an agent inside, in one evening.</p>
      </div>
      <div className="bootcamp-video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${BOOTCAMP_VIDEO_ID}`}
          title="ACRYL Bootcamp Vienna, 20 November 2026 (full session)"
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <ul className="bootcamp-shorts" aria-label="Shorts from the bootcamp">
        {BOOTCAMP_SHORTS.map(short => (
          <li key={short.id}>
            <a href={`https://www.youtube.com/shorts/${short.id}`} target="_blank" rel="noreferrer">
              <img src={`https://i.ytimg.com/vi/${short.id}/hqdefault.jpg`} alt="" loading="lazy" width="480" height="360" />
              <span><Play aria-hidden="true" /> {short.title}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="package-links bootcamp-recap-links">
        <a href={BOOTCAMP_VIDEO_URL} target="_blank" rel="noreferrer">Open on YouTube <ArrowUpRight aria-hidden="true" /></a>
        <a href={BOOTCAMP_APPS_URL} target="_blank" rel="noreferrer">The apps people shared <ArrowUpRight aria-hidden="true" /></a>
        <a href={BOOTCAMP_LUMA_URL} target="_blank" rel="noreferrer">Event page <ArrowUpRight aria-hidden="true" /></a>
      </div>
    </section>
  )
}

import { ArrowUpRight, Github } from 'lucide-react'
import { WORKSHOP_ORG_INVITE_URL, WORKSHOP_ORG_STEPS } from '../../lib/controlCenter'

/** Step three for everyone: join the workshop's GitHub organization with your own account, so the shared repositories are reachable. */
export function OrgInvite() {
  return (
    <section className="workshop-install workshop-org" aria-labelledby="workshop-org-title">
      <div>
        <p className="eyebrow">Step 3</p>
        <h2 id="workshop-org-title">Join the workshop on GitHub</h2>
        <p>You were invited to the ACRYL WORKSHOP organization by email. Join it with your own GitHub account, so you can use the workshop's shared repositories.</p>
      </div>
      <div className="workshop-org-body">
        <ol className="workshop-steps">
          {WORKSHOP_ORG_STEPS.map(step => <li key={step}>{step}</li>)}
        </ol>
        <a className="button" href={WORKSHOP_ORG_INVITE_URL} target="_blank" rel="noreferrer">
          <Github aria-hidden="true" /> Open the invitation <ArrowUpRight aria-hidden="true" />
        </a>
        <p className="workshop-note-inline">Use the account in your own name. If the page says there is no invitation, ask the facilitator: invitations are sent to the email you registered with.</p>
      </div>
    </section>
  )
}

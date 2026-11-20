import { DEPLOY_LINE, MAKE_STEPS, SHARE_APP_IN_CONTROL_CENTER, SHARE_APP_IN_THE_APP, SHARE_PLUGIN_STEPS } from '../../lib/controlCenter'

function Steps({ steps }: { readonly steps: readonly string[] }) {
  return <ol className="workshop-steps">{steps.map(step => <li key={step}>{step}</li>)}</ol>
}

/** Step two for everyone: from the Blends store to a running app, one action per line. */
export function MakeAppSteps() {
  return (
    <section className="workshop-install workshop-make" aria-labelledby="workshop-make-title">
      <div>
        <p className="eyebrow">Step 2</p>
        <h2 id="workshop-make-title">Make your app</h2>
        <p>Everything happens inside Control Center. You never need a terminal.</p>
      </div>
      <Steps steps={MAKE_STEPS} />
    </section>
  )
}

/** Sharing an app (two ways, same result) and a plugin, inside Control Center and the app itself. */
export function ShareSteps() {
  return (
    <div className="workshop-aside-card">
      <h3>Share what you made</h3>
      <details open>
        <summary>Share your app (works for every app)</summary>
        <Steps steps={SHARE_APP_IN_CONTROL_CENTER} />
      </details>
      <details>
        <summary>Share your app from inside it (if it shows the gear)</summary>
        <Steps steps={SHARE_APP_IN_THE_APP} />
      </details>
      <details>
        <summary>Share a plugin</summary>
        <Steps steps={SHARE_PLUGIN_STEPS} />
      </details>
      <p className="workshop-note-inline">{DEPLOY_LINE}</p>
      <p className="workshop-note-inline">Then paste the links above. Registry discovery runs hourly: until your entry appears, keep <strong>Published - indexing pending</strong> selected. Sharing is not a catalogue entry.</p>
      <p className="workshop-note-inline">Community plugins and Blends are community-maintained and not reviewed by ACRYL.</p>
    </div>
  )
}

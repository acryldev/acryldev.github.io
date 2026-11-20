import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { openModelKey } from '../../lib/workshopKey'

/** The provider form in Control Center's Settings > Models, as the workshop wants it filled in. */
const PROVIDER_FIELDS: readonly (readonly [string, string])[] = [
  ['Display name', 'OrcaRouter'],
  ['Base URL', 'https://api.orcarouter.ai/v1'],
  ['API protocol', 'OpenAI Chat Completions'],
  ['Retry policy', 'Default (Transient errors)'],
  ['Models', 'keep orcarouter/free (OrcaRouter Free), or click Fetch available models'],
  ['API key', 'the workshop key below'],
]

/** The model key for this workshop, sealed in the site and opened only with the password spoken in the room. Shown in My project only. */
export function ModelKeyCard() {
  const [password, setPassword] = useState('')
  const [key, setKey] = useState<string>()
  const [error, setError] = useState<string>()
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const reveal = async (): Promise<void> => {
    setBusy(true)
    setError(undefined)
    try {
      setKey(await openModelKey(password))
      setPassword('')
    } catch (cause) {
      setKey(undefined)
      setError(cause instanceof Error ? cause.message : 'Wrong password.')
    } finally {
      setBusy(false)
    }
  }
  const copy = async (): Promise<void> => {
    if (key === undefined) return
    try {
      await navigator.clipboard.writeText(key)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard refused (an insecure page, a locked-down browser): the field is selectable by hand.
    }
  }

  return (
    <section className="workshop-model-key" aria-labelledby="workshop-model-key-title">
      <div>
        <p className="eyebrow">Your model key</p>
        <h3 id="workshop-model-key-title">Set up OrcaRouter</h3>
        <p>In ACRYL Control Center, and the same way inside an ACRYL Blend app: open Settings (the gear) &gt; Models, then add a provider (or open the OrcaRouter card and click Edit). Fill it in like this:</p>
      </div>
      <dl className="workshop-model-fields">
        {PROVIDER_FIELDS.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {key === undefined
        ? (
            <form className="workshop-model-reveal" onSubmit={event => { event.preventDefault(); void reveal() }}>
              <label className="workshop-field">
                <span>Workshop password</span>
                <input
                  type="password"
                  autoComplete="off"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  aria-describedby={error === undefined ? 'workshop-model-key-hint' : 'workshop-model-key-error'}
                />
              </label>
              <button type="submit" className="button" disabled={busy || password === ''}>{busy ? 'Checking...' : 'Show key'}</button>
              {error !== undefined
                ? <p id="workshop-model-key-error" className="workshop-error" role="alert">{error}</p>
                : <p id="workshop-model-key-hint" className="workshop-note-inline">The facilitator gives you the password in the room. It is not stored on this site.</p>}
            </form>
          )
        : (
            <div className="workshop-model-reveal">
              <label className="workshop-field">
                <span>OrcaRouter API key</span>
                <input readOnly value={key} onFocus={event => event.currentTarget.select()} />
              </label>
              <div className="workshop-model-actions">
                <button type="button" className="button secondary small" onClick={() => void copy()}>
                  {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />} {copied ? 'Copied' : 'Copy key'}
                </button>
                <button type="button" className="button secondary small" onClick={() => { setKey(undefined); setCopied(false) }}>Hide</button>
              </div>
            </div>
          )}
      <p className="workshop-note-inline">This key is for the workshop only and shared by everyone: never put it in a repository, a screenshot or a public app.</p>
    </section>
  )
}

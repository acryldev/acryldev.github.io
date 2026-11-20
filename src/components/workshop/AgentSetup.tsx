import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { AGENT_SETUP_PROMPT } from '../../lib/controlCenter'

/** For a participant who cannot do the setup alone: one button copies a complete brief for their own coding agent. */
export function AgentSetup() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(AGENT_SETUP_PROMPT)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2400)
    } catch {
      // Clipboard refused (an insecure page, a locked-down browser): the text is on screen to select by hand.
    }
  }
  return (
    <section className="workshop-agent" aria-labelledby="workshop-agent-title">
      <div className="workshop-agent-head">
        <div>
          <p className="eyebrow">Stuck on the setup?</p>
          <h2 id="workshop-agent-title">Let your AI agent set it up</h2>
          <p>Paste this into your own coding agent (Claude Code, Codex, Cursor, ChatGPT...). It installs ACRYL Control Center for you and tells you what it did.</p>
        </div>
        <button type="button" className="button" onClick={() => void copy()}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />} {copied ? 'Copied' : 'Copy for my agent'}
        </button>
      </div>
      <p className="workshop-agent-note">Coding agents in the app's right panel use the ones installed on your computer: Pi <code>npm i -g @earendil-works/pi-coding-agent</code>, Claude Code <code>npm i -g @anthropic-ai/claude-code</code>, Codex <code>npm i -g @openai/codex</code>. Sign in to each once, in its own tab.</p>
      <textarea className="workshop-agent-text" readOnly value={AGENT_SETUP_PROMPT} rows={12} aria-label="Instructions for your AI agent" onFocus={event => event.currentTarget.select()} />
    </section>
  )
}

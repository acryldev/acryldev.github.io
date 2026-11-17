// Animated diagrams for the ACRYL microVMs page: what happens when an agent runs code in a box, and why.
// Pure SVG + CSS keyframes (classes mvi-*). The un-animated state of every element is a readable still diagram,
// so prefers-reduced-motion shows the same story without movement.
import { useId, type ReactNode } from 'react'

const K = 0.866 // cos 30deg, isometric projection

/** An isometric cube whose top vertex of the front edge sits at (cx, cy); s is the edge length. */
function Cube({ cx, cy, s, className = '', dots = false }: { cx: number; cy: number; s: number; className?: string; dots?: boolean }) {
  const p = (pts: readonly (readonly [number, number])[]) => pts.map(([x, y]) => `${x},${y}`).join(' ')
  const top = p([[cx, cy - s / 2], [cx + K * s, cy], [cx, cy + s / 2], [cx - K * s, cy]])
  const left = p([[cx - K * s, cy], [cx, cy + s / 2], [cx, cy + 1.5 * s], [cx - K * s, cy + s]])
  const right = p([[cx, cy + s / 2], [cx + K * s, cy], [cx + K * s, cy + s], [cx, cy + 1.5 * s]])
  return (
    <g className={`mvi-cube ${className}`}>
      <polygon className="mvi-face-top" points={top} />
      <polygon className="mvi-face-left" points={left} />
      <polygon className="mvi-face-right" points={right} />
      {dots && [-0.35, 0, 0.35].map(d => <circle key={d} className="mvi-dot" cx={cx + d * K * s} cy={cy + (d === 0 ? 0 : 0.08 * s)} r={Math.max(1.6, s / 16)} />)}
    </g>
  )
}

function Chip({ x, y, w, text, className = '' }: { x: number; y: number; w: number; text: string; className?: string }) {
  return (
    // the class goes on the outer group so a CSS transform animation does not replace the positioning transform
    <g className={`mvi-chip ${className}`}>
      <g transform={`translate(${x} ${y})`}>
        <rect x={-w / 2} y={-10} width={w} height={20} rx={4} />
        <text x={0} y={4}>{text}</text>
      </g>
    </g>
  )
}

function Frame({ title, children }: { title: string; children: (gradient: string) => ReactNode }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className="mvi-svg" viewBox="0 0 360 200" role="img" aria-label={title}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--spectrum-start)" />
          <stop offset=".5" stopColor="var(--spectrum-mid)" />
          <stop offset="1" stopColor="var(--spectrum-end)" />
        </linearGradient>
      </defs>
      {children(`url(#g${id})`)}
    </svg>
  )
}

function RunsInBox() {
  return (
    <Frame title="An agent sends a command into a box; the result comes back.">
      {g => <>
        <rect className="mvi-panel" x={14} y={56} width={92} height={80} rx={6} />
        <text className="mvi-label" x={60} y={76}>agent</text>
        <rect className="mvi-line-fill" x={28} y={88} width={64} height={5} rx={2} />
        <rect className="mvi-line-fill" x={28} y={100} width={48} height={5} rx={2} />
        <rect className="mvi-line-fill" x={28} y={112} width={56} height={5} rx={2} />
        <line className="mvi-wire" x1={110} y1={96} x2={252} y2={96} />
        <Cube cx={296} cy={50} s={40} />
        <polygon className="mvi-glow mvi-a1-glow" stroke={g} points={`296,30 ${296 + K * 40},50 ${296 + K * 40},90 296,110 ${296 - K * 40},90 ${296 - K * 40},50`} />
        <text className="mvi-label" x={296} y={134}>box · own kernel</text>
        <Chip className="mvi-a1-cmd" x={158} y={80} w={92} text="python run.py" />
        <Chip className="mvi-a1-out mvi-chip-ok" x={180} y={114} w={70} text="✓ exit 0" />
        <text className="mvi-note" x={180} y={170}>commands in · output and files back</text>
      </>}
    </Frame>
  )
}

function OwnKernel() {
  return (
    <Frame title="A destructive command wrecks only its own box; the host is untouched.">
      {g => <>
        {[80, 180, 280].map(x => <Cube key={x} cx={x} cy={44} s={28} className={x === 180 ? 'mvi-a2-hit' : ''} />)}
        <polygon className="mvi-danger mvi-a2-flash" points={`180,30 ${180 + K * 28},44 ${180 + K * 28},72 180,86 ${180 - K * 28},72 ${180 - K * 28},44`} />
        {[80, 180, 280].map(x => <text key={x} className="mvi-label" x={x} y={104}>guest kernel</text>)}
        <line className="mvi-wire" x1={16} y1={122} x2={344} y2={122} />
        <text className="mvi-note" x={180} y={136}>hypervisor · KVM or Hypervisor.framework</text>
        <rect className="mvi-panel" x={16} y={148} width={328} height={34} rx={5} />
        <text className="mvi-label mvi-left" x={30} y={169}>your machine · host kernel</text>
        <text className="mvi-ok mvi-right mvi-a2-ok" x={330} y={169}>✓ untouched</text>
        <path className="mvi-glow-line" stroke={g} d="M16 182 H344" />
        <Chip className="mvi-a2-cmd mvi-chip-bad" x={180} y={12} w={64} text="rm -rf /" />
      </>}
    </Frame>
  )
}

function SnapshotClone() {
  return (
    <Frame title="One prepared box is snapshotted and cloned into a fresh box per task.">
      {g => <>
        <Cube cx={70} cy={66} s={36} dots />
        <circle className="mvi-flash mvi-a3-flash" cx={70} cy={84} r={44} fill={g} />
        <text className="mvi-label" x={70} y={150}>prepared once</text>
        <text className="mvi-note" x={70} y={166}>packages · files · env</text>
        {[34, 96, 158].map((y, i) => <g key={y}>
          <line className="mvi-wire" x1={122} y1={96} x2={222} y2={y + 12} />
          <g className={`mvi-a3-clone mvi-a3-c${i}`}><Cube cx={250} cy={y - 8} s={20} dots /></g>
          <text className="mvi-label mvi-left" x={282} y={y + 16}>{['task a', 'task b', 'task c'][i]}</text>
        </g>)}
        <text className="mvi-note" x={172} y={84}>snapshot</text>
      </>}
    </Frame>
  )
}

function NetworkSecrets() {
  return (
    <Frame title="Requests leave the box only to allowed hosts; the real secret is added outside the guest.">
      {g => <>
        <Cube cx={46} cy={70} s={30} />
        <text className="mvi-label" x={46} y={136}>box</text>
        <text className="mvi-note" x={46} y={152}>holds $TOKEN only</text>
        <rect className="mvi-proxy" x={148} y={28} width={52} height={146} rx={5} />
        <text className="mvi-note" x={174} y={20}>host proxy</text>
        <line className="mvi-wire" x1={74} y1={86} x2={148} y2={56} />
        <line className="mvi-wire" x1={200} y1={56} x2={252} y2={56} />
        <line className="mvi-wire mvi-wire-bad" x1={74} y1={104} x2={148} y2={144} />
        <rect className="mvi-panel" x={252} y={42} width={98} height={28} rx={4} />
        <text className="mvi-label" x={301} y={60}>api.github.com</text>
        <rect className="mvi-panel mvi-panel-bad" x={252} y={130} width={98} height={28} rx={4} />
        <text className="mvi-label" x={301} y={148}>evil.example</text>
        <text className="mvi-bad mvi-a4-x" x={174} y={150}>✕</text>
        <path className="mvi-glow-line" stroke={g} d="M148 28 V174" />
        <g transform="translate(100 74)"><g className="mvi-a4-req">
          <g className="mvi-a4-placeholder"><Chip x={0} y={0} w={58} text="$TOKEN" /></g>
          <g className="mvi-a4-real"><Chip className="mvi-chip-ok" x={0} y={0} w={58} text="ghp_••••" /></g>
        </g></g>
        <g transform="translate(100 118)"><g className="mvi-a4-leak"><Chip className="mvi-chip-bad" x={0} y={0} w={58} text="POST key" /></g></g>
      </>}
    </Frame>
  )
}

const panels = [
  { art: RunsInBox, title: 'The agent works through a box', how: 'Your app starts a box from an image and hands it the commands the agent wrote. Output, exit codes and files come back over the same channel.', why: 'The agent can install packages and run anything, and none of it happens on your machine.' },
  { art: OwnKernel, title: 'Every box has its own kernel', how: 'A hypervisor sits between each box and your machine. A container shares your kernel; a box brings its own.', why: 'A destructive or hostile command breaks one box, which you throw away. Your files and the other boxes are not reachable from it.' },
  { art: SnapshotClone, title: 'Prepare once, branch per task', how: 'Install what the agent needs in one box, snapshot it, and clone it for each task. The disk stays until you remove the box.', why: 'Every run starts from the same known-good state, and parallel attempts cannot step on each other.' },
  { art: NetworkSecrets, title: 'Network and secrets stay yours', how: 'Outbound traffic goes only to hosts you allow. A secret is bound to hosts and headers; the host side writes the real value into matching requests.', why: 'Code that was tricked into leaking a key has nothing to leak: the guest only ever sees a placeholder.' },
] as const

export function MicrovmIllustrations() {
  return (
    <div className="mvi-grid">
      {panels.map(p => (
        <figure className="mvi-card" key={p.title}>
          <div className="mvi-stage"><p.art /></div>
          <figcaption>
            <h3>{p.title}</h3>
            <p>{p.how}</p>
            <p className="mvi-why"><strong>Why it matters.</strong> {p.why}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

/** The hero logo: floats, catches a light sweep, and sends out small boxes. */
export function MicrovmHeroLogo() {
  return (
    <div className="mv-logo-wrap">
      <div className="mv-logo-glow" />
      {[0, 1, 2].map(i => (
        <svg key={i} className={`mv-spawn mv-spawn-${i}`} viewBox="-12 -12 24 26" aria-hidden="true">
          <Cube cx={0} cy={-6} s={10} />
        </svg>
      ))}
      <div className="mv-logo-float">
        <img className="mv-logo" src="/acrylmicrovm/logo.webp" alt="ACRYL microVMs logo" width="280" height="280" />
        <div className="mv-logo-sheen" aria-hidden="true" />
      </div>
    </div>
  )
}

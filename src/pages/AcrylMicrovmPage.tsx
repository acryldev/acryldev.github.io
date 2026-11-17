import { ArrowUpRight, Box, Cpu, Github, GitBranch, Globe, KeyRound, Laptop, Layers, Package, ShieldCheck, Terminal } from 'lucide-react'
import { statusLabel, type Status } from '../lib/guides'
import { MicrovmHeroLogo, MicrovmIllustrations } from '../components/MicrovmIllustrations'

const repo = 'https://github.com/acryldev/acrylmicrovm'

const steps = [
  { icon: Package, name: 'Pick an image', line: 'Any OCI image from a registry: python:slim, node:alpine, your own.' },
  { icon: Cpu, name: 'Start a box', line: 'A micro-VM boots a Linux guest on that image. The host process that runs it is sandboxed too.' },
  { icon: Terminal, name: 'Run things in it', line: 'Execute commands, stream their output, copy files in and out.' },
  { icon: GitBranch, name: 'Keep it or branch it', line: 'The disk survives restarts. Snapshot a box, clone it, export it and import it elsewhere.' },
] as const

const gets = [
  { icon: Cpu, title: 'A kernel per box', body: 'Code runs in a guest VM under KVM on Linux or Hypervisor.framework on macOS, not as a process on your host. A bug in the code cannot reach your kernel directly.' },
  { icon: Layers, title: 'Ordinary images', body: 'Boxes start from the images you already build and test. Nothing to repackage.' },
  { icon: Box, title: 'State that stays', body: 'Install packages, write files, come back later. Snapshots and clones turn one prepared box into many.' },
  { icon: Globe, title: 'Network you control', body: 'Turn the network off, or on with an allow list of hosts the guest may reach.' },
  { icon: KeyRound, title: 'Secrets outside the guest', body: 'Bind a secret to hosts and headers. The host proxy writes the real value into matching requests; the guest only holds a placeholder.' },
  { icon: ShieldCheck, title: 'A sandboxed helper', body: 'The process that drives each VM runs under namespaces, a chroot, a seccomp filter and cgroups on Linux, and a Seatbelt profile on macOS.' },
] as const

const platforms = [
  ['macOS', 'Apple Silicon', 'macOS 12 or newer'],
  ['Linux', 'x86_64 and ARM64', 'KVM enabled, /dev/kvm accessible'],
  ['Windows', 'x86_64', 'Under WSL2, with KVM support'],
] as const

const stands: readonly { readonly status: Status; readonly title: string; readonly body: string }[] = [
  { status: 'building', title: 'Getting the first build green', body: 'The project was renamed recently. Some dependencies still resolve to their old locations and are being re-created under ours.' },
  { status: 'planned', title: 'Packages under our names', body: 'Python, Node.js and Rust packages and a binary installer. Until then, build from source.' },
  { status: 'planned', title: 'Our own benchmarks', body: 'Start-up time and memory per box, measured on our hardware and published here with the method. No numbers until then.' },
  { status: 'planned', title: 'A sandbox for ACRYL apps', body: 'We may use it to give an app\'s agent a safe place to run code. Nothing is wired up yet.' },
]

function Code({ label, lines }: { readonly label: string; readonly lines: readonly string[] }) {
  return (
    <div className="guide-code">
      <p className="guide-code-label">{label}</p>
      <pre><code>{lines.join('\n')}</code></pre>
    </div>
  )
}

export function AcrylMicrovmPage() {
  return (
    <>
      <section className="home-hero grid-surface">
        <div className="page-width hero-content mv-hero">
          <MicrovmHeroLogo />
          <div>
          <p className="eyebrow">ACRYL microVMs</p>
          <h1>A kernel for every box.<br /><strong className="spectrum-text">Run untrusted code safely.</strong></h1>
          <p className="hero-lede">ACRYL microVMs starts small virtual machines from ordinary container images. Code an agent writes runs inside one, on its own kernel, and the machine keeps its disk until you throw it away. Link it into your app as a library, or run it as a command or a service.</p>
          <div className="hero-cta">
            <a className="button" href={repo} target="_blank" rel="noreferrer"><Github aria-hidden="true" /> View on GitHub</a>
            <span className="status-tag building">work in progress</span>
          </div>
          </div>
          <figure className="hero-film mv-film">
            <video
              src="/acrylmicrovm/how-it-works.mp4"
              poster="/acrylmicrovm/how-it-works.jpg"
              autoPlay muted loop playsInline preload="metadata"
              aria-label="How ACRYL microVMs works: an agent's code could reach everything on your machine; run it in a box with its own kernel instead; a bad command breaks only the box; prepare a box once and clone it per task; secrets stay outside the box and only allowed hosts are reachable"
            />
            <figcaption>Why a box, in 48 seconds. The command in it is the real one.</figcaption>
          </figure>
        </div>
      </section>

      <section className="home-band page-width" aria-labelledby="mv-watch">
        <div className="section-intro">
          <div><p className="eyebrow">Watch it work</p><h2 id="mv-watch">Where agent code<br /><span className="spectrum-text">actually runs.</span></h2></div>
          <p>An agent writes code you have not read. These four pictures show where that code runs, what it can reach, and why a box is the safer place for it.</p>
        </div>
        <MicrovmIllustrations />
      </section>

      <section className="home-band page-width" aria-labelledby="mv-how">
        <div className="section-intro">
          <div><p className="eyebrow">How it works</p><h2 id="mv-how">Four steps from image<br /><span className="spectrum-text">to a running box.</span></h2></div>
          <p>A box is a micro-VM with a name, a disk and a lifetime you control. The engine is a library with no background service and no root, so your app starts boxes itself.</p>
        </div>
        <ol className="nouns-row mv-steps">
          {steps.map(s => <li key={s.name}><s.icon aria-hidden="true" /><strong>{s.name}</strong><span>{s.line}</span></li>)}
        </ol>
      </section>

      <section className="home-band page-width" aria-labelledby="mv-gets">
        <div className="section-intro">
          <div><p className="eyebrow">What you get</p><h2 id="mv-gets">Isolation that is<br /><span className="spectrum-text">cheap enough to use.</span></h2></div>
          <p>Each of these is in the source today; we checked them against the code before writing this page.</p>
        </div>
        <div className="atoms-grid">
          {gets.map(g => <article className="atom-card" key={g.title}><div><g.icon aria-hidden="true" /></div><h3>{g.title}</h3><p>{g.body}</p></article>)}
        </div>
      </section>

      <section className="home-band page-width" aria-labelledby="mv-run">
        <div className="section-intro">
          <div><p className="eyebrow">Three ways to run it</p><h2 id="mv-run">A library, a command,<br /><span className="spectrum-text">or a service.</span></h2></div>
          <p>Bindings exist for Python, Node.js, Go, Rust and C. The commands below work once the first packages are published; until then, build from source.</p>
        </div>
        <div className="mv-code-grid">
          <Code label="As a library (Python)" lines={[
            'import asyncio, acrylmicrovm',
            '',
            'async def main():',
            '    async with acrylmicrovm.SimpleBox(image="python:slim") as box:',
            '        result = await box.exec("python", "-c", "print(1 + 1)")',
            '        print(result.stdout)',
            '',
            'asyncio.run(main())',
          ]} />
          <Code label="As a command" lines={['$ acrylmicrovm run python:slim python -c \'print(1 + 1)\'']} />
          <Code label="As a service" lines={['$ acrylmicrovm serve', '# listens on 127.0.0.1:8100 and speaks REST']} />
        </div>
      </section>

      <section className="home-band page-width" aria-labelledby="mv-where">
        <div className="section-intro">
          <div><p className="eyebrow">Where it runs</p><h2 id="mv-where">Your machine,<br /><span className="spectrum-text">with hardware virtualisation.</span></h2></div>
          <p>A box needs a hypervisor underneath. Intel Macs are not supported.</p>
        </div>
        <div className="run-grid">
          {platforms.map(([os, cpu, need]) => <article key={os}><Laptop aria-hidden="true" /><h3>{os}</h3><p>{cpu}. {need}.</p></article>)}
        </div>
      </section>

      <section className="home-band page-width" aria-labelledby="mv-stands">
        <div className="section-intro">
          <div><p className="eyebrow">Where it stands</p><h2 id="mv-stands">Early, and honest<br /><span className="spectrum-text">about it.</span></h2></div>
          <p>About 250,000 lines of Rust in 639 files, counted on 16 November 2026 in the repository. It is code we can read, change and extend.</p>
        </div>
        <ul className="mv-stands">
          {stands.map(s => (
            <li key={s.title}>
              <span className={`status-tag ${s.status}`}>{statusLabel[s.status]}</span>
              <strong>{s.title}</strong>
              <span>{s.body}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="final-cta grid-surface" aria-labelledby="mv-cta">
        <p className="eyebrow">Open source</p>
        <h2 id="mv-cta">Apache-2.0.<br /><span className="spectrum-text">Read it, run it, extend it.</span></h2>
        <p>The repository carries the full licence text, a NOTICE file with the attribution and the list of changes, and the source of every part described here.</p>
        <div>
          <a className="button" href={repo} target="_blank" rel="noreferrer"><Github aria-hidden="true" /> acryldev/acrylmicrovm <ArrowUpRight aria-hidden="true" /></a>
        </div>
      </section>
    </>
  )
}

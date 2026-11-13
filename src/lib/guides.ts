/**
 * The platform guides: Get started, Concepts, Build, Reference and Vision, written as data so every page reads the same way.
 *
 * Writing rules (owner, 2026-11-13): only what works today is written without a tag; everything else carries a visible status. One term per thing
 * (plugin, Blend, ADE). Commands first, explanation second. Every command here was run against acryl 0.2.7 from npm on 2026-11-13, except the ones
 * tagged `next`, which are on main and ship in the next release.
 */
export type Status = 'next' | 'building' | 'planned' | 'shipped'

export const statusLabel: Record<Status, string> = {
  shipped: 'shipped',
  next: 'next release',
  building: 'building',
  planned: 'planned',
}

export interface Code {
  readonly label?: string
  readonly lines: readonly string[]
}

export interface Section {
  readonly id: string
  readonly title: string
  readonly status?: Status
  /** Paragraphs. `code` spans are written with backticks. */
  readonly body?: readonly string[]
  /** Commands shown before the paragraphs: the steps themselves. */
  readonly code?: readonly Code[]
  /** Commands shown after the paragraphs: an optional way to do what they describe. */
  readonly after?: readonly Code[]
  /** Short items, each `term: text`, or plain text. */
  readonly list?: readonly string[]
}

export interface Guide {
  readonly slug: string
  readonly eyebrow: string
  readonly title: string
  readonly accent: string
  readonly intro: string
  readonly sections: readonly Section[]
  readonly next?: readonly { readonly label: string; readonly to: string }[]
}

export const start: Guide = {
  slug: 'start',
  eyebrow: 'Get started',
  title: 'Your first app,',
  accent: 'in five minutes.',
  intro: 'From an empty folder to an app that an agent grows while it runs. Every step is one command you can paste.',
  sections: [
    {
      id: 'requirements',
      title: '1. Check what you need',
      body: [
        'Node.js 22.19 or newer (or 24), npm and git. macOS, Windows and Linux all work.',
        'The launcher checks this for you: open it and pick Check this machine.',
      ],
      code: [{ lines: ['node --version', 'npx acryl'] }],
    },
    {
      id: 'first-app',
      title: '2. Make your first app',
      body: [
        'An app is a folder. `acryl new` writes it, with the agent, the frame and a first page, and makes it its own git repository.',
      ],
      code: [{ lines: ['npx acryl new my-app', 'cd my-app', 'npm install'] }],
    },
    {
      id: 'run',
      title: '3. Run it on the Web, then on the Desktop',
      body: [
        '`npm run dev` opens the app in your browser. `npm run desktop` opens the same app in its own window. Both run the same plugins from the same folder.',
      ],
      code: [{ lines: ['npm run dev', 'npm run desktop'] }],
    },
    {
      id: 'model',
      title: '4. Connect a model',
      body: [
        'Open Settings > Models in the app and add one: a DeepSeek key, another provider, or a sign-in. The agent uses it from the next message.',
      ],
      after: [{ label: 'Or from a terminal (next release)', lines: ['acryl model set deepseek'] }],
    },
    {
      id: 'ask',
      title: '5. Ask the agent for a change',
      body: [
        'Type what you want in the chat, for example "add a notes page". The agent writes it as a plugin into the running app: the page appears without a restart, and the plugin is a folder you can read in `plugins/`.',
        'Save the result as a version from the Versions panel, or from the terminal:',
      ],
      after: [{ lines: ['npm run save -- "add a notes page"'] }],
    },
    {
      id: 'next-steps',
      title: 'Next steps',
      list: [
        'Pull a plugin: `npm run acryl -- plugin pull github:<owner>/<repo>@<version>` inside a running app.',
        'Start from a Blend: `npx acryl new csv-explorer --from acrylblends.csv-explorer`.',
        'Publish a plugin: `npm run acryl -- plugin publish <name>` releases it to your GitHub.',
      ],
    },
  ],
  next: [
    { label: 'Concepts: the five nouns', to: '/concepts' },
    { label: 'Build: task guides', to: '/build' },
    { label: 'Browse the Blends catalog', to: '/blends' },
  ],
}

export const concepts: Guide = {
  slug: 'concepts',
  eyebrow: 'Concepts',
  title: 'How ACRYL',
  accent: 'fits in one head.',
  intro: 'ACRYL is a platform and framework for agentic apps. The agent is one part of an app, a driver. The IDE is one app, ADE. Everything is a Cordis plugin.',
  sections: [
    {
      id: 'overview',
      title: 'Platform overview',
      body: [
        'You start an app blank or from a Blend. An agent inside the app grows it with plugins while it runs. You share plugins, save versions, publish the app to your own GitHub, and run it on the Web or the Desktop.',
        'ACRYL is open source (MIT): the framework, the launcher, ADE and the registries.',
      ],
    },
    {
      id: 'five-nouns',
      title: 'The five nouns',
      list: [
        'App: a folder. `blend.yaml` says what the app is, `plugins/` holds its code, its data lives with it. Copy the folder, you copy the app.',
        'Host: one process that runs one app. Cordis loads every plugin and can attach or detach one while the app runs.',
        'Plugin: the only unit of capability: a page, a tool, a service. If it is a feature, it is a plugin.',
        'Surface: Web, Desktop or terminal. It draws what the Host serves and forwards input; it owns no logic.',
        'Driver: an agent working inside the app, from its folder, through the same door every agent uses. The built-in chat is one driver among many.',
      ],
    },
    {
      id: 'apps-and-blends',
      title: 'Apps and Blends',
      body: [
        'A Blend is an app someone made into a starting point: its `blend.yaml`, its plugins and a lock file. The registry at acrylblends.github.io lists them; `acryl new <dir> --from <id>` makes your own copy.',
      ],
    },
    {
      id: 'plugins',
      title: 'Plugins',
      body: [
        'A plugin is a Cordis plugin: a name, what it needs, and an apply function. It registers routes, pages, tools or services, and everything it registered goes away when it unloads. That is why a running app can take a new plugin, or drop one, without a restart.',
        'One term: plugin. Not extension, not package.',
      ],
    },
    {
      id: 'surfaces',
      title: 'Surfaces',
      list: [
        'Web: `npm run dev`, in your browser.',
        'Desktop: `npm run desktop`, in its own window.',
        'Terminal (TUI): coming.',
      ],
    },
    {
      id: 'drivers',
      title: 'Drivers and agents',
      body: [
        'The chat inside an app is one driver. A terminal agent started in the app folder is another: Claude Code, Codex, pi, Cursor CLI, Qwen Code, Amp and Goose have each built a working plugin into a running app this way.',
      ],
    },
    {
      id: 'door',
      title: 'The door',
      body: [
        'Every app has one door, the same for every driver: `look` reads the page, `act` clicks, types and navigates, `plugin` adds, pulls, publishes and removes plugins, `tool` calls the app\'s tools. It answers on the command line (`npm run acryl -- <verb>`) and over MCP, so any agent can drive any app.',
      ],
      code: [{ lines: ['npm run acryl -- brief', 'npm run acryl -- look', 'npm run acryl -- act click --ref <r>'] }],
    },
    {
      id: 'where-things-live',
      title: 'Where things live',
      body: [
        'Your app is its folder, wherever you made it. What ACRYL keeps for you (installed plugins, settings, app instances) lives under `~/.acryl`, the same path on macOS, Windows and Linux.',
      ],
    },
    {
      id: 'versions',
      title: 'Snapshots and versions',
      body: [
        'A version is a git commit of the app folder. Save one from the Versions panel or with `npm run save`; restoring makes a new commit that brings an old version back, so history is never rewritten. `npm run snapshot` captures the app with its plugin lock so it can be passed on exactly.',
      ],
    },
  ],
}

export const build: Guide = {
  slug: 'build',
  eyebrow: 'Build',
  title: 'Task guides,',
  accent: 'one job each.',
  intro: 'Each guide is the commands first, then what they do. Run them inside your app folder unless the guide says otherwise.',
  sections: [
    { id: 'create', title: 'Create an app', code: [{ lines: ['npx acryl new my-app', 'cd my-app && npm install && npm run dev'] }], body: ['Or run `npx acryl` and pick Create an app.'] },
    { id: 'plugin-by-hand', title: 'Add a plugin by hand', code: [{ lines: ['npm run acryl -- plugin add plugins/pomodoro'] }], body: ['Write a folder under `plugins/` with an `index.ts` that exports a Cordis plugin, then add it to the running app. Edit it and `plugin reload` picks up the change.'] },
    { id: 'agent-builds', title: 'Let the agent build plugins', body: ['Ask in the app\'s chat, or start any coding agent in the app folder: the folder carries the docs and skill that tell it how the app is built, and the door is how it installs what it writes.'] },
    { id: 'share', title: 'Publish and pull a plugin', code: [{ lines: ['npm run acryl -- plugin publish notes', 'npm run acryl -- plugin pull github:you/notes@0.1.0'] }], body: ['Publishing shows a plan first (owner, repository, version, licence, files) and releases to your GitHub after you confirm. A pull installs into the running app and records where the plugin came from.'] },
    { id: 'versions', title: 'Version and roll back', code: [{ lines: ['npm run save -- "what changed"'] }], body: ['The Versions panel lists every save; Restore brings one back as a new commit.'] },
    { id: 'desktop', title: 'Run on the Desktop', code: [{ lines: ['npm run desktop'] }], body: ['The same app in its own window, from the same folder.'] },
    { id: 'from-blend', title: 'Make an app from a Blend', code: [{ lines: ['npx acryl new csv-explorer --from acrylblends.csv-explorer', 'cd csv-explorer && npm install && npm run dev'] }] },
    { id: 'publish-app', title: 'Share a whole app', code: [{ lines: ['npm run save', 'npx acryl new their-copy --from github:you/my-app'] }], body: ['Give the app an `acryl.template.json` with a name and a description, then `npm run save` commits it and pushes it to its own repository. Anyone can start from that repository with `--from`. Listing an app in the public Blends registry is a review by the registry maintainers today; a publish command is planned.'] },
    { id: 'outside-agent', title: 'Drive an app from an outside agent', code: [{ lines: ['npm run acryl -- brief', 'npm run acryl -- look', 'npm run acryl -- act type --ref <r> --text "hello" --submit'] }], body: ['Any agent that can run a command, or speak MCP, can read and operate a running app through its door.'] },
  ],
}

export const reference: Guide = {
  slug: 'reference',
  eyebrow: 'Reference',
  title: 'Commands',
  accent: 'and files.',
  intro: 'The `acryl` command, the app scripts every app has, and the files that describe an app.',
  sections: [
    {
      id: 'cli',
      title: 'acryl',
      code: [{ lines: [
        'npx acryl                          # the launcher: every step, no commands to remember',
        'acryl new <dir> [--from <id | folder | git URL>]',
        'acryl save [-m <message>]          # commit the app and push it',
        'acryl plugin pull <source>         # store:<name>, github:<owner>/<repo>[@version], npm:<name>',
        'acryl plugin share <plugin>        # release a plugin to its own GitHub repository',
        'acryl doctor | acryl repair        # diagnose and fix a profile that will not start',
        'acryl control list                 # running apps this CLI can drive',
        'acryl --help',
      ] }],
    },
    {
      id: 'cli-next',
      title: 'acryl, next release',
      status: 'next',
      code: [{ lines: [
        'acryl ade                          # ADE, the agentic development environment',
        'acryl --tui | --gui | --web        # the launcher in a terminal, a window or a browser',
        'acryl model set deepseek',
        'acryl apps add <folder>',
      ] }],
    },
    {
      id: 'scripts',
      title: 'App scripts',
      code: [{ lines: [
        'npm run dev         # the app in the ACRYL frame, in the browser',
        'npm run desktop     # the same, in its own window',
        'npm start           # the app on its own',
        'npm run acryl -- <verb>   # the door: brief, look, act, plugin, window, menu, tool',
        'npm run save        # commit and push',
        'npm run snapshot    # capture | verify | apply',
        'npm run upgrade     # newer frame and library plugins',
        'npm test',
      ] }],
    },
    {
      id: 'blend-yaml',
      title: 'blend.yaml',
      body: ['The app as data, in the format `blends.acryl.dev/v1alpha1`. Edit it, not the code, to switch a plugin off (`disabled: true`) or change its config. `blend.lock.json` records the exact plugin folders and digests a snapshot was made from.'],
      list: [
        'metadata: `id`, `name`, `version`, `category`, `description`, `license` (SPDX) and `visibility` (`private` until you publish).',
        'spec.parameters: values a person sets when they make an app from it, such as `hostname`.',
        'spec.rows: the plugins, in load order. Each row has an `id`, the plugin `name` and its `config`.',
      ],
    },
    {
      id: 'registry',
      title: 'Registry format',
      body: [
        'A registry is a folder of Blends plus one `index.json`. The public one is served at `acrylblends.github.io/registry/index.json`; a team can keep its own with the same layout.',
        '`index.json` is `{ "formatVersion": 1, "entries": [...] }`. Each Blend folder sits at `blends/<id>/`, with its `blend.yaml` inside.',
      ],
      list: [
        'identity: `id`, `name`, `version`, `category`, `description` and `license`, copied from the Blend\'s `blend.yaml`.',
        'kind: `Blueprint`.',
        'path: the folder, `blends/<id>`.',
        'parent: the Blueprint it grew from, when it has one.',
        'runtime: `acrylblends` for an app `acryl new --from <id>` makes; `acryl` for a starter for the ACRYL app itself, which `acryl new` refuses.',
        'archive, integrity: the packed folder and its sha512 digest.',
      ],
    },
    {
      id: 'home',
      title: 'Settings and home folder',
      body: ['`~/.acryl` on every OS. `ACRYL_HOME` (an absolute path) moves it, for an isolated run or a test. `ACRYLBLENDS_PORT` picks the port an app serves on.'],
    },
    {
      id: 'door-verbs',
      title: 'Door verbs',
      list: [
        '`brief`, `verbs`: what this app is and what it can do.',
        '`look [--window <n>]`: the page as an accessibility tree with refs.',
        '`act`: click, type, select, press, scroll, reload, navigate, wait.',
        '`plugin`: list, add, pull, publish, remove, reload.',
        '`window`, `menu`: list, open, focus, close, resize; on the Desktop, menu list and click.',
        '`tool`: list, call. The same verbs are MCP tools at the app\'s `/mcp` route.',
      ],
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      list: [
        'Node version: apps need Node 22.19+ or 24; `node --version` tells you which you have.',
        'Port in use: another app holds it; stop that app, or set `ACRYLBLENDS_PORT`.',
        'Desktop will not open: run `npm install` in the app first; it brings the Electron the window runs in.',
        'Anything else: `npx acryl` > Check this machine, then open an issue at github.com/acryldev/acryl with what it printed.',
      ],
    },
  ],
}

export const vision: Guide = {
  slug: 'vision',
  eyebrow: 'Vision',
  title: 'Where ACRYL',
  accent: 'is going.',
  intro: 'A small core, a framework on top, and apps on top of that, including ADE. Each line says whether it is shipped, being built or planned.',
  sections: [
    { id: 'framework', title: 'The framework: apps from plugins', status: 'shipped', body: ['Blank apps, Blends from the registry, plugins built by an agent into a running app, plugin sharing, versions, Web and Desktop.'] },
    { id: 'launcher', title: 'The launcher', status: 'shipped', body: ['`npx acryl`: every step offered in a terminal. A window and a browser face of the same launcher ship in the next release.'] },
    { id: 'ade', title: 'ADE, the agentic development environment', status: 'building', body: ['The ACRYL IDE as one app on the platform: workspace, terminals, any coding agent. Available as the Blend `acryl.ade`; `acryl ade` opens it from the next release.'] },
    { id: 'core', title: 'A lightweight core with no built-in agent', status: 'building', body: ['`@acryl/core`: the Host, the plugin loader and the door, with the agent as an optional driver plugin.'] },
    { id: 'tui', title: 'A terminal surface for apps', status: 'planned', body: ['The third surface next to Web and Desktop.'] },
    { id: 'one-file', title: 'One-file desktop apps', status: 'planned', body: ['An app packed as a single installable desktop file.'] },
    { id: 'webboxes', title: 'Hosting on WebBoxes.ai', status: 'planned', body: ['Your apps, running in the cloud, with the same plugins and the same folder.'] },
  ],
}

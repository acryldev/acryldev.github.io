/** Where participants get the ACRYL Control Center and how they use it. Participants use this app only, never a terminal. */

/** Control Center's own release repository: its releases/latest/download links never change, whichever version is the latest. */
const RELEASE_REPO = 'https://github.com/acrylblends/63-acryl-control-center'
export const CONTROL_CENTER_RELEASES = `${RELEASE_REPO}/releases/latest`
const DOWNLOAD = `${RELEASE_REPO}/releases/latest/download/`

export type Platform = 'mac' | 'windows' | 'linux' | 'other'

export interface Installer {
  readonly id: string
  readonly platform: Exclude<Platform, 'other'>
  readonly label: string
  readonly hint: string
  readonly file: string
  readonly primary: boolean
}

export const INSTALLERS: readonly Installer[] = [
  { id: 'mac-arm64', platform: 'mac', label: 'Mac, Apple chip', hint: 'Any Mac from late 2020 on (M1, M2, M3, M4)', file: 'ACRYL-Control-Center-mac-arm64.dmg', primary: true },
  { id: 'mac-x64', platform: 'mac', label: 'Mac, Intel', hint: 'Older Macs. Apple menu > About This Mac says which you have', file: 'ACRYL-Control-Center-mac-x64.dmg', primary: true },
  { id: 'win-x64', platform: 'windows', label: 'Windows', hint: 'Windows 10 or 11 on a normal PC', file: 'ACRYL-Control-Center-win-x64.exe', primary: true },
  { id: 'win-arm64', platform: 'windows', label: 'Windows on ARM', hint: 'Only for ARM PCs, such as Surface Pro X', file: 'ACRYL-Control-Center-win-arm64.exe', primary: false },
  { id: 'linux-x64', platform: 'linux', label: 'Linux', hint: 'Debian or Ubuntu (.deb)', file: 'ACRYL-Control-Center-linux-x64.deb', primary: true },
  { id: 'linux-arm64', platform: 'linux', label: 'Linux on ARM', hint: 'Only for ARM computers', file: 'ACRYL-Control-Center-linux-arm64.deb', primary: false },
]

/** The one line a person needs the first time, per system (the same words as the release page). No terminal command: Linux opens the file by double-click. */
export const FIRST_START: Readonly<Record<Exclude<Platform, 'other'>, string>> = {
  mac: 'The app is not signed yet: the first time, right-click it and choose Open.',
  windows: 'If SmartScreen asks, click "More info" and then "Run anyway".',
  linux: 'Double-click the .deb file to open it in the Software app.',
}

/**
 * What a person does when their system blocks the unsigned app. FIRST_START stays one line with no terminal; these are the follow-ups, and macOS needs one
 * Terminal command, so they live here and in the agent brief on purpose.
 */
export const TRUST_HELP: Readonly<Record<Exclude<Platform, 'other'>, readonly string[]>> = {
  mac: [
    'If macOS says "ACRYL Control Center can\'t be opened because it is from an unidentified developer", or the icon says the app is damaged:',
    'Open Terminal and run: sudo xattr -cr "/Applications/ACRYL Control Center.app"',
    'Type your Mac password when it asks (it does not show), then open ACRYL Control Center again.',
  ],
  windows: [
    'If SmartScreen says "Windows protected your PC": click "More info", then "Run anyway".',
    'If Windows blocks the file instead: right-click the .exe > Properties > check "Unblock" > OK, then run it again.',
    'Windows 10 and Windows 11 show these the same way.',
  ],
  linux: ['Nothing extra: Linux installs the .deb you chose to open and does not block ACRYL Control Center.'],
}

export const downloadUrl = (installer: Installer): string => `${DOWNLOAD}${installer.file}`

/** The visitor's system from the browser's own words; a phone or an unknown browser is 'other' and sees every installer. */
export function platformOf(userAgent: string, platform = ''): Platform {
  const text = `${userAgent} ${platform}`
  if (/android|iphone|ipad|ipod|cros/i.test(text)) return 'other'
  if (/windows|win32|win64/i.test(text)) return 'windows'
  if (/macintosh|mac os|macintel/i.test(text)) return 'mac'
  if (/linux|x11/i.test(text)) return 'linux'
  return 'other'
}

/*
 * What a participant clicks, in the words Control Center shows (confirmed against Control Center main bcd27361). One action per line.
 * Change a label here and every place that tells a participant where to click follows.
 */
export const STORE = 'Blends store'
export const MAKE_AN_APP = 'Make an app'
export const CONFIRM_MAKE = 'Make it'

export const MAKE_STEPS: readonly string[] = [
  'Open ACRYL Control Center.',
  `Click "${STORE}" on the left. Each card says Official or Community.`,
  `Click "${MAKE_AN_APP}" on the card you like. The form is called "New app from" and the Blend's name.`,
  `The Name is filled in. Change it if you like, choose Web or Desktop, then click "${CONFIRM_MAKE}".`,
  `If you see "Getting Node.js and GitHub's tool ready for your apps", wait a minute and press "${CONFIRM_MAKE}" again.`,
  'It says your app is made and starting. The card shows "running".',
  'Click "Open in the browser" (a desktop app says "Open in a window").',
]

const CONNECT_AND_SHARE: readonly string[] = [
  'If it asks, click "Connect GitHub". A code appears and github.com/login/device opens: enter the code and click Authorize.',
  'It says "GitHub: signed in as" and your name.',
  'Choose "Private: only you and people you invite", or "Public: anyone, listed as Community".',
  'Click "Review what would be sent".',
  'Click "Yes, share" your app.',
]

export const SHARE_APP_IN_CONTROL_CENTER: readonly string[] = ['In Control Center, open your app\'s card and click "Share".', ...CONNECT_AND_SHARE]
export const SHARE_APP_IN_THE_APP: readonly string[] = ['Only if your app shows the gear: open Settings (the gear) and click "Share".', ...CONNECT_AND_SHARE]

export const SHARE_PLUGIN_STEPS: readonly string[] = [
  'Inside your app, open Settings and click "Plugins".',
  'Find your plugin\'s row and click "Share".',
  'Choose Private or Public, then confirm.',
  'It gets its own GitHub repository and release. A public one shows in the Cordis registry as Community.',
]

/** For a shared Public app that should be online: the card's Deploy to WebBoxes.ai (Control Center 0.2.1). */
export const DEPLOY_LINE = 'To put a shared Public app online: its card > Deploy to WebBoxes.ai, sign in, Create WebBox, then Publish.'

/** "In Control Center: Blends store > Notes > Make an app" */
export const createPathOf = (blueprintName: string): string => `In Control Center: ${STORE} > ${blueprintName} > ${MAKE_AN_APP} > ${CONFIRM_MAKE}`

/** The shared workshop's GitHub organization: the invitation page, and what joining it means. */
export const WORKSHOP_ORG_INVITE_URL = 'https://github.com/orgs/acrylworkshop/invitation'

export const WORKSHOP_ORG_STEPS: readonly string[] = [
  'Sign in at github.com with your own GitHub account (create one if you do not have one: it is free).',
  'Open the invitation, sent by email to the address you registered with: ' + WORKSHOP_ORG_INVITE_URL,
  'Click "Join ACRYL WORKSHOP". The Copilot seat offer is optional: tick or untick it as you like.',
  'The shared workshop repositories are under github.com/acrylworkshop. Use your own account: never a shared one.',
]

/**
 * What a participant pastes into their own coding agent (Claude Code, Codex, Cursor, ChatGPT...) when they cannot do the setup themselves. Every link and command in it
 * was run for this text: the six download links answer, `npm create @acryldev/blends@latest my-app -- --from acrylblends.link-shortener` only MAKES the app (it neither
 * installs nor starts it), `npm install` then `npm run dev` prints http://127.0.0.1:<port>/?token=... to open. Sharing is left to the person: the share steps need
 * their GitHub sign-in and their own yes, and `npm run share` exists only in some apps.
 */
/** Verified on npm 2026-11-20: @earendil-works/pi-coding-agent, @anthropic-ai/claude-code, @openai/codex. */
export const AGENT_SETUP_PROMPT = `Help me set up ACRYL for a workshop. Do these steps on my computer and tell me what you did after each one.

1. Find my system: macOS Apple silicon, macOS Intel, Windows x64, Windows ARM, Linux x64 or Linux ARM.

2. Download ACRYL Control Center for it from https://github.com/acrylblends/63-acryl-control-center/releases/latest/download/<file>, where <file> is one of: ACRYL-Control-Center-mac-arm64.dmg, ACRYL-Control-Center-mac-x64.dmg, ACRYL-Control-Center-win-x64.exe, ACRYL-Control-Center-win-arm64.exe, ACRYL-Control-Center-linux-x64.deb, ACRYL-Control-Center-linux-arm64.deb. Then install it:
- macOS: open the .dmg and drag the app to Applications. The app is not signed yet, so the first time I open it, right-click it and choose Open. If macOS says "ACRYL Control Center can't be opened because it is from an unidentified developer", run in Terminal: sudo xattr -cr "/Applications/ACRYL Control Center.app" and open the app again.
- Windows: run the .exe. If SmartScreen says "Windows protected your PC", click "More info" and then "Run anyway". If Windows blocks the file instead, right-click the .exe > Properties > check "Unblock" > OK, then run it again. Windows 10 and 11 show these the same way.
- Linux (Debian or Ubuntu): sudo apt install ./<file>.deb. Linux does not block ACRYL Control Center.

3. Start ACRYL Control Center. On its first start it gets what it needs by itself (Node.js and GitHub's gh tool); nothing else has to be installed.

4. If the window cannot be used, the same works in a terminal with Node.js 22.19 or newer:
   npm create @acryldev/blends@latest my-app -- --from acrylblends.link-shortener
   (that only makes the app: it does not install or start it. --from names a Blend of the store, https://acrylblends.github.io/blends; leave it out for an empty app)
   cd my-app
   npm install
   npm run dev
   The last command prints an address (http://127.0.0.1:<port>/?token=...). Open it in my browser.

5. Set up the workshop model key when I ask: in ACRYL Control Center, and the same way inside an ACRYL Blend app, open Settings (the gear) > Models, click Add provider, choose the Custom model API tab, and fill in: Provider ID orcarouter; Display name OrcaRouter; Base URL https://api.orcarouter.ai/v1; API protocol OpenAI Chat Completions; then press Fetch available models so the list fills itself from OrcaRouter; leave the fetched list as it is and do not add models by hand. Always use deepseek-v4.1-flash (DeepSeek V4.1 Flash) as my model in this workshop and prefer it in every app we make; switch to another only if it fails; API key: I paste the workshop key myself from https://acryl.dev/workshoppanel, My project, "Your model key", after I enter the workshop password. Never enter that key, a password or any secret for me, and never write the key into a file, a commit, a screenshot or a chat.

6. Make sure I have joined the ACRYL WORKSHOP GitHub organization with my own account: open https://github.com/orgs/acrylworkshop/invitation in my browser, sign in as me, and click "Join ACRYL WORKSHOP" (the Copilot seat is optional). Do not accept the invitation for me, do not create an account for me, and never ask for my GitHub password.

7. Do not share anything to GitHub for me. When I want to share my app, I do it myself: in Control Center, the app's card, Share, then Connect GitHub.

Do not enter any password or API key for me: ask me to type them myself.`

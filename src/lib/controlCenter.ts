/** Where participants get the ACRYL Control Center and how they use it. Participants use this app only, never a terminal. */

/** The published Control Center release the installers belong to; move it with each new release. */
const RELEASE_TAG = 'control-center-v0.2.1'
export const CONTROL_CENTER_RELEASES = `https://github.com/acryldev/acryl/releases/tag/${RELEASE_TAG}`
const DOWNLOAD = `https://github.com/acryldev/acryl/releases/download/${RELEASE_TAG}/`

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

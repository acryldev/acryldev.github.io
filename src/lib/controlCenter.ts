/** Where participants get the ACRYL Control Center and how they use it. Participants use this app only, never a terminal. */

export const CONTROL_CENTER_RELEASES = 'https://github.com/acrylblends/63-acryl-control-center/releases/latest'
const DOWNLOAD = `${CONTROL_CENTER_RELEASES}/download/`

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
]

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
 * The menu path inside Control Center. PLACEHOLDER until the Mac walk confirms the exact labels: change these two
 * constants and every place that tells a participant what to click follows.
 */
export const CREATE_STEPS = ['Blends', '{name}', 'Create'] as const
export const SHARE_STEPS = ['My apps', '{name}', 'Share'] as const

const follow = (steps: readonly string[], name: string): string => `In Control Center: ${steps.map(step => step.replace('{name}', name)).join(' > ')}`

/** "In Control Center: Blends > Notes > Create" */
export const createPathOf = (blueprintName: string): string => follow(CREATE_STEPS, blueprintName)

/** "In Control Center: My apps > Your app > Share" */
export const sharePathOf = (appName: string): string => follow(SHARE_STEPS, appName)

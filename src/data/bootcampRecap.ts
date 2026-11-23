/** What the ACRYL Bootcamp of 20 November 2026 left behind: the recording, the Shorts cut from it, and the apps the room shared. */

export const BOOTCAMP_VIDEO_ID = 'rw_Is1Amd3M'
export const BOOTCAMP_VIDEO_URL = `https://youtu.be/${BOOTCAMP_VIDEO_ID}`
export const BOOTCAMP_APPS_URL = 'https://github.com/acrylworkshop'
export const BOOTCAMP_LUMA_URL = 'https://luma.com/nvede5nv'

export interface BootcampShort {
  readonly id: string
  readonly title: string
}

export const BOOTCAMP_SHORTS: readonly BootcampShort[] = [
  { id: '_B0PhEBm7wU', title: 'What is ACRYL' },
  { id: 'ctY-3rJSMA4', title: 'Build apps by chatting with an AI agent' },
  { id: 'w3bRXonOwqs', title: 'Software that is alive, like Lego' },
  { id: 'xZ_r-F1j8fY', title: 'The weirdness tracker, built live' },
  { id: 'aE3A5nJbH28', title: 'A hospital control center in one evening' },
  { id: 'oU-8MvuvqQU', title: 'Thank you, Vienna' },
]

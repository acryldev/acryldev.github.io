/**
 * One live, working demo per registry component (spec 038-ui-component-library). Each demo is
 * a small real usage of the actual, unmodified component source under `./components/`, not a
 * screenshot or description. Kept in one file so `UiPage.tsx` stays a thin renderer.
 */
import { useState } from 'react'
import type { ReactElement } from 'react'
import { Alert } from './components/acryl.ui.alert/Alert'
import { AppearanceCubes } from './components/acryl.ui.appearance-cubes/AppearanceCubes'
import { Avatar } from './components/acryl.ui.avatar/Avatar'
import { Badge } from './components/acryl.ui.badge/Badge'
import { Card } from './components/acryl.ui.card/Card'
import { Dialog } from './components/acryl.ui.dialog/Dialog'
import { EmptyState } from './components/acryl.ui.empty-state/EmptyState'
import { Kbd } from './components/acryl.ui.kbd/Kbd'
import { Progress } from './components/acryl.ui.progress/Progress'
import { SelectPill } from './components/acryl.ui.select-pill/SelectPill'
import { Separator } from './components/acryl.ui.separator/Separator'
import { SettingsRow } from './components/acryl.ui.settings-row/SettingsRow'
import { SidebarRow } from './components/acryl.ui.sidebar-row/SidebarRow'
import { Skeleton } from './components/acryl.ui.skeleton/Skeleton'
import { Spinner } from './components/acryl.ui.spinner/Spinner'
import { SwitchField } from './components/acryl.ui.switch-field/SwitchField'
import { Tabs } from './components/acryl.ui.tabs/Tabs'
import { ToolCallCard } from './components/acryl.ui.tool-call-card/ToolCallCard'

const toolLabels = { input: 'IN', output: 'OUT', running: 'Running', failed: 'Failed', stopped: 'Stopped' }
const dot = <span aria-hidden>&#9656;</span>

function AlertDemo() {
  return <div style={{ display: 'grid', gap: 8 }}>
    <Alert title="Heads up">This is a default alert.</Alert>
    <Alert variant="error" title="Something failed">This is an error alert.</Alert>
  </div>
}
function AppearanceCubesDemo() {
  const [value, setValue] = useState('dark')
  return <AppearanceCubes title="Appearance" value={value} onChange={setValue} options={[{ id: 'light', label: 'Light' }, { id: 'dark', label: 'Dark' }, { id: 'system', label: 'System' }]} />
}
function AvatarDemo() {
  return <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <Avatar fallback="AM" size="sm" /><Avatar fallback="AM" /><Avatar fallback="AM" size="lg" />
  </div>
}
function BadgeDemo() {
  return <div style={{ display: 'flex', gap: 8 }}>
    <Badge>Default</Badge><Badge variant="primary">Primary</Badge><Badge variant="success">Success</Badge><Badge variant="warning">Warning</Badge><Badge variant="error">Error</Badge>
  </div>
}
function CardDemo() {
  return <Card title="Settings" footer={<button type="button">Save</button>}>A bordered surface with a title and footer.</Card>
}
function DialogDemo() {
  const [open, setOpen] = useState(false)
  return <>
    <button type="button" onClick={() => { setOpen(true) }}>Open dialog</button>
    <Dialog open={open} title="Delete item?" onClose={() => { setOpen(false) }} onConfirm={() => {}} confirmLabel="Delete">This cannot be undone.</Dialog>
  </>
}
function EmptyStateDemo() {
  return <EmptyState title="Nothing yet" description="Saved items appear here" />
}
function KbdDemo() {
  return <span>Press <Kbd>&#8984;</Kbd> + <Kbd>K</Kbd></span>
}
function ProgressDemo() {
  const [value, setValue] = useState(40)
  return <div style={{ display: 'grid', gap: 8 }}>
    <Progress value={value} />
    <button type="button" onClick={() => { setValue(v => (v + 20) % 120) }}>Advance</button>
  </div>
}
function SelectPillDemo() {
  const [value, setValue] = useState('write')
  return <SelectPill label="Permission" value={value} onChange={setValue} options={[{ id: 'read', label: 'Read Only' }, { id: 'write', label: 'Workspace Write' }, { id: 'full', label: 'Full access' }]} />
}
function SeparatorDemo() {
  return <div style={{ display: 'grid', gap: 8 }}>
    <div>Above</div><Separator /><div>Below</div>
  </div>
}
function SettingsRowDemo() {
  return <SettingsRow title="Permission" description="Default mode for new sessions">
    <select><option>Read Only</option><option>Workspace Write</option></select>
  </SettingsRow>
}
function SidebarRowDemo() {
  const [wide, setWide] = useState(true)
  return <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <div style={{ width: wide ? 200 : 56, border: '1px solid var(--pv-border, #444)', borderRadius: 8 }}>
      <SidebarRow icon={dot} label="New session" wide={wide} onClick={() => { setWide(v => !v) }} />
    </div>
    <span style={{ fontSize: 12, opacity: 0.7 }}>Click to switch wide/rail</span>
  </div>
}
function SkeletonDemo() {
  return <Skeleton style={{ width: 160, height: 16 }} />
}
function SpinnerDemo() {
  return <Spinner />
}
function SwitchFieldDemo() {
  const [checked, setChecked] = useState(true)
  return <SwitchField label="Loud mode" checked={checked} onChange={setChecked} hint={checked ? 'On: uppercase everything' : 'Off'} />
}
function TabsDemo() {
  const [value, setValue] = useState('one')
  return <Tabs label="Demo" value={value} onChange={setValue} tabs={[{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }]}>
    <p>Panel {value}</p>
  </Tabs>
}
function ToolCallCardDemo() {
  return <div style={{ display: 'grid', gap: 8 }}>
    <ToolCallCard icon={dot} title="Read" summary="src/index.ts" state="ok" input="src/index.ts" output="42 lines" labels={toolLabels} />
    <ToolCallCard icon={dot} title="Bash" summary="pnpm build" errorSummary="exit code 1" state="error" input="pnpm build" output="error TS2304" labels={toolLabels} />
  </div>
}

export const demos: Record<string, () => ReactElement> = {
  'acryl.ui.alert': AlertDemo,
  'acryl.ui.appearance-cubes': AppearanceCubesDemo,
  'acryl.ui.avatar': AvatarDemo,
  'acryl.ui.badge': BadgeDemo,
  'acryl.ui.card': CardDemo,
  'acryl.ui.dialog': DialogDemo,
  'acryl.ui.empty-state': EmptyStateDemo,
  'acryl.ui.kbd': KbdDemo,
  'acryl.ui.progress': ProgressDemo,
  'acryl.ui.select-pill': SelectPillDemo,
  'acryl.ui.separator': SeparatorDemo,
  'acryl.ui.settings-row': SettingsRowDemo,
  'acryl.ui.sidebar-row': SidebarRowDemo,
  'acryl.ui.skeleton': SkeletonDemo,
  'acryl.ui.spinner': SpinnerDemo,
  'acryl.ui.switch-field': SwitchFieldDemo,
  'acryl.ui.tabs': TabsDemo,
  'acryl.ui.tool-call-card': ToolCallCardDemo,
}

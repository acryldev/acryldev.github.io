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
import { Label } from './components/acryl.ui.label/Label'
import { Textarea } from './components/acryl.ui.textarea/Textarea'
import { Checkbox } from './components/acryl.ui.checkbox/Checkbox'
import { AspectRatio } from './components/acryl.ui.aspect-ratio/AspectRatio'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from './components/acryl.ui.breadcrumb/Breadcrumb'
import { Toggle } from './components/acryl.ui.toggle/Toggle'
import { ButtonGroup } from './components/acryl.ui.button-group/ButtonGroup'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './components/acryl.ui.accordion/Accordion'
import { RadioGroup } from './components/acryl.ui.radio-group/RadioGroup'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './components/acryl.ui.collapsible/Collapsible'
import { ToggleGroup, ToggleGroupItem } from './components/acryl.ui.toggle-group/ToggleGroup'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './components/acryl.ui.table/Table'
import { DirectionProvider, useDirection } from './components/acryl.ui.direction-provider/DirectionProvider'
import { Marker } from './components/acryl.ui.marker/Marker'
import { Message, MessageGroup, MessageAvatar, MessageContent } from './components/acryl.ui.message/Message'
import { Bubble, BubbleContent } from './components/acryl.ui.bubble/Bubble'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from './components/acryl.ui.pagination/Pagination'
import { NativeSelect, NativeSelectOption } from './components/acryl.ui.native-select/NativeSelect'
import { ScrollArea } from './components/acryl.ui.scroll-area/ScrollArea'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from './components/acryl.ui.input-otp/InputOTP'
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from './components/acryl.ui.item/Item'
import { Attachment, AttachmentMedia, AttachmentContent, AttachmentTitle, AttachmentDescription, AttachmentActions, AttachmentAction } from './components/acryl.ui.attachment/Attachment'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from './components/acryl.ui.input-group/InputGroup'
import { FormField, FieldLabel, FieldContent, FieldDescription, FieldError } from './components/acryl.ui.form-field/FormField'
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from './components/acryl.ui.popover/Popover'
import { Slider } from './components/acryl.ui.slider/Slider'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './components/acryl.ui.sheet/Sheet'
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from './components/acryl.ui.drawer/Drawer'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from './components/acryl.ui.command/Command'
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxEmpty, ComboboxItem } from './components/acryl.ui.combobox/Combobox'
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from './components/acryl.ui.context-menu/ContextMenu'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './components/acryl.ui.carousel/Carousel'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/acryl.ui.resizable-panel-group/ResizablePanelGroup'
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from './components/acryl.ui.menubar/Menubar'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from './components/acryl.ui.navigation-menu/NavigationMenu'
import { Calendar } from './components/acryl.ui.calendar/Calendar'
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from './components/acryl.ui.sidebar/Sidebar'

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

function LabelDemo() {
  return <div style={{ display: 'grid', gap: 4 }}>
    <Label htmlFor="demo-label-input">Name</Label>
    <input id="demo-label-input" style={{ border: '1px solid var(--pv-border, #444)', borderRadius: 6, padding: '4px 8px', background: 'transparent', color: 'inherit' }} />
  </div>
}
function TextareaDemo() {
  const [value, setValue] = useState('')
  return <Textarea value={value} onChange={setValue} placeholder="Type something..." />
}
function CheckboxDemo() {
  const [checked, setChecked] = useState(false)
  return <Checkbox checked={checked} onChange={setChecked} label="I agree" />
}
function AspectRatioDemo() {
  return <div style={{ width: 240 }}>
    <AspectRatio ratio={16 / 9}><div style={{ width: '100%', height: '100%', background: 'var(--pv-border, #444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>16:9</div></AspectRatio>
  </div>
}
function BreadcrumbDemo() {
  return <Breadcrumb><BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbLink href="#">Settings</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbPage>UI library</BreadcrumbPage></BreadcrumbItem>
  </BreadcrumbList></Breadcrumb>
}
function ToggleDemo() {
  const [pressed, setPressed] = useState(false)
  return <Toggle pressed={pressed} onPressedChange={setPressed} variant="outline">{pressed ? 'Pressed' : 'Not pressed'}</Toggle>
}
function ButtonGroupDemo() {
  return <ButtonGroup>
    <button type="button" style={{ border: '1px solid var(--pv-border, #444)', padding: '4px 12px', background: 'transparent', color: 'inherit' }}>Left</button>
    <button type="button" style={{ border: '1px solid var(--pv-border, #444)', padding: '4px 12px', background: 'transparent', color: 'inherit' }}>Middle</button>
    <button type="button" style={{ border: '1px solid var(--pv-border, #444)', padding: '4px 12px', background: 'transparent', color: 'inherit' }}>Right</button>
  </ButtonGroup>
}
function AccordionDemo() {
  return <Accordion type="single">
    <AccordionItem value="a"><AccordionTrigger>Section A</AccordionTrigger><AccordionContent>Content of A.</AccordionContent></AccordionItem>
    <AccordionItem value="b"><AccordionTrigger>Section B</AccordionTrigger><AccordionContent>Content of B.</AccordionContent></AccordionItem>
  </Accordion>
}

function RadioGroupDemo() {
  const [value, setValue] = useState('a')
  return <RadioGroup name="demo-radio" value={value} onChange={setValue} options={[{ id: 'a', label: 'Option A' }, { id: 'b', label: 'Option B' }, { id: 'c', label: 'Option C' }]} />
}
function CollapsibleDemo() {
  return <Collapsible>
    <CollapsibleTrigger className="pv-collapsible-trigger">Toggle details</CollapsibleTrigger>
    <CollapsibleContent><p style={{ marginTop: 8 }}>Plain content, no chrome.</p></CollapsibleContent>
  </Collapsible>
}
function ToggleGroupDemo() {
  const [value, setValue] = useState<string[]>(['bold'])
  return <ToggleGroup type="multiple" value={value} onChange={(v) => setValue(v as string[])}>
    <ToggleGroupItem value="bold">B</ToggleGroupItem>
    <ToggleGroupItem value="italic">I</ToggleGroupItem>
    <ToggleGroupItem value="underline">U</ToggleGroupItem>
  </ToggleGroup>
}

function TableDemo() {
  return <Table>
    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
    <TableBody>
      <TableRow><TableCell>Alpha</TableCell><TableCell>Active</TableCell></TableRow>
      <TableRow><TableCell>Beta</TableCell><TableCell>Paused</TableCell></TableRow>
    </TableBody>
  </Table>
}
function DirectionReadout() {
  const dir = useDirection()
  return <div style={{ display: 'flex', gap: 8 }}><span>First</span><span>Second</span><span style={{ opacity: 0.6 }}>(dir={dir})</span></div>
}
function DirectionProviderDemo() {
  return <DirectionProvider dir="rtl"><DirectionReadout /></DirectionProvider>
}
function MarkerDemo() {
  return <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <Marker variant="default">Step</Marker>
    <Marker variant="border">Border</Marker>
  </div>
}
function MessageDemo() {
  return <MessageGroup>
    <Message align="start">
      <MessageAvatar><span>A</span></MessageAvatar>
      <MessageContent>Hey, got a minute to review the draft?</MessageContent>
    </Message>
  </MessageGroup>
}
function BubbleDemo() {
  return <Bubble variant="tinted" align="end"><BubbleContent>Sent a moment ago.</BubbleContent></Bubble>
}
function PaginationDemo() {
  return <Pagination>
    <PaginationContent>
      <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
      <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
      <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
      <PaginationItem><PaginationNext href="#" /></PaginationItem>
    </PaginationContent>
  </Pagination>
}
function NativeSelectDemo() {
  return <NativeSelect defaultValue="b">
    <NativeSelectOption value="a">Option A</NativeSelectOption>
    <NativeSelectOption value="b">Option B</NativeSelectOption>
    <NativeSelectOption value="c">Option C</NativeSelectOption>
  </NativeSelect>
}
function ScrollAreaDemo() {
  return <ScrollArea style={{ height: 96, width: 220, border: '1px solid var(--pv-border, #444)', borderRadius: 6 }}>
    <div style={{ padding: 8 }}>{Array.from({ length: 12 }, (_, i) => <p key={i} style={{ margin: '4px 0' }}>Row {i + 1}</p>)}</div>
  </ScrollArea>
}
function InputOTPDemo() {
  const [value, setValue] = useState('12')
  return <InputOTP value={value} onChange={setValue} maxLength={4} label="Verification code">
    <InputOTPGroup>
      <InputOTPSlot index={0} /><InputOTPSlot index={1} />
    </InputOTPGroup>
    <InputOTPSeparator />
    <InputOTPGroup>
      <InputOTPSlot index={2} /><InputOTPSlot index={3} />
    </InputOTPGroup>
  </InputOTP>
}
function ItemDemo() {
  return <Item variant="outline">
    <ItemMedia variant="icon"><span aria-hidden>&#128196;</span></ItemMedia>
    <ItemContent><ItemTitle>Design review</ItemTitle><ItemDescription>Due tomorrow</ItemDescription></ItemContent>
    <ItemActions><button type="button">Open</button></ItemActions>
  </Item>
}
function AttachmentDemo() {
  const [state, setState] = useState<'uploading' | 'done'>('uploading')
  return <Attachment state={state}>
    <AttachmentMedia variant="icon"><span aria-hidden>&#128196;</span></AttachmentMedia>
    <AttachmentContent><AttachmentTitle>report.pdf</AttachmentTitle><AttachmentDescription>{state === 'uploading' ? 'Uploading…' : '248 KB'}</AttachmentDescription></AttachmentContent>
    <AttachmentActions><AttachmentAction label="Finish upload" onClick={() => { setState('done') }}>{state === 'uploading' ? 'Finish' : 'Done'}</AttachmentAction></AttachmentActions>
  </Attachment>
}
function InputGroupDemo() {
  const [value, setValue] = useState('')
  return <InputGroup>
    <InputGroupAddon align="inline-start"><span aria-hidden>&#128269;</span></InputGroupAddon>
    <InputGroupInput placeholder="Search…" value={value} onChange={(e) => { setValue(e.target.value) }} />
    <InputGroupAddon align="inline-end"><InputGroupButton label="Clear" onClick={() => { setValue('') }}>&times;</InputGroupButton></InputGroupAddon>
  </InputGroup>
}
function FormFieldDemo() {
  const [invalid, setInvalid] = useState(true)
  return <FormField invalid={invalid}>
    <FieldLabel>Email</FieldLabel>
    <FieldContent><input type="email" defaultValue="not-an-email" onChange={() => { setInvalid(false) }} /></FieldContent>
    {invalid ? <FieldError errors={[{ message: 'Enter a valid email address.' }]} /> : <FieldDescription>Looks good.</FieldDescription>}
  </FormField>
}
function PopoverDemo() {
  return <Popover>
    <PopoverTrigger label="Open popover">Open popover</PopoverTrigger>
    <PopoverContent label="Details"><PopoverTitle>Details</PopoverTitle><p style={{ margin: 0 }}>Anchored to the trigger, no portal.</p></PopoverContent>
  </Popover>
}
function SliderDemo() {
  const [value, setValue] = useState([40])
  return <Slider value={value} onValueChange={setValue} label="Volume" />
}
function SheetDemo() {
  return <Sheet>
    <SheetTrigger label="Open sheet">Open sheet</SheetTrigger>
    <SheetContent label="Edit profile">
      <SheetHeader><SheetTitle>Edit profile</SheetTitle><SheetDescription>Flush-edge panel with focus trapped inside.</SheetDescription></SheetHeader>
    </SheetContent>
  </Sheet>
}
function DrawerDemo() {
  return <Drawer>
    <DrawerTrigger label="Open drawer">Open drawer</DrawerTrigger>
    <DrawerContent label="Options">
      <DrawerHeader><DrawerTitle>Options</DrawerTitle><DrawerDescription>Drag down to dismiss.</DrawerDescription></DrawerHeader>
    </DrawerContent>
  </Drawer>
}
function CommandDemo() {
  return <Command label="Command menu">
    <CommandInput placeholder="Type a command…" />
    <CommandList>
      <CommandEmpty>No results.</CommandEmpty>
      <CommandGroup heading="Actions">
        <CommandItem value="new file">New file</CommandItem>
        <CommandItem value="new folder">New folder</CommandItem>
        <CommandItem value="rename">Rename</CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
}
function ComboboxDemo() {
  return <Combobox>
    <ComboboxInput placeholder="Choose a fruit…" />
    <ComboboxContent>
      <ComboboxList>
        <ComboboxEmpty>No matches.</ComboboxEmpty>
        <ComboboxItem value="apple">Apple</ComboboxItem>
        <ComboboxItem value="banana">Banana</ComboboxItem>
        <ComboboxItem value="cherry">Cherry</ComboboxItem>
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
}
function ContextMenuDemo() {
  return <ContextMenu>
    <ContextMenuTrigger>
      <div style={{ border: '1px dashed var(--pv-border, #444)', borderRadius: 6, padding: '24px 12px', textAlign: 'center', fontSize: 13, opacity: 0.8 }}>Right-click here</div>
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem>Copy</ContextMenuItem>
      <ContextMenuItem>Paste</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
}
function CarouselDemo() {
  return <Carousel style={{ width: 240 }}>
    <CarouselContent>
      {['A', 'B', 'C'].map(letter => <CarouselItem key={letter}>
        <div style={{ height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--pv-border, #444)', borderRadius: 6 }}>{letter}</div>
      </CarouselItem>)}
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
}
function ResizableDemo() {
  return <ResizablePanelGroup orientation="horizontal" style={{ height: 96, width: 240, border: '1px solid var(--pv-border, #444)', borderRadius: 6 }}>
    <ResizablePanel defaultSize={50} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Left</ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel defaultSize={50} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Right</ResizablePanel>
  </ResizablePanelGroup>
}
function MenubarDemo() {
  return <Menubar>
    <MenubarMenu>
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>New</MenubarItem>
        <MenubarItem>Open…</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Edit</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>Undo</MenubarItem>
        <MenubarItem>Redo</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
}
function NavigationMenuDemo() {
  return <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Products</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuLink>Overview</NavigationMenuLink>
          <NavigationMenuLink>Pricing</NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
}
function CalendarDemo() {
  const [selected, setSelected] = useState<Date | undefined>(new Date())
  return <Calendar mode="single" selected={selected} onSelect={(d) => { setSelected(d as Date | undefined) }} />
}
function SidebarDemo() {
  return <SidebarProvider style={{ height: 220, border: '1px solid var(--pv-border, #444)', borderRadius: 6, overflow: 'hidden' }}>
    <Sidebar>
      <SidebarHeader>Workspace</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem><SidebarMenuButton isActive>Overview</SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton>Tasks</SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    <SidebarInset>
      <SidebarTrigger />
      <div style={{ padding: 8, fontSize: 13, opacity: 0.8 }}>Main content area.</div>
    </SidebarInset>
  </SidebarProvider>
}
export const demos: Record<string, () => ReactElement> = {
  'acryl.ui.table': TableDemo,
  'acryl.ui.direction-provider': DirectionProviderDemo,
  'acryl.ui.marker': MarkerDemo,
  'acryl.ui.message': MessageDemo,
  'acryl.ui.bubble': BubbleDemo,
  'acryl.ui.pagination': PaginationDemo,
  'acryl.ui.native-select': NativeSelectDemo,
  'acryl.ui.scroll-area': ScrollAreaDemo,
  'acryl.ui.input-otp': InputOTPDemo,
  'acryl.ui.item': ItemDemo,
  'acryl.ui.attachment': AttachmentDemo,
  'acryl.ui.input-group': InputGroupDemo,
  'acryl.ui.form-field': FormFieldDemo,
  'acryl.ui.popover': PopoverDemo,
  'acryl.ui.slider': SliderDemo,
  'acryl.ui.sheet': SheetDemo,
  'acryl.ui.drawer': DrawerDemo,
  'acryl.ui.command': CommandDemo,
  'acryl.ui.combobox': ComboboxDemo,
  'acryl.ui.context-menu': ContextMenuDemo,
  'acryl.ui.carousel': CarouselDemo,
  'acryl.ui.resizable-panel-group': ResizableDemo,
  'acryl.ui.menubar': MenubarDemo,
  'acryl.ui.navigation-menu': NavigationMenuDemo,
  'acryl.ui.calendar': CalendarDemo,
  'acryl.ui.sidebar': SidebarDemo,
  'acryl.ui.radio-group': RadioGroupDemo,
  'acryl.ui.collapsible': CollapsibleDemo,
  'acryl.ui.toggle-group': ToggleGroupDemo,
  'acryl.ui.label': LabelDemo,
  'acryl.ui.textarea': TextareaDemo,
  'acryl.ui.checkbox': CheckboxDemo,
  'acryl.ui.aspect-ratio': AspectRatioDemo,
  'acryl.ui.breadcrumb': BreadcrumbDemo,
  'acryl.ui.toggle': ToggleDemo,
  'acryl.ui.button-group': ButtonGroupDemo,
  'acryl.ui.accordion': AccordionDemo,
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

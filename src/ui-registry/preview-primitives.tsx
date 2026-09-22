/**
 * Real, working stand-ins for `@deepseek-ai/dsh-client-ui-primitives` (spec 038-ui-component-library),
 * used only so this site can render the actual registry component source (unmodified, from
 * acryldev/acryl-ui-registry) live, outside the ACRYL app itself. Behavior, not pixel fidelity: a real
 * click toggles a real switch, a real Escape closes a real modal. Styling here is deliberately plain
 * (this file is not part of the registry; it exists to make the registry's own CSS Modules the only
 * visible styling). See src/ui-registry/README.md.
 */
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'toolbar'

export function Button({ variant = 'ghost', size = 'md', icon, className, children, ...rest }: {
  variant?: ButtonVariant
  size?: 'sm' | 'md'
  icon?: ReactNode
  className?: string
  children?: ReactNode
  [key: string]: unknown
}) {
  const styles: Record<ButtonVariant, CSSProperties> = {
    primary: { background: '#4F46E5', color: '#fff', border: '1px solid transparent' },
    ghost: { background: 'transparent', color: 'inherit', border: '1px solid transparent' },
    outline: { background: 'transparent', color: 'inherit', border: '1px solid var(--pv-border, #444)' },
    toolbar: { background: 'transparent', color: 'inherit', border: 'none' },
  }
  return (
    <button
      type="button"
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 6, padding: size === 'sm' ? '4px 10px' : '6px 14px', fontSize: size === 'sm' ? 12 : 13, cursor: 'pointer', ...styles[variant] }}
      {...rest}
    >
      {icon}{children}
    </button>
  )
}

export function Tag({ tone, className, children }: { tone?: string, className?: string, children?: ReactNode }) {
  return <span className={className} data-tone={tone} style={{ display: 'inline-flex', borderRadius: 999, border: '1px solid var(--pv-border, #444)', padding: '1px 8px', fontSize: 11 }}>{children}</span>
}

export function Switch({ checked, onChange, label, disabled = false, className }: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={className}
      onClick={() => { onChange(!checked) }}
      style={{ width: 36, height: 20, borderRadius: 999, border: 'none', position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer', background: checked ? '#4F46E5' : 'var(--pv-border, #555)', opacity: disabled ? 0.5 : 1 }}
    >
      <span style={{ position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
    </button>
  )
}

export function StateDot({ state, size = 8 }: { state: 'done' | 'warning' | 'ongoing' | 'error' | 'idle', size?: number }) {
  const colors: Record<string, string> = { done: '#22c55e', warning: '#f59e0b', ongoing: '#4F46E5', error: '#ef4444', idle: '#888' }
  return <span aria-hidden style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', background: colors[state] ?? '#888' }} />
}

export function Modal({ open, onClose, title, closeLabel, description, children, footer, className, contentClassName }: {
  open: boolean
  onClose: () => void
  title: string
  closeLabel?: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  className?: string
  contentClassName?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => { window.removeEventListener('keydown', onKeyDown) }
  }, [open, onClose])
  if (!open) return null
  return (
    <div role="presentation" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div
        role="dialog"
        aria-label={title}
        onClick={event => { event.stopPropagation() }}
        className={className}
        style={{ background: 'var(--pv-surface, #1a1a1a)', color: 'inherit', borderRadius: 10, padding: 20, minWidth: 320, maxWidth: '90vw' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>
          <button type="button" aria-label={closeLabel ?? 'Close'} onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>x</button>
        </div>
        {description !== undefined && <p style={{ opacity: 0.7, fontSize: 13 }}>{description}</p>}
        <div className={contentClassName}>{children}</div>
        {footer !== undefined && <div style={{ marginTop: 16 }}>{footer}</div>}
      </div>
    </div>
  )
}

export function Tooltip({ label, children }: { label: string, side?: string, delayMs?: number, disabled?: boolean, maxWidth?: number, children: ReactNode }) {
  return <span title={label}>{children}</span>
}

export interface MenuItem { id: string, label: ReactNode, disabled?: boolean, icon?: ReactNode }
export interface MenuEntry { id: string, label?: ReactNode, disabled?: boolean, icon?: ReactNode, type?: 'separator' | 'label' }

export function Menu({ open, items, selectedId, onSelect, onClose }: {
  open: boolean
  anchor?: unknown
  items: readonly MenuEntry[]
  selectedId?: string
  selectedIds?: readonly string[]
  onSelect: (id: string) => void
  onClose: () => void
  align?: string
  side?: string
  portal?: boolean
  className?: string
  [key: string]: unknown
}) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) onClose() }
    document.addEventListener('mousedown', onPointerDown)
    return () => { document.removeEventListener('mousedown', onPointerDown) }
  }, [open, onClose])
  if (!open) return null
  return (
    <div ref={rootRef} role="menu" style={{ position: 'absolute', zIndex: 100, marginTop: 4, background: 'var(--pv-surface, #1a1a1a)', border: '1px solid var(--pv-border, #444)', borderRadius: 8, minWidth: 160, padding: 4 }}>
      {items.map(item => item.type === 'separator'
        ? <div key={item.id} style={{ height: 1, background: 'var(--pv-border, #444)', margin: '4px 0' }} />
        : (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => { onSelect(item.id); onClose() }}
            style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 6, textAlign: 'left', background: item.id === selectedId ? 'var(--pv-border, #333)' : 'transparent', border: 'none', borderRadius: 6, padding: '6px 8px', fontSize: 13, color: 'inherit', cursor: item.disabled ? 'not-allowed' : 'pointer' }}
          >
            {item.icon}{item.label}
          </button>
        ))}
    </div>
  )
}

export function IconChevronDownOutline14({ className }: { className?: string } = {}) {
  return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className={className}><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
}
export function IconCheckOutline16() {
  return <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
}
export function DisclosureRow({ icon, title, open, expandable, onToggle, expandOnRowClick, collapsedContent, children, rowClassName, leadingClassName, titleClassName, chevronClassName }: {
  icon?: ReactNode
  title: string
  open: boolean
  expandable: boolean
  onToggle: () => void
  expandOnRowClick?: boolean
  keepContentWhenOpen?: boolean
  collapsedContent?: ReactNode
  children?: ReactNode
  rowClassName?: string
  leadingClassName?: string
  titleClassName?: string
  chevronClassName?: string
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div>
      <div
        className={rowClassName}
        role="button"
        tabIndex={0}
        onClick={() => { if (expandOnRowClick === true && expandable) { setExpanded(v => !v); onToggle() } }}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: expandable ? 'pointer' : 'default' }}
      >
        <span className={leadingClassName}>{icon}</span>
        <span className={titleClassName}>{title}</span>
        {collapsedContent}
        {expandable && (
          <button type="button" className={chevronClassName} onClick={(event) => { event.stopPropagation(); setExpanded(v => !v); onToggle() }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
            {expanded || open ? '▾' : '▸'}
          </button>
        )}
      </div>
      {(expanded || open) && children}
    </div>
  )
}

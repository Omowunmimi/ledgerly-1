import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { Activity, AlertCircle, ArrowDownRight, ArrowUpRight, Banknote, Bell, CalendarDays, Check, ChevronDown, CircleCheck, Clock3, Download, FileCheck2, FileText, Landmark, LayoutDashboard, LoaderCircle, Pencil, Plus, ReceiptText, Search, Settings2, Trash2, TrendingDown, TrendingUp, Users, Wallet, type LucideIcon } from 'lucide-react'
import { defineControls } from 'tempo-sdk/assets'

/**
 * Shared Ledgerly primitives used by the marketing site, application screens and canvas.
 * The canvas for these components is at tempo/designs/design-system/ledgerly-design-system/index.canvas.tsx.
 * If you adjust a component in any way, keep the canvas and its asset declarations consistent.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export function Brand({ inverse = false, href = '/', static: staticBrand = false }: { inverse?: boolean; href?: string; static?: boolean }) {
  const content = <><span className="ledgerly-mark" aria-hidden="true"><i /><i /><i /></span><span>ledgerly</span></>
  return staticBrand
    ? <span className="ledgerly-wordmark" data-inverse={inverse}>{content}</span>
    : <a className="ledgerly-wordmark" data-inverse={inverse} href={href} aria-label="Ledgerly home">{content}</a>
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export function Button({ children, variant = 'primary', size = 'md', isLoading = false, leadingIcon, trailingIcon, disabled, type = 'button', ...props }: ButtonProps) {
  return (
    <button className="button" data-variant={variant} data-size={size} type={type} disabled={disabled || isLoading} aria-busy={isLoading || undefined} {...props}>
      {isLoading ? <LoaderCircle className="spin-icon" aria-hidden="true" /> : leadingIcon}
      <span>{children}</span>
      {!isLoading && trailingIcon}
    </button>
  )
}

export interface StatusBadgeProps {
  status: 'Paid' | 'Awaiting payment' | 'Overdue' | 'Draft' | 'Scheduled' | 'Review needed' | 'Matched'
}

const statusIcons: Record<StatusBadgeProps['status'], LucideIcon> = {
  Paid: Check,
  'Awaiting payment': Clock3,
  Overdue: AlertCircle,
  Draft: Clock3,
  Scheduled: Clock3,
  'Review needed': AlertCircle,
  Matched: Check,
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const Icon = statusIcons[status]
  const tone = status === 'Paid' || status === 'Matched' ? 'success' : status === 'Overdue' || status === 'Review needed' ? 'error' : status === 'Awaiting payment' || status === 'Scheduled' ? 'warning' : 'neutral'
  return <span className="status-badge" data-tone={tone}><Icon aria-hidden="true" /><span>{status}</span></span>
}

export interface MetricCardProps {
  label: string
  value: string
  detail: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
}

export function MetricCard({ label, value, detail, trend = 'neutral', icon }: MetricCardProps) {
  return (
    <section className="metric-card">
      <div className="metric-topline"><span>{label}</span><span className="metric-symbol" aria-hidden="true">{icon}</span></div>
      <strong className="financial-value">{value}</strong>
      <span className="metric-detail" data-trend={trend}>{trend === 'up' ? <TrendingUp aria-hidden="true" /> : trend === 'down' ? <TrendingDown aria-hidden="true" /> : null}{detail}</span>
    </section>
  )
}

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  prefix?: string
}

export function Field({ label, hint, error, prefix, id, ...props }: FieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = [hint && `${inputId}-hint`, error && `${inputId}-error`].filter(Boolean).join(' ') || undefined
  return (
    <label className="field" htmlFor={inputId}>
      <span className="field-label">{label}</span>
      <span className="field-control" data-invalid={Boolean(error)}>
        {prefix && <span className="field-prefix">{prefix}</span>}
        <input id={inputId} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props} />
      </span>
      {hint && !error && <span className="field-hint" id={`${inputId}-hint`}>{hint}</span>}
      {error && <span className="field-error" id={`${inputId}-error`}><AlertCircle aria-hidden="true" />{error}</span>}
    </label>
  )
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export function SelectField({ label, hint, error, options, id, ...props }: SelectFieldProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const describedBy = [hint && `${selectId}-hint`, error && `${selectId}-error`].filter(Boolean).join(' ') || undefined
  return (
    <label className="field" htmlFor={selectId}>
      <span className="field-label">{label}</span>
      <span className="field-control select-control" data-invalid={Boolean(error)}>
        <select id={selectId} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props}>
          {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <ChevronDown aria-hidden="true" />
      </span>
      {hint && !error && <span className="field-hint" id={`${selectId}-hint`}>{hint}</span>}
      {error && <span className="field-error" id={`${selectId}-error`}><AlertCircle aria-hidden="true" />{error}</span>}
    </label>
  )
}

export function TextAreaField({ label, hint, error, id, ...props }: { label: string; hint?: string; error?: string; id?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = [hint && `${inputId}-hint`, error && `${inputId}-error`].filter(Boolean).join(' ') || undefined
  return <label className="field" htmlFor={inputId}><span className="field-label">{label}</span><textarea id={inputId} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props} />{hint && !error && <span className="field-hint" id={`${inputId}-hint`}>{hint}</span>}{error && <span className="field-error" id={`${inputId}-error`}><AlertCircle aria-hidden="true" />{error}</span>}</label>
}

export function ChoiceField({ label, type = 'checkbox', name, value, checked, onChange, disabled = false }: { label: string; type?: 'checkbox' | 'radio'; name?: string; value?: string; checked?: boolean; onChange?: (checked: boolean) => void; disabled?: boolean }) {
  return <label className="choice-field"><input type={type} name={name} value={value} checked={checked} disabled={disabled} onChange={event => onChange?.(event.target.checked)} /><span className="choice-indicator" aria-hidden="true">{type === 'checkbox' && checked ? <Check /> : null}</span><span>{label}</span></label>
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumbs">{items.map((item,index) => <span key={`${item.label}-${index}`}>{item.href && index < items.length - 1 ? <a href={item.href}>{item.label}</a> : <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>}{index < items.length - 1 && <span className="breadcrumb-separator" aria-hidden="true">/</span>}</span>)}</nav>
}

export function SearchField({ label = 'Search', ...props }: Omit<FieldProps, 'label'> & { label?: string }) {
  return <Field className="search-field-input" type="search" label={label} placeholder="Search invoices" {...props} />
}

export function Card({ children, className = '', ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLElement>) {
  return <section className={`surface-card ${className}`} {...props}>{children}</section>
}

export function AccordionItem({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()
  return (
    <section className="accordion-item">
      <h3><button className="accordion-trigger" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(value => !value)}>{title}<ChevronDown aria-hidden="true" /></button></h3>
      {open && <div className="accordion-panel" id={panelId}>{children}</div>}
    </section>
  )
}

export function Toast({ title, message, tone = 'success', onDismiss }: { title: string; message: string; tone?: 'success' | 'error' | 'info'; onDismiss?: () => void }) {
  const Icon = tone === 'success' ? Check : tone === 'error' ? AlertCircle : Clock3
  return <div className="toast" data-tone={tone} role={tone === 'error' ? 'alert' : 'status'}><span className="toast-icon"><Icon aria-hidden="true" /></span><span><strong>{title}</strong><small>{message}</small></span>{onDismiss && <button className="toast-dismiss" onClick={onDismiss} aria-label="Dismiss notification">×</button>}</div>
}

function useDialogFocus(onClose: () => void) {
  const dialogRef = useRef<HTMLElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const dialog = dialogRef.current
    const getFocusable = () => dialog?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? []
    const focusable = getFocusable()
    ;(focusable[0] ?? dialog)?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); return }
      if (event.key !== 'Tab') return
      const items = getFocusable()
      if (!items.length) { event.preventDefault(); dialog?.focus(); return }
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items[items.length - 1].focus() }
      else if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0].focus() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => { document.removeEventListener('keydown', handleKeyDown); previousFocus?.focus() }
  }, [])
  return dialogRef
}

export function Modal({ title, children, onClose, size = 'default' }: { title: string; children: ReactNode; onClose: () => void; size?: 'default' | 'wide' }) {
  const titleId = useId()
  const dialogRef = useDialogFocus(onClose)
  return <div className="dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><section ref={dialogRef} className="dialog-panel" data-size={size} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}><div className="dialog-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog">×</button></div>{children}</section></div>
}

export function Drawer({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const titleId = useId()
  const dialogRef = useDialogFocus(onClose)
  return <div className="drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><aside ref={dialogRef} className="drawer-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}><div className="dialog-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close panel">×</button></div>{children}</aside></div>
}

export function LoadingState({ label = 'Loading content' }: { label?: string }) {
  return <div className="loading-state" role="status" aria-label={label}><span className="skeleton skeleton-heading" /><span className="skeleton" /><span className="skeleton skeleton-short" /></div>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-mark" aria-hidden="true">—</span><h3>{title}</h3><p>{description}</p>{action}</div>
}

export function FeedbackState({ title, message, tone = 'success' }: { title: string; message: string; tone?: 'success' | 'error' }) {
  return <div className="feedback-state" data-tone={tone} role={tone === 'error' ? 'alert' : 'status'}>{tone === 'success' ? <Check aria-hidden="true" /> : <AlertCircle aria-hidden="true" />}<span><strong>{title}</strong><small>{message}</small></span></div>
}

export function Pagination({ currentPage, pageCount, onChange }: { currentPage: number; pageCount: number; onChange: (page: number) => void }) {
  return <nav className="pagination" aria-label="Table pages"><button className="pagination-button" disabled={currentPage <= 1} onClick={() => onChange(currentPage - 1)}>Previous</button><span>Page <strong>{currentPage}</strong> of {pageCount}</span><button className="pagination-button" disabled={currentPage >= pageCount} onClick={() => onChange(currentPage + 1)}>Next</button></nav>
}

export function Tabs({ items, active, onChange, label = 'Choose a view' }: { items: Array<{ id: string; label: string }>; active: string; onChange: (id: string) => void; label?: string }) {
  return <div className="tab-list" role="tablist" aria-label={label}>{items.map(item => <button key={item.id} role="tab" aria-selected={active === item.id} className="tab-button" data-active={active === item.id} onClick={() => onChange(item.id)}>{item.label}</button>)}</div>
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return <span className="tooltip" title={label}>{children}</span>
}

export function IconButton({ label, children, ...props }: { label: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="icon-button" aria-label={label} type="button" {...props}>{children}</button>
}

const ledgerlyIcons = [
  { label: 'Dashboard', Icon: LayoutDashboard }, { label: 'Invoices', Icon: FileText },
  { label: 'Customers', Icon: Users }, { label: 'Expenses', Icon: Wallet },
  { label: 'Banking', Icon: Landmark }, { label: 'Activity', Icon: Activity },
  { label: 'Payment', Icon: Banknote }, { label: 'Receipt', Icon: ReceiptText },
  { label: 'Search', Icon: Search }, { label: 'Calendar', Icon: CalendarDays },
  { label: 'Notifications', Icon: Bell }, { label: 'Settings', Icon: Settings2 },
  { label: 'Add', Icon: Plus }, { label: 'Edit', Icon: Pencil },
  { label: 'Download', Icon: Download }, { label: 'Delete', Icon: Trash2 },
  { label: 'Paid', Icon: CircleCheck }, { label: 'Income', Icon: ArrowUpRight },
  { label: 'Expense', Icon: ArrowDownRight }, { label: 'Reconciled', Icon: FileCheck2 },
]

export function IconographyPack({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <div className="ledgerly-icon-pack" data-size={size}>{ledgerlyIcons.map(({ label, Icon }) => <span className="ledgerly-icon-item" key={label}><Icon aria-hidden="true" /><small>{label}</small></span>)}</div>
}

defineControls(Button, {
  children: { type: 'text' },
  variant: { type: 'select' },
  size: { type: 'select' },
  isLoading: { type: 'boolean' },
  disabled: { type: 'boolean' },
  onClick: false,
  leadingIcon: false,
  trailingIcon: false,
});

defineControls(Brand, { inverse: { type: 'boolean' }, href: { type: 'text' }, static: { type: 'boolean' } });
defineControls(Card, { children: { type: 'text' }, className: { type: 'text' } });
defineControls(StatusBadge, { status: { type: 'select' } });
defineControls(MetricCard, {
  label: { type: 'text' },
  value: { type: 'text' },
  detail: { type: 'text' },
  trend: { type: 'select' },
  icon: false,
});
defineControls(Field, {
  label: { type: 'text' },
  hint: { type: 'text' },
  error: { type: 'text' },
  type: { type: 'select' },
  placeholder: { type: 'text' },
  disabled: { type: 'boolean' },
});
defineControls(SelectField, { label: { type: 'text' }, hint: { type: 'text' }, error: { type: 'text' }, options: { type: 'object' }, onChange: false });
defineControls(TextAreaField, { label: { type: 'text' }, hint: { type: 'text' }, error: { type: 'text' }, rows: { type: 'number' }, placeholder: { type: 'text' }, disabled: { type: 'boolean' } });
defineControls(ChoiceField, { label: { type: 'text' }, type: { type: 'select' }, name: { type: 'text' }, value: { type: 'text' }, checked: { type: 'boolean' }, disabled: { type: 'boolean' }, onChange: false });
defineControls(Breadcrumbs, { items: { type: 'object' } });
defineControls(AccordionItem, {
  title: { type: 'text' },
  children: { type: 'text' },
  defaultOpen: { type: 'boolean' },
});
defineControls(Toast, { title: { type: 'text' }, message: { type: 'text' }, tone: { type: 'select' }, onDismiss: false });
defineControls(Modal, { title: { type: 'text' }, children: { type: 'text' }, size: { type: 'select' }, onClose: false });
defineControls(Drawer, { title: { type: 'text' }, children: { type: 'text' }, onClose: false });
defineControls(LoadingState, { label: { type: 'text' } });
defineControls(EmptyState, { title: { type: 'text' }, description: { type: 'text' }, action: false });
defineControls(FeedbackState, { title: { type: 'text' }, message: { type: 'text' }, tone: { type: 'select' } });
defineControls(Pagination, { currentPage: { type: 'number' }, pageCount: { type: 'number' }, onChange: false });
defineControls(Tabs, { items: { type: 'object' }, active: { type: 'text' }, label: { type: 'text' }, onChange: false });
defineControls(Tooltip, { label: { type: 'text' }, children: { type: 'text' } });
defineControls(IconButton, { label: { type: 'text' }, children: { type: 'text' }, onClick: false });
defineControls(IconographyPack, { size: { type: 'select' } });

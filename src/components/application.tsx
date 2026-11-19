import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, BookOpenCheck, CalendarDays, ChartNoAxesCombined, ChevronDown, CircleCheck, CircleHelp, Download, FileText, Landmark, LayoutDashboard, LogOut, Menu, MoreHorizontal, Pencil, Plus, Search, Settings2, Trash2, Users, Wallet, X } from 'lucide-react'
import { defineControls } from 'tempo-sdk/assets'
import { cashBalance, cashFlow, customerDetails, customerOptions, deleteInvoice, formatDate, formatUSD, readInvoices, recentActivity, updateInvoice, writeCreatedInvoice, type Invoice, type InvoiceDocumentData, type InvoiceLineItem } from '../data/finance'
import { downloadInvoicePdf } from '../lib/invoice-pdf'
import { Brand, Button, Card, ChoiceField, Drawer, EmptyState, Field, Modal, Pagination, SelectField, StatusBadge, TextAreaField, Toast } from './system'

/** The canvas for the shared application components in this file is at tempo/designs/design-system/ledgerly-design-system/index.canvas.tsx. */
export type AppView = 'dashboard' | 'invoices' | 'create-invoice'
type InvoiceFilter = 'All' | 'Awaiting payment' | 'Overdue' | 'Paid' | 'Draft'
interface SavedInvoiceDraft extends Invoice { notes: string }

const appLinks: Array<{ id: AppView; label: string; href: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { id: 'invoices', label: 'Invoices', href: '/app/invoices', icon: FileText },
]

const appAreas = [
  { label: 'Customers', icon: Users },
  { label: 'Expenses', icon: Wallet },
  { label: 'Bank Reconciliation', icon: Landmark },
  { label: 'Bookkeeping', icon: BookOpenCheck },
  { label: 'Financial Reports', icon: ChartNoAxesCombined },
]

const customerEmails: Record<string, string> = Object.fromEntries(customerOptions.map(option => [option.value, customerDetails[option.value]?.email ?? '']))
const draftStorageKey = 'ledgerly:northstar:invoice-draft'

function readDraft(): SavedInvoiceDraft | null {
  try {
    const value = window.localStorage.getItem(draftStorageKey)
    return value ? JSON.parse(value) as SavedInvoiceDraft : null
  } catch {
    return null
  }
}

function formatToday() {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date('2026-03-24T00:00:00Z'))
}

function documentForInvoice(invoice: Invoice): InvoiceDocumentData {
  if (invoice.document) return invoice.document
  const customerKey = customerOptions.find(option => option.label === invoice.client)?.value
  const legacyNotes = 'notes' in invoice ? (invoice as SavedInvoiceDraft).notes : undefined
  return {
    customerKey,
    customerEmail: customerKey ? customerDetails[customerKey]?.email : undefined,
    customerAddress: customerKey ? customerDetails[customerKey]?.address : undefined,
    lineItems: [{ id: 1, description: 'Invoice services', quantity: 1, rate: invoice.amount }],
    taxRate: 0,
    notes: legacyNotes || 'Thank you for working with Northstar Studio.',
    paymentTerms: 'Due on receipt',
  }
}

function InvoiceDocumentPreview({ invoice }: { invoice: Invoice }) {
  const details = documentForInvoice(invoice)
  const items = details.lineItems.length ? details.lineItems : [{ id: 1, description: 'Invoice item', quantity: 1, rate: invoice.amount }]
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const tax = Math.max(0, invoice.amount - subtotal)
  return <Card className="invoice-document-card">
    <div className="review-invoice-brand"><Brand /><span>INVOICE</span></div>
    <div className="invoice-document-parties">
      <div className="review-invoice-to"><span>Bill to</span><strong>{invoice.client}</strong>{details.customerEmail && <small>{details.customerEmail}</small>}{details.customerAddress && <small>{details.customerAddress}</small>}</div>
      <div className="invoice-from"><span>From</span><strong>Northstar Studio</strong><small>Olivia Bennett</small><small>olivia@northstar.studio</small></div>
    </div>
    <div className="review-invoice-meta"><span><small>Invoice number</small><strong>{invoice.id}</strong></span><span><small>Issue date</small><strong>{formatDate(invoice.issuedAt)}</strong></span><span><small>Due date</small><strong>{formatDate(invoice.dueAt)}</strong></span></div>
    <div className="invoice-document-lines"><div className="invoice-document-head"><span>Description</span><span>Qty</span><span>Rate</span><span>Amount</span></div>{items.map(item => <div className="invoice-document-line" key={`document-${item.id}`}><span>{item.description}<small>{item.quantity} × {formatUSD(item.rate)}</small></span><span>{item.quantity}</span><span className="financial-value">{formatUSD(item.rate)}</span><strong className="financial-value">{formatUSD(item.quantity * item.rate)}</strong></div>)}</div>
    <div className="review-invoice-tax"><span>Subtotal</span><strong className="financial-value">{formatUSD(subtotal)}</strong><span>Tax{details.taxRate ? ` · ${details.taxRate}%` : ''}</span><strong className="financial-value">{formatUSD(tax)}</strong></div>
    <div className="review-invoice-total"><span>Total due</span><strong className="financial-value">{formatUSD(invoice.amount)}</strong></div>
    {details.paymentTerms && <div className="invoice-document-payment"><span>Payment terms</span><strong>{details.paymentTerms}</strong></div>}
    {details.paymentDetails && <p className="invoice-document-payment-details">{details.paymentDetails}</p>}
    {details.notes && <p className="invoice-document-note">{details.notes}</p>}
  </Card>
}

/** The canvas for this shared navigation component is at tempo/designs/design-system/ledgerly-design-system/index.canvas.tsx. Keep its showcase in sync with the application sidebar. */
export function ApplicationSidebar({ view, onNavigate, compact = false, profileOpen = false, onToggleProfile, onSettings, onProfileDetails }: {
  view: AppView
  onNavigate?: (view: AppView) => void
  compact?: boolean
  profileOpen?: boolean
  onToggleProfile?: () => void
  onSettings?: () => void
  onProfileDetails?: () => void
}) {
  function navigate(next: AppView) {
    onNavigate?.(next)
  }

  return <aside className="app-sidebar">
    <Brand href={compact ? '#top' : '/'} static={compact} />
    {compact
      ? <div className="workspace-switcher" aria-label="Northstar Studio workspace"><span className="workspace-monogram">N</span><span><strong>Northstar Studio</strong><small>Business workspace</small></span><ChevronDown aria-hidden="true" /></div>
      : <a className="workspace-switcher" href="/app/dashboard" aria-label="Northstar Studio workspace"><span className="workspace-monogram">N</span><span><strong>Northstar Studio</strong><small>Business workspace</small></span><ChevronDown aria-hidden="true" /></a>}
    <nav className="app-nav" aria-label="Main navigation"><span className="nav-section-label">Workspace</span>
      {appLinks.map(link => {
        const Icon = link.icon
        return compact
          ? <span key={link.id} className="app-nav-link" data-active={view === link.id} aria-current={view === link.id ? 'page' : undefined}><Icon aria-hidden="true" /><span>{link.label}</span></span>
          : onNavigate
            ? <button key={link.id} className="app-nav-link" data-active={view === link.id} aria-current={view === link.id ? 'page' : undefined} onClick={() => navigate(link.id)}><Icon aria-hidden="true" /><span>{link.label}</span></button>
            : <a key={link.id} className="app-nav-link" data-active={view === link.id} aria-current={view === link.id ? 'page' : undefined} href={link.href}><Icon aria-hidden="true" /><span>{link.label}</span></a>
      })}
      <span className="nav-section-label app-nav-group-label">Finance</span>
      {appAreas.map(area => { const Icon = area.icon; return <span className="app-nav-link app-nav-static" aria-disabled="true" key={area.label}><Icon aria-hidden="true" /><span>{area.label}</span></span> })}
    </nav>
    <div className="sidebar-bottom">
      <a className="sidebar-support" href="/#faq"><CircleHelp aria-hidden="true" /><span>Help and support</span></a>
      <button className="sidebar-support" onClick={onSettings}><Settings2 aria-hidden="true" /><span>Settings</span></button>
      <button className="profile-switcher" aria-expanded={profileOpen} aria-controls="profile-menu" onClick={onToggleProfile}>
        <span className="profile-avatar">OB</span><span><strong>Olivia Bennett</strong><small>Owner</small></span><MoreHorizontal aria-hidden="true" />
      </button>
    </div>
    {profileOpen && <div className="app-popover profile-menu" id="profile-menu" role="menu">
      <div className="popover-person"><span className="profile-avatar">OB</span><span><strong>Olivia Bennett</strong><small>olivia@northstar.studio</small></span></div>
      <button role="menuitem" onClick={onProfileDetails}><FileText aria-hidden="true" />Profile details</button>
      <button role="menuitem" onClick={onSettings}><Settings2 aria-hidden="true" />Account settings</button>
      <button role="menuitem" onClick={() => window.location.assign('/')}><LogOut aria-hidden="true" />Sign out</button>
    </div>}
  </aside>
}

function AppShell({ view, children, onNavigate, compact = false }: { view: AppView; children: ReactNode; onNavigate?: (view: AppView) => void; compact?: boolean }) {
  const [menu, setMenu] = useState<'search' | 'notifications' | 'profile' | null>(null)
  const [profileAnchor, setProfileAnchor] = useState<'sidebar' | 'topbar'>('topbar')
  const [search, setSearch] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileDetailsOpen, setProfileDetailsOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [toast, setToast] = useState('')
  const title = view === 'dashboard' ? 'Dashboard' : view === 'invoices' ? 'Invoices' : 'Create invoice'

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(null)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setMenu(view === 'invoices' ? null : 'search')
        window.setTimeout(() => document.querySelector<HTMLInputElement>(view === 'invoices' ? '.invoice-search input' : '.topbar-search input')?.focus(), 0)
      }
    }
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [view])

  const searchHref = `/app/invoices?query=${encodeURIComponent(search)}`
  const searchMatches = readInvoices().filter(invoice => `${invoice.id} ${invoice.client}`.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 4)

  function navigate(next: AppView) {
    setMenu(null)
    setMobileNavOpen(false)
    if (onNavigate) onNavigate(next)
  }

  function searchDestination(href: string) {
    if (onNavigate) { onNavigate('invoices'); setMenu(null) }
    else window.location.assign(href)
  }

  return <div className={`application-shell${compact ? ' application-shell-compact' : ''}`} style={{ height: '1149px' }}>
    <ApplicationSidebar
      view={view}
      onNavigate={compact ? undefined : navigate}
      compact={compact}
      profileOpen={menu === 'profile' && profileAnchor === 'sidebar'}
      onToggleProfile={() => { setProfileAnchor('sidebar'); setMenu(menu === 'profile' && profileAnchor === 'sidebar' ? null : 'profile') }}
      onSettings={() => { setSettingsOpen(true); setMenu(null) }}
      onProfileDetails={() => { setProfileDetailsOpen(true); setMenu(null) }}
    />
    <div className="app-main-column">
      <header className="app-topbar">
        <div className="topbar-page">{compact ? <span className="mobile-sidebar-trigger" aria-hidden="true"><Menu aria-hidden="true" /></span> : <button className="mobile-sidebar-trigger" aria-label="Open workspace navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(true)}><Menu aria-hidden="true" /></button>}<span className="topbar-workspace">Northstar Studio</span><span className="topbar-page-separator" aria-hidden="true">/</span><strong>{title}</strong></div>
        <div className="topbar-actions">
          {!compact && <div className="topbar-search-wrap">
            <label className="topbar-search"><Search aria-hidden="true" /><span className="sr-only">Search invoices and customers</span><input type="search" placeholder="Search invoices or customers" value={search} onFocus={() => setMenu('search')} onChange={event => { setSearch(event.target.value); setMenu('search') }} onKeyDown={event => { if (event.key === 'Enter') searchDestination(searchHref) }} /><kbd>⌘ K</kbd></label>
            {menu === 'search' && <div className="app-popover search-menu" role="listbox" aria-label="Search results">
              {search.trim() ? <><button className="search-menu-all" onClick={() => searchDestination(searchHref)}><Search aria-hidden="true" />Search invoices for “{search.trim()}”<ArrowRight aria-hidden="true" /></button>{searchMatches.map(invoice => <button key={invoice.id} onClick={() => searchDestination(`/app/invoices?query=${encodeURIComponent(invoice.id)}`)}><FileText aria-hidden="true" /><span><strong>{invoice.client}</strong><small>{invoice.id} · {formatUSD(invoice.amount)}</small></span></button>)}{searchMatches.length === 0 && <p className="popover-empty">No matching invoices</p>}</> : <p className="popover-empty">Search by client name or invoice number</p>}
            </div>}
          </div>}
          {!compact && <div className="topbar-menu-wrap"><button className="topbar-icon-button" aria-label="Notifications" aria-expanded={menu === 'notifications'} aria-controls="notification-menu" onClick={() => setMenu(menu === 'notifications' ? null : 'notifications')}><Bell aria-hidden="true" /><i /></button>{menu === 'notifications' && <div className="app-popover notification-menu" id="notification-menu"><div className="popover-heading"><strong>Notifications</strong><span>1 new</span></div><button onClick={() => searchDestination('/app/invoices?query=Overdue')}><span className="notification-mark"><Clock3Icon /></span><span><strong>Payment is past due</strong><small>Merrill &amp; Co. · NS-2026-012 · $980.00</small></span></button><button onClick={() => searchDestination('/app/invoices?query=Field')}><span className="notification-mark"><CalendarDays /></span><span><strong>Payment due soon</strong><small>Field Studio · due Mar 29</small></span></button></div>}</div>}
          {!compact && <a className="topbar-help" href="/#faq" aria-label="Help and support"><CircleHelp aria-hidden="true" /></a>}
          {!compact && <div className="topbar-menu-wrap"><button className="topbar-profile" aria-label="Olivia Bennett account menu" aria-expanded={menu === 'profile' && profileAnchor === 'topbar'} aria-controls="profile-menu" onClick={() => { setProfileAnchor('topbar'); setMenu(menu === 'profile' && profileAnchor === 'topbar' ? null : 'profile') }}><span className="profile-avatar">OB</span><ChevronDown aria-hidden="true" /></button>{menu === 'profile' && profileAnchor === 'topbar' && <div className="app-popover profile-menu" id="profile-menu" role="menu">
            <div className="popover-person"><span className="profile-avatar">OB</span><span><strong>Olivia Bennett</strong><small>olivia@northstar.studio</small></span></div>
            <button role="menuitem" onClick={() => { setProfileDetailsOpen(true); setMenu(null) }}><FileText aria-hidden="true" />Profile details</button>
            <button role="menuitem" onClick={() => { setSettingsOpen(true); setMenu(null) }}><Settings2 aria-hidden="true" />Account settings</button>
            <button role="menuitem" onClick={() => { setMenu(null); window.location.assign('/') }}><LogOut aria-hidden="true" />Sign out</button>
          </div>}</div>}
          {compact && <span className="topbar-date"><CalendarDays aria-hidden="true" />Mar 2026</span>}
        </div>
      </header>
      {!compact && mobileNavOpen && <Drawer title="Northstar Studio" onClose={() => setMobileNavOpen(false)}><nav className="mobile-drawer-nav" aria-label="Workspace navigation"><span className="nav-section-label">Workspace</span>{appLinks.map(link => { const Icon = link.icon; return onNavigate ? <button key={link.id} className="app-nav-link" data-active={view === link.id} aria-current={view === link.id ? 'page' : undefined} onClick={() => navigate(link.id)}><Icon aria-hidden="true" /><span>{link.label}</span></button> : <a key={link.id} className="app-nav-link" data-active={view === link.id} aria-current={view === link.id ? 'page' : undefined} href={link.href} onClick={() => setMobileNavOpen(false)}><Icon aria-hidden="true" /><span>{link.label}</span></a> })}<span className="nav-section-label app-nav-group-label">Finance</span>{appAreas.map(area => { const Icon = area.icon; return <span className="app-nav-link app-nav-static" aria-disabled="true" key={area.label}><Icon aria-hidden="true" /><span>{area.label}</span></span> })}<span className="nav-section-label app-nav-group-label">Account</span><button className="app-nav-link" onClick={() => { setMobileNavOpen(false); setSettingsOpen(true) }}><Settings2 aria-hidden="true" /><span>Settings</span></button></nav><div className="mobile-drawer-profile"><span className="profile-avatar">OB</span><span><strong>Olivia Bennett</strong><small>Owner · Northstar Studio</small></span></div></Drawer>}
      {menu && <button className="popover-dismiss" aria-label="Close menu" onClick={() => setMenu(null)} />}
      <main className="app-content">{children}</main>
    </div>
    {profileDetailsOpen && <Drawer title="Profile details" onClose={() => setProfileDetailsOpen(false)}><div className="settings-panel"><span className="settings-avatar">OB</span><h3>Olivia Bennett</h3><p>Owner · Northstar Studio</p><Field label="Email address" value="olivia@northstar.studio" readOnly /><Button variant="outline" onClick={() => setProfileDetailsOpen(false)}>Done</Button></div></Drawer>}
    {settingsOpen && <Drawer title="Account settings" onClose={() => setSettingsOpen(false)}><div className="settings-panel"><span className="settings-avatar">OB</span><h3>Olivia Bennett</h3><p>Owner · Northstar Studio</p><ChoiceField label="Invoice payment reminders" checked onChange={() => setToast('Reminder preference updated')} /><ChoiceField label="Weekly cash summary" checked onChange={() => setToast('Summary preference updated')} /><Button variant="outline" onClick={() => setSettingsOpen(false)}>Done</Button></div></Drawer>}
    {toast && <div className="app-toast"><Toast title={toast} message="Your preference has been updated." onDismiss={() => setToast('')} /></div>}
  </div>
}

function PageHeading({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div><div className="page-heading-actions">{children}</div></div>
}

/** The canvas for these shared chart components lives on the Ledgerly Design System canvas. */
export function CashFlowChart({ variant = 'application' }: { variant?: 'application' | 'marketing' }) {
  const maxValue = 6500
  return <div className={`cashflow-chart${variant === 'marketing' ? ' cashflow-chart-marketing' : ''}`} role="img" aria-label="Monthly income and expenses, October through March, in US dollars.">
    <div className="chart-axis"><span>$6.5k</span><span>$5k</span><span>$3k</span><span>$1.5k</span><span>$0</span></div>
    <div className="chart-main"><div className="chart-grid"><i /><i /><i /><i /><i /></div><div className="chart-columns">{cashFlow.map(item => <div className="chart-month" key={item.month}><div className="chart-bars"><span className="chart-bar chart-bar-income" style={{ height: `${item.income / maxValue * 100}%` }} title={`${item.month} income ${formatUSD(item.income)}`} /><span className="chart-bar chart-bar-expense" style={{ height: `${item.expenses / maxValue * 100}%` }} title={`${item.month} expenses ${formatUSD(item.expenses)}`} /></div><span className="chart-month-label">{item.month}</span></div>)}</div></div>
  </div>
}

export function CashFlowLegend({ compact = false }: { compact?: boolean }) {
  return <div className={`chart-legend${compact ? ' chart-legend-compact' : ''}`}><span><i className="legend-dot legend-income" />Money in</span><span><i className="legend-dot legend-expense" />Money out</span>{!compact && <span className="chart-units">USD</span>}</div>
}

function CashFlowPanel() {
  const currentMonth = cashFlow[cashFlow.length - 1]
  return <Card className="chart-panel"><div className="section-panel-heading"><div><h2>Cash flow</h2><p>Income and expenses over the last six months</p></div><span className="chart-period">Oct 2025 — Mar 2026</span></div><CashFlowLegend /><CashFlowChart /><div className="chart-summary"><span><small>Money in · March</small><strong>{formatUSD(currentMonth.income)}</strong></span><span><small>Money out · March</small><strong>{formatUSD(currentMonth.expenses)}</strong></span></div></Card>
}

/** The same invoice table is used by the Dashboard, Invoice List, and marketing previews. */
export function InvoiceTable({ rows, compact = false }: { rows: Invoice[]; compact?: boolean }) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [menuInvoiceId, setMenuInvoiceId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null)
  useEffect(() => {
    const dismiss = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key === 'Escape') setMenuInvoiceId(null)
      if (event instanceof MouseEvent && !(event.target instanceof Element && event.target.closest('.invoice-row-menu-anchor'))) setMenuInvoiceId(null)
    }
    document.addEventListener('mousedown', dismiss)
    document.addEventListener('keydown', dismiss)
    return () => {
      document.removeEventListener('mousedown', dismiss)
      document.removeEventListener('keydown', dismiss)
    }
  }, [])
  const downloadInvoice = (invoice: Invoice) => {
    downloadInvoicePdf(invoice)
    setMenuInvoiceId(null)
  }
  const editInvoice = (invoice: Invoice) => window.location.assign(`/app/create-invoice?edit=${encodeURIComponent(invoice.id)}`)
  const markPaid = (invoice: Invoice) => {
    updateInvoice({ ...invoice, status: 'Paid', paidAt: new Date().toISOString().slice(0, 10) })
    setMenuInvoiceId(null)
  }
  const toggleMenu = (invoice: Invoice, button: HTMLButtonElement) => {
    if (menuInvoiceId === invoice.id) { setMenuInvoiceId(null); setMenuPosition(null); return }
    const bounds = button.getBoundingClientRect()
    setMenuInvoiceId(invoice.id)
    setMenuPosition({ top: Math.min(bounds.bottom + 6, window.innerHeight - 190), left: Math.max(8, Math.min(bounds.right - 190, window.innerWidth - 198)) })
  }
  const renderMenu = (invoice: Invoice) => menuInvoiceId === invoice.id && menuPosition && <div className="invoice-row-menu" style={{ top: menuPosition.top, left: menuPosition.left }} role="menu" aria-label={`${invoice.id} actions`}>
    <button type="button" role="menuitem" onClick={() => editInvoice(invoice)}><Pencil aria-hidden="true" /><span>Edit Invoice</span></button>
    <button type="button" role="menuitem" disabled={invoice.status === 'Paid'} onClick={() => markPaid(invoice)}><CircleCheck aria-hidden="true" /><span>Mark as paid</span></button>
    <button type="button" role="menuitem" onClick={() => downloadInvoice(invoice)}><Download aria-hidden="true" /><span>Download Invoice</span></button>
    <button type="button" role="menuitem" className="invoice-row-menu-delete" onClick={() => { setDeletingInvoice(invoice); setMenuInvoiceId(null) }}><Trash2 aria-hidden="true" /><span>Delete invoice</span></button>
  </div>
  return <>
    <div className="invoice-table-wrap"><table className={compact ? 'invoice-table invoice-table-compact' : 'invoice-table'}><thead><tr><th scope="col">Invoice</th><th scope="col">Customer</th>{!compact && <><th scope="col">Issue date</th><th scope="col">Due date</th></>}<th scope="col">Status</th><th scope="col" className="amount-cell">Amount</th>{!compact && <th scope="col"><span className="sr-only">Actions</span></th>}</tr></thead>
      <tbody>{rows.map(row => <tr key={row.id}><td>{compact ? <span className="invoice-id-label">{row.id}</span> : <button className="invoice-link" onClick={() => setSelectedInvoice(row)}>{row.id}</button>}</td><td><span className="table-client">{row.client}</span></td>{!compact && <><td>{formatDate(row.issuedAt)}</td><td>{formatDate(row.dueAt)}</td></>}<td><StatusBadge status={row.status} /></td><td className="amount-cell financial-value">{formatUSD(row.amount)}</td>{!compact && <td><div className="invoice-row-menu-anchor"><button className="row-action" aria-label={`More options for ${row.id}`} aria-haspopup="menu" aria-expanded={menuInvoiceId === row.id} onClick={event => toggleMenu(row, event.currentTarget)}><MoreHorizontal aria-hidden="true" /></button>{renderMenu(row)}</div></td>}</tr>)}</tbody>
    </table><div className="mobile-invoice-list">{rows.map(row => compact ? <div className="mobile-invoice-row" key={row.id}><span className="mobile-invoice-main"><strong>{row.client}</strong><small>{row.id} · due {formatDate(row.dueAt)}</small></span><span className="mobile-invoice-side"><strong className="financial-value">{formatUSD(row.amount)}</strong><StatusBadge status={row.status} /></span></div> : <div className="mobile-invoice-row" key={row.id}><button className="mobile-invoice-main mobile-invoice-open" onClick={() => setSelectedInvoice(row)}><strong>{row.client}</strong><small>{row.id} · due {formatDate(row.dueAt)}</small></button><span className="mobile-invoice-side"><strong className="financial-value">{formatUSD(row.amount)}</strong><StatusBadge status={row.status} /></span><div className="invoice-row-menu-anchor"><button className="row-action" aria-label={`More options for ${row.id}`} aria-haspopup="menu" aria-expanded={menuInvoiceId === row.id} onClick={event => toggleMenu(row, event.currentTarget)}><MoreHorizontal aria-hidden="true" /></button>{renderMenu(row)}</div></div>)}</div>{rows.length === 0 && <EmptyState title="No invoices found" description="Try another status or a shorter search." />}</div>
    {!compact && selectedInvoice && <Drawer title="Invoice details" onClose={() => setSelectedInvoice(null)}><div className="invoice-detail-summary"><span>{selectedInvoice.id}</span><h3>{selectedInvoice.client}</h3><StatusBadge status={selectedInvoice.status} /><strong className="financial-value">{formatUSD(selectedInvoice.amount)}</strong></div><InvoiceDocumentPreview invoice={selectedInvoice} /><div className="invoice-detail-actions"><Button variant="outline" leadingIcon={<Pencil aria-hidden="true" />} onClick={() => window.location.assign(`/app/create-invoice?edit=${encodeURIComponent(selectedInvoice.id)}`)}>Edit Invoice</Button><Button variant="secondary" leadingIcon={<Download aria-hidden="true" />} onClick={() => downloadInvoice(selectedInvoice)}>Download Invoice</Button></div></Drawer>}
    {!compact && deletingInvoice && <Modal title="Delete invoice?" onClose={() => setDeletingInvoice(null)}><p>{deletingInvoice.id} for {deletingInvoice.client} will be removed from this invoice list.</p><div className="invoice-edit-actions"><Button variant="outline" onClick={() => setDeletingInvoice(null)}>Keep invoice</Button><Button variant="danger" leadingIcon={<Trash2 aria-hidden="true" />} onClick={() => { deleteInvoice(deletingInvoice.id); setDeletingInvoice(null) }}>Delete invoice</Button></div></Modal>}
  </>
}

function ActivityPanel() {
  return <Card className="activity-panel"><div className="section-panel-heading"><div><h2>Recent activity</h2><p>Money moving through your business</p></div><Activity aria-hidden="true" /></div><div className="activity-list">{recentActivity.map(item => <div className="activity-row" key={item.id}><span className="activity-icon" data-kind={item.kind}>{item.kind === 'expense' ? <ArrowDownRight aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}</span><span className="activity-copy"><strong>{item.title}</strong><small>{item.detail}</small></span><span className="activity-amount financial-value" data-kind={item.kind}>{item.amount < 0 ? `−${formatUSD(Math.abs(item.amount))}` : formatUSD(item.amount)}</span><time>{item.date}</time></div>)}</div></Card>
}

function useInvoiceRevision() {
  const [, setRevision] = useState(0)
  useEffect(() => {
    const update = () => setRevision(value => value + 1)
    window.addEventListener('ledgerly:invoice-change', update)
    return () => window.removeEventListener('ledgerly:invoice-change', update)
  }, [])
}

/** The canvas for this Dashboard composition is at tempo/designs/design-system/ledgerly-design-system/index.canvas.tsx. Keep this financial summary aligned with the Dashboard screen. */
export function DashboardFinancialOverview() {
  useInvoiceRevision()
  const netIncome = cashFlow.reduce((total, month) => total + month.income - month.expenses, 0)
  const dashboardInvoices = readInvoices()
  const openInvoices = dashboardInvoices.filter(invoice => invoice.status === 'Awaiting payment' || invoice.status === 'Overdue')
  const dashboardOpenBalance = openInvoices.reduce((total, invoice) => total + invoice.amount, 0)
  const marchInvoices = dashboardInvoices.filter(invoice => invoice.paidAt?.startsWith('2026-03'))
  const dashboardCollectedThisMonth = marchInvoices.reduce((total, invoice) => total + invoice.amount, 0)

  return <div className="dashboard-overview"><section className="balance-overview"><div><span className="balance-label">Cash balance</span><strong className="balance-amount financial-value">{formatUSD(cashBalance)}</strong><span className="balance-context">Across business activity through March 24</span></div><div className="balance-net"><span>Net income this period</span><strong className="financial-value">{formatUSD(netIncome)}</strong><small>Oct 2025 — Mar 2026</small></div></section><div className="overview-side"><div><span>Open invoices</span><strong className="financial-value">{formatUSD(dashboardOpenBalance)}</strong><small>{openInvoices.length} invoices · {openInvoices.filter(invoice => invoice.status === 'Overdue').length} past due</small></div><div><span>Collected in March</span><strong className="financial-value">{formatUSD(dashboardCollectedThisMonth)}</strong><small>{marchInvoices.length} payments received</small></div></div></div>
}

export function DashboardScreen({ onNavigate, compact = false }: { onNavigate?: (view: AppView) => void; compact?: boolean }) {
  useInvoiceRevision()
  const dashboardInvoices = readInvoices()
  const newInvoice = compact
    ? <span className="button app-mockup-action" data-variant="primary" data-size="md"><Plus aria-hidden="true" /><span>New invoice</span></span>
    : onNavigate
      ? <Button leadingIcon={<Plus aria-hidden="true" />} onClick={() => onNavigate('create-invoice')}>New invoice</Button>
      : <a className="button" data-variant="primary" data-size="md" href="/app/create-invoice"><Plus aria-hidden="true" /><span>New invoice</span></a>
  return <AppShell view="dashboard" onNavigate={onNavigate} compact={compact}><PageHeading title="Good morning, Olivia" description={`${formatToday()} · Northstar Studio`}>{newInvoice}</PageHeading>
    <DashboardFinancialOverview />
    <div className="dashboard-main-grid"><CashFlowPanel /><section className="dashboard-recent"><div className="section-panel-heading"><div><h2>Latest invoices</h2><p>Recent client billing</p></div>{compact ? <span className="text-link">View all<ArrowRight aria-hidden="true" /></span> : onNavigate ? <button className="text-link" onClick={() => onNavigate('invoices')}>View all<ArrowRight aria-hidden="true" /></button> : <a className="text-link" href="/app/invoices">View all<ArrowRight aria-hidden="true" /></a>}</div><InvoiceTable rows={dashboardInvoices.slice(0, 4)} compact /></section></div>
    <ActivityPanel />
  </AppShell>
}

function filterInvoiceRows(rows: Invoice[], filter: InvoiceFilter, query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  return rows.filter(invoice => (filter === 'All' || invoice.status === filter) && (!normalizedQuery || `${invoice.id} ${invoice.client} ${invoice.status}`.toLowerCase().includes(normalizedQuery)))
}

export function InvoiceListScreen({ onNavigate, compact = false }: { onNavigate?: (view: AppView) => void; compact?: boolean }) {
  useInvoiceRevision()
  const saved = readDraft()
  const allRows = [...(saved ? [saved] : []), ...readInvoices().filter(item => item.id !== saved?.id)]
  const initialParams = new URLSearchParams(window.location.search)
  const [createdInvoiceId, setCreatedInvoiceId] = useState(() => initialParams.get('created') ?? initialParams.get('saved') ?? '')
  const [noticeKind] = useState<'created' | 'saved'>(() => initialParams.has('saved') ? 'saved' : 'created')
  const [filter, setFilter] = useState<InvoiceFilter>('All')
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('query') ?? '')
  const [page, setPage] = useState(1)
  useEffect(() => {
    if (!createdInvoiceId) return
    window.history.replaceState({}, '', '/app/invoices')
    const timer = window.setTimeout(() => setCreatedInvoiceId(''), 5000)
    return () => window.clearTimeout(timer)
  }, [createdInvoiceId])
  const filteredInvoices = filterInvoiceRows(allRows, filter, query)
  const pageCount = Math.max(1, Math.ceil(filteredInvoices.length / 6))
  const visibleInvoices = filteredInvoices.slice((page - 1) * 6, page * 6)
  const filterOptions: InvoiceFilter[] = ['All', 'Awaiting payment', 'Overdue', 'Paid', 'Draft']
  const counts: Record<InvoiceFilter, number> = { All: allRows.length, 'Awaiting payment': allRows.filter(row => row.status === 'Awaiting payment').length, Overdue: allRows.filter(row => row.status === 'Overdue').length, Paid: allRows.filter(row => row.status === 'Paid').length, Draft: allRows.filter(row => row.status === 'Draft').length }
  const openBalance = allRows.filter(row => row.status === 'Awaiting payment' || row.status === 'Overdue').reduce((sum, row) => sum + row.amount, 0)
  const paidThisMonth = allRows.filter(row => row.status === 'Paid' && row.paidAt?.startsWith('2026-03')).reduce((sum, row) => sum + row.amount, 0)
  const createAction = onNavigate ? <Button leadingIcon={<Plus aria-hidden="true" />} onClick={() => onNavigate('create-invoice')}>New invoice</Button> : <a className="button" data-variant="primary" data-size="md" href="/app/create-invoice"><Plus aria-hidden="true" /><span>New invoice</span></a>
  return <AppShell view="invoices" onNavigate={onNavigate} compact={compact}><PageHeading title="Invoices" description="Track every invoice, from first draft to final payment.">{createAction}</PageHeading>
    {createdInvoiceId && <div className="app-toast"><Toast title={noticeKind === 'saved' ? 'Invoice saved' : 'Invoice created'} message={noticeKind === 'saved' ? `${createdInvoiceId} and its invoice details were saved.` : `${createdInvoiceId} was added to your invoice list.`} onDismiss={() => setCreatedInvoiceId('')} /></div>}
    <div className="invoice-overview"><div><span>Outstanding</span><strong className="financial-value">{formatUSD(openBalance)}</strong></div><div><span>Collected this month</span><strong className="financial-value">{formatUSD(paidThisMonth)}</strong></div><div><span>Past due</span><strong className="financial-value">{formatUSD(allRows.filter(row => row.status === 'Overdue').reduce((sum, row) => sum + row.amount, 0))}</strong></div></div>
    <Card className="invoice-list-card"><div style={{ alignItems: "center" }} className="invoice-toolbar"><div className="invoice-toolbar-heading"><h2>All invoices <span>{filteredInvoices.length}</span></h2><label className="invoice-search"><Search aria-hidden="true" /><span className="sr-only">Search invoices</span><input type="search" placeholder="Search by client or number" value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} /><kbd>⌘ K</kbd></label></div>
      <div className="invoice-tabs" role="tablist" aria-label="Filter invoices by status">{filterOptions.map(option => <button type="button" role="tab" aria-selected={filter === option} data-active={filter === option} key={option} onClick={() => { setFilter(option); setPage(1) }}>{option}<span>{counts[option]}</span></button>)}</div>
    </div><InvoiceTable rows={visibleInvoices} />{pageCount > 1 && <Pagination currentPage={page} pageCount={pageCount} onChange={setPage} />}</Card>
  </AppShell>
}

export function CreateInvoiceScreen({ onNavigate, compact = false, demoStep = -1 }: { onNavigate?: (view: AppView) => void; compact?: boolean; demoStep?: number }) {
  const editId = new URLSearchParams(window.location.search).get('edit')
  const editingInvoice = editId ? readInvoices().find(invoice => invoice.id === editId) ?? (readDraft()?.id === editId ? readDraft() : null) : null
  const initialDocument = editingInvoice ? documentForInvoice(editingInvoice) : null
  const initialCustomer = initialDocument?.customerKey ?? customerOptions.find(option => option.label === editingInvoice?.client)?.value ?? 'fieldwork'
  const [customer, setCustomer] = useState(initialCustomer)
  const [invoiceNumber, setInvoiceNumber] = useState(editingInvoice?.id ?? 'NS-2026-015')
  const [issueDate, setIssueDate] = useState(editingInvoice?.issuedAt ?? '2026-03-24')
  const [dueDate, setDueDate] = useState(editingInvoice?.dueAt ?? '2026-04-07')
  const [taxRate, setTaxRate] = useState(initialDocument?.taxRate ?? 0)
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(initialDocument?.lineItems ?? [{ id: 1, description: 'Brand identity design', quantity: 1, rate: 1800 }, { id: 2, description: 'Website art direction', quantity: 1, rate: 700 }])
  const [notes, setNotes] = useState(initialDocument?.notes ?? 'Thank you for working with Northstar Studio.')
  const [paymentTerms, setPaymentTerms] = useState(initialDocument?.paymentTerms ?? 'Net 14 days')
  const [paymentDetails, setPaymentDetails] = useState(initialDocument?.paymentDetails ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [reviewOpen, setReviewOpen] = useState(false)
  const subtotal = lineItems.reduce((sum, item) => sum + Math.max(0, item.quantity) * Math.max(0, item.rate), 0)
  const tax = Math.round(subtotal * taxRate) / 100
  const total = subtotal + tax
  const client = customerOptions.find(option => option.value === customer)?.label ?? 'Select a customer'
  const details = customerDetails[customer]
  const updateError = (key: string) => setErrors(current => { const next = { ...current }; delete next[key]; return next })
  const validate = () => {
    const next: Record<string, string> = {}
    if (!customer) next.customer = 'Choose a customer.'
    if (!invoiceNumber.trim()) next.invoiceNumber = 'Add an invoice number.'
    if (!issueDate) next.issueDate = 'Choose an issue date.'
    if (!dueDate) next.dueDate = 'Choose a due date.'
    if (issueDate && dueDate && dueDate < issueDate) next.dueDate = 'Due date must be on or after the issue date.'
    lineItems.forEach((item, index) => {
      if (!item.description.trim()) next[`description-${item.id}`] = `Describe line ${index + 1}.`
      if (item.quantity <= 0) next[`quantity-${item.id}`] = 'Enter a quantity above zero.'
      if (item.rate < 0) next[`rate-${item.id}`] = 'Rate cannot be negative.'
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }
  const makeInvoice = (status: Invoice['status']): Invoice => ({
    id: invoiceNumber.trim(),
    client,
    issuedAt: issueDate,
    dueAt: dueDate,
    amount: total,
    status,
    paidAt: editingInvoice?.paidAt,
    document: {
      customerKey: customer,
      customerEmail: customerEmails[customer] ?? '',
      customerAddress: details?.address ?? '',
      lineItems,
      taxRate,
      notes,
      paymentTerms,
      paymentDetails,
    },
  })
  const currentInvoice = makeInvoice(editingInvoice?.status ?? 'Draft')
  const navigateToInvoiceList = (notice: 'saved' | 'created') => {
    if (onNavigate) onNavigate('invoices')
    else window.location.assign(`/app/invoices?${notice}=${encodeURIComponent(invoiceNumber.trim())}`)
  }
  const saveDraft = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    if (!validate()) return
    if (editingInvoice && editingInvoice.id === invoiceNumber.trim()) updateInvoice({ ...makeInvoice(editingInvoice.status), paidAt: editingInvoice.paidAt })
    else if (editingInvoice) { deleteInvoice(editingInvoice.id); writeCreatedInvoice(makeInvoice(editingInvoice.status)) }
    else writeCreatedInvoice(makeInvoice('Draft'))
    const draft = readDraft()
    if (draft?.id === invoiceNumber.trim()) window.localStorage.removeItem(draftStorageKey)
    navigateToInvoiceList('saved')
  }
  const createInvoice = () => {
    if (!validate()) return
    if (editingInvoice && editingInvoice.id === invoiceNumber.trim()) updateInvoice({ ...makeInvoice(editingInvoice.status), paidAt: editingInvoice.paidAt })
    else if (editingInvoice) { deleteInvoice(editingInvoice.id); writeCreatedInvoice(makeInvoice(editingInvoice.status)) }
    else writeCreatedInvoice(makeInvoice('Awaiting payment'))
    const draft = readDraft()
    if (draft?.id === invoiceNumber.trim()) window.localStorage.removeItem(draftStorageKey)
    navigateToInvoiceList(editingInvoice ? 'saved' : 'created')
  }
  const updateLine = (id: number, field: keyof Omit<InvoiceLineItem, 'id'>, value: string) => {
    setLineItems(items => items.map(item => item.id === id ? { ...item, [field]: field === 'description' ? value : Number(value) } : item))
    updateError(`${field}-${id}`)
  }
  const cancelAction = onNavigate ? <Button variant="outline" onClick={() => onNavigate('invoices')}>Cancel</Button> : <a className="button" data-variant="outline" data-size="md" href="/app/invoices">Cancel</a>
  const headerActions = <div className="create-invoice-header-actions"><Button variant="secondary" onClick={() => saveDraft()}>{editingInvoice ? 'Save Changes' : 'Save as Draft'}</Button><Button onClick={() => { if (validate()) setReviewOpen(true) }}>Review Invoice</Button></div>
  return <AppShell view="create-invoice" onNavigate={onNavigate} compact={compact}><div className="create-heading"><a className="back-link" href="/app/invoices"><ArrowRight aria-hidden="true" />Invoices</a><PageHeading title={editingInvoice ? 'Edit Invoice' : 'Create Invoice'} description={editingInvoice ? `Update ${editingInvoice.id} and review the client-ready document.` : 'Prepare a clear invoice for your client.'}>{headerActions}</PageHeading></div>
    <div className={`create-invoice-layout${demoStep >= 0 ? ' guided-invoice' : ''}`} data-demo-step={demoStep}>
      <form className="invoice-form" onSubmit={saveDraft} noValidate>
        <section className="form-section-card" data-demo-target="customer"><div className="form-section-heading"><span>01</span><div><h2>Client details</h2><p>Choose a client and confirm where the invoice should go.</p></div></div><div className="form-grid"><SelectField label="Client" value={customer} options={[{ value: '', label: 'Choose a client' }, ...customerOptions]} onChange={event => { setCustomer(event.target.value); updateError('customer') }} error={errors.customer} /><Field label="Email address" type="email" value={customerEmails[customer] ?? ''} readOnly hint={details?.company ?? ''} /></div><p className="client-address">{details?.address ?? 'Select a client to see their billing address.'}</p></section>
        <section className="form-section-card"><div className="form-section-heading"><span>02</span><div><h2>Invoice details</h2><p>Set a reference and payment dates.</p></div></div><div className="form-grid form-grid-three"><Field label="Invoice number" value={invoiceNumber} onChange={event => { setInvoiceNumber(event.target.value); updateError('invoiceNumber') }} error={errors.invoiceNumber} /><Field label="Issue date" type="date" value={issueDate} onChange={event => { setIssueDate(event.target.value); updateError('issueDate'); updateError('dueDate') }} error={errors.issueDate} /><Field label="Due date" type="date" value={dueDate} onChange={event => { setDueDate(event.target.value); updateError('dueDate') }} error={errors.dueDate} /></div></section>
        <section className="form-section-card line-items-card" data-demo-target="line-items"><div className="form-section-heading"><span>03</span><div><h2>What are you billing for?</h2><p>Add each service with a quantity and rate.</p></div></div><div className="line-item-head"><span>Description</span><span>Qty</span><span>Rate</span><span>Amount</span><span /></div>
          <div className="line-item-editor">{lineItems.map((item, index) => <div className="line-item-row" key={item.id}><div className="line-description"><label className="sr-only" htmlFor={`line-description-${item.id}`}>Line {index + 1} description</label><input id={`line-description-${item.id}`} value={item.description} onChange={event => updateLine(item.id, 'description', event.target.value)} placeholder="Service or product" aria-invalid={Boolean(errors[`description-${item.id}`])} />{errors[`description-${item.id}`] && <small className="field-error">{errors[`description-${item.id}`]}</small>}</div><div className="line-quantity"><label className="sr-only" htmlFor={`line-quantity-${item.id}`}>Line {index + 1} quantity</label><input id={`line-quantity-${item.id}`} type="number" min="0.25" step="0.25" value={item.quantity} onChange={event => updateLine(item.id, 'quantity', event.target.value)} aria-invalid={Boolean(errors[`quantity-${item.id}`])} /></div><div className="line-rate"><label className="sr-only" htmlFor={`line-rate-${item.id}`}>Line {index + 1} rate in US dollars</label><span>$</span><input id={`line-rate-${item.id}`} type="number" min="0" step="0.01" value={item.rate} onChange={event => updateLine(item.id, 'rate', event.target.value)} aria-invalid={Boolean(errors[`rate-${item.id}`])} /></div><strong className="line-amount financial-value">{formatUSD(item.quantity * item.rate)}</strong><button className="remove-line" type="button" aria-label={`Remove line item ${index + 1}`} disabled={lineItems.length === 1} onClick={() => setLineItems(items => items.filter(line => line.id !== item.id))}><X aria-hidden="true" /></button></div>)}</div>
          <button className="add-line-button" type="button" onClick={() => setLineItems(items => [...items, { id: Date.now(), description: '', quantity: 1, rate: 0 }])}><Plus aria-hidden="true" />Add line item</button>
          <div className="invoice-tax-row"><SelectField label="Tax" value={String(taxRate)} options={[{ value: '0', label: 'No tax' }, { value: '5', label: '5%' }, { value: '8.25', label: '8.25%' }]} onChange={event => setTaxRate(Number(event.target.value))} /></div>
          <div className="invoice-subtotal" data-demo-target="total"><span>Subtotal</span><strong className="financial-value">{formatUSD(subtotal)}</strong><span>Tax ({taxRate}%)</span><strong className="financial-value">{formatUSD(tax)}</strong><span className="invoice-total-label">Total due</span><strong className="financial-value invoice-total-value">{formatUSD(total)}</strong></div>
        </section>
        <section className="form-section-card"><div className="form-section-heading"><span>04</span><div><h2>Payment and notes</h2><p>Keep the agreed terms and any instructions with this invoice.</p></div></div><div className="form-grid"><SelectField label="Payment terms" value={paymentTerms} options={[{ value: 'Due on receipt', label: 'Due on receipt' }, { value: 'Net 14 days', label: 'Net 14 days' }, { value: 'Net 30 days', label: 'Net 30 days' }]} onChange={event => setPaymentTerms(event.target.value)} /><TextAreaField label="Payment details (optional)" rows={2} value={paymentDetails} onChange={event => setPaymentDetails(event.target.value)} /></div><TextAreaField label="Note for your client" rows={3} value={notes} onChange={event => setNotes(event.target.value)} /></section>
        <div className="invoice-form-actions invoice-cancel-actions">{cancelAction}</div>
      </form>
      <aside className="invoice-summary-aside" data-demo-target="summary"><div className="invoice-preview-toolbar"><strong>Invoice preview</strong><span>Client-ready document</span></div><InvoiceDocumentPreview invoice={currentInvoice} /></aside>
    </div>
    {reviewOpen && <Modal title={editingInvoice ? 'Review invoice changes' : 'Review invoice'} size="wide" onClose={() => setReviewOpen(false)}><div className="review-modal-document"><InvoiceDocumentPreview invoice={currentInvoice} /></div><p className="review-modal-copy">Review the client, dates, line items and total before you save this invoice.</p><div className="review-modal-actions"><Button variant="outline" leadingIcon={<Download aria-hidden="true" />} onClick={() => downloadInvoicePdf(currentInvoice)}>Download Invoice</Button>{editingInvoice ? <Button variant="secondary" onClick={() => { saveDraft(); setReviewOpen(false) }}>Save Changes</Button> : <><Button variant="secondary" onClick={() => saveDraft()}>Save as Draft</Button><Button onClick={createInvoice}>Create Invoice</Button></>}</div></Modal>}
  </AppShell>
}

export function ApplicationScreen({ view, onNavigate, compact = false }: { view: AppView; onNavigate?: (view: AppView) => void; compact?: boolean }) {
  if (view === 'invoices') return <InvoiceListScreen onNavigate={onNavigate} compact={compact} />
  if (view === 'create-invoice') return <CreateInvoiceScreen onNavigate={onNavigate} compact={compact} />
  return <DashboardScreen onNavigate={onNavigate} compact={compact} />
}

function Clock3Icon() { return <Activity aria-hidden="true" /> }

defineControls(InvoiceTable, { rows: { type: 'object' }, compact: { type: 'boolean' } });
defineControls(CashFlowChart, { variant: { type: 'select' } });
defineControls(CashFlowLegend, { compact: { type: 'boolean' } });
defineControls(ApplicationSidebar, { view: { type: 'select' }, compact: { type: 'boolean' }, profileOpen: { type: 'boolean' }, onNavigate: false, onToggleProfile: false, onSettings: false, onProfileDetails: false });
defineControls(DashboardFinancialOverview, {});
defineControls(DashboardScreen, { compact: { type: 'boolean' }, onNavigate: false });
defineControls(InvoiceListScreen, { compact: { type: 'boolean' }, onNavigate: false });
defineControls(CreateInvoiceScreen, { compact: { type: 'boolean' }, demoStep: { type: 'number' }, onNavigate: false });

export type InvoiceStatus = 'Paid' | 'Awaiting payment' | 'Overdue' | 'Draft'

export interface InvoiceLineItem {
  id: number
  description: string
  quantity: number
  rate: number
}

export interface InvoiceDocumentData {
  customerKey?: string
  customerEmail?: string
  customerAddress?: string
  lineItems: InvoiceLineItem[]
  taxRate: number
  notes?: string
  paymentTerms?: string
  paymentDetails?: string
}

export interface Invoice {
  id: string
  client: string
  issuedAt: string
  dueAt: string
  amount: number
  status: InvoiceStatus
  paidAt?: string
  document?: InvoiceDocumentData
}

const createdInvoiceStorageKey = 'ledgerly:northstar:created-invoices'
const invoiceChangesStorageKey = 'ledgerly:northstar:invoice-changes'

interface InvoiceChanges {
  deletedIds: string[]
  updates: Record<string, Partial<Invoice>>
}

function readInvoiceChanges(): InvoiceChanges {
  try {
    const stored = window.localStorage.getItem(invoiceChangesStorageKey)
    if (!stored) return { deletedIds: [], updates: {} }
    const parsed = JSON.parse(stored) as Partial<InvoiceChanges>
    return {
      deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds.filter((id): id is string => typeof id === 'string') : [],
      updates: parsed.updates && typeof parsed.updates === 'object' ? parsed.updates : {},
    }
  } catch {
    return { deletedIds: [], updates: {} }
  }
}

function writeInvoiceChanges(changes: InvoiceChanges) {
  window.localStorage.setItem(invoiceChangesStorageKey, JSON.stringify(changes))
  window.dispatchEvent(new Event('ledgerly:invoice-change'))
}

export function readCreatedInvoices(): Invoice[] {
  try {
    const stored = window.localStorage.getItem(createdInvoiceStorageKey)
    if (!stored) return []
    const parsed = JSON.parse(stored) as unknown
    if (!Array.isArray(parsed)) return []
    const validStatuses: InvoiceStatus[] = ['Paid', 'Awaiting payment', 'Overdue', 'Draft']
    return parsed.filter((item): item is Invoice => {
      if (!item || typeof item !== 'object') return false
      const invoice = item as Record<string, unknown>
      return typeof invoice.id === 'string'
        && typeof invoice.client === 'string'
        && typeof invoice.issuedAt === 'string'
        && typeof invoice.dueAt === 'string'
        && typeof invoice.amount === 'number'
        && Number.isFinite(invoice.amount)
        && typeof invoice.status === 'string'
        && validStatuses.includes(invoice.status as InvoiceStatus)
        && (invoice.paidAt === undefined || typeof invoice.paidAt === 'string')
    })
  } catch {
    return []
  }
}

export function writeCreatedInvoice(invoice: Invoice) {
  const existing = readCreatedInvoices()
  window.localStorage.setItem(createdInvoiceStorageKey, JSON.stringify([invoice, ...existing.filter(item => item.id !== invoice.id)]))
  const changes = readInvoiceChanges()
  changes.deletedIds = changes.deletedIds.filter(id => id !== invoice.id)
  delete changes.updates[invoice.id]
  writeInvoiceChanges(changes)
}

export function readInvoices(): Invoice[] {
  const changes = readInvoiceChanges()
  const byId = new Map<string, Invoice>()
  for (const invoice of invoices) byId.set(invoice.id, invoice)
  for (const invoice of readCreatedInvoices()) byId.set(invoice.id, invoice)
  return [...byId.values()]
    .filter(invoice => !changes.deletedIds.includes(invoice.id))
    .map(invoice => ({ ...invoice, ...changes.updates[invoice.id] }))
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
}

export function updateInvoice(invoice: Invoice) {
  const created = readCreatedInvoices()
  if (created.some(item => item.id === invoice.id)) {
    window.localStorage.setItem(createdInvoiceStorageKey, JSON.stringify(created.map(item => item.id === invoice.id ? invoice : item)))
  } else {
    const changes = readInvoiceChanges()
    changes.updates[invoice.id] = invoice
    changes.deletedIds = changes.deletedIds.filter(id => id !== invoice.id)
    writeInvoiceChanges(changes)
  }
  window.dispatchEvent(new Event('ledgerly:invoice-change'))
}

export function deleteInvoice(id: string) {
  const changes = readInvoiceChanges()
  if (!changes.deletedIds.includes(id)) changes.deletedIds.push(id)
  delete changes.updates[id]
  window.localStorage.setItem(createdInvoiceStorageKey, JSON.stringify(readCreatedInvoices().filter(invoice => invoice.id !== id)))
  writeInvoiceChanges(changes)
}

export const invoices: Invoice[] = [
  { id: 'NS-2026-014', client: 'Pacific House', issuedAt: '2026-03-19', dueAt: '2026-04-02', amount: 2400, status: 'Paid', paidAt: '2026-03-22', document: { customerKey: 'pacific', customerEmail: 'payables@pacifichouse.co', customerAddress: '1450 Grand Avenue, Los Angeles, CA 90015', lineItems: [{ id: 1, description: 'Website strategy and design', quantity: 1, rate: 2400 }], taxRate: 0, notes: 'Thank you for working with Northstar Studio.', paymentTerms: 'Net 14 days' } },
  { id: 'NS-2026-013', client: 'Field Studio', issuedAt: '2026-03-15', dueAt: '2026-03-29', amount: 1850, status: 'Awaiting payment', document: { customerKey: 'fieldwork', customerEmail: 'billing@field.studio', customerAddress: '18 Wythe Avenue, Brooklyn, NY 11249', lineItems: [{ id: 1, description: 'Brand identity design', quantity: 1, rate: 1250 }, { id: 2, description: 'Website art direction', quantity: 4, rate: 150 }], taxRate: 0, notes: 'Thank you for working with Northstar Studio.', paymentTerms: 'Net 14 days' } },
  { id: 'NS-2026-012', client: 'Merrill & Co.', issuedAt: '2026-02-20', dueAt: '2026-03-06', amount: 980, status: 'Overdue', document: { customerKey: 'merrow', customerEmail: 'finance@merrill.co', customerAddress: '72 Franklin Street, New York, NY 10013', lineItems: [{ id: 1, description: 'Monthly bookkeeping support', quantity: 7, rate: 140 }], taxRate: 0, notes: 'Please include the invoice number with your payment.', paymentTerms: 'Due on receipt' } },
  { id: 'NS-2026-011', client: 'Cedar House', issuedAt: '2026-03-03', dueAt: '2026-03-17', amount: 3400, status: 'Paid', paidAt: '2026-03-13', document: { customerKey: 'cedar', customerEmail: 'studio@cedarhouse.co', customerAddress: '206 SE Alder Street, Portland, OR 97214', lineItems: [{ id: 1, description: 'Product and packaging design', quantity: 1, rate: 3400 }], taxRate: 0, notes: 'Thank you for the thoughtful collaboration.', paymentTerms: 'Net 14 days' } },
  { id: 'NS-2026-010', client: 'West & Pine', issuedAt: '2026-02-04', dueAt: '2026-02-18', amount: 2100, status: 'Paid', paidAt: '2026-02-16', document: { customerKey: 'west-pine', customerEmail: 'accounts@westandpine.co', customerAddress: '28 King Street, Charleston, SC 29401', lineItems: [{ id: 1, description: 'Brand identity refresh', quantity: 1, rate: 2100 }], taxRate: 0, notes: 'Thank you for working with Northstar Studio.', paymentTerms: 'Net 14 days' } },
  { id: 'NS-2026-009', client: 'Goodwell Partners', issuedAt: '2026-01-28', dueAt: '2026-02-11', amount: 1600, status: 'Paid', paidAt: '2026-01-30', document: { customerKey: 'goodwell', customerEmail: 'finance@goodwellpartners.co', customerAddress: '310 Market Street, San Francisco, CA 94105', lineItems: [{ id: 1, description: 'Monthly finance review', quantity: 4, rate: 400 }], taxRate: 0, notes: 'Thank you for working with Northstar Studio.', paymentTerms: 'Net 14 days' } },
  { id: 'NS-2025-008', client: 'Palma Coffee', issuedAt: '2025-12-08', dueAt: '2025-12-22', amount: 5200, status: 'Paid', paidAt: '2025-12-18', document: { customerKey: 'palma', customerEmail: 'payables@palmacoffee.co', customerAddress: '12 Sunset Boulevard, Miami, FL 33130', lineItems: [{ id: 1, description: 'Seasonal campaign and creative direction', quantity: 1, rate: 5200 }], taxRate: 0, notes: 'Thank you for the continued partnership.', paymentTerms: 'Net 14 days' } },
  { id: 'NS-2025-007', client: 'Fieldhouse', issuedAt: '2025-11-11', dueAt: '2025-11-25', amount: 4800, status: 'Paid', paidAt: '2025-11-21', document: { customerKey: 'fieldhouse', customerEmail: 'accounts@fieldhouse.co', customerAddress: '81 Mercer Street, New York, NY 10012', lineItems: [{ id: 1, description: 'Storefront brand system', quantity: 1, rate: 4800 }], taxRate: 0, notes: 'Thank you for working with Northstar Studio.', paymentTerms: 'Net 14 days' } },
  { id: 'NS-2025-006', client: 'Marlow Paper', issuedAt: '2025-10-18', dueAt: '2025-11-01', amount: 3600, status: 'Paid', paidAt: '2025-10-29', document: { customerKey: 'marlow', customerEmail: 'billing@marlowpaper.co', customerAddress: '46 Atlantic Avenue, Brooklyn, NY 11201', lineItems: [{ id: 1, description: 'Print collateral and production files', quantity: 1, rate: 3600 }], taxRate: 0, notes: 'Thank you for working with Northstar Studio.', paymentTerms: 'Net 14 days' } },
  { id: 'NS-2025-005', client: 'Mariner Goods', issuedAt: '2025-10-05', dueAt: '2025-10-19', amount: 1275, status: 'Draft', document: { customerKey: 'mariner', customerEmail: 'finance@marinergoods.co', customerAddress: '70 Water Street, Boston, MA 02109', lineItems: [{ id: 1, description: 'Catalog layout and art direction', quantity: 1, rate: 1275 }], taxRate: 0, notes: 'Thank you for working with Northstar Studio.', paymentTerms: 'Net 14 days' } },
]

export const openInvoiceTotal = invoices
  .filter(invoice => invoice.status === 'Awaiting payment' || invoice.status === 'Overdue')
  .reduce((total, invoice) => total + invoice.amount, 0)

export const collectedThisMonth = invoices
  .filter(invoice => invoice.paidAt?.startsWith('2026-03'))
  .reduce((total, invoice) => total + invoice.amount, 0)

export const cashFlow = [
  { month: 'Oct', income: 3600, expenses: 1850 },
  { month: 'Nov', income: 4800, expenses: 1920 },
  { month: 'Dec', income: 5200, expenses: 2360 },
  { month: 'Jan', income: 1600, expenses: 1740 },
  { month: 'Feb', income: 2100, expenses: 2480 },
  { month: 'Mar', income: 5800, expenses: 1492 },
]

export const openingCashBalance = 20000
export const cashBalance = openingCashBalance + cashFlow.reduce((balance, month) => balance + month.income - month.expenses, 0)
export const paidInvoiceCountThisMonth = invoices.filter(invoice => invoice.paidAt?.startsWith('2026-03')).length

export const recentActivity = [
  { id: 'a1', title: 'Payment received', detail: 'Pacific House · NS-2026-014', amount: 2400, date: 'Mar 22', kind: 'income' },
  { id: 'a2', title: 'Studio supplies', detail: 'Marlow Paper · Materials', amount: -186.4, date: 'Mar 18', kind: 'expense' },
  { id: 'a3', title: 'Invoice sent', detail: 'Field Studio · NS-2026-013', amount: 1850, date: 'Mar 15', kind: 'invoice' },
  { id: 'a4', title: 'Software subscription', detail: 'Fieldnotes · Workspace tools', amount: -48, date: 'Mar 12', kind: 'expense' },
]

export const customerOptions = [
  { value: 'fieldwork', label: 'Field Studio' },
  { value: 'pacific', label: 'Pacific House' },
  { value: 'merrow', label: 'Merrill & Co.' },
  { value: 'cedar', label: 'Cedar House' },
  { value: 'west-pine', label: 'West & Pine' },
  { value: 'goodwell', label: 'Goodwell Partners' },
  { value: 'palma', label: 'Palma Coffee' },
  { value: 'fieldhouse', label: 'Fieldhouse' },
  { value: 'marlow', label: 'Marlow Paper' },
  { value: 'mariner', label: 'Mariner Goods' },
]

export const customerDetails: Record<string, { company: string; email: string; address: string }> = {
  fieldwork: { company: 'Field Studio LLC', email: 'billing@field.studio', address: '18 Wythe Avenue, Brooklyn, NY 11249' },
  pacific: { company: 'Pacific House Inc.', email: 'payables@pacifichouse.co', address: '1450 Grand Avenue, Los Angeles, CA 90015' },
  merrow: { company: 'Merrill & Co.', email: 'finance@merrill.co', address: '72 Franklin Street, New York, NY 10013' },
  cedar: { company: 'Cedar House Design', email: 'studio@cedarhouse.co', address: '206 SE Alder Street, Portland, OR 97214' },
  'west-pine': { company: 'West & Pine', email: 'accounts@westandpine.co', address: '28 King Street, Charleston, SC 29401' },
  goodwell: { company: 'Goodwell Partners', email: 'finance@goodwellpartners.co', address: '310 Market Street, San Francisco, CA 94105' },
  palma: { company: 'Palma Coffee', email: 'payables@palmacoffee.co', address: '12 Sunset Boulevard, Miami, FL 33130' },
  fieldhouse: { company: 'Fieldhouse', email: 'accounts@fieldhouse.co', address: '81 Mercer Street, New York, NY 10012' },
  marlow: { company: 'Marlow Paper', email: 'billing@marlowpaper.co', address: '46 Atlantic Avenue, Brooklyn, NY 11201' },
  mariner: { company: 'Mariner Goods', email: 'finance@marinergoods.co', address: '70 Water Street, Boston, MA 02109' },
}

export const formatUSD = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

export const formatDate = (date: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))

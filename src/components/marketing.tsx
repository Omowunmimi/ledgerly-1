import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, Banknote, BookOpenCheck, CalendarDays, Check, CircleCheck, CircleUserRound, FileCheck2, Menu, Paperclip, Plus, ReceiptText, Store, X } from 'lucide-react'
import { defineControls } from 'tempo-sdk/assets'
import { cashFlow, customerDetails, customerOptions, formatUSD, invoices, openInvoiceTotal, readInvoices, recentActivity } from '../data/finance'
import { CashFlowChart, CashFlowLegend, DashboardScreen, InvoiceTable } from './application'
import { AccordionItem, Brand, Button, Card, Field, SelectField, StatusBadge, Toast } from './system'

/** The canvas for the shared pricing component is at tempo/designs/design-system/ledgerly-design-system/index.canvas.tsx. */
export interface PricingCardProps {
  name: string
  descriptor: string
  detail: string
  monthlyPrice: number
  features: string[]
  href: string
  featured?: boolean
}

export function PricingCard({ name, descriptor, detail, monthlyPrice, features, href, featured = false }: PricingCardProps) {
  const freeTrial = name === 'Starter'
  return <article className="pricing-card" data-featured={featured}>
    <div className="pricing-card-top"><span>{name}</span>{featured && <span className="pricing-recommendation">For growing teams</span>}</div>
    <p className="pricing-descriptor">{descriptor}</p>
    <div className="pricing-price" data-trial={freeTrial}>{freeTrial && <del>{formatUSD(monthlyPrice).replace('.00', '')} / month</del>}<strong>{freeTrial ? 'Free' : formatUSD(monthlyPrice).replace('.00', '')}</strong><span>{freeTrial ? 'for 30 days' : '/ month'}</span></div>
    <p className="pricing-detail">{freeTrial ? `Then ${formatUSD(monthlyPrice).replace('.00', '')} / month. ` : ''}{detail}</p>
    <a className="button" data-variant={featured ? 'secondary' : 'outline'} data-size="md" href={href}>{freeTrial ? 'Start free for 30 days' : `Choose ${name}`}</a>
    <ul>{features.map(feature => <li key={feature}><Check aria-hidden="true" />{feature}</li>)}</ul>
  </article>
}

function FeatureInvoiceTable() {
  return <Card className="marketing-invoice-demo"><div className="marketing-invoice-heading"><span>Recent invoices</span><span>March</span></div><InvoiceTable rows={readInvoices().slice(0, 4)} compact /></Card>
}

function ExpenseRecord() {
  return <div className="expense-record">
    <div className="expense-record-heading"><span>Expense record</span><span className="expense-record-status"><CircleCheck aria-hidden="true" />Ready to review</span></div>
    <div className="expense-record-merchant"><span className="expense-merchant-icon"><Store aria-hidden="true" /></span><span className="expense-merchant-copy"><strong>Studio supplies</strong><small>Marlow Paper Co.</small></span><strong className="expense-merchant-amount financial-value">−{formatUSD(186.4)}</strong></div>
    <div className="expense-record-metadata"><span><CalendarDays aria-hidden="true" />Mar 18, 2026</span><span>Materials</span></div>
    <div className="expense-receipt-attachment"><span className="receipt-paper" aria-hidden="true"><ReceiptText /><i /><i /><i /></span><span><strong>Receipt attached</strong><small>Marlow_Paper_0318.pdf · PDF</small></span><span className="receipt-link-icon"><Paperclip aria-hidden="true" /></span></div>
  </div>
}

function MatchDiagram() {
  return <div className="match-diagram"><div className="match-source"><span className="match-icon"><Banknote aria-hidden="true" /></span><span><small>Bank activity</small><strong>MARLOW PAPER CO.</strong><small>Mar 18 · −$186.40</small></span></div><div className="match-join"><span /><span className="match-join-line" /><span /></div><div className="match-source"><span className="match-icon match-icon-soft"><FileCheck2 aria-hidden="true" /></span><span><small>Expense record</small><strong>Studio supplies</strong><small>Materials · −$186.40</small></span></div><div className="match-outcome"><Check aria-hidden="true" /><span>Amount and date line up</span></div></div>
}

function ClientLedger() {
  return <div className="client-ledger">
    {[customerOptions[0], customerOptions[1], customerOptions[2]].map((customer, index) => <div className="client-ledger-row" key={customer.value}><span className="client-ledger-avatar">{customer.label.slice(0, 1)}</span><span><strong>{customer.label}</strong><small>{customerDetails[customer.value].email}</small></span><span className="client-ledger-total">{index === 0 ? '$1,850' : index === 1 ? '$2,400' : '$980'}</span></div>)}
  </div>
}

function BookkeepingList() {
  return <div className="bookkeeping-list">{recentActivity.slice(0, 3).map(item => <div className="bookkeeping-row" key={item.id}><span className="bookkeeping-icon">{item.kind === 'expense' ? <ReceiptText aria-hidden="true" /> : <BookOpenCheck aria-hidden="true" />}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span><strong className="financial-value">{item.amount < 0 ? '−' : '+'}{formatUSD(Math.abs(item.amount))}</strong></div>)}</div>
}

function InvoiceDocument({ customer, description, quantity, rate, addedSecondLine, subtotal, taxRate, total }: { customer: string; description: string; quantity: number; rate: number; addedSecondLine: boolean; subtotal: number; taxRate: number; total: number }) {
  const lines = [{ description: description || 'Invoice item', quantity, rate }, ...(addedSecondLine ? [{ description: 'Creative direction', quantity: 1, rate: 700 }] : [])]
  return <div className="invoice-document-card explorer-invoice-paper">
    <div className="review-invoice-brand"><Brand /><span>INVOICE</span></div>
    <div className="invoice-document-parties"><div className="review-invoice-to"><span>Bill to</span><strong>{customer}</strong><small>{customerDetails[customerOptions.find(item => item.label === customer)?.value ?? 'fieldwork'].email}</small></div><div className="invoice-from"><span>From</span><strong>Northstar Studio</strong><small>Olivia Bennett</small><small>olivia@northstar.studio</small></div></div>
    <div className="review-invoice-meta"><span><small>Invoice number</small><strong>NS-2026-015</strong></span><span><small>Issue date</small><strong>Mar 24, 2026</strong></span><span><small>Due date</small><strong>Apr 7, 2026</strong></span></div>
    <div className="invoice-document-lines"><div className="invoice-document-head"><span>Description</span><span>Qty</span><span>Rate</span><span>Amount</span></div>{lines.map((line, index) => <div className="invoice-document-line" key={`${line.description}-${index}`}><span>{line.description}</span><span>{line.quantity}</span><span className="financial-value">{formatUSD(line.rate)}</span><strong className="financial-value">{formatUSD(line.quantity * line.rate)}</strong></div>)}</div>
    <div className="review-invoice-tax"><span>Subtotal</span><strong className="financial-value">{formatUSD(subtotal)}</strong><span>Tax · {taxRate}%</span><strong className="financial-value">{formatUSD(total - subtotal)}</strong></div>
    <div className="review-invoice-total"><span>Total due</span><strong className="financial-value">{formatUSD(total)}</strong></div>
    <p className="invoice-document-note">Thank you for working with Northstar Studio.</p><div className="invoice-document-payment"><span>Payment terms</span><strong>Due Apr 7, 2026</strong></div>
  </div>
}

function InvoiceExplorer() {
  const [step, setStep] = useState(0)
  const [customer, setCustomer] = useState('fieldwork')
  const [description, setDescription] = useState('Brand identity design')
  const [quantity, setQuantity] = useState(1)
  const [rate, setRate] = useState(1800)
  const [taxRate, setTaxRate] = useState(0)
  const [addedSecondLine, setAddedSecondLine] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)
  const showToast = (message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 3600)
  }
  useEffect(() => () => window.clearTimeout(toastTimer.current), [])
  const subtotal = quantity * rate + (addedSecondLine ? 700 : 0)
  const total = subtotal * (1 + taxRate / 100)
  const activeClient = customerOptions.find(option => option.value === customer)?.label ?? 'Field Studio'
  const steps = ['Client', 'Work', 'Review']
  return <section className="guided-section" id="guided-demo"><div className="guided-layout"><div className="guided-intro" data-reveal><h2>Build an invoice as you go.</h2><p>Choose a client, shape the work and check the finished document before you commit. The total updates as you edit.</p><span className="guided-instructions">Choose a customer, adjust the work and tax, then use the two actions below to try the workflow.</span></div>
    <div className="explorer-workspace" data-reveal><div className="invoice-explorer">
      <div className="explorer-form"><div className="explorer-topline"><span>New invoice</span><span>NS-2026-015</span></div><div className="explorer-steps" role="tablist" aria-label="Invoice setup steps">{steps.map((item, index) => <button type="button" role="tab" aria-selected={step === index} data-active={step === index} key={item} onClick={() => setStep(index)}><i>{index < step ? <Check aria-hidden="true" /> : index + 1}</i>{item}</button>)}</div>
        {step === 0 && <div className="explorer-fields"><SelectField label="Client" value={customer} options={customerOptions} onChange={event => setCustomer(event.target.value)} /><div className="explorer-client-detail"><CircleUserRound aria-hidden="true" /><span><strong>{activeClient}</strong><small>{customerDetails[customer].email}</small></span></div><div className="explorer-date-line"><span>Invoice date <strong>Mar 24, 2026</strong></span><span>Due date <strong>Apr 7, 2026</strong></span></div></div>}
        {step === 1 && <div className="explorer-fields"><Field label="Description" value={description} onChange={event => setDescription(event.target.value)} /><div className="explorer-number-fields"><Field label="Quantity" type="number" min="1" value={quantity} onChange={event => setQuantity(Math.max(1, Number(event.target.value)))} /><Field label="Rate" type="number" min="0" prefix="$" value={rate} onChange={event => setRate(Math.max(0, Number(event.target.value)))} /></div><SelectField label="Sales tax" value={String(taxRate)} options={[{ value: '0', label: 'No tax' }, { value: '5', label: '5%' }, { value: '8.25', label: '8.25%' }]} onChange={event => setTaxRate(Number(event.target.value))} /><button className="explorer-add-line" type="button" onClick={() => setAddedSecondLine(value => !value)}>{addedSecondLine ? <X aria-hidden="true" /> : <Plus aria-hidden="true" />}{addedSecondLine ? 'Remove additional item' : 'Add another item'}</button></div>}
        {step === 2 && <div className="explorer-review-copy"><strong>Ready to try the invoice actions</strong><p>Check the document beside this form. Your selection and total stay visible while you explore.</p></div>}
        {step < 2 ? <div className="explorer-controls"><Button variant="outline" disabled={step === 0} onClick={() => setStep(value => Math.max(0, value - 1))}>Back</Button><Button trailingIcon={<ArrowRight aria-hidden="true" />} onClick={() => setStep(value => Math.min(2, value + 1))}>Continue</Button></div> : <div className="explorer-actions"><Button variant="outline" onClick={() => showToast('Draft saved successfully.')}>Save as Draft</Button><Button onClick={() => showToast('Invoice created successfully.')}>Create Invoice</Button></div>}
        {toast && <div className="demo-toast" aria-live="polite"><Toast title={toast} message="Your invoice preview is still open below." onDismiss={() => setToast('')} /></div>}
      </div>
      <aside className="explorer-summary"><div className="explorer-preview-heading"><span>Live invoice</span><StatusBadge status="Awaiting payment" /></div><InvoiceDocument customer={activeClient} description={description} quantity={quantity} rate={rate} addedSecondLine={addedSecondLine} subtotal={subtotal} taxRate={taxRate} total={total} /></aside>
    </div></div></div>
  </section>
}

function Testimonials() {
  return <section className="testimonials-section section-shell" aria-labelledby="testimonials-title"><div className="testimonials-intro" data-reveal><h2 id="testimonials-title">More of the business. Less money admin.</h2><p>Small teams can spend less time piecing together records and more time making the next decision with confidence.</p></div><div className="testimonial-editorial" data-reveal><figure className="testimonial-feature"><blockquote>“I used to open three spreadsheets to work out what was already paid and what still needed a follow-up. Now the client and invoice details sit together, so I can deal with it in one pass.”</blockquote><figcaption><strong>Maya Ellis</strong><span>Owner, Common Thread Studio · Independent design studio</span></figcaption></figure><div className="testimonial-side"><figure><blockquote>“Keeping receipts with the expense has made our month-end a lot less of a scavenger hunt. The cash view also helps me know what I can commit to next.”</blockquote><figcaption><strong>Jonah Reed</strong><span>Co-founder, Alder &amp; Tide · Home goods shop</span></figcaption></figure><figure><blockquote>“Client billing used to feel separate from bookkeeping. Having due dates, payments and recent activity in one workspace gives me a clearer weekly rhythm.”</blockquote><figcaption><strong>Nina Park</strong><span>Principal, Fieldnote Practice · Marketing consultancy</span></figcaption></figure></div></div></section>
}

const questions = [
  { question: 'What can I manage in Ledgerly?', answer: 'Keep customer records, invoices, expenses, bank activity, bookkeeping entries and financial reports together in one business workspace.' },
  { question: 'How do I track invoices and payments?', answer: 'Create an invoice, review its document, save a draft or record it as created. The invoice list shows due dates, payment status and outstanding balances.' },
  { question: 'Can I keep customer details with the work?', answer: 'Yes. Ledgerly keeps customer contact and billing details close to the invoices and activity connected to each client.' },
  { question: 'How are expenses and bookkeeping organised?', answer: 'Record an expense with its receipt and reason, then keep each bookkeeping entry tied to its source and amount.' },
  { question: 'How does bank reconciliation work?', answer: 'Compare a bank line with a recorded transaction using its merchant, amount and date, then mark a matching item as reconciled.' },
  { question: 'What do financial reports show?', answer: 'Review income and expenses across months, see what remains after spending and keep unpaid customer balances separate from money already received.' },
  { question: 'How do pricing and getting started work?', answer: 'Choose a plan for an independent business, a small team or client work. The Starter plan begins with a 30-day free period; the other plans are billed monthly.' },
]

/** The canvas for this shared marketing header is at tempo/designs/design-system/ledgerly-design-system/index.canvas.tsx. Keep its showcase aligned with the production header. */
export function MarketingHeader({ preview = false }: { preview?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const navigationId = preview ? 'marketing-preview-nav' : 'marketing-mobile-nav'
  const closeMobileMenu = () => setMobileMenuOpen(false)
  useEffect(() => {
    if (!mobileMenuOpen) return
    const priorOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const menu = document.getElementById(navigationId)
    const mobileLinks = menu?.querySelectorAll<HTMLAnchorElement>('a[href]')
    mobileLinks?.[0]?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { closeMobileMenu(); mobileMenuButtonRef.current?.focus(); return }
      if (event.key !== 'Tab' || !mobileLinks?.length) return
      if (event.shiftKey && document.activeElement === mobileLinks[0]) { event.preventDefault(); mobileMenuButtonRef.current?.focus() }
      else if (!event.shiftKey && document.activeElement === mobileMenuButtonRef.current) { event.preventDefault(); mobileLinks[0].focus() }
      else if (!event.shiftKey && document.activeElement === mobileLinks[mobileLinks.length - 1]) { event.preventDefault(); mobileMenuButtonRef.current?.focus() }
      else if (event.shiftKey && document.activeElement === mobileMenuButtonRef.current) { event.preventDefault(); mobileLinks[mobileLinks.length - 1].focus() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = priorOverflow; window.removeEventListener('keydown', onKeyDown) }
  }, [mobileMenuOpen, navigationId])
  const links = [{ label: 'Product', href: '#capabilities' }, { label: 'How it works', href: '#guided-demo' }, { label: 'Capabilities', href: '#capabilities' }, { label: 'Pricing', href: '#pricing' }, { label: 'Get started', href: '/app/create-invoice', className: 'button mobile-nav-cta', variant: 'secondary' }]
  return <header className={`marketing-header${preview ? ' marketing-header-preview' : ''}`}><div className="section-shell header-inner"><Brand inverse href={preview ? '#marketing-preview-top' : '#top'} /><nav id={navigationId} className={mobileMenuOpen ? 'marketing-nav marketing-nav-open' : 'marketing-nav'} aria-label="Main navigation">{links.map(link => <a className={link.className} data-variant={link.variant} data-size={link.variant ? 'md' : undefined} href={link.href} key={link.href} onClick={closeMobileMenu}>{link.label}</a>)}</nav><div className="header-actions"><a className="header-secondary" href="/app/dashboard">Sign in</a><a className="button header-cta" data-variant="secondary" data-size="md" href="/app/create-invoice">Get started<ArrowRight aria-hidden="true" /></a></div><button ref={mobileMenuButtonRef} className="mobile-menu-toggle" aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileMenuOpen} aria-controls={navigationId} onClick={() => setMobileMenuOpen(value => !value)}>{mobileMenuOpen ? <X /> : <Menu />}</button></div>{mobileMenuOpen && <button className="marketing-menu-backdrop" aria-label="Close navigation" onClick={closeMobileMenu} />}</header>
}

export default function MarketingSite() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) } }), { threshold: 0.14 })
    items.forEach(item => observer.observe(item))
    return () => observer.disconnect()
  }, [])
  return <div id="top" className="marketing-site">
    <MarketingHeader />
    <main style={{ height: "11658px" }}>
      <section className="marketing-hero"><div className="section-shell hero-inner"><div className="hero-copy"><h1>Your business finances, in clear view.</h1><p>Ledgerly brings invoicing, expenses, customers and cash flow together for small-business owners who need a reliable view of what is happening and what needs attention.</p><div className="hero-actions"><a className="button hero-primary-cta" data-variant="secondary" data-size="lg" href="/app/dashboard">Get Started<ArrowRight aria-hidden="true" /></a><a style={{ justifyContent: "center" }} className="hero-text-link" href="#guided-demo">See How It Works</a></div></div><div className="hero-preview-wrap"><div className="hero-product-shell"><div className="preview-chrome"><span className="preview-dots" aria-hidden="true"><i /><i /><i /></span><span>Ledgerly · Northstar Studio</span><span>Mar 2026</span></div><div className="hero-product-content"><DashboardScreen compact /></div></div></div></div></section>
      <section className="statement-section section-shell" id="about" data-reveal style={{ margin: '140px 100px 64px', marginTop: '80px', marginBottom: '80px', marginLeft: '20px', marginRight: '20px' }}>
        <div className="statement-copy">
          <h2>So your business can see what it owes.</h2>
          <p>Bring invoices, receipts and customer details together. See what is coming in, what has gone out and which obligation needs your attention without piecing the picture together from separate tools.</p>
          <div className="statement-story">
            <span>Your money, in one view</span>
            <div className="statement-totals"><span><small>Collected</small><strong className="financial-value">{formatUSD(cashFlow[5].income)}</strong></span><i aria-hidden="true" /><span><small>Spent</small><strong className="financial-value">{formatUSD(cashFlow[5].expenses)}</strong></span></div>
            <p>After expenses, {formatUSD(cashFlow[5].income - cashFlow[5].expenses)} remains from this month's activity. {formatUSD(invoices.filter(invoice => invoice.status === 'Awaiting payment' || invoice.status === 'Overdue').reduce((sum, invoice) => sum + invoice.amount, 0))} in customer balances remains outside cash received.</p>
          </div>
        </div>
        <div className="statement-activity" aria-label="Recent financial activity">
          <div className="statement-activity-heading"><div><span>Recent financial activity</span><strong>March 2026</strong></div><span className="statement-activity-count">3 updates</span></div>
          <div className="statement-finance-summary">
            <div className="story-event"><span className="story-event-mark story-event-in">+</span><span><small>Payment received</small><strong>Pacific House · Mar 22</strong></span><b className="financial-value">+{formatUSD(2400)}</b></div>
            <div className="story-event"><span className="story-event-mark story-event-out">−</span><span><small>Recent expense</small><strong>Studio supplies · Mar 18</strong></span><b className="financial-value">−{formatUSD(186.4)}</b></div>
            <div className="story-event story-event-attention"><span className="story-event-mark story-event-due">!</span><span><small>Needs a follow-up</small><strong>Overdue customer payment</strong></span><b className="financial-value">{formatUSD(980)}</b></div>
          </div>
        </div>
      </section>
      <section className="capabilities section-shell" id="capabilities"><div className="capability-heading" data-reveal><h2>All the moving parts, finally in view.</h2><p>Keep client work, spending and the books connected to the same financial picture.</p></div>
        <div className="capability-bento">
          <article style={{ alignItems: "flex-start" }} className="bento-card bento-invoices" data-reveal><div style={{ height: "max-content" }} className="bento-copy"><h3>Invoices with a clear next step.</h3><p>See who owes what, when it is due and what has already been paid.</p></div><FeatureInvoiceTable /></article>
          <article style={{ rowGap: "20px", columnGap: "1.13rem", height: "max-content" }} className="bento-card bento-expenses" data-reveal><div className="bento-copy"><h3>Every expense keeps its receipt and reason.</h3><p>See the merchant, amount and date beside the receipt that documents the purchase.</p></div><ExpenseRecord /></article>
          <article className="bento-card bento-clients" data-reveal><div className="bento-copy"><h3>Client details stay beside the work.</h3><p>Keep billing contacts and outstanding balances close to each client relationship.</p></div><ClientLedger /></article>
          <article className="bento-card bento-reconcile" data-reveal><div className="bento-copy"><h3>Match a bank line to its source.</h3><p>Confirm a transaction by checking its merchant, amount and recorded date.</p></div><MatchDiagram /></article>
          <article className="bento-card bento-books" data-reveal><div className="bento-copy"><h3>Keep each bookkeeping entry tied to its source.</h3><p>Trace every amount to the invoice, receipt or activity that explains it.</p></div><BookkeepingList /></article>
          <article className="bento-card bento-reporting" data-reveal><div className="bento-reporting-copy"><h3>Read the month as it moves.</h3><p>Compare recorded income with expenses across six months, then see the latest month in context.</p><div className="bento-report-total"><span>March income</span><strong className="financial-value">{formatUSD(cashFlow[5].income)}</strong></div></div><div className="reporting-visual"><div className="reporting-heading"><div><strong>Northstar Studio</strong><span>Income and expenses</span></div><span>Oct 2025 — Mar 2026</span></div><CashFlowChart variant="marketing" /><CashFlowLegend compact /></div></article>
        </div>
      </section>
      <InvoiceExplorer />
      <section className="confidence-section"><div className="section-shell confidence-inner"><div className="confidence-lead" data-reveal><h2>See what is due, paid and moving through your business.</h2><p>Follow incoming payments, recent spending and bank matches in the same view. Outstanding customer balances stay separate from cash received, so the next decision starts with a clearer picture.</p><div className="confidence-context"><span>Outstanding customer balances</span><strong>{formatUSD(openInvoiceTotal)}</strong><small>2 payments to follow up · 1 is past due</small></div></div><div className="confidence-list" data-reveal><div className="due-list-heading"><span>Recent financial activity</span><span>March 2026</span></div><div className="attention-cashflow"><span><small>Money in</small><strong className="financial-value">{formatUSD(cashFlow[5].income)}</strong></span><span><small>Money out</small><strong className="financial-value">{formatUSD(cashFlow[5].expenses)}</strong></span><span><small>Net movement</small><strong className="financial-value">+{formatUSD(cashFlow[5].income - cashFlow[5].expenses)}</strong></span></div><div className="attention-activity-list">{recentActivity.slice(0, 3).map(item => <article className="attention-activity-row" data-kind={item.kind} key={item.id}><span className="attention-activity-mark" aria-hidden="true">{item.kind === 'income' ? '+' : item.kind === 'expense' ? '−' : '•'}</span><span style={{ color: "var(--color-brand-500)" }} className="attention-activity-copy"><strong>{item.title}</strong><small>{item.detail} · {item.date}</small></span><strong className="financial-value">{item.kind === 'invoice' ? `Due ${formatUSD(item.amount)}` : `${item.amount > 0 ? '+' : '−'}${formatUSD(Math.abs(item.amount))}`}</strong></article>)}</div><div className="attention-reconciliation"><span><strong>Bank activity matched</strong><small>Marlow Paper · Mar 18 · −{formatUSD(186.4)}</small></span><StatusBadge status="Matched" /></div></div></div></section>
      <Testimonials />
      <section className="pricing-section section-shell" id="pricing"><div className="pricing-intro" data-reveal><h2>Choose the plan that fits your business.</h2><p>Start with the essentials, then add room for shared work and more than one client business.</p></div><div className="pricing-grid" data-reveal><PricingCard name="Starter" descriptor="For an independent business." detail="Keep customer work, spending and monthly money reviews together." monthlyPrice={18} href="/app/create-invoice" features={['Invoice creation and tracking', 'Customer records', 'Expense and cash-flow views']} /><PricingCard name="Business" descriptor="For a small, growing team." detail="Bring shared day-to-day finance work into one workspace." monthlyPrice={36} href="/app/create-invoice" featured features={['Everything in Starter', 'Shared business workspace', 'Expense review and bank matching']} /><PricingCard name="Advisor" descriptor="For client-facing operators." detail="Keep work across several client businesses organised." monthlyPrice={72} href="/app/create-invoice" features={['Everything in Business', 'Multiple business workspaces', 'Bookkeeping and reporting views']} /></div></section>
      <section className="faq-section section-shell" id="faq"><div className="faq-intro" data-reveal><h2>Questions, answered.</h2><p>Clear details on how Ledgerly supports the everyday finance work of a small business.</p></div><div className="faq-list" data-reveal>{questions.map(item => <AccordionItem key={item.question} title={item.question}>{item.answer}</AccordionItem>)}</div></section>
      <section className="closing-section"><div className="closing-inner section-shell" data-reveal><div className="closing-orbit" aria-hidden="true"><span /><span /><span /></div><div className="closing-copy"><h2>Make the next money decision with confidence.</h2><p>Bring client invoices, everyday expenses and the books into one clear workspace.</p><div style={{ alignItems: "center" }} className="closing-actions"><a className="button" data-variant="secondary" data-size="lg" href="/app/dashboard">Get Started<ArrowRight aria-hidden="true" /></a></div></div></div></section>
    </main>
    <footer className="marketing-footer"><div className="section-shell footer-main"><div className="footer-brand-block"><Brand inverse href="#top" /><p>Clear tools for the money work behind a small business.</p></div><div className="footer-group"><span>PRODUCT</span><a href="#capabilities">Product overview</a><a href="#capabilities">Invoicing and customers</a><a href="#capabilities">Expenses and reconciliation</a><a href="#capabilities">Bookkeeping and reports</a></div><div className="footer-group"><span>RESOURCES</span><a href="#guided-demo">Invoice walkthrough</a><a href="#faq">Help and answers</a><a href="#pricing">Pricing</a></div><div className="footer-group"><span>LEGAL</span><a href="#faq">Privacy</a><a href="#faq">Terms</a></div></div><div className="section-shell footer-bottom"><span>© 2026 Ledgerly</span><span>Financial work, in good order.</span><a href="#top">Back to top <ArrowUpRight aria-hidden="true" /></a></div></footer>
  </div>
}

defineControls(MarketingHeader, { preview: { type: 'boolean' } });
defineControls(PricingCard, {
  name: { type: 'text' },
  descriptor: { type: 'text' },
  detail: { type: 'text' },
  monthlyPrice: { type: 'number' },
  features: { type: 'object' },
  href: { type: 'text' },
  featured: { type: 'boolean' },
});

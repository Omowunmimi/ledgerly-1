import { formatDate, formatUSD, type Invoice, type InvoiceDocumentData } from '../data/finance'

const pageWidth = 595
const pageHeight = 842
const ink = '0.09 0.14 0.11'
const muted = '0.36 0.40 0.38'
const line = '0.88 0.90 0.89'

function pdfText(value: string) {
  return value
    .replaceAll('–', '-')
    .replaceAll('—', '-')
    .replaceAll('·', '|')
    .replaceAll('’', "'")
    .replaceAll('“', '"')
    .replaceAll('”', '"')
    .replaceAll(/[^\x20-\x7e]/g, '')
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
}

function makeDocument(invoice: Invoice): InvoiceDocumentData {
  return invoice.document ?? {
    lineItems: [{ id: 1, description: 'Invoice services', quantity: 1, rate: invoice.amount }],
    taxRate: 0,
    notes: 'Thank you for working with Northstar Studio.',
    paymentTerms: 'Due on receipt',
  }
}

function wrapLines(value: string, maxChars: number) {
  const lines: string[] = []
  let row = ''
  for (const word of value.trim().split(/\s+/)) {
    if (word.length > maxChars) {
      if (row) lines.push(row)
      row = ''
      for (let index = 0; index < word.length; index += maxChars) lines.push(word.slice(index, index + maxChars))
      continue
    }
    const next = row ? `${row} ${word}` : word
    if (next.length > maxChars && row) {
      lines.push(row)
      row = word
    } else row = next
  }
  if (row) lines.push(row)
  return lines.length ? lines : ['Invoice item']
}

export function createInvoicePdf(invoice: Invoice) {
  const details = makeDocument(invoice)
  const subtotal = details.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const tax = invoice.amount - subtotal
  let stream: string[] = []
  const pages = [stream]

  const text = (value: string, x: number, top: number, size = 10, font = 'F1', color = ink, align: 'left' | 'right' = 'left') => {
    const safe = pdfText(value)
    const width = safe.length * size * (font === 'F2' ? 0.56 : 0.52)
    const left = align === 'right' ? x - width : x
    stream.push(`BT /${font} ${size} Tf ${color} rg 1 0 0 1 ${left.toFixed(2)} ${(pageHeight - top).toFixed(2)} Tm (${safe}) Tj ET`)
  }
  const rule = (x1: number, top: number, x2: number, width = 0.7, color = line) => {
    stream.push(`${color} RG ${width} w ${x1} ${(pageHeight - top).toFixed(2)} m ${x2} ${(pageHeight - top).toFixed(2)} l S`)
  }
  const rect = (x: number, top: number, width: number, height: number, color: string) => {
    stream.push(`${color} rg ${x} ${(pageHeight - top - height).toFixed(2)} ${width} ${height} re f`)
  }
  const wrapped = (value: string, x: number, top: number, maxChars: number, size = 9, leading = 14, color = muted) => {
    const words = value.split(/\s+/)
    let row = ''
    let y = top
    for (const word of words) {
      const next = row ? `${row} ${word}` : word
      if (next.length > maxChars && row) {
        text(row, x, y, size, 'F1', color)
        row = word
        y += leading
      } else row = next
    }
    if (row) text(row, x, y, size, 'F1', color)
    return y
  }
  const startContinuationPage = () => {
    stream = []
    pages.push(stream)
    rect(42, 42, 30, 30, '0.18 0.36 0.27')
    text('L', 52, 63, 16, 'F2', '1 1 1')
    text('ledgerly', 82, 59, 14, 'F2')
    text('INVOICE CONTINUED', 553, 58, 8, 'F2', muted, 'right')
    text(invoice.id, 553, 75, 8, 'F1', muted, 'right')
    rule(42, 96, 553, 1)
    return 125
  }
  const wrappedAcrossPages = (value: string, x: number, top: number, maxChars: number, size = 9, leading = 14, color = muted) => {
    const words = value.split(/\s+/)
    let row = ''
    let y = top
    for (const word of words) {
      const next = row ? `${row} ${word}` : word
      if (next.length > maxChars && row) {
        text(row, x, y, size, 'F1', color)
        y += leading
        if (y > 752) y = startContinuationPage()
        row = word
      } else row = next
    }
    if (row) text(row, x, y, size, 'F1', color)
    return y + leading
  }

  rect(0, 0, pageWidth, pageHeight, '1 1 1')
  rect(42, 44, 34, 34, '0.18 0.36 0.27')
  text('L', 53, 67, 18, 'F2', '1 1 1')
  text('ledgerly', 86, 63, 16, 'F2')
  text('NORTHSTAR STUDIO', 86, 78, 8, 'F2', muted)
  text('INVOICE', 553, 63, 10, 'F2', muted, 'right')
  rule(42, 101, 553, 1)

  text('BILL TO', 42, 132, 8, 'F2', muted)
  text(invoice.client, 42, 151, 12, 'F2')
  let clientY = 168
  if (details.customerEmail) { text(details.customerEmail, 42, clientY, 9, 'F1', muted); clientY += 14 }
  if (details.customerAddress) wrapped(details.customerAddress, 42, clientY, 46, 9, 13)

  text('FROM', 344, 132, 8, 'F2', muted)
  text('Northstar Studio', 344, 151, 12, 'F2')
  text('Olivia Bennett', 344, 168, 9, 'F1', muted)
  text('olivia@northstar.studio', 344, 182, 9, 'F1', muted)

  rect(42, 220, 511, 58, '0.96 0.97 0.96')
  text('INVOICE NUMBER', 56, 240, 7, 'F2', muted)
  text(invoice.id, 56, 260, 10, 'F2')
  text('ISSUE DATE', 232, 240, 7, 'F2', muted)
  text(formatDate(invoice.issuedAt), 232, 260, 10, 'F2')
  text('DUE DATE', 400, 240, 7, 'F2', muted)
  text(formatDate(invoice.dueAt), 400, 260, 10, 'F2')

  text('DESCRIPTION', 42, 311, 8, 'F2', muted)
  text('QTY', 372, 311, 8, 'F2', muted, 'right')
  text('RATE', 454, 311, 8, 'F2', muted, 'right')
  text('AMOUNT', 553, 311, 8, 'F2', muted, 'right')
  rule(42, 323, 553, 1, '0.18 0.36 0.27')

  let itemTop = 347
  details.lineItems.forEach(item => {
    const descriptionLines = wrapLines(item.description || 'Invoice item', 54)
    const rowHeight = Math.max(35, descriptionLines.length * 12 + 16)
    if (itemTop + rowHeight > 650) {
      const headerTop = startContinuationPage()
      text('DESCRIPTION', 42, headerTop, 8, 'F2', muted)
      text('QTY', 372, headerTop, 8, 'F2', muted, 'right')
      text('RATE', 454, headerTop, 8, 'F2', muted, 'right')
      text('AMOUNT', 553, headerTop, 8, 'F2', muted, 'right')
      rule(42, headerTop + 12, 553, 1, '0.18 0.36 0.27')
      itemTop = headerTop + 30
    }
    descriptionLines.forEach((lineText, lineIndex) => text(lineText, 42, itemTop + lineIndex * 12, 10, 'F2'))
    const amountTop = itemTop + Math.min(8, Math.max(0, (rowHeight - 12) / 2))
    text(String(item.quantity), 372, amountTop, 9, 'F1', muted, 'right')
    text(formatUSD(item.rate), 454, amountTop, 9, 'F1', muted, 'right')
    text(formatUSD(item.quantity * item.rate), 553, amountTop, 9, 'F2', ink, 'right')
    rule(42, itemTop + rowHeight - 7, 553)
    itemTop += rowHeight
  })

  let totalsTop = Math.max(itemTop + 14, 414)
  if (totalsTop > 600) totalsTop = startContinuationPage() + 12
  text('Subtotal', 374, totalsTop, 9, 'F1', muted)
  text(formatUSD(subtotal), 553, totalsTop, 9, 'F2', ink, 'right')
  text(`Tax${details.taxRate ? ` (${details.taxRate}%)` : ''}`, 374, totalsTop + 19, 9, 'F1', muted)
  text(formatUSD(tax), 553, totalsTop + 19, 9, 'F2', ink, 'right')
  rule(374, totalsTop + 31, 553, 1)
  text('TOTAL DUE', 374, totalsTop + 53, 9, 'F2', muted)
  text(formatUSD(invoice.amount), 553, totalsTop + 55, 16, 'F2', '0.18 0.36 0.27', 'right')

  const noteTop = totalsTop + 92
  text('PAYMENT AND NOTES', 42, noteTop, 8, 'F2', muted)
  const paymentText = [details.paymentTerms, details.paymentDetails].filter(Boolean).join(' · ')
  const afterPayment = paymentText ? wrappedAcrossPages(paymentText, 42, noteTop + 18, 72, 9, 14) : noteTop + 18
  wrappedAcrossPages(details.notes || 'Thank you for working with Northstar Studio.', 42, afterPayment + 10, 82, 9, 14)

  pages.forEach((page, index) => {
    page.push(`${line} RG 0.7 w 42 ${(pageHeight - 786).toFixed(2)} m 553 ${(pageHeight - 786).toFixed(2)} l S`)
    page.push(`BT /F1 8 Tf ${muted} rg 1 0 0 1 42 ${(pageHeight - 806).toFixed(2)} Tm (Ledgerly | Northstar Studio) Tj ET`)
    const safeId = pdfText(invoice.id).replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)')
    const idWidth = safeId.length * 8 * 0.52
    page.push(`BT /F1 8 Tf ${muted} rg 1 0 0 1 ${(553 - idWidth).toFixed(2)} ${(pageHeight - 806).toFixed(2)} Tm (${safeId}) Tj ET`)
    if (index > 0) page.push(`BT /F1 7 Tf ${muted} rg 1 0 0 1 500 28 Tm (${index + 1}) Tj ET`)
  })

  const pageCount = pages.length
  const firstPageObject = 3
  const regularFontObject = firstPageObject + pageCount
  const boldFontObject = regularFontObject + 1
  const firstContentObject = boldFontObject + 1
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${firstPageObject + index} 0 R`).join(' ')}] /Count ${pageCount} >>`,
    ...pages.map((_, index) => `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${regularFontObject} 0 R /F2 ${boldFontObject} 0 R >> >> /Contents ${firstContentObject + index} 0 R >>`),
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    ...pages.map(page => {
      const content = page.join('\n')
      return `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
    }),
  ]
  let pdf = '%PDF-1.4\n%Ledgerly invoice\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach(offset => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n` })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}

export function downloadInvoicePdf(invoice: Invoice) {
  const url = URL.createObjectURL(createInvoicePdf(invoice))
  const link = document.createElement('a')
  link.href = url
  link.download = `${invoice.id}.pdf`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Shared invoice PDF generation logic.
 * Renders classic, modern, or formal template with color palette and exports via html2canvas + jsPDF.
 */

import type { Invoice } from '@/lib/services/invoices'

// Default color palette (Ocean Blue) - matches create page presetPalettes[0]
const DEFAULT_COLOR_PALETTE = {
  name: 'Ocean Blue',
  header: '#1e40af',
  accent: '#3b82f6',
  tableHeader: '#1e3a8a',
}

// Payload type for PDF generation - supports both minimal (Invoice) and full (create page) data
export interface InvoicePDFPayload {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  template: 'modern' | 'classic' | 'formal'
  colorPalette: { name: string; header: string; accent: string; tableHeader: string }
  businessDetails: { name: string; address: string; logo: string | null; invoiceTitle: string; summary: string }
  contact: { name: string; email: string; address: string } | null
  lineItems: Array<{
    itemType: 'item' | 'hourly'
    item: string
    quantity: number
    unit: string
    hours: number
    minutes: number
    price: number
    taxId: string | null
    description: string
  }>
  taxRates: Array<{ id: string; name: string; rate: number }>
  subtotal: number
  discount: number
  discountType: 'percentage' | 'fixed'
  discountAmount: number
  totalTax: number
  total: number
  currencySymbol: string
  invoiceCurrency: string
  logoSize: 'small' | 'medium' | 'large'
  notes: string
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  const m = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function calculateLineItemAmount(
  item: InvoicePDFPayload['lineItems'][0]
): number {
  if (item.itemType === 'hourly') {
    const totalHours = item.hours + item.minutes / 60
    return totalHours * item.price
  }
  return item.quantity * item.price
}

function getTaxBreakdown(payload: InvoicePDFPayload): { name: string; amount: number }[] {
  const breakdown: { name: string; amount: number }[] = []
  const calculateItemTax = (item: InvoicePDFPayload['lineItems'][0]) => {
    if (!item.taxId) return 0
    const tax = payload.taxRates.find((t) => t.id === item.taxId)
    if (!tax) return 0
    const amount = calculateLineItemAmount(item)
    return (amount * tax.rate) / 100
  }
  payload.lineItems.forEach((item) => {
    if (item.taxId) {
      const tax = payload.taxRates.find((t) => t.id === item.taxId)
      if (tax) {
        const taxAmount = calculateItemTax(item)
        const existing = breakdown.find((b) => b.name === `${tax.name} (${tax.rate}%)`)
        if (existing) {
          existing.amount += taxAmount
        } else {
          breakdown.push({ name: `${tax.name} (${tax.rate}%)`, amount: taxAmount })
        }
      }
    }
  })
  return breakdown
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  CAD: '$', USD: '$', EUR: '€', INR: '₹', GBP: '£',
}

/**
 * Build payload from minimal Invoice (for list page download).
 * Uses invoice.lineItems and invoice.invoiceCurrency when present.
 */
function buildPayloadFromInvoice(invoice: Invoice): InvoicePDFPayload {
  const template = invoice.template || 'modern'
  const colorPalette = invoice.colorPalette || DEFAULT_COLOR_PALETTE
  const invoiceCurrency = invoice.invoiceCurrency || 'CAD'
  const currencySymbol = CURRENCY_SYMBOLS[invoiceCurrency] ?? '$'

  const rawLineItems = invoice.lineItems && invoice.lineItems.length > 0
    ? invoice.lineItems
    : [
        {
          itemType: 'item' as const,
          item: 'Invoice Amount',
          quantity: 1,
          unit: 'pcs',
          hours: 0,
          minutes: 0,
          price: invoice.amount,
          taxId: null as string | null,
          description: '',
        },
      ]

  const lineItems = rawLineItems.map((li) => ({
    itemType: (li.itemType || 'item') as 'item' | 'hourly',
    item: li.item || 'Item',
    quantity: li.quantity ?? 1,
    unit: li.unit || 'pcs',
    hours: li.hours ?? 0,
    minutes: li.minutes ?? 0,
    price: li.price ?? 0,
    taxId: li.taxId ?? null,
    description: li.description ?? '',
  }))

  const subtotal = lineItems.reduce((sum, li) => {
    if (li.itemType === 'hourly') return sum + (li.hours + li.minutes / 60) * li.price
    return sum + li.quantity * li.price
  }, 0)

  return {
    invoiceNumber: invoice.id,
    invoiceDate: invoice.issueDate,
    dueDate: invoice.dueDate || invoice.issueDate,
    template,
    colorPalette,
    businessDetails: {
      name: 'Your Business Name',
      address: '',
      logo: null,
      invoiceTitle: 'INVOICE',
      summary: 'Thank you for your business',
    },
    contact: { name: invoice.client, email: invoice.email, address: '' },
    lineItems,
    taxRates: [],
    subtotal,
    discount: 0,
    discountType: 'percentage',
    discountAmount: 0,
    totalTax: 0,
    total: invoice.amount,
    currencySymbol,
    invoiceCurrency,
    logoSize: 'medium',
    notes: '',
  }
}

async function generatePDFFromPayload(payload: InvoicePDFPayload): Promise<void> {
  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')

  const taxBreakdown = getTaxBreakdown(payload)
  const logoSizeStyles = { small: '40px', medium: '60px', large: '80px' }
  const logoStyle = `height: ${logoSizeStyles[payload.logoSize]}; width: auto; object-fit: contain;`

  const headerBg = `background-color: ${payload.colorPalette.header};`
  const headerColor = `color: ${payload.colorPalette.header};`
  const accentColor = `color: ${payload.colorPalette.accent};`
  const accentBg = `background-color: ${payload.colorPalette.accent}15;`
  const tableHeaderBg = `background-color: ${payload.colorPalette.tableHeader};`

  const { businessDetails, contact: selectedContact, lineItems } = payload
  const currencySymbol = payload.currencySymbol
  const invoiceCurrency = payload.invoiceCurrency
  const notes = payload.notes

  let templateHtml = ''

  if (payload.template === 'classic') {
    templateHtml = `
      <div style="background: white; padding: 32px; font-family: Arial, sans-serif; font-size: 14px; color: #111; min-height: 700px; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; padding-bottom: 24px; border-bottom: 2px solid ${payload.colorPalette.header};">
          <div>
            ${businessDetails.logo ? `<img src="${businessDetails.logo}" style="${logoStyle}" crossorigin="anonymous" />` : `<div style="font-size: 24px; font-weight: bold;">${businessDetails.name}</div>`}
            <p style="margin-top: 8px; font-size: 12px; color: #666; white-space: pre-line;">${businessDetails.address}</p>
          </div>
          <div style="text-align: right;">
            <h1 style="font-size: 28px; font-weight: bold; ${headerColor}">${businessDetails.invoiceTitle}</h1>
            <div style="margin-top: 8px; font-size: 12px;">
              <p><span style="font-weight: 500;">Invoice #:</span> ${payload.invoiceNumber}</p>
              <p><span style="font-weight: 500;">Date:</span> ${formatDate(payload.invoiceDate)}</p>
              ${payload.dueDate ? `<p><span style="font-weight: 500;">Due:</span> ${formatDate(payload.dueDate)}</p>` : ''}
              <p><span style="font-weight: 500;">Currency:</span> ${invoiceCurrency}</p>
            </div>
          </div>
        </div>
        <div style="padding: 24px 0;">
          <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; ${headerColor}">Bill To</h3>
          ${selectedContact ? `
            <p style="font-weight: 600;">${selectedContact.name}</p>
            <p style="font-size: 12px; color: #666;">${selectedContact.email}</p>
            ${selectedContact.address ? `<p style="font-size: 12px; color: #666; margin-top: 4px;">${selectedContact.address}</p>` : ''}
          ` : '<p style="font-size: 12px; color: #999; font-style: italic;">No contact selected</p>'}
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="${tableHeaderBg}">
              <th style="padding: 8px 12px; text-align: left; font-size: 12px; font-weight: bold; color: white;">Description</th>
              <th style="padding: 8px; text-align: center; font-size: 12px; font-weight: bold; color: white;">Qty/Hours</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; font-weight: bold; color: white;">Price</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; font-weight: bold; color: white;">Tax</th>
              <th style="padding: 8px 12px; text-align: right; font-size: 12px; font-weight: bold; color: white;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map((item, idx) => {
              const tax = item.taxId ? payload.taxRates.find((t) => t.id === item.taxId) : null
              const amount = calculateLineItemAmount(item)
              const qtyDisplay = item.itemType === 'hourly' ? `${item.hours}h ${item.minutes}m` : `${item.quantity} ${item.unit}`
              return `
                <tr style="background: ${idx % 2 === 0 ? '#f9fafb' : 'white'};">
                  <td style="padding: 8px 12px; font-size: 12px;">
                    <div>${item.item || 'Item'}</div>
                    ${item.description ? `<div style="color: #888; font-size: 10px; margin-top: 2px;">${item.description}</div>` : ''}
                  </td>
                  <td style="padding: 8px; text-align: center; font-size: 12px;">${qtyDisplay}</td>
                  <td style="padding: 8px; text-align: right; font-size: 12px;">${currencySymbol}${item.price.toFixed(2)}${item.itemType === 'hourly' ? '/hr' : ''}</td>
                  <td style="padding: 8px; text-align: right; font-size: 12px;">${tax ? tax.name : '-'}</td>
                  <td style="padding: 8px 12px; text-align: right; font-size: 12px; font-weight: 500;">${currencySymbol}${amount.toFixed(2)}</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
        <div style="margin-top: 24px; display: flex; justify-content: flex-end;">
          <div style="width: 224px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px;"><span>Subtotal</span><span>${currencySymbol}${payload.subtotal.toFixed(2)}</span></div>
            ${payload.discount > 0 ? `<div style="display: flex; justify-content: space-between; font-size: 12px; color: #16a34a;"><span>Discount ${payload.discountType === 'percentage' ? `(${payload.discount}%)` : ''}</span><span>-${currencySymbol}${payload.discountAmount.toFixed(2)}</span></div>` : ''}
            ${taxBreakdown.map((tax) => `<div style="display: flex; justify-content: space-between; font-size: 12px;"><span>${tax.name}</span><span>${currencySymbol}${tax.amount.toFixed(2)}</span></div>`).join('')}
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 8px; margin-top: 4px; font-weight: bold; ${headerColor}"><span>Total (${invoiceCurrency})</span><span>${currencySymbol}${payload.total.toFixed(2)}</span></div>
          </div>
        </div>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #ddd;">
          ${notes ? `<div style="margin-bottom: 8px;"><h3 style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">Notes</h3><p style="font-size: 12px; color: #666;">${notes}</p></div>` : ''}
          <p style="font-size: 12px; color: #888;">${businessDetails.summary}</p>
        </div>
        <div style="margin-top: auto; padding-top: 24px;">
          <p style="text-align: center; font-size: 18px; font-style: italic; font-family: Georgia, serif; ${headerColor}">Thank you</p>
        </div>
      </div>
    `
  } else if (payload.template === 'modern') {
    // Matches create page renderModernTemplate: accent gradient line, no header bar, Bill To in accent box
    templateHtml = `
      <div style="background: white; padding: 32px; font-family: Arial, sans-serif; font-size: 14px; color: #111; min-height: 700px; display: flex; flex-direction: column;">
        <div style="height: 4px; width: 100%; margin-bottom: 24px; background: linear-gradient(to right, ${payload.colorPalette.accent}40, ${payload.colorPalette.accent}, ${payload.colorPalette.accent}40);"></div>
        <div style="display: flex; justify-content: space-between; padding-bottom: 24px;">
          <div>
            ${businessDetails.logo ? `<img src="${businessDetails.logo}" style="${logoStyle}" crossorigin="anonymous" />` : `<div style="font-size: 24px; font-weight: bold;">${businessDetails.name}</div>`}
            <p style="margin-top: 8px; font-size: 12px; color: #666; white-space: pre-line;">${businessDetails.address}</p>
          </div>
          <div style="text-align: right;">
            <h1 style="font-size: 28px; font-weight: bold; letter-spacing: -0.5px; ${headerColor}">${businessDetails.invoiceTitle}</h1>
            <div style="margin-top: 12px; font-size: 12px;">
              <p><span style="font-weight: 500;">Invoice #:</span> ${payload.invoiceNumber}</p>
              <p><span style="font-weight: 500;">Date:</span> ${formatDate(payload.invoiceDate)}</p>
              ${payload.dueDate ? `<p><span style="font-weight: 500;">Due:</span> ${formatDate(payload.dueDate)}</p>` : ''}
              <p><span style="font-weight: 500;">Currency:</span> ${invoiceCurrency}</p>
            </div>
          </div>
        </div>
        <div style="border-top: 2px solid #e5e7eb; margin: 16px 0;"></div>
        <div style="${accentBg} padding: 12px; border-radius: 8px; margin-bottom: 16px;">
          <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; ${accentColor}">Bill To</h3>
          ${selectedContact ? `
            <p style="font-weight: 600;">${selectedContact.name}</p>
            <p style="font-size: 12px; color: #666;">${selectedContact.email}</p>
            ${selectedContact.address ? `<p style="font-size: 12px; color: #666; margin-top: 4px;">${selectedContact.address}</p>` : ''}
          ` : '<p style="font-size: 12px; color: #999; font-style: italic;">No contact selected</p>'}
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="${tableHeaderBg}">
              <th style="padding: 8px 12px; text-align: left; font-size: 12px; font-weight: bold; color: white;">Description</th>
              <th style="padding: 8px; text-align: center; font-size: 12px; font-weight: bold; color: white;">Qty/Hours</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; font-weight: bold; color: white;">Price</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; font-weight: bold; color: white;">Tax</th>
              <th style="padding: 8px 12px; text-align: right; font-size: 12px; font-weight: bold; color: white;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map((item, idx) => {
              const tax = item.taxId ? payload.taxRates.find((t) => t.id === item.taxId) : null
              const amount = calculateLineItemAmount(item)
              const qtyDisplay = item.itemType === 'hourly' ? `${item.hours}h ${item.minutes}m` : `${item.quantity} ${item.unit}`
              return `
                <tr style="background: ${idx % 2 === 0 ? '#f9fafb' : 'white'}; border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 12px; font-size: 12px;">
                    <div>${item.item || 'Item'}</div>
                    ${item.description ? `<div style="color: #888; font-size: 10px; margin-top: 2px;">${item.description}</div>` : ''}
                  </td>
                  <td style="padding: 8px; text-align: center; font-size: 12px;">${qtyDisplay}</td>
                  <td style="padding: 8px; text-align: right; font-size: 12px;">${currencySymbol}${item.price.toFixed(2)}${item.itemType === 'hourly' ? '/hr' : ''}</td>
                  <td style="padding: 8px; text-align: right; font-size: 12px;">${tax ? tax.name : '-'}</td>
                  <td style="padding: 8px 12px; text-align: right; font-size: 12px; font-weight: 600;">${currencySymbol}${amount.toFixed(2)}</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
        <div style="margin-top: 24px; display: flex; justify-content: flex-end;">
          <div style="width: 256px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;"><span style="color: #666;">Subtotal</span><span>${currencySymbol}${payload.subtotal.toFixed(2)}</span></div>
            ${payload.discount > 0 ? `<div style="display: flex; justify-content: space-between; font-size: 12px; color: #16a34a; margin-bottom: 4px;"><span>Discount ${payload.discountType === 'percentage' ? `(${payload.discount}%)` : ''}</span><span>-${currencySymbol}${payload.discountAmount.toFixed(2)}</span></div>` : ''}
            ${taxBreakdown.map((tax) => `<div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;"><span style="color: #666;">${tax.name}</span><span>${currencySymbol}${tax.amount.toFixed(2)}</span></div>`).join('')}
            <div style="display: flex; justify-content: space-between; border-top: 2px solid #d1d5db; padding-top: 10px; margin-top: 12px; font-weight: bold; ${headerColor}"><span>Total (${invoiceCurrency})</span><span>${currencySymbol}${payload.total.toFixed(2)}</span></div>
          </div>
        </div>
        <div style="margin-top: auto; padding-top: 24px; text-align: center;">
          <p style="font-size: 12px; color: #888;">${businessDetails.summary}</p>
        </div>
      </div>
    `
  } else {
    // Formal template - matches create page renderFormalTemplate: border, header box on right, Bill To + Payment Due grid
    templateHtml = `
      <div style="background: white; padding: 32px; font-family: Arial, sans-serif; font-size: 14px; color: #111; min-height: 700px; display: flex; flex-direction: column; border: 4px solid ${payload.colorPalette.header};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px;">
          <div>
            ${businessDetails.logo ? `<img src="${businessDetails.logo}" style="${logoStyle}" crossorigin="anonymous" />` : `<div style="font-size: 24px; font-weight: bold;">${businessDetails.name}</div>`}
            <p style="margin-top: 8px; font-size: 12px; color: #666; white-space: pre-line;">${businessDetails.address}</p>
          </div>
          <div style="${headerBg} padding: 16px; border-radius: 8px; color: white;">
            <h1 style="font-size: 24px; font-weight: bold;">${businessDetails.invoiceTitle}</h1>
            <div style="margin-top: 8px; font-size: 12px; opacity: 0.9;">
              <p>#${payload.invoiceNumber}</p>
              <p>${formatDate(payload.invoiceDate)}</p>
              <p>${invoiceCurrency}</p>
            </div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 24px 0; border-top: 1px solid ${payload.colorPalette.header}; border-bottom: 1px solid ${payload.colorPalette.header};">
          <div>
            <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; ${headerColor}">Bill To</h3>
            ${selectedContact ? `
              <p style="font-weight: 600;">${selectedContact.name}</p>
              <p style="font-size: 12px; color: #666;">${selectedContact.email}</p>
              ${selectedContact.address ? `<p style="font-size: 12px; color: #666; margin-top: 4px;">${selectedContact.address}</p>` : ''}
            ` : '<p style="font-size: 12px; color: #999; font-style: italic;">No contact selected</p>'}
          </div>
          <div style="text-align: right;">
            <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; ${headerColor}">Payment Due</h3>
            <p style="font-weight: 600;">${formatDate(payload.dueDate) || 'Upon Receipt'}</p>
            <p style="font-size: 24px; font-weight: bold; margin-top: 8px; ${headerColor}">${currencySymbol}${payload.total.toFixed(2)}</p>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
          <thead>
            <tr style="border-bottom: 2px solid ${payload.colorPalette.header};">
              <th style="padding: 12px 0; text-align: left; font-size: 12px; font-weight: bold; ${headerColor}">Description</th>
              <th style="padding: 12px 0; text-align: center; font-size: 12px; font-weight: bold; ${headerColor}">Qty/Hours</th>
              <th style="padding: 12px 0; text-align: right; font-size: 12px; font-weight: bold; ${headerColor}">Price</th>
              <th style="padding: 12px 0; text-align: right; font-size: 12px; font-weight: bold; ${headerColor}">Tax</th>
              <th style="padding: 12px 0; text-align: right; font-size: 12px; font-weight: bold; ${headerColor}">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map((item) => {
              const tax = item.taxId ? payload.taxRates.find((t) => t.id === item.taxId) : null
              const amount = calculateLineItemAmount(item)
              const qtyDisplay = item.itemType === 'hourly' ? `${item.hours}h ${item.minutes}m` : `${item.quantity} ${item.unit}`
              return `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; font-size: 12px;">
                    <div>${item.item || 'Item'}</div>
                    ${item.description ? `<div style="color: #888; font-size: 10px; margin-top: 2px;">${item.description}</div>` : ''}
                  </td>
                  <td style="padding: 12px 0; text-align: center; font-size: 12px;">${qtyDisplay}</td>
                  <td style="padding: 12px 0; text-align: right; font-size: 12px;">${currencySymbol}${item.price.toFixed(2)}${item.itemType === 'hourly' ? '/hr' : ''}</td>
                  <td style="padding: 12px 0; text-align: right; font-size: 12px;">${tax ? tax.name : '-'}</td>
                  <td style="padding: 12px 0; text-align: right; font-size: 12px; font-weight: 500;">${currencySymbol}${amount.toFixed(2)}</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
        <div style="margin-top: 24px; display: flex; justify-content: flex-end;">
          <div style="width: 224px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;"><span style="color: #666;">Subtotal</span><span>${currencySymbol}${payload.subtotal.toFixed(2)}</span></div>
            ${payload.discount > 0 ? `<div style="display: flex; justify-content: space-between; font-size: 12px; color: #16a34a; margin-bottom: 4px;"><span>Discount ${payload.discountType === 'percentage' ? `(${payload.discount}%)` : ''}</span><span>-${currencySymbol}${payload.discountAmount.toFixed(2)}</span></div>` : ''}
            ${taxBreakdown.map((tax) => `<div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;"><span style="color: #666;">${tax.name}</span><span>${currencySymbol}${tax.amount.toFixed(2)}</span></div>`).join('')}
            <div style="display: flex; justify-content: space-between; border-top: 2px solid ${payload.colorPalette.header}; padding-top: 10px; margin-top: 12px; font-weight: bold; font-size: 16px; ${headerColor}"><span>Total Due</span><span>${currencySymbol}${payload.total.toFixed(2)}</span></div>
          </div>
        </div>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid ${payload.colorPalette.header};">
          ${notes ? `<div style="margin-bottom: 8px;"><h3 style="font-size: 12px; font-weight: bold; margin-bottom: 4px; ${headerColor}">Notes</h3><p style="font-size: 12px; color: #666;">${notes}</p></div>` : ''}
          <p style="font-size: 12px; color: #888;">${businessDetails.summary}</p>
        </div>
        <div style="margin-top: auto; padding-top: 24px;">
          <p style="text-align: center; font-size: 18px; font-style: italic; font-family: Georgia, serif; ${headerColor}">Thank you</p>
        </div>
      </div>
    `
  }

  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position: fixed; left: -9999px; top: 0; width: 650px; height: 900px; border: none;'
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (!iframeDoc) {
    document.body.removeChild(iframe)
    return
  }

  iframeDoc.open()
  iframeDoc.write('<!DOCTYPE html><html><head><style>* { margin: 0; padding: 0; box-sizing: border-box; }</style></head><body></body></html>')
  iframeDoc.close()

  const tempContainer = iframeDoc.createElement('div')
  tempContainer.style.cssText = 'width: 595px; background: white;'
  iframeDoc.body.appendChild(tempContainer)

  tempContainer.innerHTML = templateHtml

  const images = tempContainer.querySelectorAll('img')
  await Promise.all(Array.from(images).map((img) => {
    if ((img as HTMLImageElement).complete) return Promise.resolve()
    return new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.onerror = () => resolve()
    })
  }))

  const canvas = await html2canvas(tempContainer.firstElementChild as HTMLElement, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 650,
    windowHeight: 900,
  })

  document.body.removeChild(iframe)

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = canvas.width
  const imgHeight = canvas.height
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
  const imgX = (pdfWidth - imgWidth * ratio) / 2
  const imgY = 0

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
  pdf.save(`${payload.invoiceNumber}.pdf`)
}

/**
 * Generate and download PDF from Invoice (for list page).
 * Uses invoice.template and invoice.colorPalette; builds minimal payload with defaults.
 */
export async function generateInvoicePDF(invoice: Invoice): Promise<void> {
  try {
    const payload = buildPayloadFromInvoice(invoice)
    await generatePDFFromPayload(payload)
  } catch (error) {
    console.error('Failed to generate PDF:', error)
  }
}

/**
 * Generate and download PDF from full payload (for create page).
 */
export async function generateInvoicePDFFromPayload(payload: InvoicePDFPayload): Promise<void> {
  try {
    await generatePDFFromPayload(payload)
  } catch (error) {
    console.error('Failed to generate PDF:', error)
  }
}

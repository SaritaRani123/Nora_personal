'use client'

import React, { forwardRef } from 'react'

export type InvoiceTemplate = 'classic' | 'modern' | 'formal'
export type LogoPosition = 'left' | 'center' | 'right'
export type LogoSize = 'small' | 'medium' | 'large'
export type DiscountType = 'percentage' | 'fixed'

export interface ColorPalette {
  name: string
  header: string
  accent: string
  tableHeader: string
}

export interface BusinessDetails {
  name: string
  address: string
  logo: string | null
  invoiceTitle: string
  summary: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

export interface LineItem {
  id: string
  itemType: 'item' | 'hourly'
  item: string
  quantity: number
  unit: string
  hours: number
  minutes: number
  price: number
  taxId: string | null
  description: string
}

export interface TaxRate {
  id: string
  name: string
  rate: number
}

export interface TaxBreakdownItem {
  name: string
  amount: number
}

export interface InvoicePreviewProps {
  businessDetails: BusinessDetails
  activeColors: ColorPalette
  logoPosition: LogoPosition
  logoSize: LogoSize
  selectedTemplate: InvoiceTemplate
  invoiceDetails: { invoiceNumber: string; invoiceDate: string; dueDate: string }
  selectedContact: Contact | null
  lineItems: LineItem[]
  taxRates: TaxRate[]
  formatDate: (dateString: string) => string
  calculateLineItemAmount: (item: LineItem) => number
  getTaxBreakdown: () => TaxBreakdownItem[]
  subtotal: number
  discount: number
  discountType: DiscountType
  discountAmount: number
  total: number
  notes: string
  invoiceCurrency: string
  currencySymbol: string
}

const logoSizeClasses = {
  small: 'h-10',
  medium: 'h-16',
  large: 'h-24',
}

function getLogoAlignmentClasses(logoPosition: LogoPosition): string {
  switch (logoPosition) {
    case 'center':
      return 'flex-col items-center text-center'
    case 'right':
      return 'flex-row-reverse'
    default:
      return ''
  }
}

const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  function InvoicePreview(props, ref) {
    const {
      businessDetails,
      activeColors,
      logoPosition,
      logoSize,
      selectedTemplate,
      invoiceDetails,
      selectedContact,
      lineItems,
      taxRates,
      formatDate,
      calculateLineItemAmount,
      getTaxBreakdown,
      subtotal,
      discount,
      discountType,
      discountAmount,
      total,
      notes,
      invoiceCurrency,
      currencySymbol,
    } = props

    const taxBreakdown = getTaxBreakdown()
    const sizeClass = logoSizeClasses[logoSize]
    const logoAlignment = getLogoAlignmentClasses(logoPosition)

    const renderLogo = (className?: string) => {
      if (!businessDetails.logo) {
        return (
          <div className={`text-2xl font-bold ${className}`}>
            {businessDetails.name}
          </div>
        )
      }
      return (
        <img
          src={businessDetails.logo || '/placeholder.svg'}
          alt="Logo"
          className={`${sizeClass} w-auto object-contain ${className}`}
          crossOrigin="anonymous"
        />
      )
    }

    const renderClassicTemplate = () => (
      <div
        ref={ref}
        className="bg-white p-8 text-gray-900 shadow-lg text-sm min-h-[700px] flex flex-col"
      >
        <div
          className={`flex pb-6 border-b-2 ${logoAlignment} ${logoPosition !== 'center' ? 'justify-between' : 'gap-4'}`}
          style={{ borderColor: activeColors.header }}
        >
          <div className={logoPosition === 'center' ? 'text-center' : logoPosition === 'right' ? 'text-right' : ''}>
            {renderLogo()}
            <p className="mt-2 text-xs text-gray-600 whitespace-pre-line">{businessDetails.address}</p>
          </div>
          <div className={logoPosition === 'center' ? 'text-center' : logoPosition === 'right' ? 'text-left' : 'text-right'}>
            <h1 className="text-3xl font-bold" style={{ color: activeColors.header }}>{businessDetails.invoiceTitle}</h1>
            <div className="mt-2 space-y-1">
              <p className="text-xs"><span className="font-medium">Invoice #:</span> {invoiceDetails.invoiceNumber}</p>
              <p className="text-xs"><span className="font-medium">Date:</span> {formatDate(invoiceDetails.invoiceDate)}</p>
              {invoiceDetails.dueDate && <p className="text-xs"><span className="font-medium">Due:</span> {formatDate(invoiceDetails.dueDate)}</p>}
              <p className="text-xs"><span className="font-medium">Currency:</span> {invoiceCurrency}</p>
            </div>
          </div>
        </div>

        <div className="py-6">
          <h3 className="text-xs font-bold uppercase mb-2" style={{ color: activeColors.header }}>Bill To</h3>
          {selectedContact ? (
            <div>
              <p className="font-semibold">{selectedContact.name}</p>
              <p className="text-xs text-gray-600">{selectedContact.email}</p>
              {selectedContact.address && <p className="text-xs text-gray-600 mt-1">{selectedContact.address}</p>}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No contact selected</p>
          )}
        </div>

        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: activeColors.tableHeader }}>
              <th className="py-2 px-3 text-left text-xs font-bold text-white">Description</th>
              <th className="py-2 px-2 text-center text-xs font-bold text-white">Qty/Hours</th>
              <th className="py-2 px-2 text-right text-xs font-bold text-white">Price</th>
              <th className="py-2 px-2 text-right text-xs font-bold text-white">Tax</th>
              <th className="py-2 px-3 text-right text-xs font-bold text-white">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => {
              const tax = item.taxId ? taxRates.find((t) => t.id === item.taxId) : null
              const amount = calculateLineItemAmount(item)
              const qtyDisplay = item.itemType === 'hourly' ? `${item.hours}h ${item.minutes}m` : `${item.quantity} ${item.unit}`
              return (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-3 text-xs">
                    <div>{item.item || 'Item'}</div>
                    {item.description && <div className="text-gray-500 text-[10px] mt-0.5">{item.description}</div>}
                  </td>
                  <td className="py-2 px-2 text-center text-xs">{qtyDisplay}</td>
                  <td className="py-2 px-2 text-right text-xs">{currencySymbol}{item.price.toFixed(2)}{item.itemType === 'hourly' ? '/hr' : ''}</td>
                  <td className="py-2 px-2 text-right text-xs">{tax ? `${tax.name}` : '-'}</td>
                  <td className="py-2 px-3 text-right text-xs font-medium">{currencySymbol}{amount.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-56 space-y-1">
            <div className="flex justify-between text-xs"><span>Subtotal</span><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>Discount {discountType === 'percentage' ? `(${discount}%)` : ''}</span>
                <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {taxBreakdown.map((tax, idx) => (
              <div key={idx} className="flex justify-between text-xs"><span>{tax.name}</span><span>{currencySymbol}{tax.amount.toFixed(2)}</span></div>
            ))}
            <div className="flex justify-between border-t pt-2 font-bold" style={{ color: activeColors.header }}>
              <span>Total ({invoiceCurrency})</span><span>{currencySymbol}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          {notes && <div className="mb-2"><h3 className="text-xs font-bold mb-1">Notes</h3><p className="text-xs text-gray-600">{notes}</p></div>}
          <p className="text-xs text-gray-500">{businessDetails.summary}</p>
        </div>

        <div className="mt-auto pt-6">
          <p className="text-center text-lg italic" style={{ fontFamily: 'Georgia, serif', color: activeColors.header }}>Thank you</p>
        </div>
      </div>
    )

    const renderModernTemplate = () => (
      <div
        ref={ref}
        className="bg-white p-8 text-gray-900 shadow-lg text-sm min-h-[700px] flex flex-col"
      >
        <div className="h-1 w-full mb-6" style={{ background: `linear-gradient(to right, ${activeColors.accent}40, ${activeColors.accent}, ${activeColors.accent}40)` }} />

        <div className={`flex pb-6 ${logoAlignment} ${logoPosition !== 'center' ? 'justify-between' : 'gap-4'}`}>
          <div className={logoPosition === 'center' ? 'text-center' : logoPosition === 'right' ? 'text-right' : ''}>
            {renderLogo()}
            <p className="mt-2 text-xs text-gray-600 whitespace-pre-line">{businessDetails.address}</p>
          </div>
          <div className={logoPosition === 'center' ? 'text-center' : logoPosition === 'right' ? 'text-left' : 'text-right'}>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: activeColors.header }}>{businessDetails.invoiceTitle}</h1>
            <div className="mt-3 space-y-0.5">
              <p className="text-xs"><span className="font-medium">Invoice #:</span> {invoiceDetails.invoiceNumber}</p>
              <p className="text-xs"><span className="font-medium">Date:</span> {formatDate(invoiceDetails.invoiceDate)}</p>
              {invoiceDetails.dueDate && <p className="text-xs"><span className="font-medium">Due:</span> {formatDate(invoiceDetails.dueDate)}</p>}
              <p className="text-xs"><span className="font-medium">Currency:</span> {invoiceCurrency}</p>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-gray-200 my-4" />

        <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: `${activeColors.accent}10` }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: activeColors.accent }}>Bill To</h3>
          {selectedContact ? (
            <div>
              <p className="font-semibold">{selectedContact.name}</p>
              <p className="text-xs text-gray-600">{selectedContact.email}</p>
              {selectedContact.address && <p className="text-xs text-gray-600 mt-1">{selectedContact.address}</p>}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No contact selected</p>
          )}
        </div>

        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: activeColors.tableHeader }}>
              <th className="py-2 px-3 text-left text-xs font-bold text-white rounded-l">Description</th>
              <th className="py-2 px-2 text-center text-xs font-bold text-white">Qty/Hours</th>
              <th className="py-2 px-2 text-right text-xs font-bold text-white">Price</th>
              <th className="py-2 px-2 text-right text-xs font-bold text-white">Tax</th>
              <th className="py-2 px-3 text-right text-xs font-bold text-white rounded-r">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => {
              const tax = item.taxId ? taxRates.find((t) => t.id === item.taxId) : null
              const amount = calculateLineItemAmount(item)
              const qtyDisplay = item.itemType === 'hourly' ? `${item.hours}h ${item.minutes}m` : `${item.quantity} ${item.unit}`
              return (
                <tr key={item.id} className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-2 px-3 text-xs font-medium">
                    <div>{item.item || 'Item'}</div>
                    {item.description && <div className="text-gray-500 text-[10px] mt-0.5 font-normal">{item.description}</div>}
                  </td>
                  <td className="py-2 px-2 text-center text-xs">{qtyDisplay}</td>
                  <td className="py-2 px-2 text-right text-xs">{currencySymbol}{item.price.toFixed(2)}{item.itemType === 'hourly' ? '/hr' : ''}</td>
                  <td className="py-2 px-2 text-right text-xs">{tax ? `${tax.name} (${tax.rate}%)` : '-'}</td>
                  <td className="py-2 px-3 text-right text-xs font-semibold">{currencySymbol}{amount.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-1">
            <div className="flex justify-between text-xs"><span className="text-gray-600">Subtotal</span><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Discount {discountType === 'percentage' ? `(${discount}%)` : ''}</span>
                <span className="text-green-600">-{currencySymbol}{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {taxBreakdown.map((tax, idx) => (
              <div key={idx} className="flex justify-between text-xs"><span className="text-gray-600">{tax.name}</span><span>{currencySymbol}{tax.amount.toFixed(2)}</span></div>
            ))}
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between"><span className="font-bold">Total ({invoiceCurrency})</span><span className="font-bold text-lg" style={{ color: activeColors.header }}>{currencySymbol}{total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200">
          {notes && <div className="mb-2"><h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Notes / Terms</h3><p className="text-xs text-gray-600 whitespace-pre-line">{notes}</p></div>}
          <p className="text-xs text-gray-500">{businessDetails.summary}</p>
        </div>

        <div className="mt-auto pt-6">
          <p className="text-center text-lg italic" style={{ fontFamily: 'Georgia, serif', color: activeColors.header }}>Thank you</p>
        </div>
      </div>
    )

    const renderFormalTemplate = () => (
      <div
        ref={ref}
        className="bg-white p-8 text-gray-900 shadow-lg text-sm min-h-[700px] flex flex-col border-4"
        style={{ borderColor: activeColors.header }}
      >
        <div className={`flex pb-6 ${logoAlignment} ${logoPosition !== 'center' ? 'justify-between items-start' : 'gap-4'}`}>
          <div className={logoPosition === 'center' ? 'text-center' : logoPosition === 'right' ? 'text-right' : ''}>
            {renderLogo()}
            <p className="mt-2 text-xs text-gray-600 whitespace-pre-line">{businessDetails.address}</p>
          </div>
          <div className={`p-4 rounded ${logoPosition === 'center' ? 'text-center' : logoPosition === 'right' ? 'text-left' : 'text-right'}`} style={{ backgroundColor: activeColors.header }}>
            <h1 className="text-2xl font-bold text-white">{businessDetails.invoiceTitle}</h1>
            <div className="mt-2 space-y-0.5 text-white/90">
              <p className="text-xs">#{invoiceDetails.invoiceNumber}</p>
              <p className="text-xs">{formatDate(invoiceDetails.invoiceDate)}</p>
              <p className="text-xs">{invoiceCurrency}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 py-6 border-y" style={{ borderColor: activeColors.header }}>
          <div>
            <h3 className="text-xs font-bold uppercase mb-2" style={{ color: activeColors.header }}>Bill To</h3>
            {selectedContact ? (
              <div>
                <p className="font-semibold">{selectedContact.name}</p>
                <p className="text-xs text-gray-600">{selectedContact.email}</p>
                {selectedContact.address && <p className="text-xs text-gray-600 mt-1">{selectedContact.address}</p>}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No contact selected</p>
            )}
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold uppercase mb-2" style={{ color: activeColors.header }}>Payment Due</h3>
            <p className="font-semibold">{formatDate(invoiceDetails.dueDate) || 'Upon Receipt'}</p>
            <p className="text-2xl font-bold mt-2" style={{ color: activeColors.header }}>{currencySymbol}{total.toFixed(2)}</p>
          </div>
        </div>

        <table className="w-full mt-6">
          <thead>
            <tr className="border-b-2" style={{ borderColor: activeColors.header }}>
              <th className="py-2 text-left text-xs font-bold uppercase" style={{ color: activeColors.header }}>Description</th>
              <th className="py-2 text-center text-xs font-bold uppercase" style={{ color: activeColors.header }}>Qty/Hours</th>
              <th className="py-2 text-right text-xs font-bold uppercase" style={{ color: activeColors.header }}>Price</th>
              <th className="py-2 text-right text-xs font-bold uppercase" style={{ color: activeColors.header }}>Tax</th>
              <th className="py-2 text-right text-xs font-bold uppercase" style={{ color: activeColors.header }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => {
              const tax = item.taxId ? taxRates.find((t) => t.id === item.taxId) : null
              const amount = calculateLineItemAmount(item)
              const qtyDisplay = item.itemType === 'hourly' ? `${item.hours}h ${item.minutes}m` : `${item.quantity} ${item.unit}`
              return (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3 text-xs">
                    <div>{item.item || 'Item'}</div>
                    {item.description && <div className="text-gray-500 text-[10px] mt-0.5">{item.description}</div>}
                  </td>
                  <td className="py-3 text-center text-xs">{qtyDisplay}</td>
                  <td className="py-3 text-right text-xs">{currencySymbol}{item.price.toFixed(2)}{item.itemType === 'hourly' ? '/hr' : ''}</td>
                  <td className="py-3 text-right text-xs">{tax ? `${tax.name}` : '-'}</td>
                  <td className="py-3 text-right text-xs font-medium">{currencySymbol}{amount.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-56 space-y-1">
            <div className="flex justify-between text-xs"><span>Subtotal</span><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>Discount {discountType === 'percentage' ? `(${discount}%)` : ''}</span>
                <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {taxBreakdown.map((tax, idx) => (
              <div key={idx} className="flex justify-between text-xs"><span>{tax.name}</span><span>{currencySymbol}{tax.amount.toFixed(2)}</span></div>
            ))}
            <div className="flex justify-between border-t-2 pt-2 font-bold text-lg" style={{ borderColor: activeColors.header, color: activeColors.header }}>
              <span>Total Due</span><span>{currencySymbol}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t" style={{ borderColor: activeColors.header }}>
          {notes && <div className="mb-2"><h3 className="text-xs font-bold mb-1" style={{ color: activeColors.header }}>Notes</h3><p className="text-xs text-gray-600">{notes}</p></div>}
          <p className="text-xs text-gray-500">{businessDetails.summary}</p>
        </div>

        <div className="mt-auto pt-6">
          <p className="text-center text-lg italic" style={{ fontFamily: 'Georgia, serif', color: activeColors.header }}>Thank you</p>
        </div>
      </div>
    )

    switch (selectedTemplate) {
      case 'classic':
        return renderClassicTemplate()
      case 'formal':
        return renderFormalTemplate()
      default:
        return renderModernTemplate()
    }
  }
)

export default InvoicePreview

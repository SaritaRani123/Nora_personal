'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Trash2,
  Upload,
  X,
  Building2,
  User,
  FileText,
  ImageIcon,
  Download,
  ArrowLeft,
  Percent,
  Send,
  Copy,
  Palette,
  Mail,
  Paperclip,
  ArrowRight,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { contacts } from '@/lib/mock-data'
import { useDataStore } from '@/lib/data-store'

interface TaxRate {
  id: string
  name: string
  rate: number
}

interface LineItem {
  id: string
  item: string
  quantity: number
  price: number
  taxId: string | null
}

interface Customer {
  id: string
  businessName: string
  email: string
  phone: string
  firstName: string
  lastName: string
  currency: string
  billingAddress: string
}

type InvoiceState = 'draft' | 'sent' | 'paid' | 'overdue'
type LogoPosition = 'left' | 'right'
type LogoSize = 'small' | 'medium' | 'large'
type InvoiceTemplate = 'classic' | 'modern' | 'formal'
type Step = 'form' | 'theme' | 'preview'

interface ColorPalette {
  name: string
  header: string
  accent: string
  tableHeader: string
}

const presetPalettes: ColorPalette[] = [
  { name: 'Ocean Blue', header: '#1e40af', accent: '#3b82f6', tableHeader: '#1e3a8a' },
  { name: 'Forest Green', header: '#166534', accent: '#22c55e', tableHeader: '#15803d' },
  { name: 'Sunset Orange', header: '#c2410c', accent: '#f97316', tableHeader: '#ea580c' },
  { name: 'Royal Purple', header: '#6b21a8', accent: '#a855f7', tableHeader: '#7c3aed' },
  { name: 'Slate Gray', header: '#334155', accent: '#64748b', tableHeader: '#475569' },
  { name: 'Rose Pink', header: '#be123c', accent: '#f43f5e', tableHeader: '#e11d48' },
]

const currencies = [
  { code: 'CAD', label: 'CAD - Canadian Dollar' },
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'GBP', label: 'GBP - British Pound' },
]

const defaultTaxRates: TaxRate[] = [
  { id: 'hst', name: 'HST', rate: 13 },
  { id: 'gst', name: 'GST', rate: 5 },
  { id: 'pst', name: 'PST', rate: 7 },
  { id: 'qst', name: 'QST', rate: 9.975 },
  { id: 'vat', name: 'VAT', rate: 20 },
]

const existingCustomers: Customer[] = contacts.map((contact) => ({
  id: contact.id,
  businessName: contact.name.split(' ')[1] ? `${contact.name}'s Company` : contact.name,
  email: contact.email,
  phone: contact.phone,
  firstName: contact.name.split(' ')[0],
  lastName: contact.name.split(' ').slice(1).join(' '),
  currency: 'CAD',
  billingAddress: contact.address,
}))

const stateConfig = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700' },
}

const logoSizeClasses = {
  small: 'h-10',
  medium: 'h-16',
  large: 'h-24',
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const invoicePreviewRef = useRef<HTMLDivElement>(null)
  const { addInvoice, invoices } = useDataStore()

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('form')

  // Invoice state
  const [invoiceState, setInvoiceState] = useState<InvoiceState>('draft')

  // Template and design
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate>('modern')
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('left')
  const [logoSize, setLogoSize] = useState<LogoSize>('medium')
  const [colorPalette, setColorPalette] = useState<ColorPalette>(presetPalettes[0])
  const [useCustomColors, setUseCustomColors] = useState(false)
  const [customColors, setCustomColors] = useState<ColorPalette>({
    name: 'Custom',
    header: '#1e40af',
    accent: '#3b82f6',
    tableHeader: '#1e3a8a',
  })

  const activeColors = useCustomColors ? customColors : colorPalette

  // Tax rates
  const [taxRates, setTaxRates] = useState<TaxRate[]>(defaultTaxRates)
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false)
  const [newTax, setNewTax] = useState({ name: '', rate: 0 })
  const [editingItemIdForTax, setEditingItemIdForTax] = useState<string | null>(null)

  // Business details
  const [businessDetails, setBusinessDetails] = useState({
    name: 'Your Business Name',
    address: '123 Business Street, Toronto, ON M5V 2T6',
    logo: null as string | null,
    invoiceTitle: 'INVOICE',
    summary: 'Thank you for your business',
  })

  // Customer
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [customerTab, setCustomerTab] = useState('contact')
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id'>>({
    businessName: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    currency: 'CAD',
    billingAddress: '',
  })

  // Invoice details
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
    poNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
  })

  // Line items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', item: '', quantity: 1, price: 0, taxId: null },
  ])

  // Discount
  const [discount, setDiscount] = useState(0)

  // Notes
  const [notes, setNotes] = useState('')

  // Send modal state
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [sendEmail, setSendEmail] = useState({
    to: '',
    subject: '',
    message: '',
    attachPdf: true,
  })
  const [isSending, setIsSending] = useState(false)

  // Currency
  const currency = selectedCustomer?.currency || 'CAD'
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const discountAmount = (subtotal * discount) / 100

  const calculateItemTax = (item: LineItem) => {
    if (!item.taxId) return 0
    const tax = taxRates.find((t) => t.id === item.taxId)
    if (!tax) return 0
    return (item.quantity * item.price * tax.rate) / 100
  }

  const totalTax = lineItems.reduce((sum, item) => sum + calculateItemTax(item), 0)
  const total = subtotal - discountAmount + totalTax
  const amountDue = total

  // Tax handlers
  const handleAddTax = () => {
    if (newTax.name && newTax.rate > 0) {
      const tax: TaxRate = {
        id: Date.now().toString(),
        name: newTax.name.toUpperCase(),
        rate: newTax.rate,
      }
      setTaxRates([...taxRates, tax])

      if (editingItemIdForTax) {
        updateLineItem(editingItemIdForTax, 'taxId', tax.id)
      }

      setNewTax({ name: '', rate: 0 })
      setIsTaxModalOpen(false)
      setEditingItemIdForTax(null)
    }
  }

  const openAddTaxModal = (itemId?: string) => {
    if (itemId) {
      setEditingItemIdForTax(itemId)
    }
    setIsTaxModalOpen(true)
  }

  // Line item handlers
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), item: '', quantity: 1, price: 0, taxId: null },
    ])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id))
    }
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number | null) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  // Customer handlers
  const handleSelectExistingCustomer = (customerId: string) => {
    const customer = existingCustomers.find((c) => c.id === customerId)
    if (customer) {
      setSelectedCustomer(customer)
      setSendEmail((prev) => ({ ...prev, to: customer.email }))
      setIsCustomerModalOpen(false)
    }
  }

  const handleSaveNewCustomer = () => {
    const customer: Customer = {
      ...newCustomer,
      id: Date.now().toString(),
    }
    setSelectedCustomer(customer)
    setSendEmail((prev) => ({ ...prev, to: customer.email }))
    setIsCustomerModalOpen(false)
    setNewCustomer({
      businessName: '',
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      currency: 'CAD',
      billingAddress: '',
    })
    setCustomerTab('contact')
  }

  // Logo handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBusinessDetails({ ...businessDetails, logo: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  // Download PDF handler - only exports the preview
  const handleDownloadPDF = useCallback(async () => {
    if (!invoicePreviewRef.current) return

    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')

    const element = invoicePreviewRef.current
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

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
    pdf.save(`${invoiceDetails.invoiceNumber}.pdf`)
  }, [invoiceDetails.invoiceNumber])

  // Send invoice handler
  const handleSendInvoice = async () => {
    setIsSending(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setInvoiceState('sent')

    addInvoice({
      client: selectedCustomer?.businessName || 'Unknown Client',
      email: selectedCustomer?.email || sendEmail.to,
      amount: total,
      status: 'pending',
      issueDate: invoiceDetails.invoiceDate,
      dueDate: invoiceDetails.dueDate || invoiceDetails.invoiceDate,
      paidDate: null,
    })

    setIsSending(false)
    setIsSendModalOpen(false)
  }

  // Duplicate invoice handler
  const handleDuplicateInvoice = () => {
    const newInvoiceNumber = `INV-${String(invoices.length + 2).padStart(3, '0')}`
    setInvoiceDetails({
      ...invoiceDetails,
      invoiceNumber: newInvoiceNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
    })
    setInvoiceState('draft')
    setCurrentStep('form')
  }

  // Open send modal
  const openSendModal = () => {
    setSendEmail({
      to: selectedCustomer?.email || '',
      subject: `Invoice ${invoiceDetails.invoiceNumber} from ${businessDetails.name}`,
      message: `Dear ${selectedCustomer?.businessName || 'Customer'},\n\nPlease find attached invoice ${invoiceDetails.invoiceNumber} for ${currencySymbol}${total.toFixed(2)}.\n\nPayment is due by ${formatDate(invoiceDetails.dueDate) || 'upon receipt'}.\n\nThank you for your business.\n\nBest regards,\n${businessDetails.name}`,
      attachPdf: true,
    })
    setIsSendModalOpen(true)
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Get tax breakdown
  const getTaxBreakdown = () => {
    const breakdown: { name: string; amount: number }[] = []
    lineItems.forEach((item) => {
      if (item.taxId) {
        const tax = taxRates.find((t) => t.id === item.taxId)
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

  // Logo component with positioning and size
  const renderLogo = (className?: string) => {
    const sizeClass = logoSizeClasses[logoSize]
    if (!businessDetails.logo) {
      return <div className={`text-2xl font-bold ${className}`}>{businessDetails.name}</div>
    }
    return <img src={businessDetails.logo || "/placeholder.svg"} alt="Logo" className={`${sizeClass} w-auto object-contain ${className}`} crossOrigin="anonymous" />
  }

  // Step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {(['form', 'theme', 'preview'] as Step[]).map((step, index) => {
        const isActive = currentStep === step
        const isPast = ['form', 'theme', 'preview'].indexOf(currentStep) > index
        const labels = { form: 'Details', theme: 'Theme', preview: 'Preview' }
        
        return (
          <React.Fragment key={step}>
            {index > 0 && (
              <div className={`h-0.5 w-8 ${isPast ? 'bg-primary' : 'bg-border'}`} />
            )}
            <button
              type="button"
              onClick={() => {
                if (isPast || isActive) setCurrentStep(step)
              }}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isPast
                  ? 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                isPast ? 'bg-primary text-primary-foreground' : isActive ? 'bg-primary-foreground text-primary' : 'bg-muted-foreground/30 text-muted-foreground'
              }`}>
                {isPast ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              {labels[step]}
            </button>
          </React.Fragment>
        )
      })}
    </div>
  )

  // Classic Template
  const renderClassicTemplate = () => {
    const taxBreakdown = getTaxBreakdown()
    return (
      <div ref={invoicePreviewRef} className="bg-white p-8 text-gray-900 shadow-lg text-sm min-h-[700px]">
        {/* Header */}
        <div className={`flex pb-6 border-b-2 ${logoPosition === 'right' ? 'flex-row-reverse' : ''} justify-between`} style={{ borderColor: activeColors.header }}>
          <div className={logoPosition === 'right' ? 'text-right' : ''}>
            {renderLogo()}
            <p className="mt-2 text-xs text-gray-600 whitespace-pre-line">{businessDetails.address}</p>
          </div>
          <div className={logoPosition === 'right' ? 'text-left' : 'text-right'}>
            <h1 className="text-3xl font-bold" style={{ color: activeColors.header }}>{businessDetails.invoiceTitle}</h1>
            <div className="mt-2 space-y-1">
              <p className="text-xs"><span className="font-medium">Invoice #:</span> {invoiceDetails.invoiceNumber}</p>
              <p className="text-xs"><span className="font-medium">Date:</span> {formatDate(invoiceDetails.invoiceDate)}</p>
              {invoiceDetails.dueDate && <p className="text-xs"><span className="font-medium">Due:</span> {formatDate(invoiceDetails.dueDate)}</p>}
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="py-6">
          <h3 className="text-xs font-bold uppercase mb-2" style={{ color: activeColors.header }}>Bill To</h3>
          {selectedCustomer ? (
            <div>
              <p className="font-semibold">{selectedCustomer.businessName}</p>
              <p className="text-xs text-gray-600">{selectedCustomer.email}</p>
              {selectedCustomer.billingAddress && <p className="text-xs text-gray-600 mt-1">{selectedCustomer.billingAddress}</p>}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No customer selected</p>
          )}
        </div>

        {/* Items Table */}
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: activeColors.tableHeader }}>
              <th className="py-2 px-3 text-left text-xs font-bold text-white">Description</th>
              <th className="py-2 px-2 text-center text-xs font-bold text-white">Qty</th>
              <th className="py-2 px-2 text-right text-xs font-bold text-white">Price</th>
              <th className="py-2 px-2 text-right text-xs font-bold text-white">Tax</th>
              <th className="py-2 px-3 text-right text-xs font-bold text-white">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => {
              const tax = item.taxId ? taxRates.find((t) => t.id === item.taxId) : null
              return (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-3 text-xs">{item.item || 'Item'}</td>
                  <td className="py-2 px-2 text-center text-xs">{item.quantity}</td>
                  <td className="py-2 px-2 text-right text-xs">{currencySymbol}{item.price.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right text-xs">{tax ? `${tax.name}` : '-'}</td>
                  <td className="py-2 px-3 text-right text-xs font-medium">{currencySymbol}{(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-56 space-y-1">
            <div className="flex justify-between text-xs"><span>Subtotal</span><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-xs text-green-600"><span>Discount ({discount}%)</span><span>-{currencySymbol}{discountAmount.toFixed(2)}</span></div>}
            {taxBreakdown.map((tax, idx) => <div key={idx} className="flex justify-between text-xs"><span>{tax.name}</span><span>{currencySymbol}{tax.amount.toFixed(2)}</span></div>)}
            <div className="flex justify-between border-t pt-2 font-bold" style={{ color: activeColors.header }}><span>Total</span><span>{currencySymbol}{total.toFixed(2)}</span></div>
          </div>
        </div>

        {notes && <div className="mt-6 pt-4 border-t"><h3 className="text-xs font-bold mb-1">Notes</h3><p className="text-xs text-gray-600">{notes}</p></div>}
        <div className="mt-6 text-center text-xs text-gray-500">{businessDetails.summary}</div>
      </div>
    )
  }

  // Modern Template
  const renderModernTemplate = () => {
    const taxBreakdown = getTaxBreakdown()
    return (
      <div ref={invoicePreviewRef} className="bg-white p-8 text-gray-900 shadow-lg text-sm min-h-[700px]">
        <div className="h-1 w-full mb-6" style={{ background: `linear-gradient(to right, ${activeColors.accent}40, ${activeColors.accent}, ${activeColors.accent}40)` }} />
        
        <div className={`flex pb-6 ${logoPosition === 'right' ? 'flex-row-reverse' : ''} justify-between`}>
          <div className={logoPosition === 'right' ? 'text-right' : ''}>
            {renderLogo()}
            <p className="mt-2 text-xs text-gray-600 whitespace-pre-line">{businessDetails.address}</p>
          </div>
          <div className={logoPosition === 'right' ? 'text-left' : 'text-right'}>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: activeColors.header }}>{businessDetails.invoiceTitle}</h1>
            <div className="mt-3 space-y-0.5">
              <p className="text-xs"><span className="font-medium">Invoice #:</span> {invoiceDetails.invoiceNumber}</p>
              <p className="text-xs"><span className="font-medium">Date:</span> {formatDate(invoiceDetails.invoiceDate)}</p>
              {invoiceDetails.dueDate && <p className="text-xs"><span className="font-medium">Due:</span> {formatDate(invoiceDetails.dueDate)}</p>}
            </div>
          </div>
        </div>

        <div className="border-t-2 border-gray-200 my-4" />

        <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: `${activeColors.accent}10` }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: activeColors.accent }}>Bill To</h3>
          {selectedCustomer ? (
            <div>
              <p className="font-semibold">{selectedCustomer.businessName}</p>
              <p className="text-xs text-gray-600">{selectedCustomer.email}</p>
              {selectedCustomer.billingAddress && <p className="text-xs text-gray-600 mt-1">{selectedCustomer.billingAddress}</p>}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No customer selected</p>
          )}
        </div>

        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: activeColors.tableHeader }}>
              <th className="py-2 px-3 text-left text-xs font-bold text-white rounded-l">Description</th>
              <th className="py-2 px-2 text-center text-xs font-bold text-white">Qty</th>
              <th className="py-2 px-2 text-right text-xs font-bold text-white">Price</th>
              <th className="py-2 px-2 text-right text-xs font-bold text-white">Tax</th>
              <th className="py-2 px-3 text-right text-xs font-bold text-white rounded-r">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => {
              const tax = item.taxId ? taxRates.find((t) => t.id === item.taxId) : null
              return (
                <tr key={item.id} className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-2 px-3 text-xs font-medium">{item.item || 'Item'}</td>
                  <td className="py-2 px-2 text-center text-xs">{item.quantity}</td>
                  <td className="py-2 px-2 text-right text-xs">{currencySymbol}{item.price.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right text-xs">{tax ? `${tax.name} (${tax.rate}%)` : '-'}</td>
                  <td className="py-2 px-3 text-right text-xs font-semibold">{currencySymbol}{(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-1">
            <div className="flex justify-between text-xs"><span className="text-gray-600">Subtotal</span><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-xs"><span className="text-gray-600">Discount ({discount}%)</span><span className="text-green-600">-{currencySymbol}{discountAmount.toFixed(2)}</span></div>}
            {taxBreakdown.map((tax, idx) => <div key={idx} className="flex justify-between text-xs"><span className="text-gray-600">{tax.name}</span><span>{currencySymbol}{tax.amount.toFixed(2)}</span></div>)}
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between"><span className="font-bold">Total</span><span className="font-bold text-lg" style={{ color: activeColors.header }}>{currencySymbol}{total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        {notes && <div className="mt-8 pt-4 border-t border-gray-200"><h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Notes / Terms</h3><p className="text-xs text-gray-600 whitespace-pre-line">{notes}</p></div>}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center"><p className="text-xs text-gray-500">{businessDetails.summary}</p></div>
      </div>
    )
  }

  // Formal Template
  const renderFormalTemplate = () => {
    const taxBreakdown = getTaxBreakdown()
    return (
      <div ref={invoicePreviewRef} className="bg-white p-8 text-gray-900 shadow-lg text-sm min-h-[700px] border-4" style={{ borderColor: activeColors.header }}>
        <div className={`flex pb-6 ${logoPosition === 'right' ? 'flex-row-reverse' : ''} justify-between items-start`}>
          <div className={logoPosition === 'right' ? 'text-right' : ''}>
            {renderLogo()}
            <p className="mt-2 text-xs text-gray-600 whitespace-pre-line">{businessDetails.address}</p>
          </div>
          <div className={`p-4 rounded ${logoPosition === 'right' ? 'text-left' : 'text-right'}`} style={{ backgroundColor: activeColors.header }}>
            <h1 className="text-2xl font-bold text-white">{businessDetails.invoiceTitle}</h1>
            <div className="mt-2 space-y-0.5 text-white/90">
              <p className="text-xs">#{invoiceDetails.invoiceNumber}</p>
              <p className="text-xs">{formatDate(invoiceDetails.invoiceDate)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 py-6 border-y" style={{ borderColor: activeColors.header }}>
          <div>
            <h3 className="text-xs font-bold uppercase mb-2" style={{ color: activeColors.header }}>Bill To</h3>
            {selectedCustomer ? (
              <div>
                <p className="font-semibold">{selectedCustomer.businessName}</p>
                <p className="text-xs text-gray-600">{selectedCustomer.email}</p>
                {selectedCustomer.billingAddress && <p className="text-xs text-gray-600 mt-1">{selectedCustomer.billingAddress}</p>}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No customer selected</p>
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
              <th className="py-2 text-center text-xs font-bold uppercase" style={{ color: activeColors.header }}>Qty</th>
              <th className="py-2 text-right text-xs font-bold uppercase" style={{ color: activeColors.header }}>Price</th>
              <th className="py-2 text-right text-xs font-bold uppercase" style={{ color: activeColors.header }}>Tax</th>
              <th className="py-2 text-right text-xs font-bold uppercase" style={{ color: activeColors.header }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => {
              const tax = item.taxId ? taxRates.find((t) => t.id === item.taxId) : null
              return (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3 text-xs">{item.item || 'Item'}</td>
                  <td className="py-3 text-center text-xs">{item.quantity}</td>
                  <td className="py-3 text-right text-xs">{currencySymbol}{item.price.toFixed(2)}</td>
                  <td className="py-3 text-right text-xs">{tax ? `${tax.name}` : '-'}</td>
                  <td className="py-3 text-right text-xs font-medium">{currencySymbol}{(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-56 space-y-1">
            <div className="flex justify-between text-xs"><span>Subtotal</span><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-xs text-green-600"><span>Discount ({discount}%)</span><span>-{currencySymbol}{discountAmount.toFixed(2)}</span></div>}
            {taxBreakdown.map((tax, idx) => <div key={idx} className="flex justify-between text-xs"><span>{tax.name}</span><span>{currencySymbol}{tax.amount.toFixed(2)}</span></div>)}
            <div className="flex justify-between border-t-2 pt-2 font-bold text-lg" style={{ borderColor: activeColors.header, color: activeColors.header }}><span>Total Due</span><span>{currencySymbol}{total.toFixed(2)}</span></div>
          </div>
        </div>

        {notes && <div className="mt-6 pt-4 border-t" style={{ borderColor: activeColors.header }}><h3 className="text-xs font-bold mb-1" style={{ color: activeColors.header }}>Notes</h3><p className="text-xs text-gray-600">{notes}</p></div>}
        <div className="mt-6 text-center text-xs text-gray-500">{businessDetails.summary}</div>
      </div>
    )
  }

  const renderCurrentTemplate = () => {
    switch (selectedTemplate) {
      case 'classic': return renderClassicTemplate()
      case 'formal': return renderFormalTemplate()
      default: return renderModernTemplate()
    }
  }

  // STEP 1: FORM
  if (currentStep === 'form') {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Create Invoice</h1>
              <Badge className={stateConfig[invoiceState].color}>{stateConfig[invoiceState].label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Fill in the invoice details</p>
          </div>
        </div>

        {renderStepIndicator()}

        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Business Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Your Business
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="businessName" className="text-xs">Business Name</Label>
                  <Input id="businessName" value={businessDetails.name} onChange={(e) => setBusinessDetails({ ...businessDetails, name: e.target.value })} className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="invoiceTitle" className="text-xs">Invoice Title</Label>
                  <Input id="invoiceTitle" value={businessDetails.invoiceTitle} onChange={(e) => setBusinessDetails({ ...businessDetails, invoiceTitle: e.target.value })} className="h-8" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="businessAddress" className="text-xs">Business Address</Label>
                  <Textarea id="businessAddress" value={businessDetails.address} onChange={(e) => setBusinessDetails({ ...businessDetails, address: e.target.value })} rows={2} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs">Business Logo</Label>
                  <div className="flex items-center gap-4">
                    {businessDetails.logo ? (
                      <div className="relative">
                        <img src={businessDetails.logo || "/placeholder.svg"} alt="Logo" className="h-12 w-auto object-contain border rounded" />
                        <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => setBusinessDetails({ ...businessDetails, logo: null })}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex h-12 w-24 items-center justify-center rounded border border-dashed border-border bg-muted">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild className="bg-transparent">
                        <span><Upload className="mr-2 h-3 w-3" />Upload Logo</span>
                      </Button>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsCustomerModalOpen(true)} className="bg-transparent">
                  {selectedCustomer ? 'Change' : 'Select Customer'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <div className="rounded-lg border border-border p-3 bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{selectedCustomer.businessName}</p>
                      <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                      {selectedCustomer.billingAddress && <p className="text-sm text-muted-foreground mt-1">{selectedCustomer.billingAddress}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                  <User className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No customer selected</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={() => setIsCustomerModalOpen(true)}>Select Customer</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Modal */}
          <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Select or Add Customer</DialogTitle>
                <DialogDescription>Choose an existing customer or create a new one</DialogDescription>
              </DialogHeader>
              <Tabs value={customerTab} onValueChange={setCustomerTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existing">Existing</TabsTrigger>
                  <TabsTrigger value="new">New Customer</TabsTrigger>
                </TabsList>
                <TabsContent value="existing" className="space-y-2 pt-3">
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {existingCustomers.map((customer) => (
                      <button key={customer.id} type="button" onClick={() => handleSelectExistingCustomer(customer.id)} className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted">
                        <p className="font-medium text-foreground">{customer.businessName}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </button>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="new" className="pt-3">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="customerBusiness" className="text-xs">Business Name *</Label>
                      <Input id="customerBusiness" value={newCustomer.businessName} onChange={(e) => setNewCustomer({ ...newCustomer, businessName: e.target.value })} placeholder="Acme Corporation" className="h-8" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="customerEmail" className="text-xs">Email *</Label>
                      <Input id="customerEmail" type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} placeholder="billing@company.com" className="h-8" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="billingAddress" className="text-xs">Billing Address</Label>
                      <Textarea id="billingAddress" value={newCustomer.billingAddress} onChange={(e) => setNewCustomer({ ...newCustomer, billingAddress: e.target.value })} placeholder="Enter billing address" rows={2} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="currency" className="text-xs">Currency</Label>
                      <Select value={newCustomer.currency} onValueChange={(value) => setNewCustomer({ ...newCustomer, currency: value })}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {currencies.map((curr) => <SelectItem key={curr.code} value={curr.code}>{curr.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setIsCustomerModalOpen(false)} className="bg-transparent">Cancel</Button>
                    <Button onClick={handleSaveNewCustomer} disabled={!newCustomer.businessName || !newCustomer.email}>Save Customer</Button>
                  </DialogFooter>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          {/* Invoice Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <Label htmlFor="invoiceNumber" className="text-xs">Invoice Number</Label>
                  <Input id="invoiceNumber" value={invoiceDetails.invoiceNumber} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })} className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="poNumber" className="text-xs">PO / SO Number</Label>
                  <Input id="poNumber" value={invoiceDetails.poNumber} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, poNumber: e.target.value })} placeholder="Optional" className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="invoiceDate" className="text-xs">Invoice Date</Label>
                  <Input id="invoiceDate" type="date" value={invoiceDetails.invoiceDate} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceDate: e.target.value })} className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dueDate" className="text-xs">Payment Due Date</Label>
                  <Input id="dueDate" type="date" value={invoiceDetails.dueDate} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, dueDate: e.target.value })} className="h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Tax Modal */}
          <Dialog open={isTaxModalOpen} onOpenChange={(open) => { setIsTaxModalOpen(open); if (!open) { setEditingItemIdForTax(null); setNewTax({ name: '', rate: 0 }) } }}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Add New Tax Rate</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="taxName" className="text-xs">Tax Name</Label>
                  <Input id="taxName" value={newTax.name} onChange={(e) => setNewTax({ ...newTax, name: e.target.value })} placeholder="e.g., HST, GST, VAT" className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="taxRate" className="text-xs">Tax Rate (%)</Label>
                  <div className="relative">
                    <Input id="taxRate" type="number" min="0" max="100" step="0.01" value={newTax.rate} onChange={(e) => setNewTax({ ...newTax, rate: Number(e.target.value) })} className="pr-8 h-8" />
                    <Percent className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTaxModalOpen(false)} className="bg-transparent">Cancel</Button>
                <Button onClick={handleAddTax} disabled={!newTax.name || newTax.rate <= 0}>Add Tax</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Items Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="hidden grid-cols-12 gap-2 text-xs font-medium text-muted-foreground lg:grid">
                  <div className="col-span-4">Item</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Price ({currency})</div>
                  <div className="col-span-2">Tax</div>
                  <div className="col-span-1 text-right">Amount</div>
                  <div className="col-span-1"></div>
                </div>

                {lineItems.map((item) => {
                  const selectedTax = item.taxId ? taxRates.find((t) => t.id === item.taxId) : null
                  return (
                    <div key={item.id} className="grid grid-cols-1 gap-2 rounded-lg border border-border p-2 lg:grid-cols-12 lg:items-center lg:border-0 lg:p-0">
                      <div className="lg:col-span-4">
                        <Label className="mb-1 block text-xs text-muted-foreground lg:hidden">Item</Label>
                        <Input placeholder="Item description" value={item.item} onChange={(e) => updateLineItem(item.id, 'item', e.target.value)} className="h-8" />
                      </div>
                      <div className="lg:col-span-2">
                        <Label className="mb-1 block text-xs text-muted-foreground lg:hidden">Quantity</Label>
                        <Input type="number" min="1" value={item.quantity} onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))} className="h-8" />
                      </div>
                      <div className="lg:col-span-2">
                        <Label className="mb-1 block text-xs text-muted-foreground lg:hidden">Price ({currency})</Label>
                        <Input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateLineItem(item.id, 'price', Number(e.target.value))} className="h-8" />
                      </div>
                      <div className="lg:col-span-2">
                        <Label className="mb-1 block text-xs text-muted-foreground lg:hidden">Tax</Label>
                        <Select value={item.taxId || 'none'} onValueChange={(value) => { if (value === 'add_new') { openAddTaxModal(item.id) } else { updateLineItem(item.id, 'taxId', value === 'none' ? null : value) } }}>
                          <SelectTrigger className="h-8"><SelectValue placeholder="No tax" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No tax</SelectItem>
                            {taxRates.map((tax) => <SelectItem key={tax.id} value={tax.id}>{tax.name} ({tax.rate}%)</SelectItem>)}
                            <SelectItem value="add_new" className="text-primary"><span className="flex items-center gap-2"><Plus className="h-3 w-3" />Add new tax...</span></SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between lg:col-span-1 lg:justify-end">
                        <Label className="text-xs text-muted-foreground lg:hidden">Amount</Label>
                        <span className="font-medium text-sm">{currencySymbol}{(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-end lg:col-span-1">
                        <Button variant="ghost" size="icon" onClick={() => removeLineItem(item.id)} disabled={lineItems.length === 1} className="text-muted-foreground hover:text-destructive h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}

                <Button variant="outline" size="sm" onClick={addLineItem} className="w-full border-dashed bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />Add Item
                </Button>
              </div>

              {/* Totals */}
              <div className="mt-4 border-t border-border pt-3">
                <div className="flex justify-end">
                  <div className="w-full max-w-xs space-y-1">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Discount</span>
                        <Input type="number" min="0" max="100" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="h-6 w-14 text-center text-xs" />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <span className="text-green-600">-{currencySymbol}{discountAmount.toFixed(2)}</span>
                    </div>
                    {getTaxBreakdown().map((tax, idx) => <div key={idx} className="flex justify-between text-sm"><span className="text-muted-foreground">{tax.name}</span><span>{currencySymbol}{tax.amount.toFixed(2)}</span></div>)}
                    <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><span>Total</span><span>{currencySymbol}{total.toFixed(2)}</span></div>
                    <div className="flex justify-between text-lg font-bold text-primary"><span>Amount Due ({currency})</span><span>{currencySymbol}{amountDue.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notes / Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter payment terms, notes, or any additional information..." rows={3} />
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => router.back()} className="bg-transparent">Cancel</Button>
            <Button onClick={() => setCurrentStep('theme')}>
              Continue to Theme
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // STEP 2: THEME
  if (currentStep === 'theme') {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentStep('form')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Choose Theme</h1>
              <Badge className={stateConfig[invoiceState].color}>{stateConfig[invoiceState].label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Customize the look of your invoice</p>
          </div>
        </div>

        {renderStepIndicator()}

        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Color Palette */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {presetPalettes.map((palette) => (
                    <button
                      key={palette.name}
                      type="button"
                      onClick={() => { setColorPalette(palette); setUseCustomColors(false) }}
                      className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 transition-all ${!useCustomColors && colorPalette.name === palette.name ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    >
                      <div className="flex gap-1">
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: palette.header }} />
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: palette.accent }} />
                      </div>
                      <span className="text-xs font-medium">{palette.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="useCustomColors" checked={useCustomColors} onChange={(e) => setUseCustomColors(e.target.checked)} className="rounded" />
                  <Label htmlFor="useCustomColors" className="text-xs">Use custom colors</Label>
                </div>
                {useCustomColors && (
                  <div className="flex gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Header</Label>
                      <input type="color" value={customColors.header} onChange={(e) => setCustomColors({ ...customColors, header: e.target.value })} className="h-8 w-16 rounded border cursor-pointer" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Accent</Label>
                      <input type="color" value={customColors.accent} onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })} className="h-8 w-16 rounded border cursor-pointer" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Table Header</Label>
                      <input type="color" value={customColors.tableHeader} onChange={(e) => setCustomColors({ ...customColors, tableHeader: e.target.value })} className="h-8 w-16 rounded border cursor-pointer" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Logo Settings */}
          {businessDetails.logo && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Logo Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs">Position</Label>
                    <div className="flex gap-2">
                      <Button variant={logoPosition === 'left' ? 'default' : 'outline'} size="sm" onClick={() => setLogoPosition('left')} className={logoPosition === 'left' ? '' : 'bg-transparent'}>Left</Button>
                      <Button variant={logoPosition === 'right' ? 'default' : 'outline'} size="sm" onClick={() => setLogoPosition('right')} className={logoPosition === 'right' ? '' : 'bg-transparent'}>Right</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Size</Label>
                    <div className="flex gap-2">
                      <Button variant={logoSize === 'small' ? 'default' : 'outline'} size="sm" onClick={() => setLogoSize('small')} className={logoSize === 'small' ? '' : 'bg-transparent'}>Small</Button>
                      <Button variant={logoSize === 'medium' ? 'default' : 'outline'} size="sm" onClick={() => setLogoSize('medium')} className={logoSize === 'medium' ? '' : 'bg-transparent'}>Medium</Button>
                      <Button variant={logoSize === 'large' ? 'default' : 'outline'} size="sm" onClick={() => setLogoSize('large')} className={logoSize === 'large' ? '' : 'bg-transparent'}>Large</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer Actions */}
          <div className="flex justify-between gap-3 pt-4">
            <Button variant="outline" onClick={() => setCurrentStep('form')} className="bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />Back to Details
            </Button>
            <Button onClick={() => setCurrentStep('preview')}>
              Preview Invoice
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // STEP 3: PREVIEW
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentStep('theme')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Invoice Preview</h1>
              <Badge className={stateConfig[invoiceState].color}>{stateConfig[invoiceState].label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{invoiceDetails.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentStep('form')} className="bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicateInvoice} className="bg-transparent">
            <Copy className="mr-2 h-4 w-4" />Duplicate
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="bg-transparent">
            <Download className="mr-2 h-4 w-4" />Download PDF
          </Button>
          <Button size="sm" onClick={openSendModal}>
            <Send className="mr-2 h-4 w-4" />Send Invoice
          </Button>
        </div>
      </div>

      {renderStepIndicator()}

      {/* Template Selection */}
      <div className="flex justify-center gap-3">
        <Button variant={selectedTemplate === 'classic' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedTemplate('classic')} className={selectedTemplate === 'classic' ? '' : 'bg-transparent'}>Classic</Button>
        <Button variant={selectedTemplate === 'modern' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedTemplate('modern')} className={selectedTemplate === 'modern' ? '' : 'bg-transparent'}>Modern</Button>
        <Button variant={selectedTemplate === 'formal' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedTemplate('formal')} className={selectedTemplate === 'formal' ? '' : 'bg-transparent'}>Formal</Button>
      </div>

      {/* Logo Position Controls on Preview */}
      {businessDetails.logo && (
        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Logo Position:</Label>
            <Button variant={logoPosition === 'left' ? 'default' : 'outline'} size="sm" onClick={() => setLogoPosition('left')} className={logoPosition === 'left' ? '' : 'bg-transparent'}>Left</Button>
            <Button variant={logoPosition === 'right' ? 'default' : 'outline'} size="sm" onClick={() => setLogoPosition('right')} className={logoPosition === 'right' ? '' : 'bg-transparent'}>Right</Button>
          </div>
        </div>
      )}

      {/* Invoice Preview */}
      <div className="max-w-3xl mx-auto">
        {renderCurrentTemplate()}
      </div>

      {/* Send Invoice Modal */}
      <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
            <DialogDescription>Send this invoice to your customer via email</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="sendTo" className="text-xs">To</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="sendTo" type="email" value={sendEmail.to} onChange={(e) => setSendEmail({ ...sendEmail, to: e.target.value })} className="pl-10 h-8" placeholder="customer@email.com" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="subject" className="text-xs">Subject</Label>
              <Input id="subject" value={sendEmail.subject} onChange={(e) => setSendEmail({ ...sendEmail, subject: e.target.value })} className="h-8" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="message" className="text-xs">Message</Label>
              <Textarea id="message" value={sendEmail.message} onChange={(e) => setSendEmail({ ...sendEmail, message: e.target.value })} rows={5} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="attachPdf" checked={sendEmail.attachPdf} onChange={(e) => setSendEmail({ ...sendEmail, attachPdf: e.target.checked })} className="rounded" />
              <Label htmlFor="attachPdf" className="text-xs flex items-center gap-2">
                <Paperclip className="h-3 w-3" />Attach PDF ({invoiceDetails.invoiceNumber}.pdf)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendModalOpen(false)} className="bg-transparent">Cancel</Button>
            <Button onClick={handleSendInvoice} disabled={isSending || !sendEmail.to}>
              {isSending ? 'Sending...' : 'Send Invoice'}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

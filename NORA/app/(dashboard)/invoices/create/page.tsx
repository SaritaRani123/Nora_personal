'use client'

import React, { useState, useRef, useCallback, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Trash2,
  Upload,
  X,
  Building2,
  User,
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
  DollarSign,
  MoreHorizontal,
  Info,
  FileText,
  CreditCard,
  Clock,
  Bell,
  Edit,
  ChevronDown,
  Phone,
  MapPin,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import useSWR, { mutate } from 'swr'
import { listContacts, createContact, type Contact as ApiContact } from '@/lib/services/contacts'
import { listInvoices, createInvoice, updateInvoice, type Invoice } from '@/lib/services/invoices'
import { markWorkDoneAsInvoiced } from '@/lib/services/work-done'
import { markTimeEntriesAsInvoiced } from '@/lib/services/time-entries'
import { HttpError } from '@/lib/api/http'
import { generateInvoicePDFFromPayload, type InvoicePDFPayload } from '@/lib/invoices/generateInvoicePDF'
import InvoicePreview from './components/InvoicePreview'

// Today's date in YYYY-MM-DD (local timezone, no UTC shift)
function getTodayYyyyMmDd(): string {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Helper function for case-insensitive alphabetical sorting
const sortAlphabetically = <T extends { name?: string; label?: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const nameA = (a.name || a.label || '').toLowerCase()
    const nameB = (b.name || b.label || '').toLowerCase()
    return nameA.localeCompare(nameB)
  })
}

interface TaxRate {
  id: string
  name: string
  rate: number
}

type ItemType = 'item' | 'hourly'

interface LineItem {
  id: string
  itemType: ItemType
  item: string
  quantity: number
  unit: string
  hours: number
  minutes: number
  price: number
  taxId: string | null
  description: string
}

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

type InvoiceState = 'draft' | 'sent' | 'pending' | 'paid' | 'overdue'
type LogoPosition = 'left' | 'center' | 'right'
type LogoSize = 'small' | 'medium' | 'large'
type InvoiceTemplate = 'classic' | 'modern' | 'formal'
type Step = 'form' | 'theme' | 'preview'
type DiscountType = 'percentage' | 'fixed'

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
  { code: 'CAD', symbol: '$', label: 'CAD - Canadian Dollar' },
  { code: 'USD', symbol: '$', label: 'USD - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR - Euro' },
  { code: 'INR', symbol: '₹', label: 'INR - Indian Rupee' },
]

const defaultTaxRates: TaxRate[] = [
  { id: 'hst', name: 'HST', rate: 13 },
  { id: 'gst', name: 'GST', rate: 5 },
  { id: 'pst', name: 'PST', rate: 7 },
  { id: 'qst', name: 'QST', rate: 9.975 },
  { id: 'vat', name: 'VAT', rate: 20 },
]



const stateConfig = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700' },
}


const logoSizeValues = {
  small: 0,
  medium: 50,
  large: 100,
}

function CreateInvoiceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invoicePreviewRef = useRef<HTMLDivElement>(null)
  const { data: invoices = [] } = useSWR<Invoice[]>('invoices', () => listInvoices())
  const { data: contacts = [] } = useSWR<ApiContact[]>('contacts', () => listContacts())

  const isEditMode = searchParams.get('edit') === 'true'
  const editInvoiceId = searchParams.get('id')
  const fromUnbilled = searchParams.get('from') === 'unbilled'

  const [unbilledPreFill] = useState<Array<{ id: string; date: string; contact: string; description: string; hours: number; rate: number; amount: number }>>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = sessionStorage.getItem('unbilledWorkEntriesForInvoice')
      if (!raw) return []
      const p = JSON.parse(raw)
      return Array.isArray(p) ? p : []
    } catch {
      return []
    }
  })
  const [unbilledTimePreFill] = useState<Array<{ id: string; contactId: string; description: string; invoiceItem: string; durationMinutes: number; hourlyRate: number; amount: number }>>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = sessionStorage.getItem('unbilledTimeEntriesForInvoice')
      if (!raw) return []
      const p = JSON.parse(raw)
      return Array.isArray(p) ? p : []
    } catch {
      return []
    }
  })
  const fromWorkEntries = fromUnbilled ? unbilledPreFill.map((w) => ({ contact: w.contact, description: w.description, amount: w.amount, hours: w.hours, rate: w.rate })) : []
  const fromWorkIds = fromUnbilled ? unbilledPreFill.map((w) => w.id) : []
  const fromTimeEntries = fromUnbilled ? unbilledTimePreFill.map((t) => ({
    contact: t.contactId,
    description: t.description || t.invoiceItem,
    amount: t.amount,
    hours: t.durationMinutes / 60,
    rate: t.hourlyRate,
  })) : []
  const fromTimeIds = fromUnbilled ? unbilledTimePreFill.map((t) => t.id) : []
  const unbilledIdsRef = useRef<string[]>(fromWorkIds)
  unbilledIdsRef.current = fromWorkIds
  const unbilledTimeIdsRef = useRef<string[]>(fromTimeIds)
  unbilledTimeIdsRef.current = fromTimeIds

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('form')

  // Invoice state
  const [invoiceState, setInvoiceState] = useState<InvoiceState>(() => {
    if (isEditMode) {
      const status = searchParams.get('status')
      if (status === 'paid' || status === 'overdue' || status === 'draft') return status
      if (status === 'pending') return 'sent'
    }
    return 'draft'
  })

  // Currency (applies to entire invoice)
  const [invoiceCurrency, setInvoiceCurrency] = useState<string>('CAD')

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

  // Contact - initialize from URL params if editing or from work done entries
  const [selectedContact, setSelectedContact] = useState<Contact | null>(() => {
    if (isEditMode) {
      const client = searchParams.get('client')
      const email = searchParams.get('email')
      if (client && email) {
        return {
          id: editInvoiceId || 'edit',
          name: client,
          email: email,
          phone: '',
          address: '',
        }
      }
    }
    // Auto-fill contact from work done or time entries
    const firstEntry = fromWorkEntries[0] || fromTimeEntries[0]
    if (firstEntry && firstEntry.contact) {
      const contactName = firstEntry.contact
      const matchedContact = contacts.find(
        (c) => c.name.toLowerCase() === contactName.toLowerCase()
      )
      if (matchedContact) {
        return {
          id: matchedContact.id,
          name: matchedContact.name,
          email: matchedContact.email,
          phone: matchedContact.phone || '',
          address: matchedContact.address || '',
        }
      }
      // If no exact match, create a minimal contact entry
      return {
        id: `work-contact-${Date.now()}`,
        name: contactName,
        email: '',
        phone: '',
        address: '',
      }
    }
    return null
  })
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [contactTab, setContactTab] = useState('existing')
  const [newContact, setNewContact] = useState<Omit<Contact, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
  })



  // Invoice details - initialize from URL params if editing
  const [invoiceDetails, setInvoiceDetails] = useState(() => {
    if (isEditMode) {
      return {
        invoiceNumber: searchParams.get('id') || `INV-${String(invoices.length + 1).padStart(3, '0')}`,
        poNumber: '',
        invoiceDate: searchParams.get('issueDate') || getTodayYyyyMmDd(),
        dueDate: searchParams.get('dueDate') || '',
      }
    }
    return {
      invoiceNumber: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      poNumber: '',
      invoiceDate: getTodayYyyyMmDd(),
      dueDate: '',
    }
  })

  // Line items - initialize from URL params if editing, or from work done entries
  const [lineItems, setLineItems] = useState<LineItem[]>(() => {
    if (isEditMode) {
      const amount = parseFloat(searchParams.get('amount') || '0')
      return [
        { id: '1', itemType: 'item', item: 'Invoice Amount', quantity: 1, unit: 'pcs', hours: 0, minutes: 0, price: amount, taxId: null, description: '' },
      ]
    }
    // Auto-fill line items from work done and time entries
    if (fromWorkEntries.length > 0 || fromTimeEntries.length > 0) {
      const workItems = fromWorkEntries.map((entry, idx) => {
        const hrs = entry.hours ?? 0
        return {
          id: String(idx + 1),
          itemType: 'hourly' as ItemType,
          item: entry.description || 'Work Done',
          quantity: 1,
          unit: 'hrs',
          hours: Math.floor(hrs),
          minutes: Math.round((hrs % 1) * 60),
          price: entry.rate ?? 0,
          taxId: null,
          description: entry.contact || 'Work',
        }
      })
      const timeItems = fromTimeEntries.map((entry, idx) => {
        const hrs = entry.hours ?? 0
        return {
          id: String(fromWorkEntries.length + idx + 1),
          itemType: 'hourly' as ItemType,
          item: entry.description || 'Time',
          quantity: 1,
          unit: 'hrs',
          hours: Math.floor(hrs),
          minutes: Math.round((hrs % 1) * 60),
          price: entry.rate ?? 0,
          taxId: null,
          description: entry.contact || 'Time',
        }
      })
      return [...workItems, ...timeItems]
    }
    return [
      { id: '1', itemType: 'item', item: '', quantity: 1, unit: 'pcs', hours: 0, minutes: 0, price: 0, taxId: null, description: '' },
    ]
  })

  // Unit options for quantity
  const unitOptions = ['pcs', 'kg', 'lbs', 'units', 'boxes', 'hrs', 'days']

  // Load full invoice from sessionStorage when editing (set by list page handleEdit)
  const editLoadedRef = useRef(false)
  useEffect(() => {
    if (!isEditMode || !editInvoiceId || editLoadedRef.current) return
    try {
      const raw = sessionStorage.getItem('invoiceToEdit')
      if (!raw) return
      const inv: Invoice = JSON.parse(raw)
      if (inv.id !== editInvoiceId) return
      editLoadedRef.current = true
      sessionStorage.removeItem('invoiceToEdit')

      if (inv.template) setSelectedTemplate(inv.template as InvoiceTemplate)
      if (inv.colorPalette) {
        const match = presetPalettes.find(
          (p) => p.header === inv.colorPalette?.header && p.accent === inv.colorPalette?.accent
        )
        if (match) setColorPalette(match)
        else setCustomColors(inv.colorPalette)
      }
      if (inv.invoiceCurrency) setInvoiceCurrency(inv.invoiceCurrency)
      setSelectedContact({
        id: inv.id,
        name: inv.client,
        email: inv.email,
        phone: '',
        address: '',
      })
      setInvoiceDetails((prev) => ({
        ...prev,
        invoiceNumber: inv.id,
        invoiceDate: inv.issueDate,
        dueDate: inv.dueDate,
      }))
      const status = inv.status
      if (status === 'paid' || status === 'overdue' || status === 'draft') setInvoiceState(status)
      else if (status === 'pending') setInvoiceState('sent')

      if (inv.lineItems && inv.lineItems.length > 0) {
        setLineItems(
          inv.lineItems.map((li, idx) => ({
            id: String(idx + 1),
            itemType: (li.itemType ?? 'item') as ItemType,
            item: li.item ?? '',
            quantity: li.quantity ?? 1,
            unit: li.unit ?? 'pcs',
            hours: li.hours ?? 0,
            minutes: li.minutes ?? 0,
            price: li.price ?? 0,
            taxId: li.taxId ?? null,
            description: li.description ?? '',
          }))
        )
      }
    } catch (_) { /* ignore */ }
  }, [isEditMode, editInvoiceId])

  // Discount
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<DiscountType>('percentage')

  // Notes
  const [notes, setNotes] = useState('')

  // Send modal state
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [sendEmail, setSendEmail] = useState({
    to: '',
    cc: '',
    subject: '',
    message: '',
    attachPdf: true,
    sendToSelf: false,
  })
  const [isSending, setIsSending] = useState(false)

  // Payment modal state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isInvoiceDateCalendarOpen, setIsInvoiceDateCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date()
    return { month: today.getMonth(), year: today.getFullYear() }
  })
  const [invoiceDateCalendarMonth, setInvoiceDateCalendarMonth] = useState(() => {
    const today = new Date()
    return { month: today.getMonth(), year: today.getFullYear() }
  })

  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(getTodayYyyyMmDd())
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')

  // Currency symbol based on invoice currency
  const currencySymbol = currencies.find(c => c.code === invoiceCurrency)?.symbol || '$'

  // Use contacts from mock data as existing contacts
  const existingContacts: Contact[] = contacts.map(contact => ({
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone ?? '',
    address: contact.address ?? '',
  }))

  // Calculate line item amount based on type
  const calculateLineItemAmount = useCallback((item: LineItem) => {
    if (item.itemType === 'hourly') {
      const totalHours = item.hours + item.minutes / 60
      return totalHours * item.price
    }
    return item.quantity * item.price
  }, [])

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + calculateLineItemAmount(item), 0)
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * discount) / 100 
    : Math.min(discount, subtotal)

  const calculateItemTax = useCallback((item: LineItem) => {
    if (!item.taxId) return 0
    const tax = taxRates.find((t) => t.id === item.taxId)
    if (!tax) return 0
    const amount = calculateLineItemAmount(item)
    return (amount * tax.rate) / 100
  }, [taxRates, calculateLineItemAmount])

  const totalTax = lineItems.reduce((sum, item) => sum + calculateItemTax(item), 0)
  const total = subtotal - discountAmount + totalTax
  const amountDue = total

  // Format date as dd/mm/yyyy (parse YYYY-MM-DD without timezone shift)
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return ''
    const m = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (m) return `${m[3]}/${m[2]}/${m[1]}`
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }, [])

  // Calendar helpers
  const getDaysInMonth = useCallback((month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }, [])

  const getFirstDayOfMonth = useCallback((month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }, [])

  const isWeekend = useCallback((dayOfWeek: number) => {
    return dayOfWeek === 0 || dayOfWeek === 6
  }, [])

  const isToday = useCallback((day: number, month: number, year: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }, [])

  const isSelectedDate = useCallback((day: number, month: number, year: number) => {
    if (!invoiceDetails.dueDate) return false
    const m = invoiceDetails.dueDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (m) return day === parseInt(m[3], 10) && month === parseInt(m[2], 10) - 1 && year === parseInt(m[1], 10)
    const selected = new Date(invoiceDetails.dueDate)
    return day === selected.getDate() && month === selected.getMonth() && year === selected.getFullYear()
  }, [invoiceDetails.dueDate])

  const handleDateSelect = useCallback((day: number, month: number, year: number) => {
    const pad = (n: number) => n.toString().padStart(2, '0')
    const dateString = `${year}-${pad(month + 1)}-${pad(day)}`
    setInvoiceDetails(prev => ({ ...prev, dueDate: dateString }))
    setIsCalendarOpen(false)
  }, [])

  const handleSetToday = useCallback(() => {
    const today = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const dateString = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
    setInvoiceDetails(prev => ({ ...prev, dueDate: dateString }))
    setCalendarMonth({ month: today.getMonth(), year: today.getFullYear() })
    setIsCalendarOpen(false)
  }, [])

  const handleClearDate = useCallback(() => {
    setInvoiceDetails(prev => ({ ...prev, dueDate: '' }))
    setIsCalendarOpen(false)
  }, [])

  // Invoice Date calendar helpers
  const isSelectedInvoiceDate = useCallback((day: number, month: number, year: number) => {
    if (!invoiceDetails.invoiceDate) return false
    const m = invoiceDetails.invoiceDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (m) return day === parseInt(m[3], 10) && month === parseInt(m[2], 10) - 1 && year === parseInt(m[1], 10)
    const selected = new Date(invoiceDetails.invoiceDate)
    return day === selected.getDate() && month === selected.getMonth() && year === selected.getFullYear()
  }, [invoiceDetails.invoiceDate])

  const handleInvoiceDateSelect = useCallback((day: number, month: number, year: number) => {
    const pad = (n: number) => n.toString().padStart(2, '0')
    const dateString = `${year}-${pad(month + 1)}-${pad(day)}`
    setInvoiceDetails(prev => ({ ...prev, invoiceDate: dateString }))
    setIsInvoiceDateCalendarOpen(false)
  }, [])

  const handleSetInvoiceDateToday = useCallback(() => {
    const today = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const dateString = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
    setInvoiceDetails(prev => ({ ...prev, invoiceDate: dateString }))
    setInvoiceDateCalendarMonth({ month: today.getMonth(), year: today.getFullYear() })
    setIsInvoiceDateCalendarOpen(false)
  }, [])

  const handleClearInvoiceDate = useCallback(() => {
    setInvoiceDetails(prev => ({ ...prev, invoiceDate: '' }))
    setIsInvoiceDateCalendarOpen(false)
  }, [])

  const navigateInvoiceDateMonth = useCallback((direction: 'prev' | 'next') => {
    setInvoiceDateCalendarMonth(prev => {
      if (direction === 'prev') {
        if (prev.month === 0) {
          return { month: 11, year: prev.year - 1 }
        }
        return { month: prev.month - 1, year: prev.year }
      } else {
        if (prev.month === 11) {
          return { month: 0, year: prev.year + 1 }
        }
        return { month: prev.month + 1, year: prev.year }
      }
    })
  }, [])

  const renderInvoiceDateCalendar = useCallback(() => {
    const daysInMonth = getDaysInMonth(invoiceDateCalendarMonth.month, invoiceDateCalendarMonth.year)
    const firstDay = getFirstDayOfMonth(invoiceDateCalendarMonth.month, invoiceDateCalendarMonth.year)
    const days: React.ReactNode[] = []

    // Get previous month's days to fill the start
    const prevMonth = invoiceDateCalendarMonth.month === 0 ? 11 : invoiceDateCalendarMonth.month - 1
    const prevYear = invoiceDateCalendarMonth.month === 0 ? invoiceDateCalendarMonth.year - 1 : invoiceDateCalendarMonth.year
    const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear)

    // Previous month's trailing days (greyed out)
    for (let i = 0; i < firstDay; i++) {
      const day = daysInPrevMonth - firstDay + i + 1
      const dayOfWeek = i % 7
      const weekend = isWeekend(dayOfWeek)
      days.push(
        <button
          key={`prev-${i}`}
          type="button"
          onClick={() => handleInvoiceDateSelect(day, prevMonth, prevYear)}
          className={`h-8 w-8 rounded-md text-sm font-medium text-muted-foreground/50 hover:bg-muted transition-colors ${weekend ? 'bg-foreground/[0.03]' : ''}`}
        >
          {day}
        </button>
      )
    }

    // Days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = (firstDay + day - 1) % 7
      const weekend = isWeekend(dayOfWeek)
      const today = isToday(day, invoiceDateCalendarMonth.month, invoiceDateCalendarMonth.year)
      const selected = isSelectedInvoiceDate(day, invoiceDateCalendarMonth.month, invoiceDateCalendarMonth.year)

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleInvoiceDateSelect(day, invoiceDateCalendarMonth.month, invoiceDateCalendarMonth.year)}
          className={`h-8 w-8 rounded-md text-sm font-medium transition-colors
            ${selected ? 'bg-primary text-primary-foreground' : ''}
            ${!selected && today ? 'bg-accent text-accent-foreground ring-1 ring-primary' : ''}
            ${!selected && !today && weekend ? 'bg-foreground/[0.04] border border-border/30' : ''}
            ${!selected && !today && !weekend ? 'text-foreground hover:bg-muted' : ''}
            ${!selected ? 'hover:bg-muted' : ''}
          `}
        >
          {day}
        </button>
      )
    }

    // Next month's leading days (greyed out) to fill out 6 rows (42 cells) for consistent height
    const totalCells = 42 // Always 6 rows
    const currentCells = days.length
    const remainingCells = totalCells - currentCells
    const nextMonth = invoiceDateCalendarMonth.month === 11 ? 0 : invoiceDateCalendarMonth.month + 1
    const nextYear = invoiceDateCalendarMonth.month === 11 ? invoiceDateCalendarMonth.year + 1 : invoiceDateCalendarMonth.year

    for (let i = 1; i <= remainingCells; i++) {
      const dayOfWeek = (currentCells + i - 1) % 7
      const weekend = isWeekend(dayOfWeek)
      days.push(
        <button
          key={`next-${i}`}
          type="button"
          onClick={() => handleInvoiceDateSelect(i, nextMonth, nextYear)}
          className={`h-8 w-8 rounded-md text-sm font-medium text-muted-foreground/50 hover:bg-muted transition-colors ${weekend ? 'bg-foreground/[0.03]' : ''}`}
        >
          {i}
        </button>
      )
    }

    return days
  }, [invoiceDateCalendarMonth, getDaysInMonth, getFirstDayOfMonth, isWeekend, isToday, isSelectedInvoiceDate, handleInvoiceDateSelect])

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCalendarMonth(prev => {
      if (direction === 'prev') {
        if (prev.month === 0) {
          return { month: 11, year: prev.year - 1 }
        }
        return { month: prev.month - 1, year: prev.year }
      } else {
        if (prev.month === 11) {
          return { month: 0, year: prev.year + 1 }
        }
        return { month: prev.month + 1, year: prev.year }
      }
    })
  }, [])

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const renderCalendar = useCallback(() => {
    const daysInMonth = getDaysInMonth(calendarMonth.month, calendarMonth.year)
    const firstDay = getFirstDayOfMonth(calendarMonth.month, calendarMonth.year)
    const days: React.ReactNode[] = []

    // Get previous month's days to fill the start
    const prevMonth = calendarMonth.month === 0 ? 11 : calendarMonth.month - 1
    const prevYear = calendarMonth.month === 0 ? calendarMonth.year - 1 : calendarMonth.year
    const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear)

    // Previous month's trailing days (greyed out)
    for (let i = 0; i < firstDay; i++) {
      const day = daysInPrevMonth - firstDay + i + 1
      const dayOfWeek = i % 7
      const weekend = isWeekend(dayOfWeek)
      days.push(
        <button
          key={`prev-${i}`}
          type="button"
          onClick={() => handleDateSelect(day, prevMonth, prevYear)}
          className={`h-8 w-8 rounded-md text-sm font-medium text-muted-foreground/50 hover:bg-muted transition-colors ${weekend ? 'bg-foreground/[0.03]' : ''}`}
        >
          {day}
        </button>
      )
    }

    // Days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = (firstDay + day - 1) % 7
      const weekend = isWeekend(dayOfWeek)
      const today = isToday(day, calendarMonth.month, calendarMonth.year)
      const selected = isSelectedDate(day, calendarMonth.month, calendarMonth.year)

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day, calendarMonth.month, calendarMonth.year)}
          className={`h-8 w-8 rounded-md text-sm font-medium transition-colors
            ${selected ? 'bg-primary text-primary-foreground' : ''}
            ${!selected && today ? 'bg-accent text-accent-foreground ring-1 ring-primary' : ''}
            ${!selected && !today && weekend ? 'bg-foreground/[0.04] border border-border/30' : ''}
            ${!selected && !today && !weekend ? 'text-foreground hover:bg-muted' : ''}
            ${!selected ? 'hover:bg-muted' : ''}
          `}
        >
          {day}
        </button>
      )
    }

    // Next month's leading days (greyed out) to fill out 6 rows (42 cells) for consistent height
    const totalCells = 42 // Always 6 rows
    const currentCells = days.length
    const remainingCells = totalCells - currentCells
    const nextMonth = calendarMonth.month === 11 ? 0 : calendarMonth.month + 1
    const nextYear = calendarMonth.month === 11 ? calendarMonth.year + 1 : calendarMonth.year

    for (let i = 1; i <= remainingCells; i++) {
      const dayOfWeek = (currentCells + i - 1) % 7
      const weekend = isWeekend(dayOfWeek)
      days.push(
        <button
          key={`next-${i}`}
          type="button"
          onClick={() => handleDateSelect(i, nextMonth, nextYear)}
          className={`h-8 w-8 rounded-md text-sm font-medium text-muted-foreground/50 hover:bg-muted transition-colors ${weekend ? 'bg-foreground/[0.03]' : ''}`}
        >
          {i}
        </button>
      )
    }

    return days
  }, [calendarMonth, getDaysInMonth, getFirstDayOfMonth, isWeekend, isToday, isSelectedDate, handleDateSelect])

  // Get tax breakdown
  const getTaxBreakdown = useCallback(() => {
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
  }, [lineItems, taxRates, calculateItemTax])

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
      { id: Date.now().toString(), itemType: 'item', item: '', quantity: 1, unit: 'pcs', hours: 0, minutes: 0, price: 0, taxId: null, description: '' },
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

  // Contact handlers
  const handleSelectExistingContact = (contactId: string) => {
    const contact = existingContacts.find((c) => c.id === contactId)
    if (contact) {
      setSelectedContact(contact)
      setSendEmail((prev) => ({ ...prev, to: contact.email }))
      setIsContactModalOpen(false)
    }
  }

  const handleSaveNewContact = async () => {
    const contact: Contact = {
      ...newContact,
      id: Date.now().toString(),
    }
    setSelectedContact(contact)
    setSendEmail((prev) => ({ ...prev, to: contact.email }))
    setIsContactModalOpen(false)
    
    try {
      await createContact({ name: newContact.name, email: newContact.email, phone: newContact.phone, address: newContact.address })
      await mutate('contacts')
    } catch (error) {
      console.error('Failed to save contact:', error)
    }
    
    setNewContact({
      name: '',
      email: '',
      phone: '',
      address: '',
    })
    setContactTab('existing')
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

  // Download PDF handler - uses shared template + html2canvas + jsPDF logic
  const handleDownloadPDF = useCallback(async () => {
    const payload: InvoicePDFPayload = {
      invoiceNumber: invoiceDetails.invoiceNumber,
      invoiceDate: invoiceDetails.invoiceDate,
      dueDate: invoiceDetails.dueDate || invoiceDetails.invoiceDate,
      template: selectedTemplate,
      colorPalette: activeColors,
      businessDetails,
      contact: selectedContact ? { name: selectedContact.name, email: selectedContact.email, address: selectedContact.address || '' } : null,
      lineItems,
      taxRates,
      subtotal,
      discount,
      discountType,
      discountAmount,
      totalTax,
      total,
      currencySymbol,
      invoiceCurrency,
      logoSize,
      notes,
    }
    await generateInvoicePDFFromPayload(payload)
  }, [invoiceDetails, selectedTemplate, activeColors, businessDetails, selectedContact, lineItems, subtotal, discountAmount, discountType, discount, totalTax, total, currencySymbol, logoSize, notes, invoiceCurrency, taxRates])

  // Send invoice handler
  const handleSendInvoice = async () => {
    setIsSending(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setInvoiceState('sent')

    const newInvoiceData = {
      id: invoiceDetails.invoiceNumber,
      client: selectedContact?.name || 'Unknown Contact',
      email: selectedContact?.email || sendEmail.to,
      amount: total,
      status: 'pending' as const,
      issueDate: invoiceDetails.invoiceDate,
      dueDate: invoiceDetails.dueDate || invoiceDetails.invoiceDate,
      paidDate: null,
      template: selectedTemplate,
      colorPalette: activeColors,
      invoiceCurrency,
      lineItems,
    }

    const created = await createInvoice(newInvoiceData)
    await mutate('invoices')
    await mutate('payable-summary')
    await mutate((k: unknown) => Array.isArray(k) && k[0] === 'charts')
    const newInvoiceId = created[0]?.id ?? newInvoiceData.id
    if (unbilledIdsRef.current.length > 0 && newInvoiceId) {
      await markWorkDoneAsInvoiced(unbilledIdsRef.current, newInvoiceId)
      try { sessionStorage.removeItem('unbilledWorkEntriesForInvoice') } catch (_) {}
      await mutate('work-done-unbilled')
    }
    if (unbilledTimeIdsRef.current.length > 0 && newInvoiceId) {
      await markTimeEntriesAsInvoiced(unbilledTimeIdsRef.current, newInvoiceId)
      try { sessionStorage.removeItem('unbilledTimeEntriesForInvoice') } catch (_) {}
      await mutate('time-entries-unbilled')
    }
    setIsSending(false)
    setIsSendModalOpen(false)
  }

  // Map invoiceState to Invoice status type
  const mapInvoiceStateToStatus = (state: InvoiceState): 'paid' | 'pending' | 'overdue' | 'draft' => {
    if (state === 'sent') return 'pending'
    return state
  }

  // Save invoice handler (saves with current status and redirects to invoices page)
  // Optional overrides for Record Payment: status 'paid' and paidDate
  const handleSaveInvoice = async (overrides?: { status?: 'paid' | 'pending' | 'overdue' | 'draft'; paidDate?: string | null }) => {
    const status = overrides?.status ?? mapInvoiceStateToStatus(invoiceState)
    const paidDate = overrides?.paidDate ?? (status === 'paid' ? getTodayYyyyMmDd() : null)

    const invoiceData = {
      id: isEditMode && editInvoiceId ? editInvoiceId : invoiceDetails.invoiceNumber,
      client: selectedContact?.name || 'Unknown Contact',
      email: selectedContact?.email || '',
      amount: total,
      status,
      issueDate: invoiceDetails.invoiceDate,
      dueDate: invoiceDetails.dueDate || invoiceDetails.invoiceDate,
      paidDate,
      template: selectedTemplate,
      colorPalette: activeColors,
      invoiceCurrency,
      lineItems,
    }

    try {
      if (isEditMode && editInvoiceId) {
        try {
          await updateInvoice(editInvoiceId, invoiceData)
        } catch (err) {
          // If 404 (invoice not found, e.g. backend restarted), fall back to create
          if (err instanceof HttpError && err.status === 404) {
            const { id: _id, ...createPayload } = invoiceData
            await createInvoice(createPayload)
          } else {
            throw err
          }
        }
        await mutate('invoices')
        await mutate('payable-summary')
        await mutate((k: unknown) => Array.isArray(k) && k[0] === 'charts')
      } else {
        const created = await createInvoice(invoiceData)
        await mutate('invoices')
        await mutate('payable-summary')
        await mutate((k: unknown) => Array.isArray(k) && k[0] === 'charts')
        const newInvoiceId = created[0]?.id ?? invoiceData.id
        if (unbilledIdsRef.current.length > 0 && newInvoiceId) {
          await markWorkDoneAsInvoiced(unbilledIdsRef.current, newInvoiceId)
          try { sessionStorage.removeItem('unbilledWorkEntriesForInvoice') } catch (_) {}
          await mutate('work-done-unbilled')
        }
        if (unbilledTimeIdsRef.current.length > 0 && newInvoiceId) {
          await markTimeEntriesAsInvoiced(unbilledTimeIdsRef.current, newInvoiceId)
          try { sessionStorage.removeItem('unbilledTimeEntriesForInvoice') } catch (_) {}
          await mutate('time-entries-unbilled')
        }
      }
      router.push('/invoices')
    } catch (e) {
      console.error('Failed to save invoice:', e)
      throw e
    }
  }

  // Record payment: persist paid status immediately and redirect
  const handleRecordPayment = async () => {
    setInvoiceState('paid')
    setIsRecordPaymentOpen(false)
    const paidDateVal = paymentDate || getTodayYyyyMmDd()
    await handleSaveInvoice({ status: 'paid', paidDate: paidDateVal })
  }

  // Duplicate invoice handler
  const handleDuplicateInvoice = () => {
    const newInvoiceNumber = `INV-${String(invoices.length + 2).padStart(3, '0')}`
    setInvoiceDetails({
      ...invoiceDetails,
      invoiceNumber: newInvoiceNumber,
      invoiceDate: getTodayYyyyMmDd(),
      dueDate: '',
    })
    setInvoiceState('draft')
    setCurrentStep('form')
  }

  // Delete invoice handler
  const handleDeleteInvoice = () => {
    router.push('/invoices')
  }

  // New invoice handler - resets all form fields
  const handleNewInvoice = () => {
    const newInvoiceNumber = `INV-${String(invoices.length + 2).padStart(3, '0')}`
    setBusinessDetails({
      logo: null,
      name: 'Your Company Name',
      invoiceTitle: 'INVOICE',
      address: '',
      summary: 'Thank you for your business!',
    })
    setSelectedContact(null)
    setInvoiceDetails({
      invoiceNumber: newInvoiceNumber,
      poNumber: '',
      invoiceDate: getTodayYyyyMmDd(),
      dueDate: '',
    })
    setLineItems([
      { id: '1', itemType: 'item', item: '', quantity: 1, unit: 'pcs', hours: 0, minutes: 0, price: 0, taxId: null, description: '' },
    ])
    setNotes('')
    setDiscount(0)
    setDiscountType('percentage')
    setInvoiceState('draft')
    setInvoiceCurrency('CAD')
    setSelectedTemplate('modern')
    setColorPalette(presetPalettes[0])
    setUseCustomColors(false)
    setLogoPosition('left')
    setLogoSize('medium')
    setCurrentStep('form')
  }

  // Open send modal
  const openSendModal = () => {
    setSendEmail({
      to: selectedContact?.email || '',
      cc: '',
      subject: `Invoice ${invoiceDetails.invoiceNumber} from ${businessDetails.name}`,
      message: `Dear ${selectedContact?.name || 'Customer'},\n\nPlease find attached invoice ${invoiceDetails.invoiceNumber} for ${currencySymbol}${total.toFixed(2)}.\n\nPayment is due by ${formatDate(invoiceDetails.dueDate) || 'upon receipt'}.\n\nThank you for your business.\n\nBest regards,\n${businessDetails.name}`,
      attachPdf: true,
      sendToSelf: false,
    })
    setIsSendModalOpen(true)
  }



  // Logo size slider handler
  const handleLogoSizeSlider = (value: number[]) => {
    if (value[0] <= 33) {
      setLogoSize('small')
    } else if (value[0] <= 66) {
      setLogoSize('medium')
    } else {
      setLogoSize('large')
    }
  }

  // Step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {(['form', 'theme', 'preview'] as Step[]).map((step, index) => {
        const isActive = currentStep === step
        const isPast = ['form', 'theme', 'preview'].indexOf(currentStep) > index
        const labels = { form: 'Details', theme: 'Template', preview: 'Preview' }
        
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

  // Invoice preview props for InvoicePreview component
  const invoicePreviewProps = {
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
  }

  // Render current template via InvoicePreview component
  const renderCurrentTemplate = () => (
    <InvoicePreview ref={invoicePreviewRef} {...invoicePreviewProps} />
  )

  // Template thumbnails for selection
  const renderTemplateThumbnail = (template: InvoiceTemplate, isSelected: boolean) => {
    const colors = activeColors
    return (
      <button
        type="button"
        onClick={() => setSelectedTemplate(template)}
        className={`relative w-full aspect-[3/4] rounded-lg border-2 transition-all overflow-hidden ${
          isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
        }`}
      >
        <div className="absolute inset-0 p-2 bg-white">
          {template === 'classic' && (
            <div className="h-full flex flex-col">
              <div className="h-1 w-full border-b-2" style={{ borderColor: colors.header }} />
              <div className="flex-1 pt-2">
                <div className="h-2 w-12 rounded" style={{ backgroundColor: colors.header }} />
                <div className="mt-2 h-1 w-16 bg-gray-200 rounded" />
                <div className="mt-3 h-3 w-full rounded" style={{ backgroundColor: colors.tableHeader }} />
                <div className="mt-1 space-y-0.5">
                  <div className="h-1.5 w-full bg-gray-100 rounded" />
                  <div className="h-1.5 w-full bg-gray-50 rounded" />
                </div>
              </div>
            </div>
          )}
          {template === 'modern' && (
            <div className="h-full flex flex-col">
              <div className="h-1 w-full rounded" style={{ background: `linear-gradient(to right, ${colors.accent}40, ${colors.accent})` }} />
              <div className="flex-1 pt-2">
                <div className="flex justify-between">
                  <div className="h-3 w-8 rounded" style={{ backgroundColor: colors.header }} />
                  <div className="h-2 w-10 rounded bg-gray-200" />
                </div>
                <div className="mt-2 p-1 rounded" style={{ backgroundColor: `${colors.accent}20` }}>
                  <div className="h-1 w-8 rounded" style={{ backgroundColor: colors.accent }} />
                </div>
                <div className="mt-2 h-3 w-full rounded" style={{ backgroundColor: colors.tableHeader }} />
                <div className="mt-1 space-y-0.5">
                  <div className="h-1.5 w-full bg-gray-100 rounded" />
                  <div className="h-1.5 w-full bg-gray-50 rounded" />
                </div>
              </div>
            </div>
          )}
          {template === 'formal' && (
            <div className="h-full flex flex-col border-2 rounded" style={{ borderColor: colors.header }}>
              <div className="flex-1 p-1">
                <div className="flex justify-between">
                  <div className="h-3 w-8 rounded bg-gray-200" />
                  <div className="h-4 w-10 rounded" style={{ backgroundColor: colors.header }} />
                </div>
                <div className="mt-2 border-t border-b py-1" style={{ borderColor: colors.header }}>
                  <div className="flex justify-between">
                    <div className="h-1 w-8 rounded" style={{ backgroundColor: colors.header }} />
                    <div className="h-2 w-6 rounded" style={{ backgroundColor: colors.header }} />
                  </div>
                </div>
                <div className="mt-1 space-y-0.5">
                  <div className="h-1.5 w-full bg-gray-100 rounded" />
                  <div className="h-1.5 w-full bg-gray-50 rounded" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-background/90 py-1 text-center">
          <span className="text-xs font-medium capitalize">{template}</span>
        </div>
        {isSelected && (
          <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        )}
      </button>
    )
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
              <div className="flex gap-6 items-start">
                {/* Logo on the left with upload overlay */}
                <div className="flex-shrink-0">
                  <Label className="text-xs mb-2 block">Logo</Label>
                  <label className="cursor-pointer group">
                    <div className="relative">
                      {businessDetails.logo ? (
                        <div className="relative h-28 w-28 rounded-lg border border-border overflow-hidden">
                          <img src={businessDetails.logo || "/placeholder.svg"} alt="Logo" className="h-full w-full object-contain" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="h-6 w-6 text-white" />
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 z-10" 
                            onClick={(e) => { e.preventDefault(); setBusinessDetails({ ...businessDetails, logo: null }) }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="h-28 w-28 rounded-lg border-2 border-dashed border-border bg-muted flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-muted/80 transition-colors">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Upload</span>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>

                {/* Business name and invoice title on the right */}
                <div className="flex-1 grid gap-4 sm:grid-cols-2">
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
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="summary" className="text-xs">Invoice Summary / Thank You Message</Label>
                    <Input id="summary" value={businessDetails.summary} onChange={(e) => setBusinessDetails({ ...businessDetails, summary: e.target.value })} className="h-8" placeholder="Thank you for your business" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedContact ? (
                <div className="rounded-lg border border-border p-3 bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{selectedContact.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
                      {selectedContact.phone && <p className="text-sm text-muted-foreground">{selectedContact.phone}</p>}
                      {selectedContact.address && <p className="text-sm text-muted-foreground mt-1">{selectedContact.address}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedContact(null)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                  <User className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No contact selected</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={() => setIsContactModalOpen(true)}>Select Contact</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Modal */}
          <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select or Add Contact</DialogTitle>
                <DialogDescription>Choose an existing contact or create a new one</DialogDescription>
              </DialogHeader>
              <Tabs value={contactTab} onValueChange={setContactTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existing">Existing</TabsTrigger>
                  <TabsTrigger value="new">New Contact</TabsTrigger>
                </TabsList>
                <TabsContent value="existing" className="space-y-2 pt-3">
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {sortAlphabetically(existingContacts).map((contact) => (
                      <button key={contact.id} type="button" onClick={() => handleSelectExistingContact(contact.id)} className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted">
                        <p className="font-medium text-foreground">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                      </button>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="new" className="pt-3">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="contactName"
                          placeholder="John Smith"
                          className="pl-10"
                          value={newContact.name}
                          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="contactEmail"
                          type="email"
                          placeholder="john@company.com"
                          className="pl-10"
                          value={newContact.email}
                          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="contactPhone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          className="pl-10"
                          value={newContact.phone}
                          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactAddress">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          id="contactAddress"
                          placeholder="123 Business St, City, State, ZIP"
                          className="pl-10 min-h-[80px]"
                          value={newContact.address}
                          onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setIsContactModalOpen(false)} className="bg-transparent">Cancel</Button>
                    <Button onClick={handleSaveNewContact} disabled={!newContact.name || !newContact.email}>Add Contact</Button>
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
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
                  <Popover open={isInvoiceDateCalendarOpen} onOpenChange={setIsInvoiceDateCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`h-8 w-full justify-start text-left font-normal bg-transparent ${!invoiceDetails.invoiceDate ? 'text-muted-foreground' : ''}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {invoiceDetails.invoiceDate ? formatDate(invoiceDetails.invoiceDate) : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-3">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => navigateInvoiceDateMonth('prev')}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium">
                            {monthNames[invoiceDateCalendarMonth.month]} {invoiceDateCalendarMonth.year}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => navigateInvoiceDateMonth('next')}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Day Names */}
                        <div className="grid grid-cols-7 gap-1 mb-1">
                          {dayNames.map((day, idx) => (
                            <div
                              key={day}
                              className={`h-8 w-8 flex items-center justify-center text-xs font-medium ${idx === 0 || idx === 6 ? 'text-rose-500' : 'text-muted-foreground'}`}
                            >
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {renderInvoiceDateCalendar()}
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={handleClearInvoiceDate}
                          >
                            Clear
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 bg-transparent"
                            onClick={handleSetInvoiceDateToday}
                          >
                            Today
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dueDate" className="text-xs">Payment Due Date</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`h-8 w-full justify-start text-left font-normal bg-transparent ${!invoiceDetails.dueDate ? 'text-muted-foreground' : ''}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {invoiceDetails.dueDate ? formatDate(invoiceDetails.dueDate) : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-3">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => navigateMonth('prev')}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium">
                            {monthNames[calendarMonth.month]} {calendarMonth.year}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => navigateMonth('next')}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Day Names */}
                        <div className="grid grid-cols-7 gap-1 mb-1">
                          {dayNames.map((day, idx) => (
                            <div
                              key={day}
                              className={`h-8 w-8 flex items-center justify-center text-xs font-medium ${idx === 0 || idx === 6 ? 'text-rose-500' : 'text-muted-foreground'}`}
                            >
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {renderCalendar()}
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={handleClearDate}
                          >
                            Clear
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 bg-transparent"
                            onClick={handleSetToday}
                          >
                            Today
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="currency" className="text-xs">Currency</Label>
                  <Select value={invoiceCurrency} onValueChange={setInvoiceCurrency}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <div className="space-y-3">
                {/* Header - Desktop only */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-3 text-xs font-medium text-muted-foreground pb-2 border-b">
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Item</div>
                  <div className="col-span-3">Qty / Hours</div>
                  <div className="col-span-2">Price ({invoiceCurrency})</div>
                  <div className="col-span-2">Tax</div>
                  <div className="col-span-1 text-right">Amount</div>
                </div>

                {lineItems.map((lineItem) => {
                  const selectedTax = lineItem.taxId ? taxRates.find((t) => t.id === lineItem.taxId) : null
                  const lineItemAmount = calculateLineItemAmount(lineItem)
                  
                  return (
                    <div key={lineItem.id} className="space-y-2 rounded-lg border border-border p-3 lg:border-0 lg:p-0 lg:space-y-0">
                      {/* Main Row */}
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-center">
                        {/* Item Type Dropdown */}
                        <div className="lg:col-span-2">
                          <Label className="mb-1 block text-xs text-muted-foreground lg:hidden">Type</Label>
                          <Select value={lineItem.itemType} onValueChange={(value: ItemType) => updateLineItem(lineItem.id, 'itemType', value)}>
                            <SelectTrigger className="h-8 text-xs w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="item">Item</SelectItem>
                              <SelectItem value="hourly">Hourly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Item Name */}
                        <div className="lg:col-span-2">
                          <Label className="mb-1 block text-xs text-muted-foreground lg:hidden">Item</Label>
                          <Input 
                            placeholder="Item name" 
                            value={lineItem.item} 
                            onChange={(e) => updateLineItem(lineItem.id, 'item', e.target.value)} 
                            className="h-8" 
                          />
                        </div>

                        {/* Quantity/Hours based on type */}
                        <div className="lg:col-span-3">
                          <Label className="mb-1 block text-xs text-muted-foreground lg:hidden">
                            {lineItem.itemType === 'hourly' ? 'Hours' : 'Quantity'}
                          </Label>
                          {lineItem.itemType === 'item' ? (
                            <div className="flex gap-2">
                              <Input 
                                type="number" 
                                min="1" 
                                value={lineItem.quantity || ''} 
                                onChange={(e) => updateLineItem(lineItem.id, 'quantity', e.target.value === '' ? 1 : Number(e.target.value))} 
                                onFocus={(e) => e.target.select()}
                                className="h-8 flex-1 min-w-0" 
                                placeholder="1"
                              />
                              <Select value={lineItem.unit} onValueChange={(value) => updateLineItem(lineItem.id, 'unit', value)}>
                                <SelectTrigger className="h-8 w-20 text-xs shrink-0">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {unitOptions.map((unit) => (
                                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <Input 
                                  type="number" 
                                  min="0" 
                                  value={lineItem.hours || ''} 
                                  onChange={(e) => updateLineItem(lineItem.id, 'hours', e.target.value === '' ? 0 : Number(e.target.value))} 
                                  onFocus={(e) => e.target.select()}
                                  className="h-8 pr-6 text-center" 
                                  placeholder="0"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">h</span>
                              </div>
                              <span className="text-muted-foreground font-medium">:</span>
                              <div className="relative flex-1">
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max="59" 
                                  value={lineItem.minutes || ''} 
                                  onChange={(e) => updateLineItem(lineItem.id, 'minutes', e.target.value === '' ? 0 : Math.min(59, Number(e.target.value)))} 
                                  onFocus={(e) => e.target.select()}
                                  className="h-8 pr-7 text-center" 
                                  placeholder="0"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">m</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="lg:col-span-2">
                          <Label className="mb-1 block text-xs text-muted-foreground lg:hidden">
                            Price {lineItem.itemType === 'hourly' ? '(per hour)' : `(${invoiceCurrency})`}
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{currencySymbol}</span>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              value={lineItem.price || ''} 
                              onChange={(e) => updateLineItem(lineItem.id, 'price', e.target.value === '' ? 0 : Number(e.target.value))} 
                              onFocus={(e) => e.target.select()}
                              className="h-8 pl-7" 
                              placeholder="0.00"
                            />
                            {lineItem.itemType === 'hourly' && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">/hr</span>
                            )}
                          </div>
                        </div>

                        {/* Tax */}
                        <div className="lg:col-span-2">
                          <Label className="mb-1 block text-xs text-muted-foreground lg:hidden">Tax</Label>
                          <Select value={lineItem.taxId || 'none'} onValueChange={(value) => { if (value === 'add_new') { openAddTaxModal(lineItem.id) } else { updateLineItem(lineItem.id, 'taxId', value === 'none' ? null : value) } }}>
                            <SelectTrigger className="h-8"><SelectValue placeholder="No tax" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No tax</SelectItem>
                              {taxRates.map((tax) => <SelectItem key={tax.id} value={tax.id}>{tax.name} ({tax.rate}%)</SelectItem>)}
                              <SelectItem value="add_new" className="text-primary"><span className="flex items-center gap-2"><Plus className="h-3 w-3" />Add new tax...</span></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Amount */}
                        <div className="flex items-center justify-between lg:col-span-1 lg:justify-end gap-2">
                          <Label className="text-xs text-muted-foreground lg:hidden">Amount</Label>
                          <span className="font-medium text-sm">{currencySymbol}{lineItemAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Description Row with Delete */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1">
                          <Input 
                            placeholder="Item description (optional)" 
                            value={lineItem.description} 
                            onChange={(e) => updateLineItem(lineItem.id, 'description', e.target.value)} 
                            className="h-7 text-xs text-muted-foreground" 
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeLineItem(lineItem.id)} 
                          disabled={lineItems.length === 1} 
                          className="text-muted-foreground hover:text-destructive h-7 w-7 shrink-0"
                        >
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
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>
                    
                    {/* Discount with switch toggle */}
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Discount</span>
                      <div className="flex items-center gap-2">
                        {/* Switch toggle for currency/percentage */}
                        <div className="flex items-center gap-1.5 rounded-md border border-input bg-muted px-2 py-1">
                          <span className={`text-sm font-medium transition-colors ${discountType === 'fixed' ? 'text-foreground' : 'text-muted-foreground'}`}>{currencySymbol}</span>
                          <Switch
                            checked={discountType === 'percentage'}
                            onCheckedChange={(checked) => setDiscountType(checked ? 'percentage' : 'fixed')}
                            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-primary"
                          />
                          <span className={`text-sm font-medium transition-colors ${discountType === 'percentage' ? 'text-foreground' : 'text-muted-foreground'}`}>%</span>
                        </div>
                        <Input 
                          type="number" 
                          min="0" 
                          max={discountType === 'percentage' ? 100 : subtotal}
                          value={discount || ''} 
                          onChange={(e) => setDiscount(e.target.value === '' ? 0 : Number(e.target.value))} 
                          onFocus={(e) => e.target.select()}
                          placeholder="0"
                          className="h-7 text-sm flex-1" 
                        />
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Discount amount</span>
                          <span className="text-green-600">-{currencySymbol}{discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {getTaxBreakdown().map((tax, idx) => <div key={idx} className="flex justify-between text-sm"><span className="text-muted-foreground">{tax.name}</span><span>{currencySymbol}{tax.amount.toFixed(2)}</span></div>)}
                    <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><span>Total</span><span>{currencySymbol}{total.toFixed(2)}</span></div>
                    <div className="flex justify-between text-lg font-bold text-primary"><span>Amount Due ({invoiceCurrency})</span><span>{currencySymbol}{amountDue.toFixed(2)}</span></div>
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
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // STEP 2: TEMPLATE & CUSTOMIZATION
  if (currentStep === 'theme') {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentStep('form')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Template & Customization</h1>
              <Badge className={stateConfig[invoiceState].color}>{stateConfig[invoiceState].label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Choose a template and customize the look of your invoice</p>
          </div>
        </div>

        {renderStepIndicator()}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Side: Live Preview - Fixed */}
          <div className="lg:order-1 lg:sticky lg:top-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden" style={{ aspectRatio: '8.5/11' }}>
                  <div className="transform scale-[0.48] origin-top-left" style={{ width: '208.33%', height: '208.33%' }}>
                    {renderCurrentTemplate()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Template Selection & Customization */}
          <div className="lg:order-2 space-y-4">
            {/* Template Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Select Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {renderTemplateThumbnail('classic', selectedTemplate === 'classic')}
                  {renderTemplateThumbnail('modern', selectedTemplate === 'modern')}
                  {renderTemplateThumbnail('formal', selectedTemplate === 'formal')}
                </div>
              </CardContent>
            </Card>

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
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Logo Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Logo Position</Label>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium transition-colors ${logoPosition === 'left' ? 'text-foreground' : 'text-muted-foreground'}`}>Left</span>
                      <Switch
                        checked={logoPosition === 'right'}
                        onCheckedChange={(checked) => setLogoPosition(checked ? 'right' : 'left')}
                      />
                      <span className={`text-sm font-medium transition-colors ${logoPosition === 'right' ? 'text-foreground' : 'text-muted-foreground'}`}>Right</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Logo Size</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant={logoSize === 'small' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => setLogoSize('small')} 
                        className={logoSize === 'small' ? '' : 'bg-transparent'}
                      >
                        Small
                      </Button>
                      <Button 
                        variant={logoSize === 'medium' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => setLogoSize('medium')} 
                        className={logoSize === 'medium' ? '' : 'bg-transparent'}
                      >
                        Medium
                      </Button>
                      <Button 
                        variant={logoSize === 'large' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => setLogoSize('large')} 
                        className={logoSize === 'large' ? '' : 'bg-transparent'}
                      >
                        Large
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer Actions */}
            <div className="flex justify-between gap-3 pt-4">
              <Button variant="outline" onClick={() => setCurrentStep('form')} className="bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />Back to Details
              </Button>
              <Button onClick={() => setCurrentStep('preview')}>
                Continue to Preview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // STEP 3: FINAL PREVIEW (Read-Only)
  const createdDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const lastSentDate = invoiceState !== 'draft' ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentStep('theme')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Invoice {invoiceDetails.invoiceNumber}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Download Button */}
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="bg-transparent">
            <Download className="h-4 w-4 mr-1" />
            Download PDF
          </Button>
          
          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-transparent">
                <MoreHorizontal className="h-4 w-4 mr-1" />
                More
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicateInvoice}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Invoice
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteInvoice} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Save Invoice */}
          <Button size="sm" onClick={() => void handleSaveInvoice()}>
            <Check className="h-4 w-4 mr-1" />
            Save Invoice
          </Button>
          
          {/* New Invoice */}
          <Button variant="outline" size="sm" onClick={handleNewInvoice} className="bg-transparent">
            <Plus className="h-4 w-4 mr-1" />
            New Invoice
          </Button>
        </div>
      </div>

      {renderStepIndicator()}

      {/* Main Content: Preview + Workflow Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Invoice Preview - Fixed US Letter Size */}
        <div className="lg:col-span-2">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="bg-white shadow-lg border border-border overflow-hidden"
              style={{ 
                width: '816px', 
                minHeight: '1056px',
                maxWidth: '100%',
              }}
            >
              <div className="h-full min-h-[1056px]">
                {renderCurrentTemplate()}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Page 1 of 1
            </div>
          </div>
        </div>

        {/* Right: Invoice Details & Workflow Panel */}
        <div className="space-y-4">
          {/* Invoice Details Card */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Select value={invoiceState} onValueChange={(value: InvoiceState) => setInvoiceState(value)}>
                  <SelectTrigger className={`w-auto h-7 text-xs font-medium border-0 ${stateConfig[invoiceState].color}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Contact Name */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Contact</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{selectedContact?.name || 'No contact'}</span>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-pointer hover:text-foreground" />
                </div>
              </div>
              
              {/* Amount Due */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount Due</span>
                <span className="text-lg font-bold text-foreground">{currencySymbol}{total.toFixed(2)} {invoiceCurrency}</span>
              </div>
              
              {/* Due Date */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Due Date</span>
                <span className={`text-sm font-medium ${invoiceState === 'overdue' ? 'text-red-600' : ''}`}>
                  {new Date(invoiceDetails.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Timeline */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-border" />

                {/* 1. Create Section */}
                <div className="relative flex gap-4 pb-6">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center z-10">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="text-sm font-semibold text-foreground">Create</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Created on {createdDate}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 h-7 text-xs bg-transparent"
                      onClick={() => setCurrentStep('form')}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit invoice
                    </Button>
                  </div>
                </div>

                {/* 2. Send Section */}
                <div className="relative flex gap-4 pb-6">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${
                    lastSentDate ? 'bg-blue-100 border-blue-500' : 'bg-muted border-border'
                  }`}>
                    <Send className={`h-4 w-4 ${lastSentDate ? 'text-blue-600' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="text-sm font-semibold text-foreground">Send</h4>
                    {lastSentDate ? (
                      <p className="text-xs text-muted-foreground mt-0.5">Last sent on {lastSentDate}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">Not sent yet</p>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 h-7 text-xs bg-transparent"
                      onClick={openSendModal}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      {lastSentDate ? 'Resend invoice' : 'Send invoice'}
                    </Button>
                    {invoiceState === 'overdue' && (
                      <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-xs text-amber-800">
                          <Bell className="h-3 w-3 inline mr-1" />
                          Overdue invoices are 3x more likely to get paid when you send reminders.
                        </p>
                        <button className="text-xs text-blue-600 hover:underline mt-1 font-medium">
                          Schedule reminders
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Manage Payments Section */}
                <div className="relative flex gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${
                    invoiceState === 'paid' ? 'bg-green-100 border-green-500' : 'bg-muted border-border'
                  }`}>
                    <CreditCard className={`h-4 w-4 ${invoiceState === 'paid' ? 'text-green-600' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="text-sm font-semibold text-foreground">Manage Payments</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Amount due</span>
                      <span className="text-sm font-semibold">{currencySymbol}{invoiceState === 'paid' ? '0.00' : total.toFixed(2)}</span>
                    </div>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="mt-2 h-7 text-xs w-full"
                      onClick={() => setIsRecordPaymentOpen(true)}
                    >
                      <CreditCard className="h-3 w-3 mr-1" />
                      Record a payment
                    </Button>
                    <div className="mt-3 p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {invoiceState === 'paid' 
                            ? 'Payment received. Thank you!' 
                            : invoiceState === 'overdue'
                            ? 'This invoice is overdue.'
                            : 'Your invoice is awaiting payment.'}
                        </p>
                      </div>
                      {invoiceState !== 'paid' && (
                        <button className="text-xs text-blue-600 hover:underline mt-1.5 font-medium flex items-center gap-1">
                          <Bell className="h-3 w-3" />
                          Send a reminder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Dialog open={isRecordPaymentOpen} onOpenChange={setIsRecordPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record a Payment</DialogTitle>
            <DialogDescription>Record a payment received for this invoice</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="paymentAmount" className="text-xs">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbol}</span>
                <Input 
                  id="paymentAmount" 
                  type="number" 
                  value={paymentAmount} 
                  onChange={(e) => setPaymentAmount(e.target.value)} 
                  className="pl-7 h-8" 
                  placeholder={total.toFixed(2)} 
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="paymentDate" className="text-xs">Payment Date</Label>
              <Input 
                id="paymentDate" 
                type="date" 
                value={paymentDate} 
                onChange={(e) => setPaymentDate(e.target.value)} 
                className="h-8" 
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="paymentMethod" className="text-xs">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRecordPaymentOpen(false)} className="bg-transparent">Cancel</Button>
            <Button onClick={() => void handleRecordPayment()}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Label htmlFor="sendCc" className="text-xs">CC</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="sendCc" type="text" value={sendEmail.cc} onChange={(e) => setSendEmail({ ...sendEmail, cc: e.target.value })} className="pl-10 h-8" placeholder="cc@example.com" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="sendToSelf" checked={sendEmail.sendToSelf} onCheckedChange={(checked) => setSendEmail({ ...sendEmail, sendToSelf: checked === true })} />
              <Label htmlFor="sendToSelf" className="text-xs cursor-pointer">Send copy to self</Label>
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

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <CreateInvoiceContent />
    </Suspense>
  )
}

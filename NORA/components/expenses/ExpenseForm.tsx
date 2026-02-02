'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Upload, Plus, Trash2, Loader2, ChevronDown } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import {
  listExpenseCategories,
  listVendors,
  listClients,
  listPaymentMethods,
  listCurrencies,
  listTaxRates,
  listRepeatFrequencies,
  getVendorById,
  getPaymentMethodById,
} from '@/lib/services/expense-service'
import type {
  ExpenseCategory,
  Vendor,
  Client,
  PaymentMethod,
  Currency,
  TaxRate,
  RepeatFrequency,
  ExpenseCreatePayload,
  ExpenseUpdatePayload,
} from '@/types/expense'
import type { Expense as LegacyExpense } from '@/lib/services/expenses'

// Expense status options
export const EXPENSE_STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  { value: 'review', label: 'Needs Review', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
] as const

export type ExpenseStatus = typeof EXPENSE_STATUS_OPTIONS[number]['value']

interface ExpenseFormData {
  // General information
  date: Date | undefined
  categoryId: string
  vendorId: string
  customVendor: string
  clientId: string
  isPaid: boolean
  status: ExpenseStatus
  notes: string
  isRepeating: boolean
  repeatFrequencyId: string
  // Payment information
  amount: string
  currencyCode: string
  paymentMethodId: string
  includeTax: boolean
  taxRateId: string
  tipAmount: string
  // Receipts
  receipts: { id: string; name: string }[]
}

interface ExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  expense?: LegacyExpense | null
  defaultDate?: Date | null
  onSubmit: (data: ExpenseCreatePayload | ExpenseUpdatePayload) => Promise<void> | void
}

const initialFormData: ExpenseFormData = {
  date: new Date(),
  categoryId: '',
  vendorId: '',
  customVendor: '',
  clientId: '',
  isPaid: true,
  status: 'paid',
  notes: '',
  isRepeating: false,
  repeatFrequencyId: '',
  amount: '',
  currencyCode: 'CAD',
  paymentMethodId: 'credit',
  includeTax: false,
  taxRateId: 'hst',
  tipAmount: '',
  receipts: [],
}

// Loading state for select dropdowns
function SelectLoading() {
  return (
    <div className="flex items-center justify-center py-6">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
    </div>
  )
}

// Empty state for select dropdowns
function SelectEmpty({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-6">
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  )
}

export function ExpenseForm({
  open,
  onOpenChange,
  mode,
  expense,
  defaultDate,
  onSubmit,
}: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData)
  const [useCustomVendor, setUseCustomVendor] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Section collapse states
  const [generalOpen, setGeneralOpen] = useState(true)
  const [paymentOpen, setPaymentOpen] = useState(true)
  const [receiptsOpen, setReceiptsOpen] = useState(true)

  // Dropdown data states
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [repeatFrequencies, setRepeatFrequencies] = useState<RepeatFrequency[]>([])

  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingVendors, setLoadingVendors] = useState(false)
  const [loadingClients, setLoadingClients] = useState(false)
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false)
  const [loadingCurrencies, setLoadingCurrencies] = useState(false)
  const [loadingTaxRates, setLoadingTaxRates] = useState(false)
  const [loadingRepeatFrequencies, setLoadingRepeatFrequencies] = useState(false)

  // Fetch dropdown data when sheet opens
  const fetchDropdownData = useCallback(async () => {
    // Fetch all dropdown data in parallel
    setLoadingCategories(true)
    setLoadingVendors(true)
    setLoadingClients(true)
    setLoadingPaymentMethods(true)
    setLoadingCurrencies(true)
    setLoadingTaxRates(true)
    setLoadingRepeatFrequencies(true)

    const [
      categoriesData,
      vendorsData,
      clientsData,
      paymentMethodsData,
      currenciesData,
      taxRatesData,
      repeatFrequenciesData,
    ] = await Promise.all([
      listExpenseCategories().finally(() => setLoadingCategories(false)),
      listVendors().finally(() => setLoadingVendors(false)),
      listClients().finally(() => setLoadingClients(false)),
      listPaymentMethods().finally(() => setLoadingPaymentMethods(false)),
      listCurrencies().finally(() => setLoadingCurrencies(false)),
      listTaxRates().finally(() => setLoadingTaxRates(false)),
      listRepeatFrequencies().finally(() => setLoadingRepeatFrequencies(false)),
    ])

    setCategories(categoriesData)
    setVendors(vendorsData)
    setClients(clientsData)
    setPaymentMethods(paymentMethodsData)
    setCurrencies(currenciesData)
    setTaxRates(taxRatesData)
    setRepeatFrequencies(repeatFrequenciesData)
  }, [])

  useEffect(() => {
    if (open) {
      fetchDropdownData()
    }
  }, [open, fetchDropdownData])

  // Reset form when opening or when expense changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && expense) {
        // Try to find vendor by matching description
        const existingVendor = vendors.find(
          (v) => v.name.toLowerCase() === expense.description.toLowerCase()
        )
        
        // Try to find payment method by matching name
        const existingPaymentMethod = paymentMethods.find(
          (p) => p.name.toLowerCase() === expense.paymentMethod?.toLowerCase()
        )

        // Parse expense date safely as local date (no timezone issues)
        let expenseDate: Date
        if (expense.date) {
          const [year, month, day] = expense.date.split('-').map(Number)
          expenseDate = new Date(year, month - 1, day)
        } else {
          expenseDate = new Date()
        }

        setFormData({
          date: expenseDate,
          categoryId: expense.category || '',
          vendorId: existingVendor?.id || '',
          customVendor: existingVendor ? '' : expense.description,
          clientId: '',
          isPaid: expense.status === 'paid',
          status: (expense.status as ExpenseStatus) || 'pending',
          notes: '',
          isRepeating: false,
          repeatFrequencyId: '',
          amount: expense.amount?.toString() || '',
          currencyCode: 'CAD',
          paymentMethodId: existingPaymentMethod?.id || 'credit',
          includeTax: false,
          taxRateId: 'hst',
          tipAmount: '',
          receipts: [],
        })
        setUseCustomVendor(!existingVendor)
      } else {
        // Use defaultDate if provided (from Calendar), otherwise use today
        setFormData({
          ...initialFormData,
          date: defaultDate || new Date(),
          status: 'pending',
        })
        setUseCustomVendor(false)
      }
    }
  }, [open, mode, expense, vendors, paymentMethods, defaultDate])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const vendorName = useCustomVendor
        ? formData.customVendor
        : getVendorById(formData.vendorId)?.name || formData.customVendor

      const selectedTaxRate = taxRates.find((t) => t.id === formData.taxRateId)?.rate || 0
      const subtotal = parseFloat(formData.amount) || 0
      const taxAmount = formData.includeTax ? subtotal * (selectedTaxRate / 100) : 0
      const tipAmount = parseFloat(formData.tipAmount) || 0
      const totalAmount = subtotal + taxAmount + tipAmount

      // Format date as YYYY-MM-DD using local date components (no timezone issues)
      const formatLocalDate = (d: Date): string => {
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      const payload: ExpenseCreatePayload = {
        date: formData.date ? formatLocalDate(formData.date) : formatLocalDate(new Date()),
        description: vendorName,
        categoryId: formData.categoryId,
        amount: subtotal,
        currencyCode: formData.currencyCode,
        paymentMethodId: formData.paymentMethodId,
        vendorId: useCustomVendor ? undefined : formData.vendorId || undefined,
        clientId: formData.clientId && formData.clientId !== 'none' ? formData.clientId : undefined,
        taxRateId: formData.includeTax ? formData.taxRateId : undefined,
        taxAmount: formData.includeTax ? taxAmount : undefined,
        tipAmount: tipAmount > 0 ? tipAmount : undefined,
        totalAmount,
        isPaid: formData.isPaid,
        status: formData.status,
        isRepeating: formData.isRepeating,
        repeatFrequencyId: formData.isRepeating ? formData.repeatFrequencyId : undefined,
        notes: formData.notes || undefined,
        receiptIds: formData.receipts.length > 0 ? formData.receipts.map(r => r.id) : undefined,
        source: 'manual',
      }

      await onSubmit(payload)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addReceipt = () => {
    const newReceipt = {
      id: `receipt-${Date.now()}`,
      name: `Receipt_${formData.receipts.length + 1}.pdf`,
    }
    setFormData((prev) => ({
      ...prev,
      receipts: [...prev.receipts, newReceipt],
    }))
  }

  const removeReceipt = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      receipts: prev.receipts.filter((r) => r.id !== id),
    }))
  }

  const selectedTaxRate = taxRates.find((t) => t.id === formData.taxRateId)?.rate || 0
  const subtotal = parseFloat(formData.amount) || 0
  const taxAmount = formData.includeTax ? subtotal * (selectedTaxRate / 100) : 0
  const tipAmount = parseFloat(formData.tipAmount) || 0
  const total = subtotal + taxAmount + tipAmount

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col h-full max-h-screen"
      >
        <SheetHeader className="shrink-0 p-6 pb-4 border-b">
          <SheetTitle>
            {mode === 'create' ? 'Add New Expense' : 'Edit Expense'}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'Enter the details of your expense below.'
              : 'Update the expense details below.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-6 py-4">
            {/* General Information Section */}
            <Collapsible open={generalOpen} onOpenChange={setGeneralOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors">
                <span>General Information</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", generalOpen && "rotate-180")} />
              </CollapsibleTrigger>
              <Separator className="mb-4" />
              <CollapsibleContent className="space-y-4">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal bg-transparent',
                          !formData.date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? (
                          format(formData.date, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) =>
                          setFormData((prev) => ({ ...prev, date }))
                        }
                        captionLayout="dropdown"
                        fromYear={2000}
                        toYear={2100}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Expense Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Expense Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, categoryId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCategories ? (
                        <SelectLoading />
                      ) : categories.length === 0 ? (
                        <SelectEmpty message="No categories available" />
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Vendor/Merchant */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vendor">Vendor/Merchant</Label>
                    <button
                      type="button"
                      onClick={() => setUseCustomVendor(!useCustomVendor)}
                      className="text-xs text-primary hover:underline"
                    >
                      {useCustomVendor ? 'Select from list' : 'Enter custom'}
                    </button>
                  </div>
                  {useCustomVendor ? (
                    <Input
                      id="customVendor"
                      placeholder="Enter vendor name"
                      value={formData.customVendor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customVendor: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <Select
                      value={formData.vendorId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, vendorId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingVendors ? (
                          <SelectLoading />
                        ) : vendors.length === 0 ? (
                          <SelectEmpty message="No vendors available" />
                        ) : (
                          vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Bill To (Client) */}
                <div className="space-y-2">
                  <Label htmlFor="billToClient">Bill To (Client)</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, clientId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingClients ? (
                        <SelectLoading />
                      ) : (
                        <>
                          <SelectItem value="none">No client</SelectItem>
                          {clients.length === 0 ? (
                            <SelectEmpty message="No clients available" />
                          ) : (
                            clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))
                          )}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Already Paid Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isPaid" className="cursor-pointer">
                      This expense is already paid
                    </Label>
                    <Switch
                      id="isPaid"
                      checked={formData.isPaid}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, isPaid: checked }))
                      }
                    />
                  </div>
                  
                  {/* Payment Method - shown when isPaid is true */}
                  {formData.isPaid && (
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethodGeneral">Payment Method</Label>
                      <Select
                        value={formData.paymentMethodId}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, paymentMethodId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingPaymentMethods ? (
                            <SelectLoading />
                          ) : paymentMethods.length === 0 ? (
                            <SelectEmpty message="No payment methods available" />
                          ) : (
                            paymentMethods.map((method) => (
                              <SelectItem key={method.id} value={method.id}>
                                {method.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ 
                        ...prev, 
                        status: value as ExpenseStatus,
                        isPaid: value === 'paid'
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              option.value === 'paid' && "bg-green-500",
                              option.value === 'pending' && "bg-yellow-500",
                              option.value === 'overdue' && "bg-red-500",
                              option.value === 'review' && "bg-blue-500",
                            )} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description/Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Description/Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                {/* Repeat Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isRepeating" className="cursor-pointer">
                      Repeat this element
                    </Label>
                    <Switch
                      id="isRepeating"
                      checked={formData.isRepeating}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, isRepeating: checked }))
                      }
                    />
                  </div>
                  {formData.isRepeating && (
                    <Select
                      value={formData.repeatFrequencyId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          repeatFrequencyId: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingRepeatFrequencies ? (
                          <SelectLoading />
                        ) : repeatFrequencies.length === 0 ? (
                          <SelectEmpty message="No frequencies available" />
                        ) : (
                          repeatFrequencies.map((freq) => (
                            <SelectItem key={freq.id} value={freq.id}>
                              {freq.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Payment Information Section */}
            <Collapsible open={paymentOpen} onOpenChange={setPaymentOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors">
                <span>Payment Information</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", paymentOpen && "rotate-180")} />
              </CollapsibleTrigger>
              <Separator className="mb-4" />
              <CollapsibleContent className="space-y-4">
                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Paid Amount <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        className="pl-7"
                      />
                    </div>
                    <Select
                      value={formData.currencyCode}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, currencyCode: value }))
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingCurrencies ? (
                          <SelectLoading />
                        ) : currencies.length === 0 ? (
                          <SelectEmpty message="No currencies available" />
                        ) : (
                          currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Taxes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeTax" className="cursor-pointer">
                      Taxes included
                    </Label>
                    <Switch
                      id="includeTax"
                      checked={formData.includeTax}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, includeTax: checked }))
                      }
                    />
                  </div>
                  {formData.includeTax && (
                    <div className="flex gap-2">
                      <Select
                        value={formData.taxRateId}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, taxRateId: value }))
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select tax type" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingTaxRates ? (
                            <SelectLoading />
                          ) : taxRates.length === 0 ? (
                            <SelectEmpty message="No tax rates available" />
                          ) : (
                            taxRates.map((tax) => (
                              <SelectItem key={tax.id} value={tax.id}>
                                {tax.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Tip */}
                <div className="space-y-2">
                  <Label htmlFor="tipAmount">Tip Amount (optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="tipAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.tipAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tipAmount: e.target.value,
                        }))
                      }
                      className="pl-7"
                    />
                  </div>
                </div>

                {/* Total Summary */}
                {(formData.includeTax || tipAmount > 0) && subtotal > 0 && (
                  <div className="rounded-md bg-muted/50 p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {formData.includeTax && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Tax ({selectedTaxRate}%)
                        </span>
                        <span>${taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {tipAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tip</span>
                        <span>${tipAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Attached Receipts Section */}
            <Collapsible open={receiptsOpen} onOpenChange={setReceiptsOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors">
                <span>Attached Receipts</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", receiptsOpen && "rotate-180")} />
              </CollapsibleTrigger>
              <Separator className="mb-4" />
              <CollapsibleContent className="space-y-3">
                {formData.receipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm">{receipt.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeReceipt(receipt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed bg-transparent"
                  onClick={addReceipt}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Attach Receipt
                </Button>
                <p className="text-xs text-muted-foreground">
                  Upload receipts for record keeping (placeholder - no actual
                  upload)
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        <SheetFooter className="shrink-0 p-6 pt-4 border-t bg-background">
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!formData.date || !formData.amount || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Adding...' : 'Saving...'}
                </>
              ) : (
                mode === 'create' ? 'Add Expense' : 'Save Changes'
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

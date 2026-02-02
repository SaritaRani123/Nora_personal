// Expense-related types

export interface ExpenseCategory {
  id: string
  name: string
  code: string
}

export interface Vendor {
  id: string
  name: string
}

export interface Client {
  id: string
  name: string
  email: string
}

export interface PaymentMethod {
  id: string
  name: string
}

export interface Currency {
  code: string
  name: string
  symbol: string
}

export interface TaxRate {
  id: string
  name: string
  rate: number
}

export interface RepeatFrequency {
  id: string
  name: string
}

// Main Expense type used throughout the app
export interface Expense {
  id: string
  date: string
  description: string
  categoryId: string
  amount: number
  currencyCode: string
  paymentMethodId: string
  vendorId?: string
  clientId?: string
  taxRateId?: string
  taxAmount?: number
  tipAmount?: number
  totalAmount: number
  isPaid: boolean
  isRepeating: boolean
  repeatFrequencyId?: string
  notes?: string
  receiptIds?: string[]
  source: 'manual' | 'calendar' | 'import'
  aiSuggested?: boolean
  confidence?: number
}

// Expense status type
export type ExpenseStatus = 'paid' | 'pending' | 'overdue' | 'review'

// Payload for creating a new expense
export interface ExpenseCreatePayload {
  date: string
  description: string
  categoryId: string
  amount: number
  currencyCode: string
  paymentMethodId: string
  vendorId?: string
  clientId?: string
  taxRateId?: string
  taxAmount?: number
  tipAmount?: number
  totalAmount: number
  isPaid: boolean
  status?: ExpenseStatus
  isRepeating: boolean
  repeatFrequencyId?: string
  notes?: string
  receiptIds?: string[]
  source?: 'manual' | 'calendar' | 'import'
}

// Payload for updating an existing expense
export interface ExpenseUpdatePayload {
  date?: string
  description?: string
  categoryId?: string
  amount?: number
  currencyCode?: string
  paymentMethodId?: string
  vendorId?: string
  clientId?: string
  taxRateId?: string
  taxAmount?: number
  tipAmount?: number
  totalAmount?: number
  isPaid?: boolean
  status?: ExpenseStatus
  isRepeating?: boolean
  repeatFrequencyId?: string
  notes?: string
  receiptIds?: string[]
}

// Filters for listing expenses
export interface ListExpensesFilters {
  from?: string // YYYY-MM-DD
  to?: string // YYYY-MM-DD
  categoryId?: string
  vendorId?: string
  clientId?: string
  paymentMethodId?: string
  isPaid?: boolean
}

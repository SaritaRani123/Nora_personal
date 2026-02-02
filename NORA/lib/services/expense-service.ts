// Service functions for expense-related data fetching
import type {
  ExpenseCategory,
  Vendor,
  Client,
  PaymentMethod,
  Currency,
  TaxRate,
  RepeatFrequency,
  Expense,
  ExpenseCreatePayload,
  ExpenseUpdatePayload,
  ListExpensesFilters,
} from '@/types/expense'
import { categories as mockCategories, contacts as mockContacts } from '@/lib/mock-data'

// Simulated API delay for realistic loading states
const simulateDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

// ============ Category Service ============

export async function listExpenseCategories(): Promise<ExpenseCategory[]> {
  await simulateDelay()
  return mockCategories
}

// ============ Vendor Service ============

const vendorsData: Vendor[] = [
  { id: 'mcdonalds', name: "McDonald's" },
  { id: 'staples', name: 'Staples' },
  { id: 'shell', name: 'Shell Gas Station' },
  { id: 'timhortons', name: 'Tim Hortons' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'costco', name: 'Costco' },
  { id: 'walmart', name: 'Walmart' },
  { id: 'adobe', name: 'Adobe' },
  { id: 'google', name: 'Google' },
  { id: 'microsoft', name: 'Microsoft' },
  { id: 'hydro-one', name: 'Hydro One' },
  { id: 'marriott', name: 'Marriott Hotel' },
]

export async function listVendors(): Promise<Vendor[]> {
  await simulateDelay()
  return vendorsData
}

export function getVendorById(id: string): Vendor | undefined {
  return vendorsData.find(v => v.id === id)
}

// ============ Client Service ============

export async function listClients(): Promise<Client[]> {
  await simulateDelay()
  return mockContacts.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
  }))
}

export function getClientById(id: string): Client | undefined {
  const contact = mockContacts.find(c => c.id === id)
  if (!contact) return undefined
  return {
    id: contact.id,
    name: contact.name,
    email: contact.email,
  }
}

// ============ Payment Method Service ============

const paymentMethodsData: PaymentMethod[] = [
  { id: 'credit', name: 'Credit Card' },
  { id: 'debit', name: 'Debit Card' },
  { id: 'cash', name: 'Cash' },
  { id: 'bank', name: 'Bank Transfer' },
  { id: 'cheque', name: 'Cheque' },
  { id: 'etransfer', name: 'E-Transfer' },
]

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  await simulateDelay()
  return paymentMethodsData
}

export function getPaymentMethodById(id: string): PaymentMethod | undefined {
  return paymentMethodsData.find(p => p.id === id)
}

// ============ Currency Service ============

const currenciesData: Currency[] = [
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
]

export async function listCurrencies(): Promise<Currency[]> {
  await simulateDelay()
  return currenciesData
}

export function getCurrencyByCode(code: string): Currency | undefined {
  return currenciesData.find(c => c.code === code)
}

// ============ Tax Rate Service ============

const taxRatesData: TaxRate[] = [
  { id: 'none', name: 'No Tax', rate: 0 },
  { id: 'hst', name: 'HST (13%)', rate: 13 },
  { id: 'gst', name: 'GST (5%)', rate: 5 },
  { id: 'pst', name: 'PST (8%)', rate: 8 },
  { id: 'qst', name: 'QST (9.975%)', rate: 9.975 },
  { id: 'tvh', name: 'TVH (15%)', rate: 15 },
]

export async function listTaxRates(): Promise<TaxRate[]> {
  await simulateDelay()
  return taxRatesData
}

export function getTaxRateById(id: string): TaxRate | undefined {
  return taxRatesData.find(t => t.id === id)
}

// ============ Repeat Frequency Service ============

const repeatFrequenciesData: RepeatFrequency[] = [
  { id: 'weekly', name: 'Weekly' },
  { id: 'biweekly', name: 'Bi-weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'quarterly', name: 'Quarterly' },
  { id: 'yearly', name: 'Yearly' },
]

export async function listRepeatFrequencies(): Promise<RepeatFrequency[]> {
  await simulateDelay()
  return repeatFrequenciesData
}

// ============ Expense CRUD Service ============

// In-memory store for expenses (in a real app, this would be a database)
let expensesStore: Expense[] = []

export async function createExpense(payload: ExpenseCreatePayload): Promise<Expense> {
  await simulateDelay(500)
  
  const newExpense: Expense = {
    id: `exp-${Date.now()}`,
    ...payload,
    source: payload.source || 'manual',
  }
  
  expensesStore = [newExpense, ...expensesStore]
  return newExpense
}

export async function updateExpense(id: string, payload: ExpenseUpdatePayload): Promise<Expense> {
  await simulateDelay(500)
  
  const index = expensesStore.findIndex(e => e.id === id)
  if (index === -1) {
    throw new Error(`Expense with id ${id} not found`)
  }
  
  const updatedExpense: Expense = {
    ...expensesStore[index],
    ...payload,
  }
  
  expensesStore[index] = updatedExpense
  return updatedExpense
}

export async function deleteExpense(id: string): Promise<void> {
  await simulateDelay(300)
  expensesStore = expensesStore.filter(e => e.id !== id)
}

export async function getExpense(id: string): Promise<Expense | null> {
  await simulateDelay()
  return expensesStore.find(e => e.id === id) || null
}

// List expenses with optional filters (type imported from @/types/expense)
export async function listExpenses(filters?: ListExpensesFilters): Promise<Expense[]> {
  await simulateDelay()
  
  if (!filters) {
    return expensesStore
  }

  return expensesStore.filter(expense => {
    // Date range filter (YYYY-MM-DD string comparison works correctly)
    if (filters.from && expense.date < filters.from) return false
    if (filters.to && expense.date > filters.to) return false
    
    // Category filter
    if (filters.categoryId && expense.categoryId !== filters.categoryId) return false
    
    // Vendor filter
    if (filters.vendorId && expense.vendorId !== filters.vendorId) return false
    
    // Client filter
    if (filters.clientId && expense.clientId !== filters.clientId) return false
    
    // Payment method filter
    if (filters.paymentMethodId && expense.paymentMethodId !== filters.paymentMethodId) return false
    
    // Paid status filter
    if (filters.isPaid !== undefined && expense.isPaid !== filters.isPaid) return false
    
    return true
  })
}

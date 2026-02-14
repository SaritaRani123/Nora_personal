/**
 * Expense form lookup services: categories, clients, and app config (payment methods,
 * status options, defaults) from backend API. Vendors, currencies, tax rates, repeat
 * frequencies remain local reference data. Expense CRUD is in lib/services/expenses.
 */
import type {
  ExpenseCategory,
  Vendor,
  Client,
  PaymentMethod,
  Currency,
  TaxRate,
  RepeatFrequency,
} from '@/types/expense'
import { apiFetch, extractArray } from '@/lib/api/http'
import { listContacts, type Contact } from '@/lib/services/contacts'
import { fetchConfig } from '@/lib/services/app-config'

// ============ Category Service (backend API) ============

export async function listExpenseCategories(): Promise<ExpenseCategory[]> {
  const body = await apiFetch('/categories')
  return extractArray<ExpenseCategory>(body, 'categories')
}

// ============ Vendor Service (local reference data) ============

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
  return Promise.resolve(vendorsData)
}

export function getVendorById(id: string): Vendor | undefined {
  return vendorsData.find(v => v.id === id)
}

// ============ Client Service (backend API: contacts) ============

export async function listClients(): Promise<Client[]> {
  const contacts = await listContacts()
  return contacts.map((c: Contact) => ({
    id: c.id,
    name: c.name,
    email: c.email,
  }))
}

export function getClientById(id: string, contacts?: Client[]): Client | undefined {
  if (contacts?.length) return contacts.find(c => c.id === id)
  return undefined
}

// ============ Payment Method Service (backend API via /config) ============

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  const config = await fetchConfig()
  return config.paymentMethods
}

export async function getPaymentMethodById(id: string): Promise<PaymentMethod | undefined> {
  const config = await fetchConfig()
  const found = config.paymentMethods.find(p => p.id === id)
  if (found) return found
  const defaultMethod = config.paymentMethods.find(p => p.id === config.defaultPaymentMethodId)
  return defaultMethod
}

// ============ Currency Service (local reference data) ============

const currenciesData: Currency[] = [
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
]

export async function listCurrencies(): Promise<Currency[]> {
  return Promise.resolve(currenciesData)
}

export function getCurrencyByCode(code: string): Currency | undefined {
  return currenciesData.find(c => c.code === code)
}

// ============ Tax Rate Service (local reference data) ============

const taxRatesData: TaxRate[] = [
  { id: 'none', name: 'No Tax', rate: 0 },
  { id: 'hst', name: 'HST (13%)', rate: 13 },
  { id: 'gst', name: 'GST (5%)', rate: 5 },
  { id: 'pst', name: 'PST (8%)', rate: 8 },
  { id: 'qst', name: 'QST (9.975%)', rate: 9.975 },
  { id: 'tvh', name: 'TVH (15%)', rate: 15 },
]

export async function listTaxRates(): Promise<TaxRate[]> {
  return Promise.resolve(taxRatesData)
}

export function getTaxRateById(id: string): TaxRate | undefined {
  return taxRatesData.find(t => t.id === id)
}

// ============ Repeat Frequency Service (local reference data) ============

const repeatFrequenciesData: RepeatFrequency[] = [
  { id: 'weekly', name: 'Weekly' },
  { id: 'biweekly', name: 'Bi-weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'quarterly', name: 'Quarterly' },
  { id: 'yearly', name: 'Yearly' },
]

export async function listRepeatFrequencies(): Promise<RepeatFrequency[]> {
  return Promise.resolve(repeatFrequenciesData)
}

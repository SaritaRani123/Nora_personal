/**
 * App config from backend: payment methods, expense status options, and defaults.
 * Used so all former hardcoded values (defaults, status list, N/A label, calendar range) come from the API.
 */
import type { PaymentMethod } from '@/types/expense'
import { apiFetch } from '@/lib/api/http'

export interface ExpenseStatusOption {
  value: string
  label: string
  color: string
}

export interface AppConfig {
  paymentMethods: PaymentMethod[]
  expenseStatusOptions: ExpenseStatusOption[]
  defaultPaymentMethodId: string
  defaultExpenseStatus: string
  defaultCategoryId: string
  missingStatusLabel: string
  calendarMinYear: number
  calendarMaxYear: number
}

const configUrl = '/config'

/** Fallback when backend is unavailable (same shape as backend). */
export const DEFAULT_EXPENSE_STATUS_OPTIONS: ExpenseStatusOption[] = [
  { value: 'paid', label: 'Paid', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  { value: 'review', label: 'Needs Review', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
]

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'credit', name: 'Credit Card' },
  { id: 'debit', name: 'Debit Card' },
  { id: 'cash', name: 'Cash' },
  { id: 'bank', name: 'Bank Transfer' },
  { id: 'cheque', name: 'Cheque' },
  { id: 'etransfer', name: 'E-Transfer' },
]

export async function fetchConfig(): Promise<AppConfig> {
  try {
    const body = await apiFetch(configUrl)
    if (!body || typeof body !== 'object') throw new Error('Invalid config response')
    const o = body as Record<string, unknown>
    return {
      paymentMethods: Array.isArray(o.paymentMethods) && o.paymentMethods.length > 0
        ? (o.paymentMethods as PaymentMethod[]) : DEFAULT_PAYMENT_METHODS,
      expenseStatusOptions: Array.isArray(o.expenseStatusOptions) && o.expenseStatusOptions.length > 0
        ? (o.expenseStatusOptions as ExpenseStatusOption[]) : DEFAULT_EXPENSE_STATUS_OPTIONS,
      defaultPaymentMethodId: typeof o.defaultPaymentMethodId === 'string' ? o.defaultPaymentMethodId : 'credit',
      defaultExpenseStatus: typeof o.defaultExpenseStatus === 'string' ? o.defaultExpenseStatus : 'pending',
      defaultCategoryId: typeof o.defaultCategoryId === 'string' ? o.defaultCategoryId : '',
      missingStatusLabel: typeof o.missingStatusLabel === 'string' ? o.missingStatusLabel : 'N/A',
      calendarMinYear: typeof o.calendarMinYear === 'number' ? o.calendarMinYear : 2020,
      calendarMaxYear: typeof o.calendarMaxYear === 'number' ? o.calendarMaxYear : 2030,
    }
  } catch {
    return {
      paymentMethods: DEFAULT_PAYMENT_METHODS,
      expenseStatusOptions: DEFAULT_EXPENSE_STATUS_OPTIONS,
      defaultPaymentMethodId: 'credit',
      defaultExpenseStatus: 'pending',
      defaultCategoryId: '',
      missingStatusLabel: 'N/A',
      calendarMinYear: 2020,
      calendarMaxYear: 2030,
    }
  }
}

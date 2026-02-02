import type { Expense } from './data-store'

// Calendar event type for consistent usage across the app
export interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD format
  type: 'expense' | 'travel' | 'invoice' | 'income' | 'work' | 'meeting' | 'deadline' | 'overdue'
  amount?: number
  category?: string
  categoryId?: string
  hours?: number
  client?: string
  kilometers?: number
  paymentMethod?: string
  taxDeductible?: boolean
}

/**
 * Formats a Date object to YYYY-MM-DD string without timezone issues.
 * Uses local date components to avoid off-by-one day errors.
 */
export function formatDateToLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parses a YYYY-MM-DD date string safely without timezone issues.
 * Creates a Date object in local timezone, not UTC.
 */
export function parseDateString(dateStr: string): Date {
  // Split the date string and create date with local timezone
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Normalizes payment method codes to human-readable format
 */
function normalizePaymentMethod(method: string): string {
  const methodMap: Record<string, string> = {
    credit: 'credit',
    'Credit Card': 'credit',
    debit: 'debit',
    'Debit Card': 'debit',
    bank: 'bank',
    'Bank Transfer': 'bank',
    cash: 'cash',
    Cash: 'cash',
    paypal: 'paypal',
    PayPal: 'paypal',
  }
  return methodMap[method] || 'credit'
}

/**
 * Maps an expense from the data store to a calendar event.
 * Used by both Calendar and any other component that needs to display expenses on a calendar.
 */
export function mapExpenseToCalendarEvent(expense: Expense): CalendarEvent {
  return {
    id: `expense-${expense.id}`,
    title: expense.description,
    date: expense.date, // Already in YYYY-MM-DD format from data store
    type: expense.category === 'travel' ? 'travel' : 'expense',
    amount: expense.amount,
    category: expense.category,
    categoryId: expense.category,
    paymentMethod: normalizePaymentMethod(expense.paymentMethod),
    taxDeductible: expense.category === 'office' || expense.category === 'software',
  }
}

/**
 * Checks if a date string falls within a date range (inclusive).
 * All dates should be in YYYY-MM-DD format.
 */
export function isDateInRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to
}

/**
 * Gets the start and end dates for a week view.
 * Returns dates in YYYY-MM-DD format.
 */
export function getWeekRange(date: Date): { start: string; end: string } {
  const startOfWeek = new Date(date)
  const day = startOfWeek.getDay()
  startOfWeek.setDate(startOfWeek.getDate() - day)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)

  return {
    start: formatDateToLocal(startOfWeek),
    end: formatDateToLocal(endOfWeek),
  }
}

/**
 * Gets the start and end dates for a month view (including calendar grid padding).
 * Returns dates in YYYY-MM-DD format.
 */
export function getMonthRange(date: Date): { start: string; end: string } {
  const year = date.getFullYear()
  const month = date.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Include previous month days shown in calendar grid
  const startingDay = firstDay.getDay()
  const calendarStart = new Date(year, month, 1 - startingDay)

  // Include next month days shown in calendar grid (42 cells total)
  const daysInMonth = lastDay.getDate()
  const totalCells = 42
  const remainingCells = totalCells - (startingDay + daysInMonth)
  const calendarEnd = new Date(year, month + 1, remainingCells)

  return {
    start: formatDateToLocal(calendarStart),
    end: formatDateToLocal(calendarEnd),
  }
}

/**
 * Minimal expense shape used for filtering (same as Expenses page logic).
 * Used by both Dashboard and Expenses page so "Total Expenses" always uses the same calculation.
 */
export interface ExpenseForFilter {
  id: string
  date: string
  description: string
  category: string
  amount: number
  paymentMethod: string
  status?: string
}

export interface ExpenseFilters {
  categoryFilter: string
  searchQuery: string
  statusFilter: string
  dateRange: { from: Date | undefined; to: Date | undefined }
}

/** Default filters (no category/search/status/date filter) — matches Expenses page when no filters applied. */
export const DEFAULT_EXPENSE_FILTERS: ExpenseFilters = {
  categoryFilter: 'all',
  searchQuery: '',
  statusFilter: 'all',
  dateRange: { from: undefined, to: undefined },
}

/** Parse YYYY-MM-DD as local date (not UTC). Do not use new Date("YYYY-MM-DD") which parses as UTC. */
function parseLocalDate(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number)
  return { year, month: month - 1, day }
}

/** Start of day in local time (00:00:00.000). */
function localStartOfDay(dateStr: string): Date {
  const { year, month, day } = parseLocalDate(dateStr)
  return new Date(year, month, day, 0, 0, 0, 0)
}

/** End of day in local time (23:59:59.999). */
function localEndOfDay(dateStr: string): Date {
  const { year, month, day } = parseLocalDate(dateStr)
  return new Date(year, month, day, 23, 59, 59, 999)
}

/** Get YYYY-MM-DD from a Date using its UTC date (so calendar date is preserved when caller used new Date("YYYY-MM-DD")). */
function toYYYYMMDD(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Filter expenses using the same logic as the Expenses page.
 * Date range is inclusive: from = start of day (00:00:00.000), to = end of day (23:59:59.999).
 * Compares real Date objects; parses YYYY-MM-DD as local (not UTC).
 */
export function filterExpenses<T extends ExpenseForFilter>(
  expenses: T[],
  filters: ExpenseFilters
): T[] {
  const { categoryFilter, searchQuery, statusFilter, dateRange } = filters
  return expenses.filter((e) => {
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter

    let matchesDateRange = true
    if (dateRange.from || dateRange.to) {
      const expenseDate = localStartOfDay(e.date.slice(0, 10))
      if (dateRange.from && dateRange.to) {
        const fromStr = toYYYYMMDD(dateRange.from)
        const toStr = toYYYYMMDD(dateRange.to)
        const fromStart = localStartOfDay(fromStr)
        const toEnd = localEndOfDay(toStr)
        matchesDateRange = expenseDate >= fromStart && expenseDate <= toEnd
      } else if (dateRange.from) {
        const fromStr = toYYYYMMDD(dateRange.from)
        const fromStart = localStartOfDay(fromStr)
        matchesDateRange = expenseDate >= fromStart
      } else {
        const toStr = toYYYYMMDD(dateRange.to!)
        const toEnd = localEndOfDay(toStr)
        matchesDateRange = expenseDate <= toEnd
      }
    }

    return matchesCategory && matchesSearch && matchesDateRange && matchesStatus
  })
}

/**
 * Sum amounts of (filtered) expenses. Same formula as Expenses page "Total Expenses".
 */
export function getTotalExpensesFromFiltered(expenses: { amount: number }[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0)
}

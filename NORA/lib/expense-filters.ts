import { format } from 'date-fns'

/**
 * Minimal expense shape used for filtering (same as Expenses page logic).
 * Used so Dashboard and Expenses page share the exact same filter + total calculation.
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

/**
 * Filter expenses using the same logic as the Expenses page.
 * Used by both Dashboard and Expenses page so "Total Expenses" always uses the same calculation.
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
      const expenseDateStr = e.date
      const fromStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null
      const toStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null
      if (fromStr && toStr) {
        matchesDateRange = expenseDateStr >= fromStr && expenseDateStr <= toStr
      } else if (fromStr) {
        matchesDateRange = expenseDateStr >= fromStr
      } else if (toStr) {
        matchesDateRange = expenseDateStr <= toStr
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

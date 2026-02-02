// API-driven expense service
// All functions use fetch to hit /api/... endpoints

export interface Expense {
  id: string
  date: string
  description: string
  category: string
  amount: number
  paymentMethod: string
  aiSuggested?: boolean
  confidence?: number
  status?: string
  source?: 'manual' | 'calendar' | 'import'
}

export interface Category {
  id: string
  name: string
  code: string
}

export interface ListExpensesFilters {
  from?: string // YYYY-MM-DD
  to?: string // YYYY-MM-DD
  categoryId?: string
  status?: string
}

export interface CreateExpensePayload {
  date: string
  description: string
  category: string
  amount: number
  paymentMethod: string
  status?: string
  source?: 'manual' | 'calendar' | 'import'
  aiSuggested?: boolean
  confidence?: number
}

export interface UpdateExpensePayload {
  date?: string
  description?: string
  category?: string
  amount?: number
  paymentMethod?: string
  status?: string
}

// ============ Expense CRUD Service ============

export async function listExpenses(
  filters?: ListExpensesFilters
): Promise<Expense[]> {
  const params = new URLSearchParams()

  if (filters?.from) params.set('from', filters.from)
  if (filters?.to) params.set('to', filters.to)
  if (filters?.categoryId) params.set('categoryId', filters.categoryId)
  if (filters?.status) params.set('status', filters.status)

  const queryString = params.toString()
  const url = `/api/expenses${queryString ? `?${queryString}` : ''}`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch expenses: ${res.statusText}`)
  }

  const data = await res.json()
  return data.expenses
}

export async function createExpense(
  payload: CreateExpensePayload
): Promise<Expense> {
  const res = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Failed to create expense: ${res.statusText}`)
  }

  return res.json()
}

export async function updateExpense(
  id: string,
  payload: UpdateExpensePayload
): Promise<Expense> {
  const res = await fetch(`/api/expenses?id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Failed to update expense: ${res.statusText}`)
  }

  return res.json()
}

export async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(`/api/expenses?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    throw new Error(`Failed to delete expense: ${res.statusText}`)
  }
}

// ============ Categories Service ============

export async function listCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories')

  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.statusText}`)
  }

  const data = await res.json()
  return data.categories
}

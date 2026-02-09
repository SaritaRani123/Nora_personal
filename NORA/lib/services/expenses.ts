// API-driven expense service
// All functions call the backend API (default: http://localhost:8080)

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

import { apiFetch, extractArray } from '@/lib/api/http'

export async function listExpenses(
  filters?: ListExpensesFilters
): Promise<Expense[]> {
  const params = new URLSearchParams()

  if (filters?.from) params.set('from', filters.from)
  if (filters?.to) params.set('to', filters.to)
  if (filters?.categoryId) params.set('categoryId', filters.categoryId)
  if (filters?.status) params.set('status', filters.status)

  const queryString = params.toString()
  const url = `/expenses${queryString ? `?${queryString}` : ''}`
  const body = await apiFetch(url)
  return extractArray<Expense>(body, 'expenses')
}

export async function createExpense(
  payload: CreateExpensePayload
): Promise<Expense[]> {
  const body = await apiFetch('/expenses', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  // Enforce array response even for single created item
  return extractArray<Expense>(body, 'expenses')
}

export async function updateExpense(
  id: string,
  payload: UpdateExpensePayload
): Promise<Expense[]> {
  const body = await apiFetch(`/expenses/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return extractArray<Expense>(body, 'expenses')
}

export async function deleteExpense(id: string): Promise<void> {
  await apiFetch(`/expenses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

// ============ Categories Service ============

export async function listCategories(): Promise<Category[]> {
  const body = await apiFetch('/categories')
  return extractArray<Category>(body, 'categories')
}

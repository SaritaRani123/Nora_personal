import { apiFetch, extractArray } from '@/lib/api/http'

export interface BudgetCategory {
  name: string
  budget: number
  spent: number
}

export interface BudgetOverviewData {
  year: string
  totalBudget: number
  spent: number
  categories: BudgetCategory[]
}

export async function getBudgetOverview(): Promise<BudgetOverviewData[]> {
  const body = await apiFetch('/budget')
  return extractArray<BudgetOverviewData>(body, 'budget')
}


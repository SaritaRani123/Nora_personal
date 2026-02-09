import { apiFetch, extractArray } from '@/lib/api/http'

export interface StatsData {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  incomeChange: string
  expensesChange: string
  profitChange: string
}

export async function getStats(): Promise<StatsData> {
  const body = await apiFetch('/stats')
  const arr = extractArray<StatsData>(body, 'stats')
  return arr[0] ?? {
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    incomeChange: '+0%',
    expensesChange: '+0%',
    profitChange: '+0%',
  }
}

import { apiFetch, extractArray } from '@/lib/api/http'

export interface ChartData {
  incomeExpenseData: { month: string; income: number; expenses: number }[]
  categoryData: { name: string; value: number }[]
}

export async function getCharts(range: '12' | '24' = '12'): Promise<ChartData> {
  const body = await apiFetch(`/charts?range=${range}`)
  const arr = extractArray<ChartData>(body, 'charts')
  return arr[0] ?? { incomeExpenseData: [], categoryData: [] }
}

import { apiFetch, extractArray } from '@/lib/api/http'

export interface ReportsData {
  stats: {
    totalIncome: number
    totalExpenses: number
    netSavings: number
    savingsRate: number
    avgDailySpend: number
    highestCategory: string
    monthlyAverage: number
    incomeChange: number
    expenseChange: number
    savingsChange: number
  }
  categoryDistribution: { name: string; value: number; color: string; budget: number }[]
  spendingTrend: Record<string, { date: string; amount: number }[]>
  profitLossTrend: Record<string, { date: string; income: number; expense: number; netProfitLoss: number }[]>
  incomeVsExpenses: { month: string; income: number; expenses: number; netProfit: number }[]
  budgetComparison: { category: string; budgeted: number; spent: number; remaining: number; progress: number }[]
  insights: { id: string; text: string; type: string }[]
  suggestions: { id: string; text: string; type: string }[]
  categoryDrilldown: Record<string, unknown>
  topTransactions: { id: string; date: string; merchant: string; category: string; payment: string; amount: number; tag: string }[]
  heatmapData: Record<string, { amount: number; intensity: string }>
}

export interface GetReportsParams {
  range?: string
  from?: string
  to?: string
  startDate?: string // YYYY-MM-DD (backend should accept and filter by this)
  endDate?: string // YYYY-MM-DD (backend should accept and filter by this)
}

export async function getReports(params?: GetReportsParams): Promise<ReportsData> {
  const search = new URLSearchParams()
  if (params?.startDate) search.set('startDate', params.startDate)
  if (params?.endDate) search.set('endDate', params.endDate)
  if (params?.range) search.set('range', params.range)
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  const qs = search.toString()
  const url = qs ? `/reports?${qs}` : '/reports'
  const body = await apiFetch(url)
  const arr = extractArray<ReportsData>(body, 'reports')
  if (!arr[0]) throw new Error('No reports data')
  return arr[0]
}

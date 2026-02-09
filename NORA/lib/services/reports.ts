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

export async function getReports(): Promise<ReportsData> {
  const body = await apiFetch('/reports')
  const arr = extractArray<ReportsData>(body, 'reports')
  if (!arr[0]) throw new Error('No reports data')
  return arr[0]
}

import { NextResponse } from 'next/server'

// Mock reports data
const reportStats = {
  revenue: 142500,
  expenses: 88450,
  netProfit: 54050,
  profitMargin: 37.9,
}

const reportTypes = [
  { id: 'income-statement', name: 'Income Statement', description: 'Revenue and expenses summary', lastGenerated: '2025-01-20' },
  { id: 'expense-report', name: 'Expense Report', description: 'Detailed expense breakdown', lastGenerated: '2025-01-18' },
  { id: 'profit-loss', name: 'Profit & Loss', description: 'P&L for the period', lastGenerated: '2025-01-15' },
  { id: 'tax-summary', name: 'Tax Summary', description: 'Tax-ready financial summary', lastGenerated: '2025-01-10' },
  { id: 'cash-flow', name: 'Cash Flow Statement', description: 'Cash inflows and outflows', lastGenerated: '2025-01-08' },
]

const monthlySummary = {
  grossRevenue: 12500,
  operatingExpenses: 8450,
  costOfGoodsSold: 2100,
  depreciation: 350,
  netIncome: 1600,
}

const taxEstimates = {
  q1Estimated: 4850,
  federal: 3200,
  state: 980,
  selfEmployment: 670,
  dueDate: 'Apr 15',
}

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return NextResponse.json({
    stats: reportStats,
    reportTypes,
    monthlySummary,
    taxEstimates,
  })
}

import { NextResponse } from 'next/server'

// Mock chart data
const monthlyData12 = [
  { month: 'Feb', income: 8500, expenses: 5800 },
  { month: 'Mar', income: 9200, expenses: 6100 },
  { month: 'Apr', income: 10100, expenses: 6500 },
  { month: 'May', income: 9800, expenses: 6300 },
  { month: 'Jun', income: 10500, expenses: 6700 },
  { month: 'Jul', income: 9000, expenses: 5900 },
  { month: 'Aug', income: 9500, expenses: 6200 },
  { month: 'Sep', income: 11200, expenses: 7100 },
  { month: 'Oct', income: 10800, expenses: 6800 },
  { month: 'Nov', income: 12500, expenses: 7900 },
  { month: 'Dec', income: 14200, expenses: 8500 },
  { month: 'Jan', income: 11750, expenses: 7245 },
]

const monthlyData24 = [
  { month: 'Feb 24', income: 7200, expenses: 4900 },
  { month: 'Apr 24', income: 7800, expenses: 5200 },
  { month: 'Jun 24', income: 8500, expenses: 5500 },
  { month: 'Aug 24', income: 9000, expenses: 5800 },
  { month: 'Oct 24', income: 8700, expenses: 5600 },
  { month: 'Dec 24', income: 9500, expenses: 6200 },
  { month: 'Feb 25', income: 8500, expenses: 5800 },
  { month: 'Apr 25', income: 10100, expenses: 6500 },
  { month: 'Jun 25', income: 10500, expenses: 6700 },
  { month: 'Aug 25', income: 9500, expenses: 6200 },
  { month: 'Oct 25', income: 10800, expenses: 6800 },
  { month: 'Jan 26', income: 11750, expenses: 7245 },
]

const categoryExpenses12 = [
  { name: 'Food & Dining', value: 1250 },
  { name: 'Office Expenses', value: 890 },
  { name: 'Fuel & Commute', value: 650 },
  { name: 'Software', value: 420 },
  { name: 'Marketing', value: 1800 },
  { name: 'Other', value: 2235 },
]

const categoryExpenses24 = [
  { name: 'Food & Dining', value: 2450 },
  { name: 'Office Expenses', value: 1680 },
  { name: 'Fuel & Commute', value: 1320 },
  { name: 'Software', value: 840 },
  { name: 'Marketing', value: 3500 },
  { name: 'Other', value: 4100 },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || '12'
  
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const incomeExpenseData = range === '24' ? monthlyData24 : monthlyData12
  const categoryData = range === '24' ? categoryExpenses24 : categoryExpenses12
  
  return NextResponse.json({
    incomeExpenseData,
    categoryData,
  })
}

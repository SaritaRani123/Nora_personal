import { NextResponse } from 'next/server'
import { income, expenses, monthlyData } from '@/lib/mock-data'

/**
 * Calculates stats dynamically from existing mock data:
 * - Total Income: Sum of all amounts from income array
 * - Total Expenses: Sum of amounts from expenses where status !== 'paid' (unpaid bills)
 * - Net Profit: Total Income - Total Expenses
 * - Percentage changes: Calculated from monthlyData historical data
 */
function calculateStats() {
  // Calculate Total Income from income array (same data as Income page)
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0)

  // Calculate Total Expenses from expenses where status !== 'paid' (same data as Expenses page)
  const totalExpenses = expenses
    .filter((expense) => expense.status !== 'paid')
    .reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate Net Profit
  const netProfit = totalIncome - totalExpenses

  // Calculate percentage changes from monthlyData
  // Current month is the last entry, previous month is second to last
  const currentMonth = monthlyData[monthlyData.length - 1]
  const previousMonth = monthlyData[monthlyData.length - 2]

  const incomeChange = previousMonth.income > 0
    ? (((currentMonth.income - previousMonth.income) / previousMonth.income) * 100).toFixed(1)
    : '0'

  const expensesChange = previousMonth.expenses > 0
    ? (((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100).toFixed(1)
    : '0'

  const currentProfit = currentMonth.income - currentMonth.expenses
  const previousProfit = previousMonth.income - previousMonth.expenses
  const profitChange = previousProfit > 0
    ? (((currentProfit - previousProfit) / previousProfit) * 100).toFixed(1)
    : '0'

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    incomeChange: `${Number(incomeChange) >= 0 ? '+' : ''}${incomeChange}%`,
    expensesChange: `${Number(expensesChange) >= 0 ? '+' : ''}${expensesChange}%`,
    profitChange: `${Number(profitChange) >= 0 ? '+' : ''}${profitChange}%`,
  }
}

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))

  const stats = calculateStats()
  
  return NextResponse.json(stats)
}

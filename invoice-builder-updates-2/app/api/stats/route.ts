import { NextResponse } from 'next/server'

// Mock stats data
const stats = {
  totalIncome: 11750.00,
  totalExpenses: 7245.43,
  netProfit: 4504.57,
  incomeChange: '+12.5%',
  expensesChange: '+8.2%',
  profitChange: '+18.3%',
}

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return NextResponse.json(stats)
}

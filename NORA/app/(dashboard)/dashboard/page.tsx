'use client'

import { StatsCards } from '@/components/stats-cards'
import { PayableOwingSummary } from '@/components/payable-owing-summary'
import { IncomeExpenseChart } from '@/components/income-expense-chart'
import { CategoryChart } from '@/components/category-chart'

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your financial overview.</p>
      </div>

      <StatsCards />

      <PayableOwingSummary />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IncomeExpenseChart />
        </div>
        <CategoryChart />
      </div>
    </div>
  )
}

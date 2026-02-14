'use client'

import useSWR from 'swr'
import { TrendingUp, TrendingDown, DollarSign, Receipt, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { listInvoices, type Invoice } from '@/lib/services/invoices'
import { listExpenses, type Expense } from '@/lib/services/expenses'
import { filterExpenses, getTotalExpensesFromFiltered, DEFAULT_EXPENSE_FILTERS } from '@/lib/expense-filters'

export function StatsCards() {
  const {
    data: invoices,
    isLoading: invoicesLoading,
  } = useSWR<Invoice[]>('invoices', listInvoices)

  const {
    data: expenses,
    isLoading: expensesLoading,
  } = useSWR<Expense[]>('expenses', () => listExpenses())

  const isLoading = invoicesLoading || expensesLoading

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const invoicesSafe = invoices ?? []
  const expensesSafe = expenses ?? []

  // Total Income: sum of paid invoices
  const totalIncome = invoicesSafe
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0)

  // Total Expenses: same calculation as Expenses page (same filters/date range logic, default = no filters)
  const filteredExpenses = filterExpenses(expensesSafe, DEFAULT_EXPENSE_FILTERS)
  const totalExpenses = getTotalExpensesFromFiltered(filteredExpenses)

  const netProfit = totalIncome - totalExpenses

  const stats = [
    {
      title: 'Total Income',
      value: `$${totalIncome.toLocaleString()}`,
      change: '+0%',
      trend: 'up' as 'up' | 'down' | 'flat',
      icon: DollarSign,
      description: 'vs last month',
    },
    {
      title: 'Total Expenses',
      value: `$${totalExpenses.toLocaleString()}`,
      change: '+0%',
      trend: 'up' as 'up' | 'down' | 'flat',
      icon: Receipt,
      description: 'vs last month',
    },
    {
      title: 'Net Profit',
      value: `$${netProfit.toLocaleString()}`,
      change: '+0%',
      trend: netProfit >= 0 ? ('up' as const) : ('down' as const),
      icon: Wallet,
      description: 'vs last month',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
            <div className="flex items-center gap-1 text-xs">
              {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-primary" />}
              {stat.trend === 'down' && <TrendingDown className="h-3 w-3 text-destructive" />}
              <span
                className={
                  stat.trend === 'up'
                    ? 'text-primary'
                    : stat.trend === 'down'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }
              >
                {stat.change}
              </span>
              <span className="text-muted-foreground">{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

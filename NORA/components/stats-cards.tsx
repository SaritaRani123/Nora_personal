'use client'

import useSWR from 'swr'
import { isSameMonth, subMonths } from 'date-fns'
import { TrendingUp, TrendingDown, DollarSign, Receipt, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { listInvoices, type Invoice } from '@/lib/services/invoices'
import { listExpenses, type Expense } from '@/lib/services/expenses'
import { parseDateString } from '@/lib/calendar-utils'

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

  const now = new Date()
  const lastMonth = subMonths(now, 1)

  // Helper: % change vs last period; when last is 0, use +100% / -100% / 0% to avoid division by zero
  const pctChange = (current: number, last: number): number => {
    if (last === 0) {
      if (current > 0) return 100
      if (current < 0) return -100
      return 0
    }
    return ((current - last) / last) * 100
  }
  const formatChange = (pct: number): string =>
    pct >= 0 ? `+${Math.round(pct)}%` : `${Math.round(pct)}%`
  const trendFromPct = (pct: number): 'up' | 'down' | 'flat' =>
    pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat'

  // Total Income = all-time sum of paid invoices (backend)
  const totalIncome = invoicesSafe
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0)

  // This month / last month income: paid invoices by paidDate
  const paidInvoices = invoicesSafe.filter((inv) => inv.status === 'paid' && inv.paidDate)
  const thisMonthIncome = paidInvoices
    .filter((inv) => isSameMonth(parseDateString(inv.paidDate!), now))
    .reduce((sum, inv) => sum + (inv.amount || 0), 0)
  const lastMonthIncome = paidInvoices
    .filter((inv) => isSameMonth(parseDateString(inv.paidDate!), lastMonth))
    .reduce((sum, inv) => sum + (inv.amount || 0), 0)
  const incomePct = pctChange(thisMonthIncome, lastMonthIncome)

  // Total Expenses = all-time sum of all expenses (backend)
  const totalExpenses = expensesSafe.reduce((sum, e) => sum + e.amount, 0)

  // This month / last month expenses (backend)
  const thisMonthExpenses = expensesSafe
    .filter((e) => isSameMonth(parseDateString(e.date), now))
    .reduce((sum, e) => sum + e.amount, 0)
  const lastMonthExpenses = expensesSafe
    .filter((e) => isSameMonth(parseDateString(e.date), lastMonth))
    .reduce((sum, e) => sum + e.amount, 0)
  const expensesPct = pctChange(thisMonthExpenses, lastMonthExpenses)

  // Net Profit = all-time income − all-time expenses (backend)
  const netProfit = totalIncome - totalExpenses

  // This month / last month net profit = month income − month expenses
  const thisMonthNetProfit = thisMonthIncome - thisMonthExpenses
  const lastMonthNetProfit = lastMonthIncome - lastMonthExpenses
  const netProfitPct = pctChange(thisMonthNetProfit, lastMonthNetProfit)

  const stats = [
    {
      title: 'Total Income',
      value: `$${totalIncome.toLocaleString()}`,
      change: formatChange(incomePct),
      trend: trendFromPct(incomePct),
      icon: DollarSign,
      description: 'vs last month',
    },
    {
      title: 'Total Expenses',
      value: `$${totalExpenses.toLocaleString()}`,
      change: formatChange(expensesPct),
      trend: trendFromPct(expensesPct),
      icon: Receipt,
      description: 'vs last month',
    },
    {
      title: 'Net Profit',
      value: `$${netProfit.toLocaleString()}`,
      change: formatChange(netProfitPct),
      trend: trendFromPct(netProfitPct),
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

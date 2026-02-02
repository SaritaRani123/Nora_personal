'use client'

import useSWR from 'swr'
import { TrendingUp, TrendingDown, DollarSign, Receipt, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface StatsData {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  incomeChange: string
  expensesChange: string
  profitChange: string
}

export function StatsCards() {
  const { data, isLoading } = useSWR<StatsData>('/api/stats', fetcher)

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

  const stats = [
    {
      title: 'Total Income',
      value: `$${data?.totalIncome?.toLocaleString() || '0'}`,
      change: data?.incomeChange || '+0%',
      trend: 'up',
      icon: DollarSign,
      description: 'vs last month',
    },
    {
      title: 'Total Expenses',
      value: `$${data?.totalExpenses?.toLocaleString() || '0'}`,
      change: data?.expensesChange || '+0%',
      trend: 'up',
      icon: Receipt,
      description: 'vs last month',
    },
    {
      title: 'Net Profit',
      value: `$${data?.netProfit?.toLocaleString() || '0'}`,
      change: data?.profitChange || '+0%',
      trend: 'up',
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
              <span className={stat.trend === 'up' ? 'text-primary' : stat.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}>
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

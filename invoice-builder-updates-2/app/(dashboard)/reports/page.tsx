'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Download, FileText, Calendar, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IncomeExpenseChart } from '@/components/income-expense-chart'
import { CategoryChart } from '@/components/category-chart'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const iconMap = {
  'income-statement': DollarSign,
  'expense-report': PieChart,
  'profit-loss': TrendingUp,
  'tax-summary': FileText,
  'cash-flow': BarChart3,
}

interface ReportsData {
  stats: {
    revenue: number
    expenses: number
    netProfit: number
    profitMargin: number
  }
  reportTypes: {
    id: string
    name: string
    description: string
    lastGenerated: string
  }[]
  monthlySummary: {
    grossRevenue: number
    operatingExpenses: number
    costOfGoodsSold: number
    depreciation: number
    netIncome: number
  }
  taxEstimates: {
    q1Estimated: number
    federal: number
    state: number
    selfEmployment: number
    dueDate: string
  }
}

export default function ReportsPage() {
  const [periodFilter, setPeriodFilter] = useState('month')
  const { data, isLoading } = useSWR<ReportsData>('/api/reports', fetcher)

  const stats = data?.stats || { revenue: 0, expenses: 0, netProfit: 0, profitMargin: 0 }
  const reportTypes = data?.reportTypes || []
  const monthlySummary = data?.monthlySummary || { grossRevenue: 0, operatingExpenses: 0, costOfGoodsSold: 0, depreciation: 0, netIncome: 0 }
  const taxEstimates = data?.taxEstimates || { q1Estimated: 0, federal: 0, state: 0, selfEmployment: 0, dueDate: '' }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-10 w-10 rounded-lg mb-2" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and download financial reports for your business</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[150px] bg-secondary/50 border-0">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold text-foreground">${stats.revenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-2xl font-bold text-foreground">${stats.expenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold text-primary">${stats.netProfit.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <PieChart className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold text-foreground">{stats.profitMargin}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IncomeExpenseChart />
        </div>
        <CategoryChart />
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Available Reports</CardTitle>
          <CardDescription>Generate and download reports for your records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reportTypes.map((report) => {
              const IconComponent = iconMap[report.id as keyof typeof iconMap] || FileText
              return (
                <div
                  key={report.id}
                  className="flex flex-col justify-between rounded-lg border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium text-foreground">{report.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Last: {new Date(report.lastGenerated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      <Download className="mr-2 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Monthly Summary</CardTitle>
            <CardDescription>January 2025 financial overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-foreground">Gross Revenue</span>
              <span className="font-medium text-foreground">${monthlySummary.grossRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-foreground">Operating Expenses</span>
              <span className="font-medium text-destructive">-${monthlySummary.operatingExpenses.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-foreground">Cost of Goods Sold</span>
              <span className="font-medium text-destructive">-${monthlySummary.costOfGoodsSold.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-foreground">Depreciation</span>
              <span className="font-medium text-destructive">-${monthlySummary.depreciation.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-foreground">Net Income</span>
              <span className="text-lg font-bold text-primary">${monthlySummary.netIncome.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Tax Estimates</CardTitle>
            <CardDescription>Quarterly tax projections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Q1 2025 Estimated Tax</span>
                <Badge variant="secondary">Due {taxEstimates.dueDate}</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">${taxEstimates.q1Estimated.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Federal Income Tax</span>
                <span className="text-foreground">${taxEstimates.federal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">State Income Tax</span>
                <span className="text-foreground">${taxEstimates.state.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Self-Employment Tax</span>
                <span className="text-foreground">${taxEstimates.selfEmployment.toLocaleString()}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              <FileText className="mr-2 h-4 w-4" />
              Generate Tax Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { getCharts, type ChartData } from '@/lib/services/charts'

export function IncomeExpenseChart() {
  const [dateRange, setDateRange] = useState<'12' | '24'>('12')
  const [showIncome, setShowIncome] = useState(true)
  const [showExpenses, setShowExpenses] = useState(true)
  
  const { data, isLoading, error } = useSWR<ChartData>(
    ['charts', dateRange],
    () => getCharts(dateRange),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  const chartData = data?.incomeExpenseData || []
  const hasData = chartData.length > 0

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Cash Flow</CardTitle>
          <CardDescription>Unable to load chart data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Failed to load data. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasData) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Cash Flow</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No cash flow data available for this period.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-card-foreground">Cash Flow</CardTitle>
            <CardDescription>Monthly comparison for the {dateRange === '12' ? 'last 12 months' : 'last 24 months'}</CardDescription>
          </div>
          <Select value={dateRange} onValueChange={(value) => setDateRange(value as '12' | '24')}>
            <SelectTrigger className="w-[160px] bg-secondary/50 border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">Last 12 Months</SelectItem>
              <SelectItem value="24">Last 24 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowIncome(!showIncome)}
            className={cn(
              "gap-2 transition-all duration-200",
              showIncome 
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/30 hover:text-emerald-400" 
                : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <span 
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors duration-200",
                showIncome ? "bg-emerald-500" : "bg-muted-foreground"
              )} 
            />
            Income
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExpenses(!showExpenses)}
            className={cn(
              "gap-2 transition-all duration-200",
              showExpenses 
                ? "bg-rose-500/20 border-rose-500/50 text-rose-500 hover:bg-rose-500/30 hover:text-rose-400" 
                : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <span 
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors duration-200",
                showExpenses ? "bg-rose-500" : "bg-muted-foreground"
              )} 
            />
            Expense
          </Button>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--popover-foreground)',
                }}
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`, 
                  name === 'income' ? 'Income' : 'Expenses'
                ]}
                cursor={{ fill: 'transparent' }}
              />
              <defs>
                <filter id="glow-income" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-expense" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {showIncome && (
                <Bar 
                  dataKey="income" 
                  name="income"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  animationDuration={300}
                  animationEasing="ease-in-out"
                  style={{ transition: 'filter 0.2s ease-out, opacity 0.2s ease-out' }}
                  onMouseEnter={(data, index, e) => {
                    if (e?.target) {
                      const target = e.target as SVGElement
                      target.style.filter = 'url(#glow-income) brightness(1.15)'
                      target.style.opacity = '1'
                    }
                  }}
                  onMouseLeave={(data, index, e) => {
                    if (e?.target) {
                      const target = e.target as SVGElement
                      target.style.filter = 'none'
                      target.style.opacity = '0.9'
                    }
                  }}
                />
              )}
              {showExpenses && (
                <Bar 
                  dataKey="expenses" 
                  name="expenses"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  animationDuration={300}
                  animationEasing="ease-in-out"
                  style={{ transition: 'filter 0.2s ease-out, opacity 0.2s ease-out' }}
                  onMouseEnter={(data, index, e) => {
                    if (e?.target) {
                      const target = e.target as SVGElement
                      target.style.filter = 'url(#glow-expense) brightness(1.15)'
                      target.style.opacity = '1'
                    }
                  }}
                  onMouseLeave={(data, index, e) => {
                    if (e?.target) {
                      const target = e.target as SVGElement
                      target.style.filter = 'none'
                      target.style.opacity = '0.9'
                    }
                  }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

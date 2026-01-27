'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ChartData {
  incomeExpenseData: { month: string; income: number; expenses: number }[]
  categoryData: { name: string; value: number }[]
}

export function IncomeExpenseChart() {
  const [dateRange, setDateRange] = useState<'12' | '24'>('12')
  const { data, isLoading } = useSWR<ChartData>(`/api/charts?range=${dateRange}`, fetcher)

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-card-foreground">Income vs Expenses</CardTitle>
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
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.incomeExpenseData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span style={{ color: 'var(--muted-foreground)' }}>{value}</span>}
              />
              <Bar 
                dataKey="income" 
                name="Income"
                fill="var(--chart-1)" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="expenses" 
                name="Expenses"
                fill="var(--chart-3)" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

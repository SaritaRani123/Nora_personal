'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
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

const COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#eab308', '#a855f7', '#6b7280']

interface ChartData {
  incomeExpenseData: { month: string; income: number; expenses: number }[]
  categoryData: { name: string; value: number }[]
}

export function CategoryChart() {
  const [mounted, setMounted] = useState(false)
  const [dateRange, setDateRange] = useState<'12' | '24'>('12')
  const { data, isLoading } = useSWR<ChartData>(`/api/charts?range=${dateRange}`, fetcher)
  
  const categoryExpenses = data?.categoryData || []
  const total = categoryExpenses.reduce((sum, item) => sum + item.value, 0)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-card-foreground">Expense Categories</CardTitle>
          </div>
          <div className="flex items-center justify-between">
            <CardDescription>Distribution of expenses by category</CardDescription>
            <Select value={dateRange} onValueChange={(value) => setDateRange(value as '12' | '24')}>
              <SelectTrigger className="w-[140px] h-8 bg-secondary/50 border-0 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">Last 12 Months</SelectItem>
                <SelectItem value="24">Last 24 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="h-[200px] w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryExpenses}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {categoryExpenses.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(240 10% 14%)',
                    border: '1px solid hsl(240 5% 22%)',
                    borderRadius: '8px',
                    color: 'hsl(240 5% 95%)',
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {categoryExpenses.map((item, index) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
              return (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.name} ({percentage}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import useSWR from 'swr'
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip as RechartsTooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { getCharts, type ChartData } from '@/lib/services/charts'

const COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#eab308', '#a855f7', '#6b7280']

// Shared tooltip styling: shadcn CSS variables (bg-popover, border, text-foreground, text-muted-foreground) for light + dark mode. Used by both Dashboard and Expenses pie charts.
const CHART_TOOLTIP_WRAPPER_CLASS =
  'rounded-md border border-border bg-popover px-3 py-2 shadow-lg'


interface ActiveShapeProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill: string
  payload: { name: string; value: number }
  percent: number
  value: number
}

const renderActiveShape = (props: ActiveShapeProps) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
          transition: 'all 0.2s ease-out',
        }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ opacity: 0.5 }}
      />
    </g>
  )
}

interface CategoryChartProps {
  compact?: boolean
  showTooltip?: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { name: string; value: number } }>
}

export function CategoryChart({ compact = false, showTooltip = false }: CategoryChartProps) {
  const [mounted, setMounted] = useState(false)
  const [dateRange, setDateRange] = useState<'12' | '24'>('12')
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  
  const { data, isLoading, error } = useSWR<ChartData>(
    ['charts', dateRange],
    () => getCharts(dateRange),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  )
  
  const categoryExpenses = data?.categoryData || []
  const total = categoryExpenses.reduce((sum, item) => sum + item.value, 0)

  const CustomPieTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length > 0) {
      const item = payload[0].payload
      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
      return (
        <div className={CHART_TOOLTIP_WRAPPER_CLASS}>
          <p className="text-sm font-medium text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            ${item.value.toLocaleString()} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }
  const hasData = categoryExpenses.length > 0

  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index)
  }, [])

  const onPieLeave = useCallback(() => {
    setActiveIndex(undefined)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    if (compact) {
      return (
        <>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <Skeleton className="h-[80px] w-[80px] rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-18" />
              </div>
            </div>
          </CardContent>
        </>
      )
    }
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

  if (error) {
    if (compact) {
      return (
        <>
          <CardHeader className="pb-2">
            <CardTitle className="text-card-foreground text-sm">Categories</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground text-xs">Failed to load</p>
          </CardContent>
        </>
      )
    }
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Expense Categories</CardTitle>
          <CardDescription>Unable to load data</CardDescription>
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
    if (compact) {
      return (
        <>
          <CardHeader className="pb-2">
            <CardTitle className="text-card-foreground text-sm">Categories</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground text-xs">No data available</p>
          </CardContent>
        </>
      )
    }
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Expense Categories</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No expense data available for this period.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Compact mode for inline display
  if (compact) {
    return (
      <>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-card-foreground text-sm">Categories</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-[70px] w-[70px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryExpenses.slice(0, 4)}
                    cx="50%"
                    cy="50%"
                    innerRadius={18}
                    outerRadius={32}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    animationDuration={300}
                  >
                    {categoryExpenses.slice(0, 4).map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              {categoryExpenses.slice(0, 4).map((item, index) => {
                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0'
                return (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-[10px] text-muted-foreground truncate">
                      {item.name} {percentage}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </>
    )
  }

  // Full chart display (inside Card wrapper from parent, or standalone)
  const chartContent = (
    <>
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
                {showTooltip && <RechartsTooltip content={<CustomPieTooltip />} />}
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={categoryExpenses}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  animationDuration={300}
                  animationEasing="ease-out"
                >
                  {categoryExpenses.map((entry, index) => (
                    <Cell 
                      key={`cell-${entry.name}`} 
                      fill={COLORS[index % COLORS.length]}
                      style={{
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease-out',
                        opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.5,
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {categoryExpenses.map((item, index) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
              return (
                <div 
                  key={item.name} 
                  className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
                  style={{
                    opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.5,
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0 transition-transform duration-200"
                    style={{ 
                      backgroundColor: COLORS[index % COLORS.length],
                      transform: activeIndex === index ? 'scale(1.3)' : 'scale(1)',
                    }}
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
    </>
  )

  // If showTooltip is true, parent provides Card wrapper
  if (showTooltip) {
    return chartContent
  }

  return (
    <Card className="bg-card border-border">
      {chartContent}
    </Card>
  )
}

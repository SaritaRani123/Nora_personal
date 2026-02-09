"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Grid3x3, Box } from "lucide-react"

interface SpendingHeatmapProps {
  data: Record<string, { amount: number; intensity: string }>
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function computeStats(data: Record<string, { amount: number; intensity: string }>) {
  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b))
  if (entries.length === 0) {
    return { totalSpending: 0, totalDaysActive: 0, busiestDay: { date: '', amount: 0 }, longestStreak: { days: 0, start: '', end: '' }, currentStreak: { days: 0, start: '', end: '' } }
  }

  let totalSpending = 0
  let totalDaysActive = 0
  let busiestDay = { date: '', amount: 0 }

  for (const [date, cell] of entries) {
    totalSpending += cell.amount
    if (cell.amount > 0) totalDaysActive++
    if (cell.amount > busiestDay.amount) {
      busiestDay = { date, amount: cell.amount }
    }
  }

  // Calculate streaks (days with spending > 0)
  let longestStreak = { days: 0, start: '', end: '' }
  let currentStreak = { days: 0, start: '', end: '' }
  let streak = 0
  let streakStart = ''

  for (const [date, cell] of entries) {
    if (cell.amount > 0) {
      if (streak === 0) streakStart = date
      streak++
      if (streak > longestStreak.days) {
        longestStreak = { days: streak, start: streakStart, end: date }
      }
    } else {
      streak = 0
    }
  }

  // Current streak: count backwards from the last entry
  let cStreak = 0
  let cStart = ''
  let cEnd = ''
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i][1].amount > 0) {
      if (cStreak === 0) cEnd = entries[i][0]
      cStreak++
      cStart = entries[i][0]
    } else {
      break
    }
  }
  currentStreak = { days: cStreak, start: cStart, end: cEnd }

  const firstDate = entries[0][0]
  const lastDate = entries[entries.length - 1][0]

  return { totalSpending, totalDaysActive, busiestDay, longestStreak, currentStreak, firstDate, lastDate }
}

function formatShortDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatFullDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function SpendingHeatmap({ data }: SpendingHeatmapProps) {
  const [view, setView] = useState<'2d' | '3d'>('2d')

  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() - 364)
    start.setDate(start.getDate() - start.getDay())

    const weeksArr: { date: string; dayOfWeek: number }[][] = []
    let currentWeek: { date: string; dayOfWeek: number }[] = []
    const labels: { label: string; colIndex: number }[] = []
    let lastMonth = -1

    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay()
      const dateStr = d.toISOString().split('T')[0]

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeksArr.push(currentWeek)
        currentWeek = []
      }

      const month = d.getMonth()
      if (month !== lastMonth) {
        labels.push({ label: MONTHS[month], colIndex: weeksArr.length })
        lastMonth = month
      }

      currentWeek.push({ date: dateStr, dayOfWeek })
    }

    if (currentWeek.length > 0) {
      weeksArr.push(currentWeek)
    }

    return { weeks: weeksArr, monthLabels: labels }
  }, [])

  const stats = useMemo(() => computeStats(data), [data])

  const getIntensityClass = (intensity: string | undefined) => {
    switch (intensity) {
      case 'low': return 'bg-emerald-300/50 dark:bg-emerald-500/30'
      case 'medium': return 'bg-emerald-400/70 dark:bg-emerald-500/50'
      case 'high': return 'bg-emerald-500 dark:bg-emerald-500/80'
      case 'very-high': return 'bg-emerald-700 dark:bg-emerald-400'
      default: return 'bg-secondary/40'
    }
  }

  return (
    <div>
      {/* View toggle */}
      <div className="flex items-center gap-1 mb-4">
        <Button
          variant={view === '2d' ? 'default' : 'outline'}
          size="sm"
          className={cn("h-7 text-xs gap-1.5", view !== '2d' && "bg-transparent")}
          onClick={() => setView('2d')}
        >
          <Grid3x3 className="h-3.5 w-3.5" />
          2D View
        </Button>
        <Button
          variant={view === '3d' ? 'default' : 'outline'}
          size="sm"
          className={cn("h-7 text-xs gap-1.5", view !== '3d' && "bg-transparent")}
          onClick={() => setView('3d')}
        >
          <Box className="h-3.5 w-3.5" />
          3D View
        </Button>
      </div>

      {view === '2d' ? (
        <FlatHeatmap
          weeks={weeks}
          monthLabels={monthLabels}
          data={data}
          getIntensityClass={getIntensityClass}
        />
      ) : (
        <Heatmap3D data={data} weeks={weeks} stats={stats} />
      )}
    </div>
  )
}

/* ---------- 2D Flat Heatmap ---------- */
function FlatHeatmap({
  weeks,
  monthLabels,
  data,
  getIntensityClass,
}: {
  weeks: { date: string; dayOfWeek: number }[][]
  monthLabels: { label: string; colIndex: number }[]
  data: Record<string, { amount: number; intensity: string }>
  getIntensityClass: (i: string | undefined) => string
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-0">
          {/* Month labels */}
          <div className="flex">
            <div className="w-8 shrink-0" />
            <div className="flex">
              {weeks.map((_, weekIdx) => {
                const label = monthLabels.find((m) => m.colIndex === weekIdx)
                return (
                  <div key={weekIdx} className="w-[13px] mr-[2px] text-[10px] text-muted-foreground leading-none">
                    {label ? label.label : ''}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Grid rows */}
          {Array.from({ length: 7 }).map((_, dayIdx) => (
            <div key={dayIdx} className="flex items-center">
              <div className="w-8 shrink-0 text-[10px] text-muted-foreground pr-2 text-right leading-none">
                {DAYS[dayIdx]}
              </div>
              <div className="flex gap-[2px]">
                {weeks.map((week, weekIdx) => {
                  const cell = week.find((c) => c.dayOfWeek === dayIdx)
                  if (!cell) {
                    return <div key={weekIdx} className="h-[11px] w-[11px] rounded-[2px]" />
                  }
                  const cellData = data[cell.date]
                  const intensity = cellData?.intensity
                  const amount = cellData?.amount ?? 0
                  return (
                    <Tooltip key={weekIdx}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "h-[11px] w-[11px] rounded-[2px] cursor-pointer transition-colors",
                            getIntensityClass(intensity)
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">${amount.toLocaleString()}</p>
                        <p className="text-muted-foreground">{cell.date}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3 pt-3 border-t border-border">
        <span className="text-[10px] text-muted-foreground mr-1">Less</span>
        <div className="h-[11px] w-[11px] rounded-[2px] bg-secondary/40" />
        <div className="h-[11px] w-[11px] rounded-[2px] bg-emerald-300/50 dark:bg-emerald-500/30" />
        <div className="h-[11px] w-[11px] rounded-[2px] bg-emerald-400/70 dark:bg-emerald-500/50" />
        <div className="h-[11px] w-[11px] rounded-[2px] bg-emerald-500 dark:bg-emerald-500/80" />
        <div className="h-[11px] w-[11px] rounded-[2px] bg-emerald-700 dark:bg-emerald-400" />
        <span className="text-[10px] text-muted-foreground ml-1">More</span>
      </div>
    </TooltipProvider>
  )
}

/* ---------- 3D Isometric Heatmap ---------- */
import dynamic from "next/dynamic"

const Scene3D = dynamic(() => import("@/components/heatmap-3d-scene").then(m => ({ default: m.Heatmap3DScene })), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full flex items-center justify-center bg-secondary/10 rounded-lg">
      <p className="text-sm text-muted-foreground">Loading 3D view...</p>
    </div>
  ),
})

function Heatmap3D({
  data,
  weeks,
  stats,
}: {
  data: Record<string, { amount: number; intensity: string }>
  weeks: { date: string; dayOfWeek: number }[][]
  stats: ReturnType<typeof computeStats>
}) {
  return (
    <div className="relative">
      {/* Stats overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none p-4">
        <div className="flex flex-col justify-between h-full">
          {/* Top-right stats */}
          <div className="flex justify-end">
            <div className="text-right space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">1 year total</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 leading-tight">
                  ${stats.totalSpending.toLocaleString()}
                  <span className="text-xs font-normal text-muted-foreground ml-1">spent</span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatFullDate(stats.firstDate ?? '')} &mdash; {formatFullDate(stats.lastDate ?? '')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Busiest day</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 leading-tight">
                  ${stats.busiestDay.amount.toLocaleString()}
                  <span className="text-xs font-normal text-muted-foreground ml-1">spent</span>
                </p>
                <p className="text-[10px] text-muted-foreground">{formatShortDate(stats.busiestDay.date)}</p>
              </div>
            </div>
          </div>

          {/* Bottom-left stats */}
          <div className="flex justify-start">
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Longest streak</p>
                <p className="text-xl font-bold text-foreground leading-tight">
                  {stats.longestStreak.days}
                  <span className="text-xs font-normal text-muted-foreground ml-1">days</span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatShortDate(stats.longestStreak.start)} &mdash; {formatShortDate(stats.longestStreak.end)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current streak</p>
                <p className="text-xl font-bold text-foreground leading-tight">
                  {stats.currentStreak.days}
                  <span className="text-xs font-normal text-muted-foreground ml-1">days</span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatShortDate(stats.currentStreak.start)} &mdash; {formatShortDate(stats.currentStreak.end)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Scene3D data={data} weeks={weeks} />
    </div>
  )
}

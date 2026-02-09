'use client'

import { useState, useMemo, useCallback } from 'react'
import useSWR from 'swr'
import {
  Download,
  FileText,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info,
  DollarSign,
  PiggyBank,
  Percent,
  CreditCard,
  Tag,
  BarChart3,
  PieChartIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Sector,
  Area,
  AreaChart,
  ReferenceLine,
  ComposedChart,
} from 'recharts'
import { cn } from '@/lib/utils'
import { parseDateString } from '@/lib/calendar-utils'
import { SpendingHeatmap } from '@/components/spending-heatmap'

import { getReports, type ReportsData } from '@/lib/services/reports'

const CHART_COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#eab308', '#a855f7', '#6b7280']

// Active shape for pie chart hover - matching dashboard style
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
  value: number
  percent: number
}

const renderActiveShape = (props: ActiveShapeProps) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props

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
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        fill="#ffffff"
        className="text-xs font-medium"
        style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fill="#ffffff"
        className="text-sm font-semibold"
        style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}
      >
        ${value.toLocaleString()}
      </text>
    </g>
  )
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<'date' | 'amount' | 'merchant' | 'category' | 'payment'>('amount')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [trendPeriod, setTrendPeriod] = useState<'7D' | '30D' | '3M' | '1Y'>('30D')
  const [profitLossPeriod, setProfitLossPeriod] = useState<'7D' | '30D' | '3M' | '1Y'>('30D')
  const [activePieIndex, setActivePieIndex] = useState<number | undefined>(undefined)
  const [selectedCategory, setSelectedCategory] = useState<string>('Food')

  const { data, isLoading } = useSWR<ReportsData>('reports', getReports)

  const onPieEnter = useCallback((_: unknown, index: number) => setActivePieIndex(index), [])
  const onPieLeave = useCallback(() => setActivePieIndex(undefined), [])

  const resetFilters = () => {
    setDateRange('month')
    setCategoryFilter('all')
    setPaymentFilter('all')
    setSearchQuery('')
  }

  const stats = data?.stats ?? {
    totalIncome: 0, totalExpenses: 0, netSavings: 0, savingsRate: 0,
    avgDailySpend: 0, highestCategory: '-', incomeChange: 0, expenseChange: 0, savingsChange: 0,
  }
  const categoryDistribution = data?.categoryDistribution ?? []
  const spendingTrend = data?.spendingTrend ?? {}
  const profitLossTrend = data?.profitLossTrend ?? {}
  const incomeVsExpenses = data?.incomeVsExpenses ?? []
  const budgetComparison = data?.budgetComparison ?? []
  const insights = data?.insights ?? []
  const suggestions = data?.suggestions ?? []
  const categoryDrilldown = data?.categoryDrilldown ?? {}
  const topTransactions = data?.topTransactions ?? []
  const heatmapData: Record<string, { amount: number; intensity: string }> = data?.heatmapData ?? {}

  const filteredTransactions = useMemo(() => {
    let result = [...topTransactions]
    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category.toLowerCase() === categoryFilter.toLowerCase())
    }
    if (paymentFilter !== 'all') {
      result = result.filter((t) => t.payment.toLowerCase() === paymentFilter.toLowerCase())
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((t) => t.merchant.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      if (sortField === 'date') {
        return sortOrder === 'asc' ? parseDateString(a.date).getTime() - parseDateString(b.date).getTime() : parseDateString(b.date).getTime() - parseDateString(a.date).getTime()
      }
      if (sortField === 'merchant' || sortField === 'category' || sortField === 'payment') {
        const aVal = a[sortField].toLowerCase()
        const bVal = b[sortField].toLowerCase()
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
    })
    return result
  }, [topTransactions, categoryFilter, paymentFilter, searchQuery, sortField, sortOrder])

  const toggleSort = (field: 'date' | 'amount' | 'merchant' | 'category' | 'payment') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const drilldownData = categoryDrilldown[selectedCategory]

  if (isLoading || !data) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Analyze your spending and track your financial health</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px] h-9">
              <Calendar className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom</SelectItem>
              <SelectItem value="3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="bills">Bills</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="fuel">Fuel</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="bank transfer">Bank Transfer</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={resetFilters} className="h-9 bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <div className="flex items-center gap-1 border-l border-border pl-2 ml-1">
            <Button variant="outline" size="sm" className="h-9 bg-transparent">
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" className="h-9 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" className="h-9 bg-transparent">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {/* Total Income */}
        <Card className="group relative overflow-hidden border-border bg-gradient-to-br from-emerald-500/5 to-transparent hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Income</span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">${stats.totalIncome.toLocaleString()}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge variant="secondary" className={cn("text-xs", stats.incomeChange >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>
                {stats.incomeChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {stats.incomeChange >= 0 ? '+' : ''}{stats.incomeChange}%
              </Badge>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Expense */}
        <Card className="group relative overflow-hidden border-border bg-gradient-to-br from-rose-500/5 to-transparent hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/20 transition-colors" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Expense</span>
              <div className="h-9 w-9 rounded-xl bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="h-4 w-4 text-rose-500" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">${stats.totalExpenses.toLocaleString()}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge variant="secondary" className={cn("text-xs", stats.expenseChange <= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>
                {stats.expenseChange <= 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                {stats.expenseChange}%
              </Badge>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Net Savings */}
        <Card className="group relative overflow-hidden border-border bg-gradient-to-br from-blue-500/5 to-transparent hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Net Savings</span>
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PiggyBank className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-blue-500">+${stats.netSavings.toLocaleString()}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600">
                <TrendingUp className="h-3 w-3 mr-1" />+{stats.savingsChange}%
              </Badge>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Savings Rate */}
        <Card className="group relative overflow-hidden border-border bg-gradient-to-br from-violet-500/5 to-transparent hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-violet-500/20 transition-colors" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Savings Rate</span>
              <div className="h-9 w-9 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Percent className="h-4 w-4 text-violet-500" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{stats.savingsRate}%</p>
            <div className="mt-2">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${stats.savingsRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg Daily Spend */}
        <Card className="group relative overflow-hidden border-border bg-gradient-to-br from-amber-500/5 to-transparent hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-colors" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Daily Spend</span>
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="h-4 w-4 text-amber-500" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">${stats.avgDailySpend.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">Based on 30 days</p>
          </CardContent>
        </Card>

        {/* Highest Category */}
        <Card className="group relative overflow-hidden border-border bg-gradient-to-br from-pink-500/5 to-transparent hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-pink-500/20 transition-colors" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Top Category</span>
              <div className="h-9 w-9 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Tag className="h-4 w-4 text-pink-500" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{stats.highestCategory}</p>
            <p className="text-xs text-muted-foreground mt-2">$5,800 this month</p>
          </CardContent>
        </Card>

        {/* Month-over-Month Change */}
        <Card className="group relative overflow-hidden border-border bg-gradient-to-br from-cyan-500/5 to-transparent hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-colors" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">MoM Change</span>
              <div className="h-9 w-9 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-4 w-4 text-cyan-500" />
              </div>
            </div>
            <p className={cn("text-2xl font-bold tracking-tight", stats.savingsChange >= 0 ? "text-emerald-500" : "text-rose-500")}>
              {stats.savingsChange >= 0 ? '+' : ''}{stats.savingsChange}%
            </p>
            <p className="text-xs text-muted-foreground mt-2">Net savings growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Profit/Loss Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Net Profit/Loss Trend Line Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Net Profit/Loss Trend</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Track your profit above and loss below the breakeven line</p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
                {(['7D', '30D', '3M', '1Y'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setProfitLossPeriod(period)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      profitLossPeriod === period ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={profitLossTrend[profitLossPeriod] || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lossGradient" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = { income: 'Income', expense: 'Expense', netProfitLoss: 'Net P/L' }
                      return [`$${value.toLocaleString()}`, labels[name] || name]
                    }}
                  />
                  <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="5 5" strokeWidth={2} label={{ value: 'Breakeven', position: 'right', fill: 'var(--muted-foreground)', fontSize: 10 }} />
                  <Area type="monotone" dataKey="netProfitLoss" stroke="none" fill="url(#profitGradient)" baseLine={0} />
                  <Line type="monotone" dataKey="netProfitLoss" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Profit (above 0)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="text-xs text-muted-foreground">Loss (below 0)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-4 border-t-2 border-dashed border-muted-foreground" />
                <span className="text-xs text-muted-foreground">Breakeven</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Profit vs Loss Bar Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Monthly Profit vs Loss</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Breakeven = 0 (horizontal line)</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsExpenses} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <filter id="glow-profit-bar" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="glow-loss-bar" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    cursor={{ fill: 'var(--muted)', opacity: 0.15, radius: 4 }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        const netProfit = data.netProfit
                        const isPositive = netProfit >= 0
                        return (
                          <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-xl shadow-xl p-4 min-w-[200px]">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                              <div className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center",
                                isPositive ? "bg-emerald-500/20" : "bg-rose-500/20"
                              )}>
                                {isPositive ? (
                                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-rose-500" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{label}</p>
                                <p className="text-xs text-muted-foreground">{isPositive ? 'Profitable' : 'Loss'} Month</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                  <span className="text-sm text-muted-foreground">Income</span>
                                </div>
                                <span className="text-sm font-medium text-emerald-500">${data.income?.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-rose-500" />
                                  <span className="text-sm text-muted-foreground">Expenses</span>
                                </div>
                                <span className="text-sm font-medium text-rose-500">${data.expenses?.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
                                <div className="flex items-center gap-2">
                                  <div className={cn("h-2 w-2 rounded-full", isPositive ? "bg-emerald-500" : "bg-rose-500")} />
                                  <span className="text-sm font-medium text-foreground">Net Profit</span>
                                </div>
                                <span className={cn("text-sm font-bold", isPositive ? "text-emerald-500" : "text-rose-500")}>
                                  {isPositive ? '+' : ''}${netProfit?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="5 5" strokeWidth={2} />
                  <Bar 
                    dataKey="netProfit" 
                    radius={[4, 4, 0, 0]} 
                    animationDuration={300}
                    style={{ transition: 'filter 0.2s ease-out, opacity 0.2s ease-out' }}
                    onMouseEnter={(data, index, e) => {
                      if (e?.target) {
                        const target = e.target as SVGElement
                        const isPositive = data.netProfit >= 0
                        target.style.filter = `url(#${isPositive ? 'glow-profit-bar' : 'glow-loss-bar'}) brightness(1.2)`
                        target.style.opacity = '1'
                      }
                    }}
                    onMouseLeave={(data, index, e) => {
                      if (e?.target) {
                        const target = e.target as SVGElement
                        target.style.filter = 'none'
                        target.style.opacity = '0.85'
                      }
                    }}
                  >
                    {incomeVsExpenses.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.netProfit >= 0 ? '#22c55e' : '#ef4444'} 
                        style={{ cursor: 'pointer', opacity: 0.85 }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Profit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-rose-500" />
                <span className="text-xs text-muted-foreground">Loss</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spending Trend Line Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Spending Trend</CardTitle>
              <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
                {(['7D', '30D', '3M', '1Y'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTrendPeriod(period)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      trendPeriod === period ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingTrend[trendPeriod] || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spent']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fill="url(#spendGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense by Category Donut Chart - matching dashboard style */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Expense Categories</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Distribution of expenses by category</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      activeIndex={activePieIndex}
                      activeShape={renderActiveShape}
                      data={categoryDistribution}
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
                      {categoryDistribution.map((entry, index) => (
                        <Cell 
                          key={entry.name} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          style={{
                            cursor: 'pointer',
                            transition: 'opacity 0.2s ease-out',
                            opacity: activePieIndex === undefined || activePieIndex === index ? 1 : 0.5,
                          }}
                        />
                      ))}
                    </Pie>
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {categoryDistribution.map((item, index) => {
                  const total = categoryDistribution.reduce((s, i) => s + i.value, 0)
                  const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
                  return (
                    <div 
                      key={item.name} 
                      className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
                      style={{
                        opacity: activePieIndex === undefined || activePieIndex === index ? 1 : 0.5,
                      }}
                      onMouseEnter={() => setActivePieIndex(index)}
                      onMouseLeave={() => setActivePieIndex(undefined)}
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0 transition-transform duration-200"
                        style={{ 
                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                          transform: activePieIndex === index ? 'scale(1.3)' : 'scale(1)',
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
        </Card>
      </div>

      {/* Category Drilldown Section */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Category Drilldown</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Deep dive into spending by category</p>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(categoryDrilldown).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        {drilldownData && (
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Weekly Trend */}
              <div>
                <h4 className="text-sm font-medium mb-3">Weekly Trend</h4>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={drilldownData.weeklyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px' }} formatter={(v: number) => [`$${v}`, 'Spent']} />
                      <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Top Merchants */}
              <div>
                <h4 className="text-sm font-medium mb-3">Top Merchants</h4>
                <div className="space-y-2">
                  {drilldownData.topMerchants.map((m, i) => (
                    <div key={m.name} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-muted-foreground w-5">{i + 1}</span>
                        <span className="text-sm font-medium">{m.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${m.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{m.count} txns</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-xl font-bold">${drilldownData.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">${drilldownData.avgTransaction.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Avg Transaction</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Budget Comparison moved here to make more balanced layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Budget vs Actual - Now full row  */}
        <Card className="border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Budget vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetComparison.map((item) => {
                const isOver = item.progress > 100
                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">${item.spent.toLocaleString()} / ${item.budgeted.toLocaleString()}</span>
                        <Badge variant={isOver ? "destructive" : "secondary"} className={cn("text-xs min-w-[50px] justify-center", !isOver && "bg-emerald-500/10 text-emerald-600")}>
                          {item.progress}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", isOver ? "bg-rose-500" : "bg-emerald-500")}
                        style={{ width: `${Math.min(item.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Insights Card */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.slice(0, 4).map((insight) => (
                <div key={insight.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/30">
                  {insight.type === 'positive' && <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />}
                  {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />}
                  {insight.type === 'info' && <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />}
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions Section */}
      <Card className="border-border bg-gradient-to-br from-amber-500/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Savings Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((sug) => (
              <div key={sug.id} className="p-3 rounded-xl bg-background/50 border border-border hover:border-amber-500/30 transition-colors">
                <p className="text-sm text-foreground">{sug.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Transactions Table */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold">Top Transactions</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] h-9 bg-secondary/50 border-0">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="bills">Bills</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="fuel">Fuel</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[160px] h-9 bg-secondary/50 border-0">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="bank transfer">Bank Transfer</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search transactions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 bg-secondary/50 border-0" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px]">
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('date')}>
                    Date <ArrowUpDown className={cn("h-3 w-3", sortField === 'date' && "text-foreground")} />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('merchant')}>
                    Merchant <ArrowUpDown className={cn("h-3 w-3", sortField === 'merchant' && "text-foreground")} />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('category')}>
                    Category <ArrowUpDown className={cn("h-3 w-3", sortField === 'category' && "text-foreground")} />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('payment')}>
                    Payment <ArrowUpDown className={cn("h-3 w-3", sortField === 'payment' && "text-foreground")} />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button className="flex items-center gap-1 ml-auto hover:text-foreground" onClick={() => toggleSort('amount')}>
                    Amount <ArrowUpDown className={cn("h-3 w-3", sortField === 'amount' && "text-foreground")} />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.slice(0, 10).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-xs text-muted-foreground">{t.date}</TableCell>
                  <TableCell className="font-medium">{t.merchant}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{t.category}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.payment}</TableCell>
                  <TableCell className="text-right font-semibold text-rose-500">-${t.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Showing {Math.min(10, filteredTransactions.length)} of {filteredTransactions.length} transactions</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" disabled><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" disabled><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spending Heatmap */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Spending Heatmap</CardTitle>
          <p className="text-xs text-muted-foreground">Daily spending intensity over the past year</p>
        </CardHeader>
        <CardContent>
          <SpendingHeatmap data={heatmapData} />
        </CardContent>
      </Card>
    </div>
  )
}

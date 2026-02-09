'use client'

import React from "react"
import { useState, useCallback } from 'react'
import useSWR, { mutate } from 'swr'
import { Sparkles, Pencil, ChevronDown, Calendar, Filter, Plus, Download, Search, Info, X, Loader2, AlertCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CategoryChart } from '@/components/category-chart'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { parseDateString } from '@/lib/calendar-utils'
import { ExpenseForm, EXPENSE_STATUS_OPTIONS } from '@/components/expenses/ExpenseForm'
import { useToast } from '@/hooks/use-toast'
import { getPaymentMethodById } from '@/lib/services/expense-service'
import type { ExpenseCreatePayload, ExpenseUpdatePayload } from '@/types/expense'
import {
  listExpenses,
  listCategories,
  createExpense as createExpenseAPI,
  updateExpense as updateExpenseAPI,
  type Expense,
  type Category,
} from '@/lib/services/expenses'

// Helper function for case-insensitive alphabetical sorting
const sortAlphabetically = <T extends { name?: string; label?: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const nameA = (a.name || a.label || '').toLowerCase()
    const nameB = (b.name || b.label || '').toLowerCase()
    return nameA.localeCompare(nameB)
  })
}

// SWR fetcher functions
const expensesFetcher = () => listExpenses()
const categoriesFetcher = () => listCategories()

export default function ExpensesPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [dateRangeOpen, setDateRangeOpen] = useState(false)
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // API-driven data fetching with SWR
  const { data: expenses = [], error: expensesError, isLoading: expensesLoading } = useSWR('expenses', expensesFetcher)
  const { data: categories = [], error: categoriesError, isLoading: categoriesLoading } = useSWR('categories', categoriesFetcher)
  
  const { toast } = useToast()

  const isLoading = expensesLoading || categoriesLoading
  const hasError = expensesError || categoriesError

  const filteredExpenses = expenses.filter((e) => {
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    
    // Date range filter - compare date strings directly (YYYY-MM-DD format)
    let matchesDateRange = true
    if (dateRange.from || dateRange.to) {
      const expenseDateStr = e.date // Already in YYYY-MM-DD format
      const fromStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null
      const toStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null
      
      if (fromStr && toStr) {
        matchesDateRange = expenseDateStr >= fromStr && expenseDateStr <= toStr
      } else if (fromStr) {
        matchesDateRange = expenseDateStr >= fromStr
      } else if (toStr) {
        matchesDateRange = expenseDateStr <= toStr
      }
    }
    
    return matchesCategory && matchesSearch && matchesDateRange && matchesStatus
  })

  const clearDateRange = () => {
    setDateRange({ from: undefined, to: undefined })
  }

  const clearAllFilters = () => {
    setCategoryFilter('all')
    setStatusFilter('all')
    setSearchQuery('')
    setDateRange({ from: undefined, to: undefined })
  }

  const hasDateRange = dateRange.from || dateRange.to
  const hasAnyFilter = hasDateRange || categoryFilter !== 'all' || searchQuery !== '' || statusFilter !== 'all'

  // Selection handlers
  const toggleExpenseSelection = (id: string) => {
    setSelectedExpenseIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleAllSelection = () => {
    if (selectedExpenseIds.size === filteredExpenses.length) {
      setSelectedExpenseIds(new Set())
    } else {
      setSelectedExpenseIds(new Set(filteredExpenses.map(e => e.id)))
    }
  }

  const isAllSelected = filteredExpenses.length > 0 && selectedExpenseIds.size === filteredExpenses.length
  const isSomeSelected = selectedExpenseIds.size > 0 && selectedExpenseIds.size < filteredExpenses.length

  // Export function
  const handleExport = () => {
    const expensesToExport = selectedExpenseIds.size > 0
      ? filteredExpenses.filter(e => selectedExpenseIds.has(e.id))
      : filteredExpenses
    
    // Create CSV content
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Status']
    const rows = expensesToExport.map(e => [
      e.date,
      `"${e.description.replace(/"/g, '""')}"`,
      getCategoryName(e.category),
      e.amount.toFixed(2),
      e.paymentMethod,
      e.status || 'N/A'
    ])
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    
    toast({
      title: 'Export successful',
      description: `Exported ${expensesToExport.length} expense${expensesToExport.length !== 1 ? 's' : ''} to CSV`,
    })
  }

  // Get the earliest and latest expense dates to set calendar default month
  const expenseDateRange = React.useMemo(() => {
    if (expenses.length === 0) return { earliest: new Date(), latest: new Date() }
    const dates = expenses.map(e => parseDateString(e.date))
    const sorted = dates.sort((a, b) => a.getTime() - b.getTime())
    return { earliest: sorted[0], latest: sorted[sorted.length - 1] }
  }, [expenses])

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId
  }

  const handleAddExpense = () => {
    setSelectedExpense(null)
    setFormMode('create')
    setFormOpen(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense)
    setFormMode('edit')
    setFormOpen(true)
  }

  const handleFormSubmit = useCallback(async (data: ExpenseCreatePayload | ExpenseUpdatePayload) => {
    try {
      // Convert new payload format to API format
      const paymentMethod = getPaymentMethodById((data as ExpenseCreatePayload).paymentMethodId)
      
      const apiData = {
        date: data.date || '',
        description: data.description || '',
        category: (data as ExpenseCreatePayload).categoryId || '',
        amount: data.amount || 0,
        paymentMethod: paymentMethod?.name || 'Credit Card',
        status: (data as ExpenseCreatePayload).status || ((data as ExpenseCreatePayload).isPaid ? 'paid' : 'pending'),
        source: 'manual' as const,
      }

      if (formMode === 'create') {
        await createExpenseAPI(apiData)
        toast({
          title: 'Expense added',
          description: `Successfully added expense for $${apiData.amount.toFixed(2)}`,
        })
      } else if (selectedExpense) {
        await updateExpenseAPI(selectedExpense.id, apiData)
        toast({
          title: 'Expense updated',
          description: 'Successfully updated expense details',
        })
      }
      
      // Revalidate the expenses data
      mutate('expenses')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save expense. Please try again.',
        variant: 'destructive',
      })
      throw error
    }
  }, [formMode, selectedExpense, toast])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading expenses...</p>
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Failed to load expenses. Please try again.</p>
        <Button variant="outline" onClick={() => { mutate('expenses'); mutate('categories'); }}>
          Retry
        </Button>
      </div>
    )
  }

  // Empty state
  if (expenses.length === 0) {
    return (
      <TooltipProvider>
        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
              <p className="text-muted-foreground">Manage and categorize all your business expenses</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddExpense}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
          
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="rounded-full bg-muted p-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No expenses yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Start tracking your business expenses by adding your first expense or uploading a bank statement.
              </p>
              <Button onClick={handleAddExpense}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Expense
              </Button>
            </CardContent>
          </Card>

          <ExpenseForm
            open={formOpen}
            onOpenChange={setFormOpen}
            mode={formMode}
            expense={selectedExpense}
            onSubmit={handleFormSubmit}
          />
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
            <p className="text-muted-foreground">Manage and categorize all your business expenses</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddExpense}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>

        {/* Top row: 2-column layout - Left: 2x2 summary cards, Right: Category Chart */}
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Left column: 2x2 grid of summary cards */}
          <div className="grid grid-cols-2 gap-4 lg:w-1/2">
            <Card className="bg-card border-border">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Info className="h-3.5 w-3.5" />
                        <span className="sr-only">Info about Total Expenses</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Sum of all expenses in the selected date range and category filter.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-2xl font-bold text-foreground cursor-default">${totalExpenses.toLocaleString()}</p>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{filteredExpenses.length} transactions totaling ${totalExpenses.toLocaleString()}</p>
                  </TooltipContent>
                </Tooltip>
                <p className="mt-1 text-xs text-muted-foreground">{filteredExpenses.length} transactions</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Info className="h-3.5 w-3.5" />
                        <span className="sr-only">Info about This Month</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Total expenses recorded in the current calendar month, compared to the previous month.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-2xl font-bold text-destructive cursor-default">$8,450</p>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Current month spending: $8,450</p>
                  </TooltipContent>
                </Tooltip>
                <p className="mt-1 text-xs text-destructive">+12% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Average per Day</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Info className="h-3.5 w-3.5" />
                        <span className="sr-only">Info about Average per Day</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Average daily spending calculated from the last 30 days of expenses.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-2xl font-bold text-foreground cursor-default">$338</p>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>~$338 average daily spend over 30 days</p>
                  </TooltipContent>
                </Tooltip>
                <p className="mt-1 text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Info className="h-3.5 w-3.5" />
                        <span className="sr-only">Info about Pending Review</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Expenses that are uncategorized or flagged for manual review and categorization.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-2xl font-bold text-warning cursor-default">5</p>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>5 expenses need your attention</p>
                  </TooltipContent>
                </Tooltip>
                <p className="mt-1 text-xs text-muted-foreground">Need categorization</p>
              </CardContent>
            </Card>
          </div>
          {/* Right column: Category Chart */}
          <Card className="bg-card border-border lg:w-1/2">
            <CategoryChart compact={false} showTooltip />
          </Card>
        </div>

        {/* Full-width table section */}
        <Card className="bg-card border-border flex flex-col">
          <CardHeader className="shrink-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-card-foreground">All Expenses</CardTitle>
                <CardDescription>AI-categorized transactions from your accounts</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-[200px] pl-9 bg-secondary/50 border-0"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px] bg-secondary/50 border-0">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {sortAlphabetically(categories).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] bg-secondary/50 border-0">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {EXPENSE_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            status.value === 'paid' ? 'bg-green-500' :
                            status.value === 'pending' ? 'bg-yellow-500' :
                            status.value === 'overdue' ? 'bg-red-500' : 'bg-blue-500'
                          }`} />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`hidden sm:flex bg-transparent ${hasDateRange ? 'border-primary text-primary' : ''}`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {hasDateRange ? (
                        <>
                          {dateRange.from ? format(dateRange.from, 'MMM d, yyyy') : 'Start'}
                          {' - '}
                          {dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : 'End'}
                        </>
                      ) : (
                        'Date Range'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Select Date Range</p>
                        {hasDateRange && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-auto p-1 text-muted-foreground hover:text-foreground"
                            onClick={clearDateRange}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Clear date range</span>
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {hasDateRange 
                          ? `Showing ${filteredExpenses.length} expenses`
                          : `Expenses range: ${format(expenseDateRange.earliest, 'MMM d, yyyy')} - ${format(expenseDateRange.latest, 'MMM d, yyyy')}`
                        }
                      </p>
                    </div>
                    <div className="flex">
                      <div className="border-r border-border">
                        <div className="px-3 py-2 border-b border-border">
                          <p className="text-xs font-medium text-muted-foreground">From</p>
                        </div>
                        <CalendarComponent
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                          defaultMonth={dateRange.from || new Date()}
                          captionLayout="dropdown"
                          startMonth={new Date(2020, 0)}
                          endMonth={new Date(2030, 11)}
                          initialFocus
                          fixedWeeks
                          showOutsideDays
                        />
                      </div>
                      <div>
                        <div className="px-3 py-2 border-b border-border">
                          <p className="text-xs font-medium text-muted-foreground">To</p>
                        </div>
                        <CalendarComponent
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                          defaultMonth={dateRange.to || new Date()}
                          captionLayout="dropdown"
                          startMonth={new Date(2020, 0)}
                          endMonth={new Date(2030, 11)}
                          disabled={(date) => dateRange.from ? date < dateRange.from : false}
                          fixedWeeks
                          showOutsideDays
                        />
                      </div>
                    </div>
                    <div className="p-3 border-t border-border flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-transparent"
                        onClick={() => {
                          clearDateRange()
                          setDateRangeOpen(false)
                        }}
                      >
                        Clear
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => setDateRangeOpen(false)}
                      >
                        Apply
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                {hasAnyFilter && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
                <div className="h-6 w-px bg-border hidden sm:block" />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExport}
                  className="bg-transparent"
                  disabled={filteredExpenses.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export {selectedExpenseIds.size > 0 ? `(${selectedExpenseIds.size})` : `All (${filteredExpenses.length})`}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <div className="rounded-lg border border-border overflow-auto max-h-[calc(100vh-420px)]">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/50 z-10">
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) {
                            (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = isSomeSelected
                          }
                        }}
                        onCheckedChange={toggleAllSelection}
                        aria-label="Select all expenses"
                      />
                    </TableHead>
                    <TableHead className="text-muted-foreground whitespace-nowrap">Date</TableHead>
                    <TableHead className="text-muted-foreground whitespace-nowrap min-w-[200px]">Description</TableHead>
                    <TableHead className="text-muted-foreground whitespace-nowrap">Category</TableHead>
                    <TableHead className="text-muted-foreground whitespace-nowrap">Amount</TableHead>
                    <TableHead className="text-muted-foreground whitespace-nowrap">Payment</TableHead>
                    <TableHead className="text-muted-foreground whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id} className={`hover:bg-muted/30 ${selectedExpenseIds.has(expense.id) ? 'bg-muted/20' : ''}`}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedExpenseIds.has(expense.id)}
                          onCheckedChange={() => toggleExpenseSelection(expense.id)}
                          aria-label={`Select expense ${expense.description}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-foreground whitespace-nowrap">
                        {parseDateString(expense.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-foreground">{expense.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-auto p-1 hover:bg-transparent">
                                <Badge variant="secondary" className="cursor-pointer">
                                  {getCategoryName(expense.category)}
                                  <ChevronDown className="ml-1 h-3 w-3" />
                                </Badge>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {categories.map((cat) => (
                                <DropdownMenuItem key={cat.id}>{cat.name}</DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {expense.aiSuggested && (
                            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                              <Sparkles className="mr-1 h-3 w-3" />
                              {expense.confidence}%
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-destructive whitespace-nowrap">
                        -${expense.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{expense.paymentMethod}</TableCell>
                      <TableCell>
                        {(() => {
                          const statusOption = EXPENSE_STATUS_OPTIONS.find(s => s.value === expense.status) || EXPENSE_STATUS_OPTIONS.find(s => s.value === 'pending')
                          return (
                            <Badge variant="outline" className={statusOption?.color}>
                              {statusOption?.label || 'Pending'}
                            </Badge>
                          )
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditExpense(expense)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <ExpenseForm
          open={formOpen}
          onOpenChange={setFormOpen}
          mode={formMode}
          expense={selectedExpense}
          onSubmit={handleFormSubmit}
        />
      </div>
    </TooltipProvider>
  )
}

'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Sparkles, Pencil, ChevronDown, Calendar, Filter, Plus, Download, Search } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Expense {
  id: string
  date: string
  description: string
  category: string
  amount: number
  paymentMethod: string
  aiSuggested: boolean
  confidence: number
  status: string
}

interface Category {
  id: string
  name: string
  code: string
}

interface ExpensesData {
  expenses: Expense[]
  categories: Category[]
}

export default function ExpensesPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useSWR<ExpensesData>('/api/expenses', fetcher)

  const expenses = data?.expenses || []
  const categories = data?.categories || []

  const filteredExpenses = expenses.filter((e) => {
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId
  }

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
                <Skeleton className="h-4 w-24 mb-2" />
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
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground">Manage and categorize all your business expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-3xl font-bold text-foreground">${totalExpenses.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">{filteredExpenses.length} transactions</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-3xl font-bold text-destructive">$8,450</p>
            <p className="mt-1 text-xs text-destructive">+12% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Average per Day</p>
            <p className="text-3xl font-bold text-foreground">$338</p>
            <p className="mt-1 text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-3xl font-bold text-warning">5</p>
            <p className="mt-1 text-xs text-muted-foreground">Need categorization</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-card-foreground">All Expenses</CardTitle>
                  <CardDescription>AI-categorized transactions from your accounts</CardDescription>
                </div>
                <div className="flex items-center gap-2">
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
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
                    <Calendar className="mr-2 h-4 w-4" />
                    Date Range
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Description</TableHead>
                      <TableHead className="text-muted-foreground">Category</TableHead>
                      <TableHead className="text-muted-foreground">Amount</TableHead>
                      <TableHead className="text-muted-foreground">Payment</TableHead>
                      <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-foreground">
                          {new Date(expense.date).toLocaleDateString('en-US', {
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
                        <TableCell className="font-medium text-destructive">
                          -${expense.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{expense.paymentMethod}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
        </div>
        <CategoryChart />
      </div>
    </div>
  )
}

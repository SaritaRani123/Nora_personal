'use client'

import { useState } from 'react'
import { Sparkles, Pencil, ChevronDown, Calendar, Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { parseDateString } from '@/lib/calendar-utils'
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
import { expenses, categories } from '@/lib/mock-data'

const statusConfig = {
  paid: { label: 'Paid', icon: CheckCircle2, color: 'text-success bg-success/10' },
  pending: { label: 'Pending', icon: Clock, color: 'text-chart-4 bg-chart-4/10' },
  overdue: { label: 'Overdue', icon: AlertCircle, color: 'text-destructive bg-destructive/10' },
}

export function ExpenseTable() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredExpenses = categoryFilter === 'all' 
    ? expenses 
    : expenses.filter(e => e.category === categoryFilter)

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-card-foreground">Recent Expenses</CardTitle>
            <CardDescription>AI-categorized transactions from your accounts</CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Payment Method</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground">
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
                          AI {expense.confidence}%
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-destructive">
                    -${expense.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const status = statusConfig[expense.status as keyof typeof statusConfig]
                      const Icon = status.icon
                      return (
                        <Badge className={`${status.color} border-0 gap-1`}>
                          <Icon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      )
                    })()}
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
  )
}

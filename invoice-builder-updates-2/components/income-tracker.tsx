'use client'

import { Plus, ArrowUpRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { income } from '@/lib/mock-data'

export function IncomeTracker() {
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-card-foreground">Income Tracker</CardTitle>
            <CardDescription>Track and manage your business income</CardDescription>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Income
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-primary/10 p-4">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold text-foreground">${totalIncome.toLocaleString()}</p>
            <div className="mt-1 flex items-center gap-1 text-xs text-primary">
              <ArrowUpRight className="h-3 w-3" />
              +12.5% from last month
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">This Year</p>
            <p className="text-2xl font-bold text-foreground">$142,500</p>
            <div className="mt-1 flex items-center gap-1 text-xs text-primary">
              <ArrowUpRight className="h-3 w-3" />
              +24.3% from last year
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Average Monthly</p>
            <p className="text-2xl font-bold text-foreground">$11,875</p>
            <p className="mt-1 text-xs text-muted-foreground">Based on 12 months</p>
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Description</TableHead>
                <TableHead className="text-muted-foreground">Source</TableHead>
                <TableHead className="text-right text-muted-foreground">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {income.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-foreground">{item.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.source}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    +${item.amount.toLocaleString()}
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

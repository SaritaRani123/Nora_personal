'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { budgetData } from '@/lib/mock-data'

export function BudgetOverview() {
  const percentSpent = (budgetData.spent / budgetData.totalBudget) * 100
  const remaining = budgetData.totalBudget - budgetData.spent

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Budget Overview</CardTitle>
        <CardDescription>Expense budget for {budgetData.year}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Budget</span>
            <span className="font-medium text-foreground">${budgetData.totalBudget.toLocaleString()}</span>
          </div>
          <Progress value={percentSpent} className="h-3" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Spent: <span className="text-destructive">${budgetData.spent.toLocaleString()}</span>
            </span>
            <span className="text-muted-foreground">
              Remaining: <span className="text-primary">${remaining.toLocaleString()}</span>
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">By Category</h4>
          {budgetData.categories.map((cat) => {
            const percent = (cat.spent / cat.budget) * 100
            const isOverBudget = percent > 90
            
            return (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{cat.name}</span>
                  <span className="text-muted-foreground">
                    ${cat.spent.toLocaleString()} / ${cat.budget.toLocaleString()}
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all ${
                      isOverBudget ? 'bg-destructive' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="rounded-lg bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Net Profit/Loss</p>
              <p className="text-xs text-muted-foreground">Based on income vs expenses</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">+$54,050</p>
              <p className="text-xs text-muted-foreground">Year to date</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

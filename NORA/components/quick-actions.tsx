'use client'

import { Plus, Upload, FileText, Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const actions = [
  {
    title: 'Add Expense',
    description: 'Record a new expense',
    icon: Plus,
    variant: 'default' as const,
  },
  {
    title: 'Upload Statement',
    description: 'Import bank statement',
    icon: Upload,
    variant: 'secondary' as const,
  },
  {
    title: 'Generate Report',
    description: 'Create financial report',
    icon: FileText,
    variant: 'secondary' as const,
  },
  {
    title: 'Calculate Tax',
    description: 'Estimate tax obligations',
    icon: Calculator,
    variant: 'secondary' as const,
  },
]

export function QuickActions() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              className={`h-auto w-full flex-col items-center justify-center gap-2 p-4 text-center ${
                action.variant === 'default' 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              <action.icon className="h-5 w-5 shrink-0" />
              <div className="flex flex-col gap-0.5 w-full">
                <span className="text-sm font-medium truncate">{action.title}</span>
                <span className={`text-xs truncate ${action.variant === 'default' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {action.description}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

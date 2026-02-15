'use client'

import * as React from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface DateRangeFilterProps {
  fromDate: string
  toDate: string
  onFromDateChange: (value: string) => void
  onToDateChange: (value: string) => void
  title?: string
  description?: string
}

export function DateRangeFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  title = 'Filter by Date',
  description = 'Select a date range to filter',
}: DateRangeFilterProps) {
  const idFrom = React.useId()
  const idTo = React.useId()
  const hasRange = Boolean(fromDate || toDate)

  const clearDates = () => {
    onFromDateChange('')
    onToDateChange('')
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="bg-transparent">
          <Calendar className="mr-2 h-4 w-4" />
          Date Range
          {hasRange && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              1
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor={idFrom} className="text-xs">From Date</Label>
              <Input
                id={idFrom}
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => onFromDateChange(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={idTo} className="text-xs">To Date</Label>
              <Input
                id={idTo}
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => onToDateChange(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          {hasRange && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearDates}
              className="w-full bg-transparent"
            >
              Clear Dates
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

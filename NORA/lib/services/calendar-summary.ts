import { apiFetch } from '@/lib/api/http'

export interface CalendarSummary {
  workDone: number
  expenses: number
  income: number
  hoursWorked: number
  net: number
}

export async function fetchCalendarSummary(
  from: string,
  to: string
): Promise<CalendarSummary> {
  const params = new URLSearchParams({ from, to })
  const body = await apiFetch(`/stats/calendar-summary?${params.toString()}`)
  return {
    workDone: Number((body as CalendarSummary).workDone) || 0,
    expenses: Number((body as CalendarSummary).expenses) || 0,
    income: Number((body as CalendarSummary).income) || 0,
    hoursWorked: Number((body as CalendarSummary).hoursWorked) || 0,
    net: Number((body as CalendarSummary).net) || 0,
  }
}

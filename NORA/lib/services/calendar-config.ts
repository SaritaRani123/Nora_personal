import { apiFetch } from '@/lib/api/http'

export interface CalendarEntryType {
  id: string
  label: string
  iconKey: string
  colorKey: string
}

export interface CalendarConfig {
  entryTypes: CalendarEntryType[]
  /** Default rate per km ($) for travel entries. From backend /calendar/config. */
  defaultKmRate: number
  /** Default hourly rate ($) for time entries. From backend /calendar/config. */
  defaultHourlyRate: number
}

export async function fetchCalendarConfig(): Promise<CalendarConfig> {
  const body = await apiFetch('/calendar/config')
  const b = body as {
    entryTypes?: unknown[]
    defaultKmRate?: unknown
    defaultHourlyRate?: unknown
  }
  const raw = b?.entryTypes
  const entryTypes: CalendarEntryType[] = Array.isArray(raw)
    ? raw.map((t: Record<string, unknown>) => ({
        id: String(t?.id ?? ''),
        label: String(t?.label ?? ''),
        iconKey: String(t?.iconKey ?? 'fileText'),
        colorKey: String(t?.colorKey ?? 'muted'),
      }))
    : []
  const defaultKmRate = typeof b?.defaultKmRate === 'number' && b.defaultKmRate >= 0 ? b.defaultKmRate : 0.58
  const defaultHourlyRate = typeof b?.defaultHourlyRate === 'number' && b.defaultHourlyRate >= 0 ? b.defaultHourlyRate : 75
  return { entryTypes, defaultKmRate, defaultHourlyRate }
}

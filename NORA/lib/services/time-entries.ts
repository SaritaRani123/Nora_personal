import { apiFetch, extractArray } from '@/lib/api/http'

export interface TimeEntry {
  id: string
  date: string
  contactId: string
  invoiceItem: string
  description: string
  hourlyRate: number
  durationMinutes: number
  amount: number
  invoiceId: string | null
  timerStartedAt: string | null
}

export interface ListTimeEntriesParams {
  from?: string
  to?: string
  unbilledOnly?: boolean
}

export async function listTimeEntries(params?: ListTimeEntriesParams): Promise<TimeEntry[]> {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  if (params?.unbilledOnly) search.set('unbilledOnly', 'true')
  const qs = search.toString()
  const path = `/time-entries${qs ? `?${qs}` : ''}`
  const body = await apiFetch(path)
  return extractArray<TimeEntry>(body, 'timeEntries')
}

export interface CreateTimeEntryPayload {
  date: string
  contactId: string
  invoiceItem?: string
  description?: string
  hourlyRate: number
  durationMinutes?: number
  amount?: number
  invoiceId?: string | null
  timerStartedAt?: string | null
}

export async function createTimeEntry(payload: CreateTimeEntryPayload): Promise<TimeEntry[]> {
  const body = await apiFetch('/time-entries', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return extractArray<TimeEntry>(body, 'timeEntries')
}

export interface UpdateTimeEntryPayload {
  date?: string
  contactId?: string
  invoiceItem?: string
  description?: string
  hourlyRate?: number
  durationMinutes?: number
  amount?: number
  invoiceId?: string | null
  timerStartedAt?: string | null
}

export async function updateTimeEntry(id: string, payload: UpdateTimeEntryPayload): Promise<TimeEntry[]> {
  const body = await apiFetch(`/time-entries/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return extractArray<TimeEntry>(body, 'timeEntries')
}

export async function deleteTimeEntry(id: string): Promise<void> {
  await apiFetch(`/time-entries/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

/** Mark multiple time entries as invoiced (set invoiceId). */
export async function markTimeEntriesAsInvoiced(ids: string[], invoiceId: string): Promise<void> {
  await Promise.all(ids.map((id) => updateTimeEntry(id, { invoiceId })))
}

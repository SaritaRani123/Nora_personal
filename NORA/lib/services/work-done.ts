import { apiFetch, extractArray } from '@/lib/api/http'

export interface WorkDoneEntry {
  id: string
  date: string
  contact: string
  description: string
  hours: number
  rate: number
  amount: number
  invoiceId: string | null
}

export interface ListWorkDoneParams {
  from?: string
  to?: string
  unbilledOnly?: boolean
}

export async function listWorkDone(params?: ListWorkDoneParams): Promise<WorkDoneEntry[]> {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  if (params?.unbilledOnly) search.set('unbilledOnly', 'true')
  const qs = search.toString()
  const path = `/work-done${qs ? `?${qs}` : ''}`
  const body = await apiFetch(path)
  return extractArray<WorkDoneEntry>(body, 'workDone')
}

export interface CreateWorkDonePayload {
  date: string
  contact: string
  description: string
  hours: number
  rate: number
  amount: number
}

export async function createWorkDone(payload: CreateWorkDonePayload): Promise<WorkDoneEntry[]> {
  const body = await apiFetch('/work-done', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return extractArray<WorkDoneEntry>(body, 'workDone')
}

export async function markWorkDoneAsInvoiced(
  ids: string[],
  invoiceId: string
): Promise<WorkDoneEntry[]> {
  const body = await apiFetch('/work-done/mark-invoiced', {
    method: 'PATCH',
    body: JSON.stringify({ ids, invoiceId }),
  })
  return extractArray<WorkDoneEntry>(body, 'workDone')
}

export async function deleteWorkDone(id: string): Promise<void> {
  await apiFetch(`/work-done/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

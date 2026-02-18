import { apiFetch, extractArray } from '@/lib/api/http'

export interface Meeting {
  id: string
  date: string
  startTime: string
  endTime: string
  contactId: string
  title: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface ListMeetingsParams {
  from?: string
  to?: string
}

export async function listMeetings(params?: ListMeetingsParams): Promise<Meeting[]> {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  const qs = search.toString()
  const path = `/meetings${qs ? `?${qs}` : ''}`
  const body = await apiFetch(path)
  return extractArray<Meeting>(body, 'meetings')
}

export interface CreateMeetingPayload {
  date: string
  startTime?: string
  endTime?: string
  contactId?: string
  title: string
  notes?: string
}

export async function createMeeting(payload: CreateMeetingPayload): Promise<Meeting[]> {
  const body = await apiFetch('/meetings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return extractArray<Meeting>(body, 'meetings')
}

export interface UpdateMeetingPayload {
  date?: string
  startTime?: string
  endTime?: string
  contactId?: string
  title?: string
  notes?: string
}

export async function updateMeeting(id: string, payload: UpdateMeetingPayload): Promise<Meeting[]> {
  const body = await apiFetch(`/meetings/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return extractArray<Meeting>(body, 'meetings')
}

export async function deleteMeeting(id: string): Promise<void> {
  await apiFetch(`/meetings/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

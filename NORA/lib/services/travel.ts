import { apiFetch, extractArray } from '@/lib/api/http'

export interface TravelEntry {
  id: string
  date: string
  fromAddress: string
  toAddress: string
  roundTrip: boolean
  stops: string[]
  billTo: string
  distance: number
  rate: number
  taxes: number
  notes: string
  total: number
}

export interface ListTravelParams {
  from?: string
  to?: string
}

export async function listTravel(params?: ListTravelParams): Promise<TravelEntry[]> {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  const qs = search.toString()
  const path = `/travel${qs ? `?${qs}` : ''}`
  const body = await apiFetch(path)
  return extractArray<TravelEntry>(body, 'travel')
}

export interface CreateTravelPayload {
  date: string
  fromAddress: string
  toAddress: string
  roundTrip: boolean
  stops: string[]
  billTo: string
  distance: number
  rate: number
  taxes?: number
  notes?: string
}

export async function createTravel(payload: CreateTravelPayload): Promise<TravelEntry[]> {
  const body = await apiFetch('/travel', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return extractArray<TravelEntry>(body, 'travel')
}

export interface UpdateTravelPayload {
  date: string
  fromAddress: string
  toAddress: string
  roundTrip: boolean
  stops: string[]
  billTo: string
  distance: number
  rate: number
  taxes?: number
  notes?: string
}

export async function updateTravel(id: string, payload: UpdateTravelPayload): Promise<TravelEntry[]> {
  const body = await apiFetch(`/travel/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return extractArray<TravelEntry>(body, 'travel')
}

export async function deleteTravel(id: string): Promise<void> {
  await apiFetch(`/travel/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

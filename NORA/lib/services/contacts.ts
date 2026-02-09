import { apiFetch, extractArray } from '@/lib/api/http'

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
}

export async function listContacts(): Promise<Contact[]> {
  const body = await apiFetch('/contacts')
  return extractArray<Contact>(body, 'contacts')
}

export async function createContact(payload: { name: string; email: string; phone?: string; address?: string }): Promise<Contact[]> {
  const body = await apiFetch('/contacts', { method: 'POST', body: JSON.stringify(payload) })
  return extractArray<Contact>(body, 'contacts')
}

export async function updateContact(id: string, updates: Partial<Omit<Contact, 'id'>>): Promise<Contact[]> {
  const body = await apiFetch('/contacts', { method: 'PUT', body: JSON.stringify({ id, ...updates }) })
  return extractArray<Contact>(body, 'contacts')
}

export async function deleteContact(id: string): Promise<void> {
  await apiFetch(`/contacts?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}


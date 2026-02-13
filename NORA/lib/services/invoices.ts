import { apiFetch, extractArray } from '@/lib/api/http'

export interface InvoiceLineItem {
  id?: string
  itemType: 'item' | 'hourly'
  item: string
  quantity: number
  unit: string
  hours: number
  minutes: number
  price: number
  taxId: string | null
  description: string
}

export interface Invoice {
  id: string
  client: string
  email: string
  amount: number
  status: 'paid' | 'pending' | 'overdue' | 'draft'
  issueDate: string
  dueDate: string
  paidDate: string | null
  source?: 'manual' | 'calendar'
  template?: 'modern' | 'classic' | 'formal'
  colorPalette?: {
    name: string
    header: string
    accent: string
    tableHeader: string
  }
  invoiceCurrency?: string
  lineItems?: InvoiceLineItem[]
}

export type CreateInvoicePayload = Omit<Invoice, 'id'>
export type UpdateInvoicePayload = Partial<CreateInvoicePayload>

export async function listInvoices(): Promise<Invoice[]> {
  const body = await apiFetch('/invoices')
  return extractArray<Invoice>(body, 'invoices')
}

export async function createInvoice(payload: CreateInvoicePayload): Promise<Invoice[]> {
  const body = await apiFetch('/invoices', { method: 'POST', body: JSON.stringify(payload) })
  return extractArray<Invoice>(body, 'invoices')
}

export async function updateInvoice(id: string, payload: UpdateInvoicePayload): Promise<Invoice[]> {
  const body = await apiFetch(`/invoices/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return extractArray<Invoice>(body, 'invoices')
}

export async function deleteInvoice(id: string): Promise<void> {
  await apiFetch(`/invoices/${encodeURIComponent(id)}`, { method: 'DELETE' })
}


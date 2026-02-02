import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Shared invoices storage that syncs with data store
// This uses a simple in-memory cache that can be updated via POST/PUT/DELETE
let invoicesCache: Invoice[] = [
  {
    id: 'INV-001',
    client: 'ABC Corporation',
    email: 'billing@abccorp.com',
    amount: 5000.0,
    status: 'paid',
    issueDate: '2025-01-10',
    dueDate: '2025-01-25',
    paidDate: '2025-01-20',
  },
  {
    id: 'INV-002',
    client: 'XYZ Ltd',
    email: 'accounts@xyzltd.com',
    amount: 2500.0,
    status: 'pending',
    issueDate: '2025-01-15',
    dueDate: '2025-01-30',
    paidDate: null,
  },
  {
    id: 'INV-003',
    client: 'Tech Innovations Inc',
    email: 'finance@techinnovations.com',
    amount: 3750.0,
    status: 'overdue',
    issueDate: '2024-12-20',
    dueDate: '2025-01-05',
    paidDate: null,
  },
  {
    id: 'INV-004',
    client: 'Global Services Co',
    email: 'payments@globalservices.com',
    amount: 1800.0,
    status: 'draft',
    issueDate: '2025-01-22',
    dueDate: '2025-02-06',
    paidDate: null,
  },
  {
    id: 'INV-005',
    client: 'StartUp Ventures',
    email: 'billing@startupventures.io',
    amount: 4200.0,
    status: 'paid',
    issueDate: '2025-01-05',
    dueDate: '2025-01-20',
    paidDate: '2025-01-18',
  },
]

interface Invoice {
  id: string
  client: string
  email: string
  amount: number
  status: 'paid' | 'pending' | 'overdue' | 'draft'
  issueDate: string
  dueDate: string
  paidDate: string | null
  template?: string
  colorPalette?: {
    name: string
    header: string
    accent: string
    tableHeader: string
  }
}

// Export for use by other modules
export function getInvoicesCache() {
  return invoicesCache
}

export function setInvoicesCache(invoices: Invoice[]) {
  invoicesCache = invoices
}

export function addInvoiceToCache(invoice: Invoice) {
  invoicesCache.unshift(invoice)
}

export function updateInvoiceInCache(id: string, updates: Partial<Invoice>) {
  const index = invoicesCache.findIndex(inv => inv.id === id)
  if (index !== -1) {
    invoicesCache[index] = { ...invoicesCache[index], ...updates }
  }
}

export function deleteInvoiceFromCache(id: string) {
  invoicesCache = invoicesCache.filter(inv => inv.id !== id)
}

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Calculate stats
  const stats = {
    total: invoicesCache.reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoicesCache.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoicesCache.filter((inv) => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: invoicesCache.filter((inv) => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
  }
  
  return NextResponse.json({ invoices: invoicesCache, stats })
}

export async function POST(request: Request) {
  const body = await request.json()
  
  // Generate new invoice ID
  const lastId = invoicesCache.length > 0 
    ? Math.max(...invoicesCache.map(inv => parseInt(inv.id.replace('INV-', '')) || 0))
    : 0
  const newId = body.id || `INV-${String(lastId + 1).padStart(3, '0')}`
  
  const newInvoice: Invoice = {
    id: newId,
    client: body.client,
    email: body.email,
    amount: body.amount,
    status: body.status || 'draft',
    issueDate: body.issueDate || new Date().toISOString().split('T')[0],
    dueDate: body.dueDate,
    paidDate: body.paidDate || null,
    template: body.template,
    colorPalette: body.colorPalette,
  }
  
  invoicesCache.unshift(newInvoice)
  
  return NextResponse.json(newInvoice, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...updates } = body
  
  const index = invoicesCache.findIndex(inv => inv.id === id)
  if (index !== -1) {
    invoicesCache[index] = { ...invoicesCache[index], ...updates }
    return NextResponse.json(invoicesCache[index])
  }
  
  return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  invoicesCache = invoicesCache.filter(inv => inv.id !== id)
  
  return NextResponse.json({ success: true })
}

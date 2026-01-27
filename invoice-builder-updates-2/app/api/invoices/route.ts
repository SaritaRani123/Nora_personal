import { NextResponse } from 'next/server'

// Mock invoices data stored in memory
let invoices = [
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

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Calculate stats
  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter((inv) => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: invoices.filter((inv) => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
  }
  
  return NextResponse.json({ invoices, stats })
}

export async function POST(request: Request) {
  const body = await request.json()
  
  // Generate new invoice ID
  const lastId = invoices.length > 0 
    ? Math.max(...invoices.map(inv => parseInt(inv.id.replace('INV-', ''))))
    : 0
  const newId = `INV-${String(lastId + 1).padStart(3, '0')}`
  
  const newInvoice = {
    id: newId,
    client: body.client,
    email: body.email,
    amount: body.amount,
    status: body.status || 'draft',
    issueDate: body.issueDate || new Date().toISOString().split('T')[0],
    dueDate: body.dueDate,
    paidDate: null,
  }
  
  invoices.unshift(newInvoice)
  
  return NextResponse.json(newInvoice, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...updates } = body
  
  const index = invoices.findIndex(inv => inv.id === id)
  if (index !== -1) {
    invoices[index] = { ...invoices[index], ...updates }
    return NextResponse.json(invoices[index])
  }
  
  return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  invoices = invoices.filter(inv => inv.id !== id)
  
  return NextResponse.json({ success: true })
}

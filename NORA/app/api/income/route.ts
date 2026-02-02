import { NextResponse } from 'next/server'

// Mock income data
const income = [
  {
    id: '1',
    date: '2025-01-15',
    description: 'Client Payment - ABC Corp',
    amount: 5000.0,
    source: 'Invoice',
    client: 'ABC Corporation',
  },
  {
    id: '2',
    date: '2025-01-10',
    description: 'Consulting Fee - XYZ Ltd',
    amount: 2500.0,
    source: 'Invoice',
    client: 'XYZ Ltd',
  },
  {
    id: '3',
    date: '2025-01-05',
    description: 'Product Sales',
    amount: 1250.0,
    source: 'E-commerce',
  },
  {
    id: '4',
    date: '2025-01-01',
    description: 'Monthly Retainer - Tech Inc',
    amount: 3000.0,
    source: 'Contract',
    client: 'Tech Innovations Inc',
  },
  {
    id: '5',
    date: '2025-01-20',
    description: 'Project Milestone Payment',
    amount: 4200.0,
    source: 'Invoice',
    client: 'StartUp Ventures',
  },
]

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return NextResponse.json({ income })
}

export async function POST(request: Request) {
  const body = await request.json()
  
  const newIncome = {
    id: String(Date.now()),
    ...body,
    date: body.date || new Date().toISOString().split('T')[0],
  }
  
  return NextResponse.json(newIncome, { status: 201 })
}

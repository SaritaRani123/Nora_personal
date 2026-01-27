import { NextResponse } from 'next/server'

// Mock calendar events data
let calendarEvents = [
  {
    id: '1',
    title: 'Web Development - ABC Corp',
    date: '2025-01-25',
    type: 'work',
    amount: 450.0,
    hours: 6,
    client: 'ABC Corporation',
    paymentMethod: 'bank',
    taxDeductible: false,
  },
  {
    id: '2',
    title: 'Invoice INV-002 Due',
    date: '2025-01-30',
    type: 'invoice',
    amount: 2500.0,
    client: 'XYZ Ltd',
  },
  {
    id: '3',
    title: 'Quarterly Tax Payment',
    date: '2025-01-31',
    type: 'tax',
    amount: 3500.0,
    taxDeductible: true,
  },
  {
    id: '4',
    title: 'Office Supplies',
    date: '2025-01-24',
    type: 'expense',
    amount: 156.0,
    category: 'Office Expenses',
    paymentMethod: 'credit',
    taxDeductible: true,
  },
  {
    id: '5',
    title: 'Client Meeting - Tech Inc',
    date: '2025-01-27',
    type: 'meeting',
    client: 'Tech Innovations',
  },
  {
    id: '6',
    title: 'Drive to Client Office',
    date: '2025-01-27',
    type: 'travel',
    amount: 45.0,
    kilometers: 85,
    client: 'Tech Innovations',
    taxDeductible: true,
  },
  {
    id: '7',
    title: 'Consulting Session',
    date: '2025-01-28',
    type: 'work',
    amount: 300.0,
    hours: 4,
    client: 'StartUp Ventures',
    paymentMethod: 'bank',
  },
  {
    id: '8',
    title: 'Software Subscription',
    date: '2025-01-20',
    type: 'expense',
    amount: 49.99,
    category: 'Software',
    paymentMethod: 'credit',
    taxDeductible: true,
  },
  {
    id: '9',
    title: 'Design Work',
    date: '2025-01-25',
    type: 'work',
    amount: 200.0,
    hours: 2.5,
    client: 'Global Services',
  },
  {
    id: '10',
    title: 'Invoice INV-005 Paid',
    date: '2025-01-18',
    type: 'income',
    amount: 4200.0,
    client: 'StartUp Ventures',
  },
  {
    id: '11',
    title: 'Lunch Meeting',
    date: '2025-01-26',
    type: 'expense',
    amount: 65.0,
    category: 'Food & Dining',
    paymentMethod: 'cash',
    taxDeductible: false,
  },
  {
    id: '12',
    title: 'Project Milestone',
    date: '2025-01-29',
    type: 'work',
    amount: 800.0,
    hours: 8,
    client: 'ABC Corporation',
    paymentMethod: 'bank',
  },
]

const upcomingEvents = [
  {
    id: 'up1',
    title: 'Invoice INV-002',
    date: '2025-01-30',
    type: 'invoice',
    amount: 2500,
    client: 'XYZ Ltd',
    status: 'due_soon',
  },
  {
    id: 'up2',
    title: 'Adobe Creative Cloud',
    date: '2025-02-01',
    type: 'subscription',
    amount: 54.99,
    recurring: true,
  },
  {
    id: 'up3',
    title: 'Office Rent',
    date: '2025-02-01',
    type: 'planned_expense',
    amount: 1200,
    category: 'Rent',
  },
  {
    id: 'up4',
    title: 'Project Payment - ABC',
    date: '2025-02-05',
    type: 'expected_income',
    amount: 3500,
    client: 'ABC Corporation',
  },
  {
    id: 'up5',
    title: 'Invoice INV-001',
    date: '2025-01-20',
    type: 'invoice',
    amount: 1800,
    client: 'Tech Innovations',
    status: 'overdue',
  },
  {
    id: 'up6',
    title: 'Slack Subscription',
    date: '2025-02-03',
    type: 'subscription',
    amount: 12.50,
    recurring: true,
  },
  {
    id: 'up7',
    title: 'Quarterly Tax',
    date: '2025-01-31',
    type: 'planned_expense',
    amount: 3500,
    category: 'Tax',
    status: 'due_soon',
  },
]

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return NextResponse.json({ events: calendarEvents, upcomingEvents })
}

export async function POST(request: Request) {
  const body = await request.json()
  
  const newEvent = {
    id: String(Date.now()),
    ...body,
  }
  
  calendarEvents.push(newEvent)
  
  return NextResponse.json(newEvent, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...updates } = body
  
  const index = calendarEvents.findIndex(e => e.id === id)
  if (index !== -1) {
    calendarEvents[index] = { ...calendarEvents[index], ...updates }
    return NextResponse.json(calendarEvents[index])
  }
  
  return NextResponse.json({ error: 'Event not found' }, { status: 404 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  calendarEvents = calendarEvents.filter(e => e.id !== id)
  
  return NextResponse.json({ success: true })
}

import { NextResponse } from 'next/server'

// Mock contacts data
let contacts = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@abccorp.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave, Toronto, ON M5V 2T6',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@xyzltd.com',
    phone: '+1 (555) 234-5678',
    address: '456 Commerce St, Vancouver, BC V6B 1A1',
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'mchen@techinnovations.com',
    phone: '+1 (555) 345-6789',
    address: '789 Innovation Blvd, Montreal, QC H3B 2Y5',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@globalservices.com',
    phone: '+1 (555) 456-7890',
    address: '321 Enterprise Way, Calgary, AB T2P 3N4',
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'rwilson@startupventures.io',
    phone: '+1 (555) 567-8901',
    address: '654 Startup Lane, Ottawa, ON K1P 5G3',
  },
]

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return NextResponse.json({ contacts })
}

export async function POST(request: Request) {
  const body = await request.json()
  
  const newContact = {
    id: String(Date.now()),
    name: body.name,
    email: body.email,
    phone: body.phone,
    address: body.address,
  }
  
  contacts.unshift(newContact)
  
  return NextResponse.json(newContact, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...updates } = body
  
  const index = contacts.findIndex(c => c.id === id)
  if (index !== -1) {
    contacts[index] = { ...contacts[index], ...updates }
    return NextResponse.json(contacts[index])
  }
  
  return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  contacts = contacts.filter(c => c.id !== id)
  
  return NextResponse.json({ success: true })
}

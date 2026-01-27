import { NextResponse } from 'next/server'

// Mock expenses data
const expenses = [
  {
    id: '1',
    date: '2025-01-24',
    description: "McDonald's",
    category: 'food',
    amount: 45.99,
    paymentMethod: 'Debit Card',
    aiSuggested: true,
    confidence: 95,
    status: 'paid',
  },
  {
    id: '2',
    date: '2025-01-23',
    description: 'Staples - Office Supplies',
    category: 'office',
    amount: 234.5,
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 92,
    status: 'pending',
  },
  {
    id: '3',
    date: '2025-01-22',
    description: 'Shell Gas Station',
    category: 'fuel',
    amount: 78.0,
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 98,
    status: 'paid',
  },
  {
    id: '4',
    date: '2025-01-21',
    description: 'Adobe Creative Cloud',
    category: 'software',
    amount: 54.99,
    paymentMethod: 'Credit Card',
    aiSuggested: false,
    confidence: 100,
    status: 'paid',
  },
  {
    id: '5',
    date: '2025-01-20',
    description: 'Hydro One - Electricity',
    category: 'utilities',
    amount: 189.45,
    paymentMethod: 'Bank Transfer',
    aiSuggested: true,
    confidence: 88,
    status: 'overdue',
  },
  {
    id: '6',
    date: '2025-01-19',
    description: 'Google Ads Campaign',
    category: 'marketing',
    amount: 500.0,
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 91,
    status: 'pending',
  },
  {
    id: '7',
    date: '2025-01-18',
    description: 'Marriott Hotel - Toronto',
    category: 'travel',
    amount: 325.0,
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 94,
    status: 'paid',
  },
  {
    id: '8',
    date: '2025-01-17',
    description: 'Tim Hortons',
    category: 'food',
    amount: 12.5,
    paymentMethod: 'Debit Card',
    aiSuggested: true,
    confidence: 97,
    status: 'paid',
  },
]

const categories = [
  { id: 'food', name: 'Food & Dining', code: '7012' },
  { id: 'office', name: 'Office Expenses', code: '4053' },
  { id: 'fuel', name: 'Fuel & Commute', code: '3242' },
  { id: 'utilities', name: 'Utilities', code: '4900' },
  { id: 'software', name: 'Software & Subscriptions', code: '5045' },
  { id: 'marketing', name: 'Marketing & Advertising', code: '7311' },
  { id: 'travel', name: 'Travel & Accommodation', code: '4722' },
  { id: 'insurance', name: 'Insurance', code: '6300' },
]

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return NextResponse.json({ expenses, categories })
}

export async function POST(request: Request) {
  const body = await request.json()
  
  const newExpense = {
    id: String(Date.now()),
    ...body,
    date: body.date || new Date().toISOString().split('T')[0],
  }
  
  // In a real app, this would save to a database
  expenses.unshift(newExpense)
  
  return NextResponse.json(newExpense, { status: 201 })
}

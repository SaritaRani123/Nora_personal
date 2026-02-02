import { NextResponse } from 'next/server'

// In-memory expenses store - in production this would be a database
let expenses = [
  {
    id: '1',
    date: '2026-01-24',
    description: "McDonald's",
    category: 'food',
    amount: 45.99,
    paymentMethod: 'Debit Card',
    aiSuggested: true,
    confidence: 95,
    status: 'paid',
    source: 'import',
  },
  {
    id: '2',
    date: '2026-01-23',
    description: 'Staples - Office Supplies',
    category: 'office',
    amount: 234.5,
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 92,
    status: 'pending',
    source: 'import',
  },
  {
    id: '3',
    date: '2026-01-22',
    description: 'Shell Gas Station',
    category: 'fuel',
    amount: 78.0,
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 98,
    status: 'paid',
    source: 'import',
  },
  {
    id: '4',
    date: '2026-01-21',
    description: 'Adobe Creative Cloud',
    category: 'software',
    amount: 54.99,
    paymentMethod: 'Credit Card',
    aiSuggested: false,
    confidence: 100,
    status: 'paid',
    source: 'import',
  },
  {
    id: '5',
    date: '2026-01-20',
    description: 'Hydro One - Electricity',
    category: 'utilities',
    amount: 189.45,
    paymentMethod: 'Bank Transfer',
    aiSuggested: true,
    confidence: 88,
    status: 'overdue',
    source: 'import',
  },
  {
    id: '6',
    date: '2026-01-19',
    description: 'Google Ads Campaign',
    category: 'marketing',
    amount: 500.0,
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 91,
    status: 'pending',
    source: 'import',
  },
  {
    id: '7',
    date: '2026-01-18',
    description: 'Marriott Hotel - Toronto',
    category: 'travel',
    amount: 325.0,
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 94,
    status: 'paid',
    source: 'import',
  },
  {
    id: '8',
    date: '2026-01-17',
    description: 'Tim Hortons',
    category: 'food',
    amount: 12.5,
    paymentMethod: 'Debit Card',
    aiSuggested: true,
    confidence: 97,
    status: 'paid',
    source: 'import',
  },
  {
    id: '9',
    date: '2026-01-05',
    description: 'Business Insurance',
    amount: 450.0,
    category: 'insurance',
    paymentMethod: 'Bank Transfer',
    aiSuggested: true,
    confidence: 96,
    status: 'paid',
    source: 'import',
  },
  {
    id: '10',
    date: '2026-01-04',
    description: 'Employee Training',
    amount: 299.0,
    category: 'education',
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 88,
    status: 'paid',
    source: 'import',
  },
  {
    id: '11',
    date: '2026-01-03',
    description: 'Cloud Hosting - AWS',
    amount: 189.5,
    category: 'software',
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 98,
    status: 'paid',
    source: 'import',
  },
  {
    id: '12',
    date: '2026-01-02',
    description: 'Office Cleaning Service',
    amount: 150.0,
    category: 'utilities',
    paymentMethod: 'Bank Transfer',
    aiSuggested: true,
    confidence: 91,
    status: 'paid',
    source: 'import',
  },
]

export async function GET(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const categoryId = searchParams.get('categoryId')
  const status = searchParams.get('status')

  let filteredExpenses = [...expenses]

  // Filter by date range if provided
  if (from || to) {
    filteredExpenses = filteredExpenses.filter((expense) => {
      const expenseDate = expense.date
      if (from && expenseDate < from) return false
      if (to && expenseDate > to) return false
      return true
    })
  }

  // Filter by category if provided
  if (categoryId) {
    filteredExpenses = filteredExpenses.filter(
      (expense) => expense.category === categoryId
    )
  }

  // Filter by status if provided
  if (status) {
    filteredExpenses = filteredExpenses.filter(
      (expense) => expense.status === status
    )
  }

  return NextResponse.json({ expenses: filteredExpenses })
}

export async function POST(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const body = await request.json()

  const newExpense = {
    id: `exp-${Date.now()}`,
    date: body.date || new Date().toISOString().split('T')[0],
    description: body.description || '',
    category: body.category || 'office',
    amount: body.amount || 0,
    paymentMethod: body.paymentMethod || 'Credit Card',
    aiSuggested: body.aiSuggested ?? false,
    confidence: body.confidence ?? 100,
    status: body.status || 'pending',
    source: body.source || 'manual',
  }

  expenses = [newExpense, ...expenses]

  return NextResponse.json(newExpense, { status: 201 })
}

export async function PUT(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing expense id' }, { status: 400 })
  }

  const body = await request.json()
  const index = expenses.findIndex((e) => e.id === id)

  if (index === -1) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
  }

  expenses[index] = {
    ...expenses[index],
    ...body,
  }

  return NextResponse.json(expenses[index])
}

export async function DELETE(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing expense id' }, { status: 400 })
  }

  const index = expenses.findIndex((e) => e.id === id)

  if (index === -1) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
  }

  expenses = expenses.filter((e) => e.id !== id)

  return NextResponse.json({ success: true })
}

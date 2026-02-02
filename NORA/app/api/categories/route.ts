import { NextResponse } from 'next/server'

// Categories data - in production this would come from a database
const categories = [
  { id: 'food', name: 'Food & Dining', code: '7012' },
  { id: 'office', name: 'Office Expenses', code: '4053' },
  { id: 'fuel', name: 'Fuel & Commute', code: '3242' },
  { id: 'utilities', name: 'Utilities', code: '4900' },
  { id: 'software', name: 'Software & Subscriptions', code: '5045' },
  { id: 'marketing', name: 'Marketing & Advertising', code: '7311' },
  { id: 'travel', name: 'Travel & Accommodation', code: '4722' },
  { id: 'insurance', name: 'Insurance', code: '6300' },
  { id: 'education', name: 'Education & Training', code: '6100' },
]

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 50))
  return NextResponse.json({ categories })
}

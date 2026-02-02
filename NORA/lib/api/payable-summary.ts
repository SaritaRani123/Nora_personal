// ============================================================
// Payable Summary API Service
// ============================================================
// This service calculates aging buckets from existing invoice and expense data.
// To connect to AWS, replace the mock functions with real API calls.
//
// IMPORTANT: This file is used by the API route handler (server-side only).
// Use server-side environment variables (without NEXT_PUBLIC_ prefix)
// to keep API keys secure.
//
// Example AWS integration (in API route):
// const response = await fetch('https://api.your-aws-endpoint.com/payable-summary', {
//   headers: {
//     'Authorization': `Bearer ${process.env.AWS_API_KEY}`,
//     'Content-Type': 'application/json',
//   },
// })
// return response.json()
// ============================================================

import { invoices, expenses } from '@/lib/mock-data'

export type AgingBucket = 'coming_due' | '1_30' | '31_60' | '61_90' | 'over_90'

export interface BucketData {
  label: string
  key: AgingBucket
  amount: number
  count: number
  filterParam: string
}

export interface PayableSummaryResponse {
  invoicesPayable: BucketData[]
  billsOwing: BucketData[]
  totalReceivable: number
  totalPayable: number
}

/**
 * Calculates the number of days between two dates
 */
function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = date1.getTime() - date2.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Determines the overdue aging bucket based on days overdue
 * Only used for items with status === "overdue"
 */
function getOverdueBucket(daysOverdue: number): AgingBucket {
  if (daysOverdue <= 30) return '1_30'
  if (daysOverdue <= 60) return '31_60'
  if (daysOverdue <= 90) return '61_90'
  return 'over_90'
}

/**
 * Creates empty bucket data structure
 */
function createEmptyBuckets(): Record<AgingBucket, { amount: number; count: number }> {
  return {
    coming_due: { amount: 0, count: 0 },
    '1_30': { amount: 0, count: 0 },
    '31_60': { amount: 0, count: 0 },
    '61_90': { amount: 0, count: 0 },
    over_90: { amount: 0, count: 0 },
  }
}

/**
 * Converts bucket record to BucketData array
 */
function bucketRecordToArray(buckets: Record<AgingBucket, { amount: number; count: number }>): BucketData[] {
  return [
    { label: 'Coming Due', key: 'coming_due', amount: buckets.coming_due.amount, count: buckets.coming_due.count, filterParam: 'coming_due' },
    { label: '1–30 Days Overdue', key: '1_30', amount: buckets['1_30'].amount, count: buckets['1_30'].count, filterParam: '1_30' },
    { label: '31–60 Days Overdue', key: '31_60', amount: buckets['31_60'].amount, count: buckets['31_60'].count, filterParam: '31_60' },
    { label: '61–90 Days Overdue', key: '61_90', amount: buckets['61_90'].amount, count: buckets['61_90'].count, filterParam: '61_90' },
    { label: '>90 Days Overdue', key: 'over_90', amount: buckets.over_90.amount, count: buckets.over_90.count, filterParam: 'over_90' },
  ]
}

/**
 * Calculates invoices payable buckets from invoice data
 * Uses: invoices from lib/mock-data.ts (same data as Invoices page)
 * 
 * Rules:
 * - Coming Due: status === "pending" AND dueDate >= today
 * - Overdue Breakdown: status === "overdue", bucketed by days overdue (today - dueDate)
 */
function calculateInvoicesPayable(today: Date): BucketData[] {
  const buckets = createEmptyBuckets()

  for (const invoice of invoices) {
    // Skip paid invoices
    if (invoice.status === 'paid') continue

    const dueDate = new Date(invoice.dueDate)

    if (invoice.status === 'pending') {
      // Coming Due: pending items with dueDate >= today
      buckets.coming_due.amount += invoice.amount
      buckets.coming_due.count += 1
    } else if (invoice.status === 'overdue') {
      // Overdue: bucket by days overdue (today - dueDate)
      const daysOverdue = getDaysDifference(today, dueDate)
      const bucket = getOverdueBucket(daysOverdue)
      buckets[bucket].amount += invoice.amount
      buckets[bucket].count += 1
    }
  }

  return bucketRecordToArray(buckets)
}

/**
 * Calculates bills owing buckets from expense data
 * Uses: expenses from lib/mock-data.ts (same data as Expenses page)
 * 
 * Rules:
 * - Coming Due: status === "pending"
 * - Overdue Breakdown: status === "overdue", bucketed by days overdue (today - date)
 */
function calculateBillsOwing(today: Date): BucketData[] {
  const buckets = createEmptyBuckets()

  for (const expense of expenses) {
    // Skip paid expenses
    if (expense.status === 'paid') continue

    if (expense.status === 'pending') {
      // Coming Due: pending items
      buckets.coming_due.amount += expense.amount
      buckets.coming_due.count += 1
    } else if (expense.status === 'overdue') {
      // Overdue: bucket by days overdue (today - date)
      const dueDate = new Date(expense.date)
      const daysOverdue = getDaysDifference(today, dueDate)
      const bucket = getOverdueBucket(daysOverdue)
      buckets[bucket].amount += expense.amount
      buckets[bucket].count += 1
    }
  }

  return bucketRecordToArray(buckets)
}

// ============================================================
// API Functions - Replace these with AWS API calls
// ============================================================

/**
 * Fetches payable summary data from the API
 * 
 * Calculates aging buckets dynamically from:
 * - Invoices data (same as Invoices page) → "Invoices Payable to You"
 * - Expenses data (same as Expenses page) → "Bills You Owe"
 * 
 * To replace with AWS:
 * 1. Update the fetch URL to your AWS endpoint
 * 2. Add proper authentication headers
 * 3. Handle the response format from your AWS API
 */
export async function fetchPayableSummary(): Promise<PayableSummaryResponse> {
  // Simulate network delay for realistic loading states
  await new Promise((resolve) => setTimeout(resolve, 300))

  // TODO: Replace with AWS API call
  // const response = await fetch(`${process.env.AWS_API_URL}/payable-summary`, {
  //   headers: {
  //     'Authorization': `Bearer ${process.env.AWS_API_KEY}`,
  //   },
  // })
  // if (!response.ok) throw new Error('Failed to fetch payable summary')
  // return response.json()

  const today = new Date()

  const invoicesPayable = calculateInvoicesPayable(today)
  const billsOwing = calculateBillsOwing(today)

  const totalReceivable = invoicesPayable.reduce((sum, bucket) => sum + bucket.amount, 0)
  const totalPayable = billsOwing.reduce((sum, bucket) => sum + bucket.amount, 0)

  return {
    invoicesPayable,
    billsOwing,
    totalReceivable,
    totalPayable,
  }
}

/**
 * Fetches invoices for a specific aging bucket
 */
export async function fetchInvoicesByBucket(bucket: AgingBucket): Promise<unknown[]> {
  // TODO: Replace with AWS API call
  // const response = await fetch(`${process.env.AWS_API_URL}/invoices?aging=${bucket}`)
  // return response.json()
  
  await new Promise((resolve) => setTimeout(resolve, 200))
  return []
}

/**
 * Fetches expenses/bills for a specific aging bucket
 */
export async function fetchExpensesByBucket(bucket: AgingBucket): Promise<unknown[]> {
  // TODO: Replace with AWS API call
  // const response = await fetch(`${process.env.AWS_API_URL}/expenses?aging=${bucket}`)
  // return response.json()
  
  await new Promise((resolve) => setTimeout(resolve, 200))
  return []
}

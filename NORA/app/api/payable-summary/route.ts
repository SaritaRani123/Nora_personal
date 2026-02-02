import { NextResponse } from 'next/server'
import { fetchPayableSummary } from '@/lib/api/payable-summary'

// ============================================================
// Payable Summary API Route
// ============================================================
// This route handler delegates to the API service layer.
// To switch from mock data to AWS, update lib/api/payable-summary.ts
// No changes needed in this file or the UI component.
// ============================================================

export async function GET() {
  try {
    const data = await fetchPayableSummary()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch payable summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payable summary' },
      { status: 500 }
    )
  }
}

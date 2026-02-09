import { apiFetch, extractArray } from '@/lib/api/http'

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

export async function fetchPayableSummary(): Promise<PayableSummaryResponse[]> {
  const body = await apiFetch('/payable-summary')
  return extractArray<PayableSummaryResponse>(body, 'payableSummary')
}


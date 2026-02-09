'use client'

import type React from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { fetchPayableSummary, type BucketData, type PayableSummaryResponse } from '@/lib/services/payable-summary'

// ============================================================
// Payable & Owing Summary Component
// ============================================================
// This component fetches data from /api/payable-summary which
// uses the API service layer in lib/api/payable-summary.ts
// 
// To switch from mock data to AWS:
// 1. Update lib/api/payable-summary.ts with your AWS endpoint
// 2. No changes needed in this component
// ============================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function BucketRow({
  bucket,
  onClick,
  isOverdue = false,
}: {
  bucket: BucketData
  onClick: () => void
  isOverdue?: boolean
}) {
  const hasAmount = bucket.amount > 0

  return (
    <button
      onClick={onClick}
      disabled={!hasAmount}
      className={cn(
        'flex w-full items-center justify-between px-3 py-2.5 rounded-lg',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'group',
        hasAmount
          ? 'hover:bg-accent hover:shadow-sm cursor-pointer'
          : 'cursor-default opacity-60'
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-sm transition-colors duration-200',
            hasAmount
              ? 'text-muted-foreground group-hover:text-foreground'
              : 'text-muted-foreground/60'
          )}
        >
          {bucket.label}
        </span>
        {bucket.count > 0 && (
          <span
            className={cn(
              'inline-flex items-center justify-center text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[20px]',
              isOverdue
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {bucket.count}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-sm font-semibold tabular-nums transition-colors duration-200',
            hasAmount ? 'text-foreground' : 'text-muted-foreground/60',
            isOverdue && hasAmount && 'text-destructive'
          )}
        >
          {formatCurrency(bucket.amount)}
        </span>
        {hasAmount && (
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
        )}
      </div>
    </button>
  )
}

function SummaryCard({
  title,
  icon: Icon,
  iconColor,
  buckets,
  total,
  basePath,
  variant = 'receivable',
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  buckets: BucketData[]
  total: number
  basePath: string
  variant?: 'receivable' | 'payable'
}) {
  const router = useRouter()

  const handleBucketClick = (filterParam: string) => {
    router.push(`${basePath}?aging=${filterParam}`)
  }

  // Keys that represent overdue buckets
  const overdueBuckets = ['1_30', '31_60', '61_90', 'over_90']

  return (
    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-card-foreground">
            {title}
          </CardTitle>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-105',
              iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span
            className={cn(
              'text-3xl font-bold tracking-tight',
              variant === 'payable' && total > 0
                ? 'text-destructive'
                : 'text-card-foreground'
            )}
          >
            {formatCurrency(total)}
          </span>
          <span className="text-sm text-muted-foreground">total outstanding</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="border-t border-border pt-3">
          <div className="flex flex-col gap-0.5">
            {buckets.map((bucket) => (
              <BucketRow
                key={bucket.key}
                bucket={bucket}
                onClick={() => handleBucketClick(bucket.filterParam)}
                isOverdue={overdueBuckets.includes(bucket.key)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="border-t border-border pt-3">
          <div className="flex flex-col gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between py-2.5 px-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PayableOwingSummary() {
  const { data: dataArr, isLoading, error } = useSWR<PayableSummaryResponse[]>(
    'payable-summary',
    fetchPayableSummary,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  )
  const data = dataArr?.[0]

  if (isLoading) {
    return (
      <section aria-label="Payable and Owing Summary">
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section aria-label="Payable and Owing Summary">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="py-6">
            <p className="text-sm text-destructive text-center">
              Failed to load summary data. Please try again later.
            </p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section aria-label="Payable and Owing Summary">
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        <SummaryCard
          title="Invoices Payable to You"
          icon={ArrowDownLeft}
          iconColor="bg-primary/10 text-primary"
          buckets={data?.invoicesPayable || []}
          total={data?.totalReceivable || 0}
          basePath="/invoices"
          variant="receivable"
        />
        <SummaryCard
          title="Bills You Owe"
          icon={ArrowUpRight}
          iconColor="bg-destructive/10 text-destructive"
          buckets={data?.billsOwing || []}
          total={data?.totalPayable || 0}
          basePath="/expenses"
          variant="payable"
        />
      </div>
    </section>
  )
}

import type { PaymentMethod } from '@/types/expense'
import { apiFetch } from '@/lib/api/http'

export interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[]
  defaultPaymentMethodId: string
}

export async function fetchPaymentMethods(): Promise<PaymentMethodsResponse> {
  const body = await apiFetch('/payment-methods')
  const o = body as PaymentMethodsResponse
  const paymentMethods = Array.isArray(o.paymentMethods) ? o.paymentMethods : []
  const defaultPaymentMethodId =
    typeof o.defaultPaymentMethodId === 'string' ? o.defaultPaymentMethodId : paymentMethods[0]?.id ?? ''
  return { paymentMethods, defaultPaymentMethodId }
}

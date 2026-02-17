import type { AdminPaymentItem, PaymentMethod, PaymentStatus } from '~/types'

export type PaymentListViewState = 'loading' | 'error' | 'empty' | 'ready'

export function getPaymentListViewState(params: {
  isLoading: boolean
  errorMessage: string
  items: AdminPaymentItem[]
}): PaymentListViewState {
  if (params.isLoading) {
    return 'loading'
  }
  if (params.errorMessage) {
    return 'error'
  }
  if (params.items.length === 0) {
    return 'empty'
  }
  return 'ready'
}

export function paymentStatusColor(
  status: PaymentStatus
): 'neutral' | 'warning' | 'info' | 'success' | 'error' {
  const map: Record<PaymentStatus, 'neutral' | 'warning' | 'info' | 'success' | 'error'> = {
    PENDING: 'warning',
    PROCESSING: 'info',
    COMPLETED: 'success',
    FAILED: 'error',
    REFUNDED: 'neutral',
    CANCELLED: 'neutral',
  }
  return map[status]
}

export function paymentMethodLabel(method: PaymentMethod | string): string {
  return method
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function canIssueRefund(item: AdminPaymentItem): boolean {
  if (!['COMPLETED', 'REFUNDED'].includes(item.status)) {
    return false
  }
  return item.refundable_amount > 0
}

export function buildIdempotencyKey(prefix = 'admin-refund'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

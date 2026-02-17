import type { AdminOrderItem, OrderItemResponse, OrderPaymentStatus, OrderStatus } from '~/types'

export type OrderListViewState = 'loading' | 'error' | 'empty' | 'ready'

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['PICKING_UP', 'CANCELLED'],
  PICKING_UP: ['DELIVERING'],
  DELIVERING: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: ['REFUNDED'],
  REFUNDED: [],
}

export function getOrderListViewState(params: {
  isLoading: boolean
  errorMessage: string
  items: AdminOrderItem[]
}): OrderListViewState {
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

export function orderStatusColor(
  status: OrderStatus
): 'neutral' | 'warning' | 'info' | 'success' | 'error' {
  const map: Record<OrderStatus, 'neutral' | 'warning' | 'info' | 'success' | 'error'> = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    PREPARING: 'info',
    READY: 'info',
    PICKING_UP: 'info',
    DELIVERING: 'info',
    DELIVERED: 'success',
    CANCELLED: 'error',
    REFUNDED: 'neutral',
  }
  return map[status]
}

export function orderPaymentStatusColor(
  status: OrderPaymentStatus | null
): 'neutral' | 'warning' | 'info' | 'success' | 'error' {
  if (!status) {
    return 'neutral'
  }

  const map: Record<OrderPaymentStatus, 'neutral' | 'warning' | 'info' | 'success' | 'error'> = {
    PENDING: 'warning',
    PROCESSING: 'info',
    COMPLETED: 'success',
    FAILED: 'error',
    REFUNDED: 'neutral',
    CANCELLED: 'neutral',
  }
  return map[status]
}

export function getNextOrderStatuses(status: OrderStatus): OrderStatus[] {
  return ORDER_TRANSITIONS[status] || []
}

export interface SelectedOptionSnapshot {
  option_group_id?: string
  option_group_name?: string
  option_id?: string
  option_name?: string
  price_delta?: number
}

export function parseSelectedOptions(item: OrderItemResponse): SelectedOptionSnapshot[] {
  if (!item.selected_options) {
    return []
  }

  try {
    const parsed = JSON.parse(item.selected_options) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter(
      (value): value is SelectedOptionSnapshot => value !== null && typeof value === 'object'
    )
  } catch {
    return []
  }
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'PICKING_UP'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type OrderPaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED'

export interface OrderItemResponse {
  id: string
  menu_item_id: string
  name: string
  price: number
  quantity: number
  subtotal: number
  notes: string | null
  selected_options: string | null
}

export interface OrderResponse {
  id: string
  order_number: string
  user_id: string
  merchant_id: string
  driver_id: string | null
  status: OrderStatus
  subtotal: number
  delivery_fee: number
  tax: number
  discount: number
  total: number
  delivery_address: string
  delivery_latitude: number | null
  delivery_longitude: number | null
  customer_note: string | null
  estimated_prep_time: number | null
  estimated_delivery_time: number | null
  items: OrderItemResponse[]
  created_at: string
  updated_at: string
}

export interface AdminOrderItem {
  id: string
  order_number: string
  user_id: string
  merchant_id: string
  driver_id: string | null
  status: OrderStatus
  subtotal: number
  delivery_fee: number
  tax: number
  discount: number
  total: number
  delivery_address: string
  customer_note: string | null
  payment_status: OrderPaymentStatus | null
  latest_payment_id: string | null
  latest_transaction_id: string | null
  created_at: string
  updated_at: string
}

export interface AdminOrderListResponse {
  items: AdminOrderItem[]
  total: number
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus
  reason?: string
}

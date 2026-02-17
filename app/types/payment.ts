export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED'

export type PaymentMethod =
  | 'VNPAY'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'DIGITAL_WALLET'
  | 'CASH_ON_DELIVERY'
  | 'BANK_TRANSFER'

export interface PaymentResponse {
  id: string
  transaction_id: string
  order_id: string
  user_id: string
  amount: number
  currency: string
  method: PaymentMethod | string
  status: PaymentStatus
  gateway: string | null
  payment_url: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface AdminPaymentItem extends PaymentResponse {
  order_status: string | null
  refunded_amount: number
  refundable_amount: number
}

export interface AdminPaymentListResponse {
  items: AdminPaymentItem[]
  total: number
}

export interface RefundCreateRequest {
  payment_id: string
  amount?: number
  reason: string
}

export interface RefundResponse {
  id: string
  payment_id: string
  order_id: string
  amount: number
  reason: string
  status: string
  refunded_by: string | null
  created_at: string
  updated_at: string
}

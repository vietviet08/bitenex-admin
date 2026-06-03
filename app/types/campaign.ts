/**
 * Campaign status
 */
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'ENDED' | 'CANCELLED'

/**
 * Campaign type
 */
export type CampaignType = 'DISCOUNT' | 'FREE_DELIVERY' | 'BUNDLE' | 'LOYALTY'

/**
 * Discount type
 */
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT'

/**
 * Target audience
 */
export type TargetAudience = 'ALL' | 'NEW_USERS' | 'RETURNING_USERS' | 'VIP'

/**
 * API campaign response (snake_case from backend)
 */
export interface ApiCampaignItem {
  id: string
  name: string
  description: string | null
  campaign_type: CampaignType
  discount_type: DiscountType
  discount_value: number
  max_discount: number | null
  min_order_value: number
  voucher_code: string | null
  auto_generate_vouchers: boolean
  max_vouchers: number | null
  used_vouchers: number
  target_audience: TargetAudience
  start_date: string
  end_date: string
  status: CampaignStatus
  budget: number | null
  spent: number
  total_orders: number
  total_revenue: number
  created_by: string | null
  is_featured: boolean
  created_at: string
  updated_at: string
}

/**
 * API campaign list response
 */
export interface ApiCampaignListResponse {
  items: ApiCampaignItem[]
  total: number
}

/**
 * API campaign stats response
 */
export interface ApiCampaignStats {
  total_campaigns: number
  active_campaigns: number
  scheduled_campaigns: number
  ended_campaigns: number
  total_budget: number
  total_spent: number
  total_revenue_generated: number
  total_orders: number
  total_vouchers_used: number
}

/**
 * Campaign entity for frontend (camelCase)
 */
export interface CampaignEntity {
  id: string
  name: string
  description?: string
  campaignType: CampaignType
  discountType: DiscountType
  discountValue: number
  maxDiscount?: number
  minOrderValue: number
  voucherCode?: string
  autoGenerateVouchers: boolean
  maxVouchers?: number
  usedVouchers: number
  targetAudience: TargetAudience
  startDate: string
  endDate: string
  status: CampaignStatus
  budget?: number
  spent: number
  totalOrders: number
  totalRevenue: number
  createdBy?: string
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Create campaign request
 */
export interface CampaignCreateRequest {
  name: string
  description?: string
  campaign_type?: CampaignType
  discount_type?: DiscountType
  discount_value: number
  max_discount?: number
  min_order_value?: number
  voucher_code?: string
  auto_generate_vouchers?: boolean
  max_vouchers?: number
  target_audience?: TargetAudience
  start_date: string
  end_date: string
  budget?: number
  is_featured?: boolean
}

/**
 * Update campaign request
 */
export interface CampaignUpdateRequest {
  name?: string
  description?: string
  campaign_type?: CampaignType
  discount_type?: DiscountType
  discount_value?: number
  max_discount?: number
  min_order_value?: number
  target_audience?: TargetAudience
  start_date?: string
  end_date?: string
  budget?: number
  is_featured?: boolean
}

/**
 * Campaign list params
 */
export interface CampaignListParams {
  page?: number
  per_page?: number
  status?: CampaignStatus
  campaign_type?: CampaignType
}

/**
 * Transform API campaign item to frontend entity
 */
export function transformCampaignItem(item: ApiCampaignItem): CampaignEntity {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? undefined,
    campaignType: item.campaign_type,
    discountType: item.discount_type,
    discountValue: item.discount_value,
    maxDiscount: item.max_discount ?? undefined,
    minOrderValue: item.min_order_value,
    voucherCode: item.voucher_code ?? undefined,
    autoGenerateVouchers: item.auto_generate_vouchers,
    maxVouchers: item.max_vouchers ?? undefined,
    usedVouchers: item.used_vouchers,
    targetAudience: item.target_audience,
    startDate: item.start_date,
    endDate: item.end_date,
    status: item.status,
    budget: item.budget ?? undefined,
    spent: item.spent,
    totalOrders: item.total_orders,
    totalRevenue: item.total_revenue,
    createdBy: item.created_by ?? undefined,
    isFeatured: item.is_featured,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

/**
 * Get status color
 */
export function campaignStatusColor(status: CampaignStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'SCHEDULED':
      return 'info'
    case 'DRAFT':
      return 'gray'
    case 'PAUSED':
      return 'warning'
    case 'ENDED':
      return 'neutral'
    case 'CANCELLED':
      return 'error'
    default:
      return 'gray'
  }
}

/**
 * Get campaign type label
 */
export function campaignTypeLabel(type: CampaignType): string {
  switch (type) {
    case 'DISCOUNT':
      return 'Discount'
    case 'FREE_DELIVERY':
      return 'Free Delivery'
    case 'BUNDLE':
      return 'Bundle'
    case 'LOYALTY':
      return 'Loyalty'
    default:
      return type
  }
}

/**
 * Format discount value
 */
export function formatDiscount(type: DiscountType, value: number): string {
  if (type === 'PERCENTAGE') {
    return `${value}% OFF`
  }
  return `${value.toLocaleString()} VND OFF`
}

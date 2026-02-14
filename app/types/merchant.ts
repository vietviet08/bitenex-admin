export type MerchantStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CLOSED'

export interface AdminMerchantItem {
  id: string
  user_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  cover_image_url: string | null
  status: MerchantStatus
  is_featured: boolean
  address: string
  city: string
  latitude: number | null
  longitude: number | null
  phone: string | null
  min_order_amount: number
  delivery_fee: number
  estimated_prep_time: number
  average_rating: number
  total_orders: number
  is_profile_complete: boolean
  owner_email: string | null
  owner_full_name: string | null
  created_at: string
  updated_at: string
}

export interface AdminMerchantListResponse {
  items: AdminMerchantItem[]
  total: number
}

/**
 * API driver response (snake_case from backend)
 */
export interface ApiDriverItem {
  id: string
  user_id: string
  vehicle_type: string | null
  vehicle_plate: string | null
  vehicle_model: string | null
  license_number: string | null
  status: DriverStatus
  is_approved: boolean
  current_latitude: number | null
  current_longitude: number | null
  total_deliveries: number
  average_rating: number
  created_at: string
  updated_at: string
  user_name: string | null
  user_email: string | null
  user_phone: string | null
}

/**
 * Driver status enum
 */
export type DriverStatus = 'ONLINE' | 'OFFLINE' | 'BUSY' | 'RETURNING'

/**
 * Driver entity for frontend (camelCase)
 */
export interface DriverEntity {
  id: string
  userId: string
  vehicleType?: string
  vehiclePlate?: string
  vehicleModel?: string
  licenseNumber?: string
  status: DriverStatus
  isApproved: boolean
  currentLatitude?: number
  currentLongitude?: number
  totalDeliveries: number
  averageRating: number
  createdAt: string
  updatedAt: string
  userName?: string
  userEmail?: string
  userPhone?: string
}

/**
 * Driver list query params
 */
export interface DriverListParams {
  page?: number
  per_page?: number
  search?: string
  status?: DriverStatus
  is_approved?: boolean
}

/**
 * Transform API driver item to frontend entity
 */
export function transformDriverItem(item: ApiDriverItem): DriverEntity {
  return {
    id: item.id,
    userId: item.user_id,
    vehicleType: item.vehicle_type ?? undefined,
    vehiclePlate: item.vehicle_plate ?? undefined,
    vehicleModel: item.vehicle_model ?? undefined,
    licenseNumber: item.license_number ?? undefined,
    status: item.status,
    isApproved: item.is_approved,
    currentLatitude: item.current_latitude ?? undefined,
    currentLongitude: item.current_longitude ?? undefined,
    totalDeliveries: item.total_deliveries,
    averageRating: item.average_rating,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    userName: item.user_name ?? undefined,
    userEmail: item.user_email ?? undefined,
    userPhone: item.user_phone ?? undefined,
  }
}

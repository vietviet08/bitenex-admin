import type { Role } from './auth'

/**
 * API user response (snake_case from backend)
 */
export interface ApiAdminUserItem {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: Role
  is_active: boolean
  is_verified: boolean
  avatar_url: string | null
  created_at: string
  updated_at: string
}

/**
 * API admin user list response
 */
export interface ApiAdminUserListResponse {
  items: ApiAdminUserItem[]
  total: number
}

/**
 * User entity for user management (camelCase frontend)
 */
export interface UserEntity {
  id: string
  email: string
  fullName: string
  phone?: string
  role: Role
  isActive: boolean
  isVerified: boolean
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

/**
 * User list query params
 */
export interface UserListParams {
  page?: number
  per_page?: number
  search?: string
  role?: string
  is_active?: boolean
}

/**
 * Admin update user request (snake_case for API)
 */
export interface AdminUserUpdateRequest {
  full_name?: string
  phone?: string
  role?: Role
  is_active?: boolean
  is_verified?: boolean
}

/**
 * Address response from API
 */
export interface AddressResponse {
  id: string
  user_id: string
  label: string
  address_line1: string
  address_line2: string | null
  city: string
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  is_default: boolean
  created_at: string
  updated_at: string
}

/**
 * Transform API user item to frontend entity
 */
export function transformUserItem(item: ApiAdminUserItem): UserEntity {
  return {
    id: item.id,
    email: item.email,
    fullName: item.full_name,
    phone: item.phone ?? undefined,
    role: item.role,
    isActive: item.is_active,
    isVerified: item.is_verified,
    avatarUrl: item.avatar_url ?? undefined,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

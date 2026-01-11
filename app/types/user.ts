import type { Role } from './auth'

/**
 * User entity for user management
 */
export interface UserEntity {
  id: string
  email: string
  fullName: string
  phone?: string
  role: Role
  status: UserStatus
  avatar?: string
  createdAt: string
  updatedAt: string
}

/**
 * User status enum
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * User list query params
 */
export interface UserListParams {
  page?: number
  limit?: number
  search?: string
  role?: Role
  status?: UserStatus
}

/**
 * Create user request
 */
export interface CreateUserRequest {
  email: string
  password: string
  fullName: string
  phone?: string
  role: Role
}

/**
 * Update user request
 */
export interface UpdateUserRequest {
  email?: string
  fullName?: string
  phone?: string
  role?: Role
  status?: UserStatus
}

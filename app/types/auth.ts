/**
 * User roles in the admin panel
 */
export enum Role {
  ADMIN = 'admin',
  STAFF = 'staff',
}

/**
 * Auth tokens returned from login
 */
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

/**
 * Current authenticated user
 */
export interface User {
  id: string
  email: string
  fullName: string
  role: Role
  avatar?: string
  createdAt: string
  updatedAt: string
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Auth state for Pinia store
 */
export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

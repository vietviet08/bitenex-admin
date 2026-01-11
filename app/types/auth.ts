/**
 * User roles matching API enum values
 */
export enum Role {
    USER = 'USER',
    DRIVER = 'DRIVER',
    MERCHANT = 'MERCHANT',
    ADMIN = 'ADMIN',
}

/**
 * Auth tokens returned from login (API response format)
 */
export interface AuthTokens {
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
}

/**
 * API token response (snake_case from backend)
 */
export interface ApiTokenResponse {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
}

/**
 * API user response (snake_case from backend)
 */
export interface ApiUserResponse {
    id: string
    email: string
    full_name: string
    role: Role
    is_verified: boolean
    created_at: string
}

/**
 * API login response structure
 */
export interface ApiLoginResponse {
    tokens: ApiTokenResponse
    user: ApiUserResponse
}

/**
 * Current authenticated user (camelCase for frontend)
 */
export interface User {
    id: string
    email: string
    fullName: string
    role: Role
    isVerified: boolean
    avatar?: string
    createdAt: string
    updatedAt?: string
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

/**
 * Access denied error for non-ADMIN users
 */
export class AccessDeniedError extends Error {
    code = 'ACCESS_DENIED'
    constructor(message = 'Access Denied: Admin access required') {
        super(message)
        this.name = 'AccessDeniedError'
    }
}

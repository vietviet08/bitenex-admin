/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T
  message?: string
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * API error response (matches backend ErrorResponse)
 */
export interface ApiErrorResponse {
  error: {
    error_code: string
    message: string
    details?: Record<string, ApiFieldError[]>
  }
}

/**
 * Field-level validation error
 */
export interface ApiFieldError {
  type: string
  message: string
  input?: unknown
}

/**
 * Parsed API error for use in components
 */
export interface ApiError {
  code: string
  message: string
  fieldErrors?: Record<string, string[]>
  status?: number
}

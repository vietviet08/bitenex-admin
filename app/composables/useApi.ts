import type { ApiError, ApiErrorResponse } from '~/types/api'
import type { ApiTokenResponse } from '~/types/auth'

// RequestBody accepts any serializable object, not just Record<string, unknown>
type RequestBody = { [key: string]: unknown } | FormData | Blob | ArrayBuffer | string | null

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

/**
 * Parse API error response into a structured ApiError
 */
function parseError(error: unknown): ApiError {
  // Handle fetch errors
  if (error && typeof error === 'object' && 'data' in error) {
    const fetchError = error as { data?: ApiErrorResponse; status?: number }
    const apiError = fetchError.data?.error

    if (apiError) {
      const fieldErrors: Record<string, string[]> = {}

      if (apiError.details) {
        for (const [field, errors] of Object.entries(apiError.details)) {
          fieldErrors[field] = errors.map((e) => e.message)
        }
      }

      return {
        code: apiError.error_code,
        message: apiError.message,
        fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
        status: fetchError.status,
      }
    }
  }

  // Fallback for unknown errors
  return {
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
  }
}

/**
 * API wrapper composable with auth headers, error handling, and toast notifications
 */
export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const toast = useToast()

  const baseURL = config.public.apiBase

  /**
   * Show error toast notification
   */
  function showErrorToast(error: ApiError) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'error',
    })
  }

  /**
   * Show success toast notification
   */
  function showSuccessToast(message: string, title = 'Success') {
    toast.add({
      title,
      description: message,
      color: 'success',
    })
  }

  async function refreshAccessToken(): Promise<boolean> {
    if (!authStore.refreshToken) {
      return false
    }

    if (isRefreshing && refreshPromise) {
      return refreshPromise
    }

    isRefreshing = true
    refreshPromise = (async () => {
      try {
        const response = await $fetch<ApiTokenResponse>('/auth/refresh', {
          baseURL,
          method: 'POST',
          body: { refresh_token: authStore.refreshToken },
          headers: { 'Content-Type': 'application/json' },
        })

        authStore.setTokens({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          tokenType: response.token_type,
          expiresIn: response.expires_in,
        })

        return true
      } catch {
        authStore.clearAuth()
        return false
      } finally {
        isRefreshing = false
        refreshPromise = null
      }
    })()

    return refreshPromise
  }

  async function apiFetch<T>(
    endpoint: string,
    options: Parameters<typeof $fetch>[1] = {},
    isRetry = false
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    // Add auth header if token exists
    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }

    try {
      const response = await $fetch<T>(endpoint, {
        baseURL,
        ...options,
        headers,
      })
      return response
    } catch (error) {
      const apiError = parseError(error)

      if (apiError.status === 401 && !isRetry && authStore.refreshToken) {
        if (!endpoint.includes('/auth/refresh')) {
          const refreshed = await refreshAccessToken()

          if (refreshed) {
            return apiFetch<T>(endpoint, options, true)
          }
        }

        navigateTo('/admin/login')
        showErrorToast({
          code: 'SESSION_EXPIRED',
          message: 'Session expired. Please log in again.',
          status: 401,
        })
      }

      throw apiError
    }
  }

  /**
   * GET request
   */
  async function get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    return apiFetch<T>(endpoint, {
      method: 'GET',
      params,
    })
  }

  /**
   * POST request
   */
  async function post<T>(endpoint: string, body?: RequestBody): Promise<T> {
    return apiFetch<T>(endpoint, {
      method: 'POST',
      body: body as never,
    })
  }

  /**
   * PUT request
   */
  async function put<T>(endpoint: string, body?: RequestBody): Promise<T> {
    return apiFetch<T>(endpoint, {
      method: 'PUT',
      body: body as never,
    })
  }

  /**
   * PATCH request
   */
  async function patch<T>(endpoint: string, body?: RequestBody): Promise<T> {
    return apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: body as never,
    })
  }

  /**
   * DELETE request
   */
  async function del<T>(endpoint: string): Promise<T> {
    return apiFetch<T>(endpoint, {
      method: 'DELETE',
    })
  }

  return {
    apiFetch,
    get,
    post,
    put,
    patch,
    del,
    parseError,
    showErrorToast,
    showSuccessToast,
    refreshAccessToken,
  }
}

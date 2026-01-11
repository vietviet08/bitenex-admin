import type { ApiError, ApiErrorResponse } from '~/types/api'

type RequestBody = Record<string, unknown> | FormData | Blob | ArrayBuffer | string | null

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

  /**
   * Core fetch wrapper with auth headers
   */
  async function apiFetch<T>(
    endpoint: string,
    options: Parameters<typeof $fetch>[1] = {}
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

      // Handle 401 - clear auth and redirect
      if (apiError.status === 401) {
        authStore.clearAuth()
        navigateTo('/admin/login')
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
  }
}

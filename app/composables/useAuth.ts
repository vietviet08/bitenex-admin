import type {
  LoginCredentials,
  AuthTokens,
  User,
  ApiLoginResponse,
  ApiTokenResponse,
  ApiUserResponse,
} from '~/types/auth'
import { Role, AccessDeniedError } from '~/types/auth'

/**
 * Transform API token response (snake_case) to frontend format (camelCase)
 */
function transformTokens(apiTokens: ApiTokenResponse): AuthTokens {
  return {
    accessToken: apiTokens.access_token,
    refreshToken: apiTokens.refresh_token,
    tokenType: apiTokens.token_type,
    expiresIn: apiTokens.expires_in,
  }
}

/**
 * Transform API user response (snake_case) to frontend format (camelCase)
 */
function transformUser(apiUser: ApiUserResponse): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    fullName: apiUser.full_name,
    role: apiUser.role,
    isVerified: apiUser.is_verified,
    createdAt: apiUser.created_at,
  }
}

/**
 * Auth composable for login, logout, and token management
 */
export function useAuth() {
  const authStore = useAuthStore()
  const api = useApi()
  const router = useRouter()

  /**
   * Login with email and password
   * Validates that user has ADMIN role before allowing access
   */
  async function login(credentials: LoginCredentials): Promise<void> {
    try {
      // Call the API to authenticate
      const response = await api.post<ApiLoginResponse>(
        '/auth/login',
        credentials as unknown as Record<string, unknown>
      )

      // Transform API response to frontend types
      const tokens = transformTokens(response.tokens)
      const user = transformUser(response.user)

      // Validate that user has ADMIN role
      if (user.role !== Role.ADMIN) {
        throw new AccessDeniedError()
      }

      // Store auth data
      authStore.login(tokens, user)

      api.showSuccessToast('Welcome back!', 'Login Successful')
      router.push('/admin')
    } catch (error) {
      // Handle AccessDeniedError specifically
      if (error instanceof AccessDeniedError) {
        api.showErrorToast({
          code: error.code,
          message: error.message,
          status: 403,
        })
        throw error
      }

      // Handle other API errors
      const apiError = api.parseError(error)
      api.showErrorToast(apiError)
      throw apiError
    }
  }

  /**
   * Logout and redirect to login
   */
  async function logout(): Promise<void> {
    // Optionally call logout API to revoke refresh token
    if (authStore.refreshToken) {
      try {
        await api.post('/auth/logout', {
          refresh_token: authStore.refreshToken,
        })
      } catch {
        // Ignore errors - we'll clear local auth anyway
      }
    }

    authStore.logout()
    router.push('/admin/login')
    api.showSuccessToast('You have been logged out', 'Logged Out')
  }

  /**
   * Refresh access token using refresh token
   */
  async function refreshAccessToken(): Promise<boolean> {
    if (!authStore.refreshToken) {
      return false
    }

    try {
      const response = await api.post<ApiTokenResponse>('/auth/refresh', {
        refresh_token: authStore.refreshToken,
      })

      const tokens = transformTokens(response)
      authStore.setTokens(tokens)
      return true
    } catch {
      // Refresh failed - clear auth and redirect to login
      authStore.clearAuth()
      router.push('/admin/login')
      api.showErrorToast({
        code: 'SESSION_EXPIRED',
        message: 'Session expired. Please log in again.',
        status: 401,
      })
      return false
    }
  }

  /**
   * Get current user info from API
   */
  async function fetchCurrentUser(): Promise<User | null> {
    if (!authStore.accessToken) {
      return null
    }

    try {
      const response = await api.get<ApiUserResponse>('/auth/me')
      const user = transformUser(response)
      authStore.setUser(user)
      return user
    } catch {
      return null
    }
  }

  return {
    login,
    logout,
    refreshAccessToken,
    fetchCurrentUser,
    // Re-export store state for convenience
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
  }
}

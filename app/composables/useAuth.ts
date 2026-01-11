import type { LoginCredentials, AuthTokens, User } from '~/types/auth'
import { Role } from '~/types/auth'

/**
 * Auth composable for login, logout, and token management
 */
export function useAuth() {
  const authStore = useAuthStore()
  const api = useApi()
  const router = useRouter()

  /**
   * Login with email and password
   */
  async function login(credentials: LoginCredentials): Promise<void> {
    try {
      // In production, call the actual API
      // const response = await api.post<{ tokens: AuthTokens; user: User }>('/auth/login', credentials)
      // authStore.login(response.tokens, response.user)

      // Mock login for development
      await mockLogin(credentials)

      api.showSuccessToast('Welcome back!', 'Login Successful')
      router.push('/admin')
    } catch (error) {
      api.showErrorToast(error as ReturnType<typeof api.parseError>)
      throw error
    }
  }

  /**
   * Mock login for development
   */
  async function mockLogin(credentials: LoginCredentials): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock credentials check
    if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
      const mockTokens: AuthTokens = {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        tokenType: 'Bearer',
        expiresIn: 3600,
      }

      const mockUser: User = {
        id: '1',
        email: credentials.email,
        fullName: 'Admin User',
        role: Role.ADMIN,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      authStore.login(mockTokens, mockUser)
    } else if (credentials.email === 'staff@example.com' && credentials.password === 'password') {
      const mockTokens: AuthTokens = {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        tokenType: 'Bearer',
        expiresIn: 3600,
      }

      const mockUser: User = {
        id: '2',
        email: credentials.email,
        fullName: 'Staff User',
        role: Role.STAFF,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      authStore.login(mockTokens, mockUser)
    } else {
      const error = new Error('Invalid email or password')
      Object.assign(error, {
        code: 'AUTHENTICATION_ERROR',
        message: 'Invalid email or password',
        status: 401,
      })
      throw error
    }
  }

  /**
   * Logout and redirect to login
   */
  function logout(): void {
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

    // In production, call the actual API
    // const response = await api.post<{ tokens: AuthTokens }>('/auth/refresh', {
    //   refreshToken: authStore.refreshToken,
    // })
    // authStore.setTokens(response.tokens)
    // try {
    //   return true
    // } catch {
    //   authStore.clearAuth()
    //   return false
    // }
    return true
  }

  /**
   * Get current user info
   */
  async function fetchCurrentUser(): Promise<User | null> {
    if (!authStore.accessToken) {
      return null
    }

    try {
      // In production, call the actual API
      // const response = await api.get<User>('/auth/me')
      // authStore.setUser(response)
      // return response
      return authStore.user
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

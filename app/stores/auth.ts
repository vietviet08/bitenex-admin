import { defineStore } from 'pinia'
import { useLocalStorage, StorageSerializers } from '@vueuse/core'
import type { User, AuthTokens, Role } from '~/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // State with localStorage persistence
  const accessToken = useLocalStorage<string | null>('admin_access_token', null)
  const refreshToken = useLocalStorage<string | null>('admin_refresh_token', null)
  // Use object serializer for proper JSON serialization
  const user = useLocalStorage<User | null>('admin_user', null, {
    serializer: StorageSerializers.object,
  })

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  const userRole = computed<Role | null>(() => user.value?.role ?? null)

  // Actions
  function setTokens(tokens: AuthTokens) {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
  }

  function setUser(newUser: User) {
    user.value = newUser
  }

  function clearAuth() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  function login(tokens: AuthTokens, userData: User) {
    setTokens(tokens)
    setUser(userData)
  }

  function logout() {
    clearAuth()
  }

  function updateUser(updates: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...updates }
    }
  }

  return {
    // State
    accessToken,
    refreshToken,
    user,
    // Getters
    isAuthenticated,
    userRole,
    // Actions
    setTokens,
    setUser,
    clearAuth,
    login,
    logout,
    updateUser,
  }
})

import type { UserEntity } from '~/types/user'
import type { Role } from '~/types/auth'

export type UserListViewState = 'loading' | 'error' | 'empty' | 'ready'

/**
 * Filter users client-side by search query (name or email)
 */
export function filterUsers(items: UserEntity[], query: string): UserEntity[] {
  if (!query.trim()) return items
  const normalized = query.toLowerCase()
  return items.filter(
    (u) =>
      u.fullName.toLowerCase().includes(normalized) ||
      u.email.toLowerCase().includes(normalized)
  )
}

/**
 * Determine the list view state
 */
export function getUserListViewState(params: {
  isLoading: boolean
  errorMessage: string
  items: UserEntity[]
}): UserListViewState {
  if (params.isLoading) return 'loading'
  if (params.errorMessage) return 'error'
  if (params.items.length === 0) return 'empty'
  return 'ready'
}

/**
 * Badge color for active / inactive status
 */
export function activeStatusColor(isActive: boolean): 'success' | 'neutral' {
  return isActive ? 'success' : 'neutral'
}

/**
 * Badge color for user role
 */
export function roleColor(role: Role): 'primary' | 'info' | 'warning' | 'neutral' {
  const map: Record<string, 'primary' | 'info' | 'warning' | 'neutral'> = {
    ADMIN: 'primary',
    MERCHANT: 'warning',
    DRIVER: 'info',
    USER: 'neutral',
  }
  return map[role] ?? 'neutral'
}

/**
 * Apply deactivation optimistically
 */
export function applyDeactivate(items: UserEntity[], userId: string): UserEntity[] {
  return items.map((u) => (u.id === userId ? { ...u, isActive: false } : u))
}

/**
 * Apply activation optimistically
 */
export function applyActivate(items: UserEntity[], userId: string): UserEntity[] {
  return items.map((u) => (u.id === userId ? { ...u, isActive: true } : u))
}

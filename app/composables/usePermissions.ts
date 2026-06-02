import { Role } from '~/types/auth'

/**
 * Feature permissions by role
 */
const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [Role.ADMIN]: [
    'dashboard',
    'users',
    'settings',
    'orders',
    'payments',
    'merchants',
    'reports',
    'drivers',
    'tickets',
    'promotions',
    'copilot',
  ],
  [Role.USER]: [],
  [Role.DRIVER]: [],
  [Role.MERCHANT]: [],
}

/**
 * Menu items configuration
 */
export interface MenuItem {
  label: string
  icon: string
  to: string
  requiredRoles?: Role[]
  children?: MenuItem[]
}

/**
 * Permissions composable for RBAC checks
 */
export function usePermissions() {
  const authStore = useAuthStore()

  /**
   * Check if current user has any of the specified roles
   */
  function hasRole(roles: Role[]): boolean {
    if (!authStore.user) return false
    return roles.includes(authStore.user.role)
  }

  /**
   * Check if current user is admin
   */
  function isAdmin(): boolean {
    return hasRole([Role.ADMIN])
  }

  /**
   * Check if current user can access a specific feature
   */
  function canAccess(feature: string): boolean {
    if (!authStore.user) return false
    const role = authStore.user.role
    const permissions = ROLE_PERMISSIONS[role] || []
    return permissions.includes(feature)
  }

  /**
   * Get filtered menu items based on user role
   */
  function getVisibleMenuItems(items: MenuItem[]): MenuItem[] {
    if (!authStore.user) return []

    return items.filter((item) => {
      // If no roles specified, item is visible to all authenticated users
      if (!item.requiredRoles || item.requiredRoles.length === 0) {
        return true
      }
      return hasRole(item.requiredRoles)
    })
  }

  /**
   * Admin sidebar menu items
   */
  const adminMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'i-heroicons-home',
      to: '/admin',
    },
    {
      label: 'Users',
      icon: 'i-heroicons-users',
      to: '/admin/users',
      requiredRoles: [Role.ADMIN],
    },
    {
      label: 'Merchants',
      icon: 'i-heroicons-building-storefront',
      to: '/admin/merchants',
      requiredRoles: [Role.ADMIN],
    },
    {
      label: 'Orders',
      icon: 'i-heroicons-shopping-bag',
      to: '/admin/orders',
      requiredRoles: [Role.ADMIN],
    },
    {
      label: 'Drivers',
      icon: 'i-heroicons-truck',
      to: '/admin/drivers',
      requiredRoles: [Role.ADMIN],
    },
    {
      label: 'Payments',
      icon: 'i-heroicons-credit-card',
      to: '/admin/payments',
      requiredRoles: [Role.ADMIN],
    },
    {
      label: 'Tickets & AI Support',
      icon: 'i-heroicons-ticket',
      to: '/admin/tickets',
      requiredRoles: [Role.ADMIN],
    },
    {
      label: 'Promotions (AI)',
      icon: 'i-heroicons-receipt-percent',
      to: '/admin/promotions',
      requiredRoles: [Role.ADMIN],
    },
    {
      label: 'AI Copilot',
      icon: 'i-heroicons-sparkles',
      to: '/admin/copilot',
      requiredRoles: [Role.ADMIN],
    },
    {
      label: 'Settings',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/admin/settings',
      requiredRoles: [Role.ADMIN],
    },
  ]

  /**
   * Get visible admin menu items for current user
   */
  const visibleMenuItems = computed(() => getVisibleMenuItems(adminMenuItems))

  return {
    hasRole,
    isAdmin,
    canAccess,
    getVisibleMenuItems,
    adminMenuItems,
    visibleMenuItems,
  }
}

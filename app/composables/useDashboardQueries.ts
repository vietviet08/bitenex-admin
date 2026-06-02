import { useQuery } from '@tanstack/vue-query'

/**
 * Dashboard stats from API
 */
export interface DashboardStats {
  total_users: number
  total_drivers: number
  total_merchants: number
  total_orders: number
  pending_orders: number
  today_revenue: number
  active_drivers: number
}

/**
 * User stats from API
 */
export interface UserStats {
  total: number
  active: number
  verified: number
  new_today: number
  new_this_week: number
  new_this_month: number
}

/**
 * Order stats from API
 */
export interface OrderStats {
  total: number
  by_status: Record<string, number>
  today_count: number
  today_revenue: number
  week_count: number
  week_revenue: number
}

/**
 * Merchant stats from API
 */
export interface MerchantStats {
  total: number
  pending_approval: number
  active: number
  suspended: number
}

/**
 * Driver stats from API
 */
export interface DriverStats {
  total: number
  online: number
  busy: number
  offline: number
  pending_approval: number
}

/**
 * Get dashboard statistics
 */
export function useDashboardStats() {
  const api = useApi()

  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async (): Promise<DashboardStats> => {
      return await api.get<DashboardStats>('/admin/dashboard')
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
  })
}

/**
 * Get user statistics
 */
export function useUserStats() {
  const api = useApi()

  return useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async (): Promise<UserStats> => {
      return await api.get<UserStats>('/admin/stats/users')
    },
  })
}

/**
 * Get order statistics
 */
export function useOrderStats() {
  const api = useApi()

  return useQuery({
    queryKey: ['admin-order-stats'],
    queryFn: async (): Promise<OrderStats> => {
      return await api.get<OrderStats>('/admin/stats/orders')
    },
  })
}

/**
 * Get merchant statistics
 */
export function useMerchantStats() {
  const api = useApi()

  return useQuery({
    queryKey: ['admin-merchant-stats'],
    queryFn: async (): Promise<MerchantStats> => {
      return await api.get<MerchantStats>('/admin/stats/merchants')
    },
  })
}

/**
 * Get driver statistics
 */
export function useDriverStats() {
  const api = useApi()

  return useQuery({
    queryKey: ['admin-driver-stats'],
    queryFn: async (): Promise<DriverStats> => {
      return await api.get<DriverStats>('/admin/stats/drivers')
    },
  })
}

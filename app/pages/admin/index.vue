<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
      <UButton
        icon="i-heroicons-arrow-path"
        variant="ghost"
        :loading="isLoading"
        @click="refreshAll"
      >
        Refresh
      </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Users -->
      <UCard>
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <UIcon name="i-heroicons-users" class="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ isLoading ? '-' : formatNumber(dashboardStats?.total_users || 0) }}
            </p>
          </div>
        </div>
      </UCard>

      <!-- Total Orders -->
      <UCard>
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
            <UIcon
              name="i-heroicons-shopping-bag"
              class="h-6 w-6 text-green-600 dark:text-green-400"
            />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ isLoading ? '-' : formatNumber(dashboardStats?.total_orders || 0) }}
            </p>
            <p v-if="dashboardStats?.pending_orders" class="text-xs text-orange-500">
              {{ dashboardStats.pending_orders }} pending
            </p>
          </div>
        </div>
      </UCard>

      <!-- Today's Revenue -->
      <UCard>
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <UIcon
              name="i-heroicons-currency-dollar"
              class="h-6 w-6 text-purple-600 dark:text-purple-400"
            />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Today's Revenue</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ isLoading ? '-' : formatCurrency(dashboardStats?.today_revenue || 0) }}
            </p>
          </div>
        </div>
      </UCard>

      <!-- Active Drivers -->
      <UCard>
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <UIcon name="i-heroicons-truck" class="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Active Drivers</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ isLoading ? '-' : formatNumber(dashboardStats?.active_drivers || 0) }}
            </p>
            <p class="text-xs text-gray-400">of {{ dashboardStats?.total_drivers || 0 }} total</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Quick Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Merchants -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-white">Merchants</h3>
            <UButton variant="ghost" size="xs" to="/admin/merchants">View All</UButton>
          </div>
        </template>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">Total</span>
            <span class="font-medium">{{ merchantStats?.total || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">Active</span>
            <UBadge color="success" variant="subtle">{{ merchantStats?.active || 0 }}</UBadge>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">Pending Approval</span>
            <UBadge color="warning" variant="subtle">{{
              merchantStats?.pending_approval || 0
            }}</UBadge>
          </div>
        </div>
      </UCard>

      <!-- Drivers -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-white">Drivers</h3>
            <UButton variant="ghost" size="xs" to="/admin/drivers">View All</UButton>
          </div>
        </template>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">Online</span>
            <UBadge color="success" variant="subtle">{{ driverStats?.online || 0 }}</UBadge>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">Busy</span>
            <UBadge color="warning" variant="subtle">{{ driverStats?.busy || 0 }}</UBadge>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">Offline</span>
            <UBadge color="gray" variant="subtle">{{ driverStats?.offline || 0 }}</UBadge>
          </div>
        </div>
      </UCard>

      <!-- Users -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-white">Users</h3>
            <UButton variant="ghost" size="xs" to="/admin/users">View All</UButton>
          </div>
        </template>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">New Today</span>
            <span class="font-medium text-green-600">+{{ userStats?.new_today || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">This Week</span>
            <span class="font-medium">+{{ userStats?.new_this_week || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">Verified</span>
            <UBadge color="info" variant="subtle">{{ userStats?.verified || 0 }}</UBadge>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Order Status Distribution -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Order Status -->
      <UCard>
        <template #header>
          <h3 class="font-semibold text-gray-900 dark:text-white">Order Status Distribution</h3>
        </template>
        <div v-if="orderStats" class="space-y-4">
          <div v-for="(count, status) in orderStats.by_status" :key="status" class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">{{ formatStatus(String(status)) }}</span>
              <span class="font-medium">{{ count }}</span>
            </div>
            <UProgress
              :value="getPercentage(count, orderStats.total)"
              :color="getStatusColor(String(status))"
            />
          </div>
        </div>
      </UCard>

      <!-- Weekly Summary -->
      <UCard>
        <template #header>
          <h3 class="font-semibold text-gray-900 dark:text-white">This Week Summary</h3>
        </template>
        <div v-if="orderStats" class="space-y-6">
          <div class="text-center">
            <p class="text-sm text-gray-500">Weekly Revenue</p>
            <p class="text-3xl font-bold text-primary-600">
              {{ formatCurrency(orderStats.week_revenue) }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p class="text-sm text-gray-500">Orders</p>
              <p class="text-xl font-bold">{{ formatNumber(orderStats.week_count) }}</p>
            </div>
            <div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p class="text-sm text-gray-500">Avg. Order</p>
              <p class="text-xl font-bold">
                {{
                  formatCurrency(
                    orderStats.week_count > 0 ? orderStats.week_revenue / orderStats.week_count : 0
                  )
                }}
              </p>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    useDashboardStats,
    useUserStats,
    useOrderStats,
    useMerchantStats,
    useDriverStats,
  } from '~/composables/useDashboardQueries'

  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  // Fetch all stats
  const { data: dashboardStats, isLoading, refetch: refetchDashboard } = useDashboardStats()
  const { data: userStats, refetch: refetchUsers } = useUserStats()
  const { data: orderStats, refetch: refetchOrders } = useOrderStats()
  const { data: merchantStats, refetch: refetchMerchants } = useMerchantStats()
  const { data: driverStats, refetch: refetchDrivers } = useDriverStats()

  // Refresh all data
  function refreshAll() {
    refetchDashboard()
    refetchUsers()
    refetchOrders()
    refetchMerchants()
    refetchDrivers()
  }

  // Format helpers
  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  function formatStatus(status: string): string {
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase())
  }

  function getPercentage(value: number, total: number): number {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      PREPARING: 'primary',
      READY: 'success',
      PICKING_UP: 'info',
      DELIVERING: 'primary',
      DELIVERED: 'success',
      CANCELLED: 'error',
      REFUNDED: 'gray',
    }
    return colors[status] || 'gray'
  }
</script>

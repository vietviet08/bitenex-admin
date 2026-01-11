<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard Overview</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <UCard v-for="stat in stats" :key="stat.label">
        <div class="flex items-center gap-4">
          <div :class="['p-3 rounded-lg', stat.bgColor]">
            <UIcon :name="stat.icon" :class="['h-6 w-6', stat.iconColor]" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ stat.label }}
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stat.value }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Orders -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <UButton variant="ghost" size="sm" to="/admin/orders"> View All </UButton>
          </div>
        </template>

        <div class="space-y-4">
          <div
            v-for="order in recentOrders"
            :key="order.id"
            class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ order.id }}
              </p>
              <p class="text-sm text-gray-500">
                {{ order.customer }}
              </p>
            </div>
            <div class="text-right">
              <p class="font-medium text-gray-900 dark:text-white">
                {{ order.amount }}
              </p>
              <UBadge :color="getStatusColor(order.status)" variant="subtle" size="sm">
                {{ order.status }}
              </UBadge>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Top Merchants -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Top Merchants</h2>
            <UButton variant="ghost" size="sm" to="/admin/merchants"> View All </UButton>
          </div>
        </template>

        <div class="space-y-4">
          <div
            v-for="merchant in topMerchants"
            :key="merchant.id"
            class="flex items-center gap-4 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <UAvatar :alt="merchant.name" size="sm" />
            <div class="flex-1">
              <p class="font-medium text-gray-900 dark:text-white">
                {{ merchant.name }}
              </p>
              <p class="text-sm text-gray-500">{{ merchant.orders }} orders</p>
            </div>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ merchant.revenue }}
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  // Page meta
  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  // Mock stats data
  const stats = [
    {
      label: 'Total Users',
      value: '12,456',
      icon: 'i-heroicons-users',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Total Orders',
      value: '8,234',
      icon: 'i-heroicons-shopping-bag',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Revenue',
      value: '$45,678',
      icon: 'i-heroicons-currency-dollar',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Active Drivers',
      value: '156',
      icon: 'i-heroicons-truck',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ]

  // Mock recent orders
  const recentOrders = [
    { id: '#ORD-001', customer: 'John Doe', amount: '$45.00', status: 'Delivered' },
    { id: '#ORD-002', customer: 'Jane Smith', amount: '$32.50', status: 'Preparing' },
    { id: '#ORD-003', customer: 'Mike Johnson', amount: '$78.25', status: 'Delivering' },
    { id: '#ORD-004', customer: 'Sarah Wilson', amount: '$21.00', status: 'Pending' },
  ]

  // Mock top merchants
  const topMerchants = [
    { id: '1', name: 'Burger Palace', orders: 234, revenue: '$12,450' },
    { id: '2', name: 'Pizza Heaven', orders: 189, revenue: '$9,876' },
    { id: '3', name: 'Sushi Master', orders: 156, revenue: '$8,234' },
    { id: '4', name: 'Taco Town', orders: 123, revenue: '$6,543' },
  ]

  function getStatusColor(status: string): 'success' | 'warning' | 'info' | 'neutral' {
    const colors: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
      Delivered: 'success',
      Preparing: 'warning',
      Delivering: 'info',
      Pending: 'neutral',
    }
    return colors[status] || 'neutral'
  }
</script>

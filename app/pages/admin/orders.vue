<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h1>
      <UButton
        icon="i-heroicons-arrow-path"
        variant="ghost"
        :loading="isLoading"
        @click="fetchOrders"
      >
        Refresh
      </UButton>
    </div>

    <div class="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-6">
      <UInput
        v-model="search"
        placeholder="Search order/user/merchant/address..."
        icon="i-heroicons-magnifying-glass"
        class="xl:col-span-2"
      />
      <UInput
        v-model="userFilter"
        placeholder="Filter by user ID"
        icon="i-heroicons-user"
        class="xl:col-span-1"
      />
      <UInput
        v-model="merchantFilter"
        placeholder="Filter by merchant ID"
        icon="i-heroicons-building-storefront"
        class="xl:col-span-1"
      />
      <USelectMenu v-model="statusFilter" :items="statusOptions" class="xl:col-span-1" />
      <USelectMenu
        v-model="paymentStatusFilter"
        :items="paymentStatusOptions"
        class="xl:col-span-1"
      />
    </div>

    <UCard>
      <template v-if="listViewState === 'error'">
        <div class="space-y-3 py-12 text-center">
          <p class="text-sm text-red-500">{{ loadError }}</p>
          <UButton icon="i-heroicons-arrow-path" @click="fetchOrders">Retry</UButton>
        </div>
      </template>

      <template v-else-if="listViewState === 'empty'">
        <div class="py-12 text-center text-sm text-gray-500">No orders found.</div>
      </template>

      <template v-else>
        <UTable :columns="columns" :data="filteredOrders" :loading="isLoading">
          <template #order-cell="{ row }">
            <div class="space-y-0.5">
              <NuxtLink
                :to="`/admin/orders-detail?id=${row.original.id}`"
                class="font-medium text-primary-600 hover:underline"
              >
                {{ row.original.order_number }}
              </NuxtLink>
              <p class="text-xs text-gray-500">{{ row.original.id }}</p>
            </div>
          </template>

          <template #customer-cell="{ row }">
            <p class="max-w-[180px] truncate text-sm text-gray-700 dark:text-gray-200">
              {{ row.original.user_id }}
            </p>
          </template>

          <template #merchant-cell="{ row }">
            <p class="max-w-[180px] truncate text-sm text-gray-700 dark:text-gray-200">
              {{ row.original.merchant_id }}
            </p>
          </template>

          <template #amount-cell="{ row }">
            {{ formatCurrency(row.original.total) }}
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="orderStatusColor(row.original.status)" variant="subtle">
              {{ row.original.status }}
            </UBadge>
          </template>

          <template #payment-cell="{ row }">
            <UBadge :color="orderPaymentStatusColor(row.original.payment_status)" variant="subtle">
              {{ row.original.payment_status || 'NO_PAYMENT' }}
            </UBadge>
          </template>

          <template #created-cell="{ row }">
            {{ formatDate(row.original.created_at) }}
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center gap-2">
              <UButton size="sm" variant="soft" :to="`/admin/orders-detail?id=${row.original.id}`">
                Detail
              </UButton>
              <UButton
                size="sm"
                variant="ghost"
                :to="`/admin/payments?order_id=${row.original.id}`"
              >
                Payments
              </UButton>
              <UDropdownMenu
                v-if="getActionItems(row.original).length > 0"
                :items="getActionItems(row.original)"
              >
                <UButton
                  icon="i-heroicons-arrow-path-rounded-square"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :loading="updatingOrderId === row.original.id"
                />
              </UDropdownMenu>
            </div>
          </template>
        </UTable>
      </template>

      <div
        class="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700"
      >
        <p class="text-sm text-gray-500">
          Showing {{ filteredOrders.length }} of {{ total }} orders
        </p>
        <UPagination v-model="currentPage" :total="total" :page-count="pageSize" />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
  import { useDebounceFn } from '@vueuse/core'
  import dayjs from 'dayjs'
  import type { TableColumn } from '@nuxt/ui'
  import type {
    AdminOrderItem,
    AdminOrderListResponse,
    OrderPaymentStatus,
    OrderStatus,
  } from '~/types'
  import {
    getNextOrderStatuses,
    getOrderListViewState,
    orderPaymentStatusColor,
    orderStatusColor,
  } from '~/utils/orderManagement'

  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  const api = useApi()
  const toast = useToast()
  const { isAdmin } = usePermissions()

  const orders = ref<AdminOrderItem[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const loadError = ref('')
  const updatingOrderId = ref<string | null>(null)

  const search = ref('')
  const userFilter = ref('')
  const merchantFilter = ref('')
  const debouncedSearch = ref('')
  const debouncedUserFilter = ref('')
  const debouncedMerchantFilter = ref('')

  const currentPage = ref(1)
  const pageSize = 20

  const statusFilterValue = ref<OrderStatus | undefined>(undefined)
  const paymentStatusFilterValue = ref<OrderPaymentStatus | undefined>(undefined)

  const statusOptions = [
    { label: 'All status', value: undefined },
    { label: 'Pending', value: 'PENDING' as OrderStatus },
    { label: 'Confirmed', value: 'CONFIRMED' as OrderStatus },
    { label: 'Preparing', value: 'PREPARING' as OrderStatus },
    { label: 'Ready', value: 'READY' as OrderStatus },
    { label: 'Picking Up', value: 'PICKING_UP' as OrderStatus },
    { label: 'Delivering', value: 'DELIVERING' as OrderStatus },
    { label: 'Delivered', value: 'DELIVERED' as OrderStatus },
    { label: 'Cancelled', value: 'CANCELLED' as OrderStatus },
    { label: 'Refunded', value: 'REFUNDED' as OrderStatus },
  ]

  const paymentStatusOptions = [
    { label: 'All payments', value: undefined },
    { label: 'Pending', value: 'PENDING' as OrderPaymentStatus },
    { label: 'Processing', value: 'PROCESSING' as OrderPaymentStatus },
    { label: 'Completed', value: 'COMPLETED' as OrderPaymentStatus },
    { label: 'Failed', value: 'FAILED' as OrderPaymentStatus },
    { label: 'Refunded', value: 'REFUNDED' as OrderPaymentStatus },
    { label: 'Cancelled', value: 'CANCELLED' as OrderPaymentStatus },
  ]

  const statusFilter = computed({
    get: () =>
      statusOptions.find((opt) => opt.value === statusFilterValue.value) || statusOptions[0],
    set: (value: { label: string; value: OrderStatus | undefined }) => {
      statusFilterValue.value = value.value
      currentPage.value = 1
    },
  })

  const paymentStatusFilter = computed({
    get: () =>
      paymentStatusOptions.find((opt) => opt.value === paymentStatusFilterValue.value) ||
      paymentStatusOptions[0],
    set: (value: { label: string; value: OrderPaymentStatus | undefined }) => {
      paymentStatusFilterValue.value = value.value
    },
  })

  const columns: TableColumn<AdminOrderItem>[] = [
    { accessorKey: 'order_number', id: 'order', header: 'Order' },
    { accessorKey: 'user_id', id: 'customer', header: 'Customer' },
    { accessorKey: 'merchant_id', id: 'merchant', header: 'Merchant' },
    { accessorKey: 'total', id: 'amount', header: 'Total' },
    { accessorKey: 'status', id: 'status', header: 'Order Status' },
    { accessorKey: 'payment_status', id: 'payment', header: 'Payment' },
    { accessorKey: 'created_at', id: 'created', header: 'Created' },
    { id: 'actions' },
  ]

  const filteredOrders = computed(() => {
    if (!paymentStatusFilterValue.value) {
      return orders.value
    }
    return orders.value.filter((item) => item.payment_status === paymentStatusFilterValue.value)
  })

  const listViewState = computed(() =>
    getOrderListViewState({
      isLoading: isLoading.value,
      errorMessage: loadError.value,
      items: filteredOrders.value,
    })
  )

  const updateDebouncedSearch = useDebounceFn((value: string) => {
    debouncedSearch.value = value
    currentPage.value = 1
  }, 300)

  const updateDebouncedUserFilter = useDebounceFn((value: string) => {
    debouncedUserFilter.value = value
    currentPage.value = 1
  }, 300)

  const updateDebouncedMerchantFilter = useDebounceFn((value: string) => {
    debouncedMerchantFilter.value = value
    currentPage.value = 1
  }, 300)

  watch(search, (value) => updateDebouncedSearch(value))
  watch(userFilter, (value) => updateDebouncedUserFilter(value))
  watch(merchantFilter, (value) => updateDebouncedMerchantFilter(value))

  watch(
    [debouncedSearch, debouncedUserFilter, debouncedMerchantFilter, statusFilterValue, currentPage],
    () => fetchOrders()
  )

  onMounted(async () => {
    if (!isAdmin()) {
      await navigateTo('/admin')
      return
    }
    await fetchOrders()
  })

  async function fetchOrders() {
    isLoading.value = true
    loadError.value = ''
    try {
      const params: Record<string, unknown> = {
        page: currentPage.value,
        per_page: pageSize,
      }
      if (debouncedSearch.value.trim()) {
        params.search = debouncedSearch.value.trim()
      }
      if (debouncedUserFilter.value.trim()) {
        params.user_id = debouncedUserFilter.value.trim()
      }
      if (debouncedMerchantFilter.value.trim()) {
        params.merchant_id = debouncedMerchantFilter.value.trim()
      }
      if (statusFilterValue.value) {
        params.status = statusFilterValue.value
      }

      const response = await api.get<AdminOrderListResponse>('/orders/admin/list', params)
      orders.value = response.items
      total.value = response.total
    } catch (error) {
      const parsed = api.parseError(error)
      loadError.value = parsed.message
    } finally {
      isLoading.value = false
    }
  }

  function getActionItems(order: AdminOrderItem) {
    const nextStatuses = getNextOrderStatuses(order.status)
    if (nextStatuses.length === 0) {
      return []
    }

    return [
      nextStatuses.map((nextStatus) => ({
        label: `Set ${formatStatusLabel(nextStatus)}`,
        icon: 'i-heroicons-arrow-path',
        onSelect: () => updateOrderStatus(order, nextStatus),
      })),
    ]
  }

  async function updateOrderStatus(order: AdminOrderItem, nextStatus: OrderStatus) {
    updatingOrderId.value = order.id
    try {
      await api.post(`/orders/${order.id}/status`, {
        status: nextStatus,
        reason: `Admin changed status from ${order.status} to ${nextStatus}`,
      })
      api.showSuccessToast(`Order ${order.order_number} updated to ${nextStatus}`)
      await fetchOrders()
    } catch (error) {
      const parsed = api.parseError(error)
      toast.add({
        title: 'Order update failed',
        description: parsed.message,
        color: 'error',
      })
    } finally {
      updatingOrderId.value = null
    }
  }

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  function formatDate(value: string): string {
    return dayjs(value).format('MMM D, YYYY HH:mm')
  }

  function formatStatusLabel(value: OrderStatus): string {
    return value
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }
</script>

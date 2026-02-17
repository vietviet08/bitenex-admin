<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Order {{ order?.order_number || 'Detail' }}
        </h1>
        <p class="text-sm text-gray-500">Full operational context for support and reconciliation</p>
      </div>
      <UButton
        icon="i-heroicons-arrow-path"
        variant="ghost"
        :loading="isLoading"
        @click="fetchDetail"
      >
        Refresh
      </UButton>
    </div>

    <UCard v-if="isLoading && !order">
      <div class="py-12 text-center text-sm text-gray-500">Loading order detail...</div>
    </UCard>

    <UCard v-else-if="loadError">
      <div class="space-y-3 py-12 text-center">
        <p class="text-sm text-red-500">{{ loadError }}</p>
        <UButton icon="i-heroicons-arrow-path" @click="fetchDetail">Retry</UButton>
      </div>
    </UCard>

    <template v-else-if="order">
      <UCard>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p class="text-xs text-gray-500">Order Number</p>
            <p class="font-semibold text-gray-900 dark:text-white">{{ order.order_number }}</p>
            <p class="text-xs text-gray-500">{{ order.id }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Status</p>
            <UBadge :color="orderStatusColor(order.status)" variant="subtle">
              {{ order.status }}
            </UBadge>
          </div>
          <div>
            <p class="text-xs text-gray-500">Customer</p>
            <p class="text-sm text-gray-900 dark:text-white">{{ order.user_id }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Merchant</p>
            <p class="text-sm text-gray-900 dark:text-white">{{ order.merchant_id }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Driver</p>
            <p class="text-sm text-gray-900 dark:text-white">
              {{ order.driver_id || 'Unassigned' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Created At</p>
            <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(order.created_at) }}</p>
          </div>
          <div class="md:col-span-2 xl:col-span-2">
            <p class="text-xs text-gray-500">Delivery Address</p>
            <p class="text-sm text-gray-900 dark:text-white">{{ order.delivery_address }}</p>
          </div>
          <div class="md:col-span-2 xl:col-span-4">
            <p class="text-xs text-gray-500">Customer Note</p>
            <p class="text-sm text-gray-900 dark:text-white">
              {{ order.customer_note || 'No note' }}
            </p>
          </div>
        </div>

        <div
          class="mt-4 grid gap-3 border-t border-gray-200 pt-4 dark:border-gray-700 md:grid-cols-4"
        >
          <div>
            <p class="text-xs text-gray-500">Subtotal</p>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ formatCurrency(order.subtotal) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Delivery Fee</p>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ formatCurrency(order.delivery_fee) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Discount</p>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ formatCurrency(order.discount) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Total</p>
            <p class="font-semibold text-gray-900 dark:text-white">
              {{ formatCurrency(order.total) }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Status Transition</h2>
          <p class="text-xs text-gray-500">Follows backend transition guardrails</p>
        </div>

        <div class="grid gap-3 md:grid-cols-3">
          <USelectMenu v-model="nextStatusFilter" :items="nextStatusOptions" />
          <UInput
            v-model="statusReason"
            placeholder="Reason (optional)"
            icon="i-heroicons-chat-bubble-left-ellipsis"
          />
          <UButton :disabled="!nextStatusValue" :loading="isUpdatingStatus" @click="updateStatus">
            Update Status
          </UButton>
        </div>
      </UCard>

      <UCard>
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Items ({{ order.items.length }})
          </h2>
        </div>

        <UTable :columns="itemColumns" :data="order.items">
          <template #name-cell="{ row }">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ row.original.name }}</p>
              <p class="text-xs text-gray-500">{{ row.original.menu_item_id }}</p>
              <p v-if="row.original.notes" class="text-xs text-gray-500">
                Note: {{ row.original.notes }}
              </p>
            </div>
          </template>

          <template #unitPrice-cell="{ row }">
            {{ formatCurrency(row.original.price) }}
          </template>

          <template #subtotal-cell="{ row }">
            {{ formatCurrency(row.original.subtotal) }}
          </template>

          <template #options-cell="{ row }">
            <p class="max-w-[340px] text-xs text-gray-600 dark:text-gray-300">
              {{ formatSelectedOptions(row.original) }}
            </p>
          </template>
        </UTable>
      </UCard>

      <UCard>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Payments ({{ payments.length }})
          </h2>
          <UButton variant="soft" :to="`/admin/payments?order_id=${order.id}`"
            >Open Payment Board</UButton
          >
        </div>

        <div v-if="payments.length === 0" class="py-6 text-center text-sm text-gray-500">
          No payment attempts recorded for this order.
        </div>

        <UTable v-else :columns="paymentColumns" :data="payments">
          <template #transaction-cell="{ row }">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ row.original.transaction_id }}
              </p>
              <p class="text-xs text-gray-500">{{ row.original.id }}</p>
            </div>
          </template>

          <template #amount-cell="{ row }">
            {{ formatCurrency(row.original.amount) }}
          </template>

          <template #method-cell="{ row }">
            {{ paymentMethodLabel(row.original.method) }}
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="paymentStatusColor(row.original.status)" variant="subtle">
              {{ row.original.status }}
            </UBadge>
          </template>

          <template #created-cell="{ row }">
            {{ formatDate(row.original.created_at) }}
          </template>
        </UTable>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import type { TableColumn } from '@nuxt/ui'
  import type { OrderItemResponse, OrderResponse, OrderStatus, PaymentResponse } from '~/types'
  import {
    getNextOrderStatuses,
    orderStatusColor,
    parseSelectedOptions,
  } from '~/utils/orderManagement'
  import { paymentMethodLabel, paymentStatusColor } from '~/utils/paymentManagement'

  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  const route = useRoute()
  const api = useApi()
  const toast = useToast()
  const { isAdmin } = usePermissions()

  const order = ref<OrderResponse | null>(null)
  const payments = ref<PaymentResponse[]>([])
  const isLoading = ref(false)
  const isUpdatingStatus = ref(false)
  const loadError = ref('')
  const statusReason = ref('')
  const nextStatusValue = ref<OrderStatus | undefined>(undefined)

  const orderId = computed(() => String(route.query.id || ''))
  const nextStatuses = computed(() => (order.value ? getNextOrderStatuses(order.value.status) : []))

  const nextStatusOptions = computed(() => [
    { label: 'Select next status', value: undefined },
    ...nextStatuses.value.map((status) => ({
      label: formatStatusLabel(status),
      value: status,
    })),
  ])

  const nextStatusFilter = computed({
    get: () =>
      nextStatusOptions.value.find((opt) => opt.value === nextStatusValue.value) ||
      nextStatusOptions.value[0],
    set: (value: { label: string; value: OrderStatus | undefined }) => {
      nextStatusValue.value = value.value
    },
  })

  const itemColumns: TableColumn<OrderItemResponse>[] = [
    { accessorKey: 'name', id: 'name', header: 'Item' },
    { accessorKey: 'quantity', id: 'quantity', header: 'Qty' },
    { accessorKey: 'price', id: 'unitPrice', header: 'Unit Price' },
    { accessorKey: 'subtotal', id: 'subtotal', header: 'Subtotal' },
    { accessorKey: 'selected_options', id: 'options', header: 'Options' },
  ]

  const paymentColumns: TableColumn<PaymentResponse>[] = [
    { accessorKey: 'transaction_id', id: 'transaction', header: 'Transaction' },
    { accessorKey: 'amount', id: 'amount', header: 'Amount' },
    { accessorKey: 'method', id: 'method', header: 'Method' },
    { accessorKey: 'status', id: 'status', header: 'Status' },
    { accessorKey: 'created_at', id: 'created', header: 'Created' },
  ]

  watch(nextStatuses, (items) => {
    nextStatusValue.value = items[0]
  })

  onMounted(async () => {
    if (!isAdmin()) {
      await navigateTo('/admin')
      return
    }
    await fetchDetail()
  })

  async function fetchDetail() {
    if (!orderId.value) {
      loadError.value = 'Missing order ID in query string'
      return
    }

    isLoading.value = true
    loadError.value = ''
    try {
      const [orderResponse, paymentResponse] = await Promise.all([
        api.get<OrderResponse>(`/orders/${orderId.value}`),
        api.get<PaymentResponse[]>(`/payments/order/${orderId.value}`),
      ])
      order.value = orderResponse
      payments.value = paymentResponse
    } catch (error) {
      const parsed = api.parseError(error)
      loadError.value = parsed.message
    } finally {
      isLoading.value = false
    }
  }

  async function updateStatus() {
    if (!order.value || !nextStatusValue.value) {
      return
    }

    isUpdatingStatus.value = true
    try {
      await api.post(`/orders/${order.value.id}/status`, {
        status: nextStatusValue.value,
        reason:
          statusReason.value.trim() ||
          `Admin changed status from ${order.value.status} to ${nextStatusValue.value}`,
      })
      api.showSuccessToast(`Order updated to ${nextStatusValue.value}`)
      statusReason.value = ''
      await fetchDetail()
    } catch (error) {
      const parsed = api.parseError(error)
      toast.add({
        title: 'Status update failed',
        description: parsed.message,
        color: 'error',
      })
    } finally {
      isUpdatingStatus.value = false
    }
  }

  function formatSelectedOptions(item: OrderItemResponse): string {
    const options = parseSelectedOptions(item)
    if (options.length === 0) {
      return 'No options'
    }
    return options
      .map((opt) => {
        const group = opt.option_group_name || 'Option Group'
        const option = opt.option_name || opt.option_id || 'Option'
        const delta = Number(opt.price_delta || 0)
        return `${group}: ${option}${delta > 0 ? ` (+${formatCurrency(delta)})` : ''}`
      })
      .join(', ')
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

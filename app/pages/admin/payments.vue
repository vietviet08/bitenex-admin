<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Payment Management</h1>
      <UButton
        icon="i-heroicons-arrow-path"
        variant="ghost"
        :loading="isLoading"
        @click="fetchPayments"
      >
        Refresh
      </UButton>
    </div>

    <div class="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-5">
      <UInput
        v-model="search"
        placeholder="Search payment/order/transaction/user..."
        icon="i-heroicons-magnifying-glass"
        class="xl:col-span-2"
      />
      <UInput
        v-model="orderIdFilter"
        placeholder="Filter by order ID"
        icon="i-heroicons-shopping-bag"
      />
      <USelectMenu v-model="statusFilter" :items="statusOptions" />
      <USelectMenu v-model="methodFilter" :items="methodOptions" />
    </div>

    <UCard>
      <div
        v-if="selectedRefundPayment"
        class="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-900/10"
      >
        <div class="mb-3">
          <p class="font-medium text-gray-900 dark:text-white">
            Refund {{ selectedRefundPayment.transaction_id }}
          </p>
          <p class="text-xs text-gray-600 dark:text-gray-300">
            Refundable: {{ formatCurrency(selectedRefundPayment.refundable_amount) }}
          </p>
        </div>
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <UInput
            v-model="refundAmountInput"
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount (optional)"
          />
          <UInput v-model="refundReason" placeholder="Refund reason" class="lg:col-span-2" />
          <div class="flex items-center gap-2">
            <UButton :loading="isRefunding" @click="submitRefund">Submit Refund</UButton>
            <UButton color="neutral" variant="ghost" @click="cancelRefund">Cancel</UButton>
          </div>
        </div>
      </div>

      <template v-if="listViewState === 'error'">
        <div class="space-y-3 py-12 text-center">
          <p class="text-sm text-red-500">{{ loadError }}</p>
          <UButton icon="i-heroicons-arrow-path" @click="fetchPayments">Retry</UButton>
        </div>
      </template>

      <template v-else-if="listViewState === 'empty'">
        <div class="py-12 text-center text-sm text-gray-500">No payments found.</div>
      </template>

      <template v-else>
        <UTable :columns="columns" :data="payments" :loading="isLoading">
          <template #transaction-cell="{ row }">
            <div class="space-y-0.5">
              <p class="font-medium text-gray-900 dark:text-white">
                {{ row.original.transaction_id }}
              </p>
              <p class="text-xs text-gray-500">{{ row.original.id }}</p>
            </div>
          </template>

          <template #order-cell="{ row }">
            <NuxtLink
              :to="`/admin/orders-detail?id=${row.original.order_id}`"
              class="text-primary-600 hover:underline"
            >
              {{ row.original.order_id }}
            </NuxtLink>
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

          <template #refunded-cell="{ row }">
            <div class="space-y-0.5 text-xs">
              <p class="text-gray-700 dark:text-gray-200">
                {{ formatCurrency(row.original.refunded_amount) }} /
                {{ formatCurrency(row.original.amount) }}
              </p>
              <p class="text-gray-500">
                Remaining: {{ formatCurrency(row.original.refundable_amount) }}
              </p>
            </div>
          </template>

          <template #created-cell="{ row }">
            {{ formatDate(row.original.created_at) }}
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center gap-2">
              <UButton
                size="sm"
                variant="soft"
                :to="`/admin/orders-detail?id=${row.original.order_id}`"
              >
                Order
              </UButton>
              <UButton
                v-if="canIssueRefund(row.original)"
                size="sm"
                color="warning"
                variant="soft"
                @click="openRefund(row.original)"
              >
                Refund
              </UButton>
            </div>
          </template>
        </UTable>
      </template>

      <div
        class="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700"
      >
        <p class="text-sm text-gray-500">Showing {{ payments.length }} of {{ total }} payments</p>
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
    AdminPaymentItem,
    AdminPaymentListResponse,
    PaymentMethod,
    PaymentStatus,
    RefundCreateRequest,
    RefundResponse,
  } from '~/types'
  import {
    buildIdempotencyKey,
    canIssueRefund,
    getPaymentListViewState,
    paymentMethodLabel,
    paymentStatusColor,
  } from '~/utils/paymentManagement'

  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  const route = useRoute()
  const api = useApi()
  const toast = useToast()
  const { isAdmin } = usePermissions()

  const payments = ref<AdminPaymentItem[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const loadError = ref('')
  const isRefunding = ref(false)

  const search = ref('')
  const debouncedSearch = ref('')
  const orderIdFilter = ref('')
  const debouncedOrderIdFilter = ref('')

  const currentPage = ref(1)
  const pageSize = 20

  const statusFilterValue = ref<PaymentStatus | undefined>(undefined)
  const methodFilterValue = ref<PaymentMethod | undefined>(undefined)

  const selectedRefundPayment = ref<AdminPaymentItem | null>(null)
  const refundAmountInput = ref('')
  const refundReason = ref('')

  const statusOptions = [
    { label: 'All status', value: undefined },
    { label: 'Pending', value: 'PENDING' as PaymentStatus },
    { label: 'Processing', value: 'PROCESSING' as PaymentStatus },
    { label: 'Completed', value: 'COMPLETED' as PaymentStatus },
    { label: 'Failed', value: 'FAILED' as PaymentStatus },
    { label: 'Refunded', value: 'REFUNDED' as PaymentStatus },
    { label: 'Cancelled', value: 'CANCELLED' as PaymentStatus },
  ]

  const methodOptions = [
    { label: 'All methods', value: undefined },
    { label: 'VNPAY', value: 'VNPAY' as PaymentMethod },
    { label: 'Credit Card', value: 'CREDIT_CARD' as PaymentMethod },
    { label: 'Debit Card', value: 'DEBIT_CARD' as PaymentMethod },
    { label: 'Digital Wallet', value: 'DIGITAL_WALLET' as PaymentMethod },
    { label: 'Cash on Delivery', value: 'CASH_ON_DELIVERY' as PaymentMethod },
    { label: 'Bank Transfer', value: 'BANK_TRANSFER' as PaymentMethod },
  ]

  const statusFilter = computed({
    get: () =>
      statusOptions.find((opt) => opt.value === statusFilterValue.value) || statusOptions[0],
    set: (value: { label: string; value: PaymentStatus | undefined }) => {
      statusFilterValue.value = value.value
      currentPage.value = 1
    },
  })

  const methodFilter = computed({
    get: () =>
      methodOptions.find((opt) => opt.value === methodFilterValue.value) || methodOptions[0],
    set: (value: { label: string; value: PaymentMethod | undefined }) => {
      methodFilterValue.value = value.value
      currentPage.value = 1
    },
  })

  const listViewState = computed(() =>
    getPaymentListViewState({
      isLoading: isLoading.value,
      errorMessage: loadError.value,
      items: payments.value,
    })
  )

  const columns: TableColumn<AdminPaymentItem>[] = [
    { accessorKey: 'transaction_id', id: 'transaction', header: 'Transaction' },
    { accessorKey: 'order_id', id: 'order', header: 'Order' },
    { accessorKey: 'user_id', id: 'user', header: 'User' },
    { accessorKey: 'amount', id: 'amount', header: 'Amount' },
    { accessorKey: 'method', id: 'method', header: 'Method' },
    { accessorKey: 'status', id: 'status', header: 'Status' },
    { accessorKey: 'refunded_amount', id: 'refunded', header: 'Refund Progress' },
    { accessorKey: 'created_at', id: 'created', header: 'Created' },
    { id: 'actions' },
  ]

  const updateDebouncedSearch = useDebounceFn((value: string) => {
    debouncedSearch.value = value
    currentPage.value = 1
  }, 300)

  const updateDebouncedOrderFilter = useDebounceFn((value: string) => {
    debouncedOrderIdFilter.value = value
    currentPage.value = 1
  }, 300)

  watch(search, (value) => updateDebouncedSearch(value))
  watch(orderIdFilter, (value) => updateDebouncedOrderFilter(value))

  watch(
    [debouncedSearch, debouncedOrderIdFilter, statusFilterValue, methodFilterValue, currentPage],
    () => fetchPayments()
  )

  onMounted(async () => {
    if (!isAdmin()) {
      await navigateTo('/admin')
      return
    }

    if (typeof route.query.order_id === 'string' && route.query.order_id.trim()) {
      orderIdFilter.value = route.query.order_id.trim()
      debouncedOrderIdFilter.value = route.query.order_id.trim()
    }

    await fetchPayments()
  })

  async function fetchPayments() {
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
      if (debouncedOrderIdFilter.value.trim()) {
        params.order_id = debouncedOrderIdFilter.value.trim()
      }
      if (statusFilterValue.value) {
        params.status = statusFilterValue.value
      }
      if (methodFilterValue.value) {
        params.method = methodFilterValue.value
      }

      const response = await api.get<AdminPaymentListResponse>('/payments/admin/list', params)
      payments.value = response.items
      total.value = response.total
    } catch (error) {
      const parsed = api.parseError(error)
      loadError.value = parsed.message
    } finally {
      isLoading.value = false
    }
  }

  function openRefund(payment: AdminPaymentItem) {
    selectedRefundPayment.value = payment
    refundAmountInput.value = payment.refundable_amount > 0 ? String(payment.refundable_amount) : ''
    refundReason.value = ''
  }

  function cancelRefund() {
    selectedRefundPayment.value = null
    refundAmountInput.value = ''
    refundReason.value = ''
  }

  async function submitRefund() {
    if (!selectedRefundPayment.value) {
      return
    }

    if (!refundReason.value.trim()) {
      toast.add({
        title: 'Refund reason required',
        description: 'Please provide a reason before submitting.',
        color: 'warning',
      })
      return
    }

    const payload: RefundCreateRequest = {
      payment_id: selectedRefundPayment.value.id,
      reason: refundReason.value.trim(),
    }

    if (refundAmountInput.value.trim()) {
      const parsedAmount = Number(refundAmountInput.value)
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        toast.add({
          title: 'Invalid amount',
          description: 'Refund amount must be a positive number.',
          color: 'warning',
        })
        return
      }
      if (parsedAmount > selectedRefundPayment.value.refundable_amount) {
        toast.add({
          title: 'Amount exceeds refundable balance',
          description:
            'Please enter an amount lower than or equal to the remaining refundable value.',
          color: 'warning',
        })
        return
      }
      payload.amount = parsedAmount
    }

    isRefunding.value = true
    try {
      const refund = await api.post<RefundResponse>(
        '/payments/refund',
        payload as unknown as Record<string, unknown>,
        {
          headers: {
            'Idempotency-Key': buildIdempotencyKey(
              `admin-refund-${selectedRefundPayment.value.id}`
            ),
          },
        }
      )
      api.showSuccessToast(`Refund ${refund.id} created successfully`)
      cancelRefund()
      await fetchPayments()
    } catch (error) {
      const parsed = api.parseError(error)
      toast.add({
        title: 'Refund failed',
        description: parsed.message,
        color: 'error',
      })
    } finally {
      isRefunding.value = false
    }
  }

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  function formatDate(value: string): string {
    return dayjs(value).format('MMM D, YYYY HH:mm')
  }
</script>

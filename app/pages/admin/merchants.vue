<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Merchant Management</h1>
      <UButton
        icon="i-heroicons-arrow-path"
        variant="ghost"
        :loading="isLoading"
        @click="fetchMerchants"
      >
        Refresh
      </UButton>
    </div>

    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <UInput
        v-model="search"
        placeholder="Search merchant name or owner email..."
        icon="i-heroicons-magnifying-glass"
        class="flex-1"
      />
      <USelectMenu v-model="statusFilter" :items="statusOptions" class="w-full md:w-56" />
    </div>

    <UCard>
      <template v-if="listViewState === 'error'">
        <div class="py-12 text-center space-y-3">
          <p class="text-sm text-red-500">{{ loadError }}</p>
          <UButton icon="i-heroicons-arrow-path" @click="fetchMerchants">Retry</UButton>
        </div>
      </template>

      <template v-else-if="listViewState === 'empty'">
        <div class="py-12 text-center text-sm text-gray-500">
          No merchants found for the selected filters.
        </div>
      </template>

      <template v-else>
        <UTable :columns="columns" :data="filteredMerchants" :loading="isLoading">
          <template #merchant-cell="{ row }">
            <div class="space-y-0.5">
              <NuxtLink
                :to="`/admin/merchants/${row.original.id}`"
                class="font-medium text-primary-600 hover:underline"
              >
                {{ row.original.name }}
              </NuxtLink>
              <p class="text-xs text-gray-500">{{ row.original.slug }}</p>
            </div>
          </template>

          <template #owner-cell="{ row }">
            <div class="space-y-0.5">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ row.original.owner_full_name || 'Unknown owner' }}
              </p>
              <p class="text-xs text-gray-500">{{ row.original.owner_email || 'No email' }}</p>
            </div>
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="statusColor(row.original.status)" variant="subtle">
              {{ row.original.status }}
            </UBadge>
          </template>

          <template #created-cell="{ row }">
            {{ formatDate(row.original.created_at) }}
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center gap-2">
              <UButton size="sm" variant="soft" :to="`/admin/merchants/${row.original.id}`">
                Detail
              </UButton>
              <UButton
                v-if="row.original.status === 'PENDING'"
                size="sm"
                color="success"
                :loading="approvingId === row.original.id"
                @click="approve(row.original.id)"
              >
                Approve
              </UButton>
            </div>
          </template>
        </UTable>
      </template>

      <div
        class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-500">
          Showing {{ filteredMerchants.length }} of {{ total }} merchants
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
  import type { AdminMerchantItem, AdminMerchantListResponse, MerchantStatus } from '~/types'
  import {
    applyApproveSuccess,
    filterMerchants,
    getMerchantListViewState,
    statusColor,
  } from '~/utils/merchantManagement'

  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  const api = useApi()
  const toast = useToast()
  const { isAdmin } = usePermissions()

  const merchants = ref<AdminMerchantItem[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const loadError = ref('')
  const approvingId = ref<string | null>(null)

  const search = ref('')
  const debouncedSearch = ref('')
  const currentPage = ref(1)
  const pageSize = 10
  const statusFilterValue = ref<MerchantStatus | undefined>('PENDING')

  const statusOptions = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'All statuses', value: undefined },
  ]

  const statusFilter = computed({
    get: () =>
      statusOptions.find((opt) => opt.value === statusFilterValue.value) || statusOptions[0],
    set: (value: { label: string; value: MerchantStatus | undefined }) => {
      statusFilterValue.value = value.value
    },
  })

  const columns: TableColumn<AdminMerchantItem>[] = [
    { accessorKey: 'name', id: 'merchant', header: 'Merchant' },
    { accessorKey: 'owner_full_name', id: 'owner', header: 'Owner' },
    { accessorKey: 'status', id: 'status', header: 'Status' },
    { accessorKey: 'created_at', id: 'created', header: 'Created' },
    { id: 'actions' },
  ]

  const filteredMerchants = computed(() => {
    return filterMerchants(merchants.value, debouncedSearch.value)
  })
  const listViewState = computed(() =>
    getMerchantListViewState({
      isLoading: isLoading.value,
      errorMessage: loadError.value,
      items: filteredMerchants.value,
    })
  )

  const updateDebouncedSearch = useDebounceFn((value: string) => {
    debouncedSearch.value = value
  }, 300)

  watch(search, (value) => updateDebouncedSearch(value))
  watch([statusFilterValue, currentPage], () => fetchMerchants())

  onMounted(async () => {
    if (!isAdmin()) {
      await navigateTo('/admin')
      return
    }
    await fetchMerchants()
  })

  async function fetchMerchants() {
    isLoading.value = true
    loadError.value = ''

    try {
      const response = await api.get<AdminMerchantListResponse>('/merchants/admin/list', {
        status: statusFilterValue.value,
        page: currentPage.value,
        per_page: pageSize,
      })
      merchants.value = response.items
      total.value = response.total
    } catch (error) {
      const parsed = api.parseError(error)
      loadError.value = parsed.message
    } finally {
      isLoading.value = false
    }
  }

  async function approve(merchantId: string) {
    approvingId.value = merchantId
    try {
      await api.post(`/merchants/${merchantId}/approve`)
      merchants.value = applyApproveSuccess(merchants.value, merchantId)
      api.showSuccessToast('Merchant approved successfully')
      await fetchMerchants()
    } catch (error) {
      const parsed = api.parseError(error)
      toast.add({
        title: 'Approval failed',
        description: parsed.message,
        color: 'error',
      })
    } finally {
      approvingId.value = null
    }
  }

  function formatDate(value: string): string {
    return dayjs(value).format('MMM D, YYYY HH:mm')
  }
</script>

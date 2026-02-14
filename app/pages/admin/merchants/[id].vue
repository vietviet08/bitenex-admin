<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Merchant Detail</h1>
        <p class="text-sm text-gray-500">Operational profile and menu visibility</p>
      </div>
      <UButton
        variant="ghost"
        icon="i-heroicons-arrow-path"
        :loading="isLoading"
        @click="fetchDetail"
      >
        Refresh
      </UButton>
    </div>

    <UCard v-if="merchant">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <p class="text-xs text-gray-500">Merchant</p>
          <p class="font-semibold text-gray-900 dark:text-white">{{ merchant.name }}</p>
          <p class="text-sm text-gray-500">{{ merchant.slug }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Status</p>
          <UBadge :color="statusColor(merchant.status)" variant="subtle">
            {{ merchant.status }}
          </UBadge>
        </div>
        <div>
          <p class="text-xs text-gray-500">Owner</p>
          <p class="text-sm text-gray-900 dark:text-white">
            {{ merchant.owner_full_name || 'Unknown owner' }}
          </p>
          <p class="text-sm text-gray-500">{{ merchant.owner_email || 'No email' }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Profile Completeness</p>
          <p class="text-sm text-gray-900 dark:text-white">
            {{ merchant.is_profile_complete ? 'Complete' : 'Incomplete' }}
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Address</p>
          <p class="text-sm text-gray-900 dark:text-white">{{ merchant.address }}</p>
          <p class="text-sm text-gray-500">{{ merchant.city }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Business Settings</p>
          <p class="text-sm text-gray-900 dark:text-white">
            Min order: ${{ merchant.min_order_amount.toFixed(2) }}
          </p>
          <p class="text-sm text-gray-500">
            Delivery fee: ${{ merchant.delivery_fee.toFixed(2) }} • Prep:
            {{ merchant.estimated_prep_time }} min
          </p>
        </div>
      </div>
    </UCard>

    <UCard>
      <template v-if="viewState === 'loading'">
        <div class="py-12 text-center text-sm text-gray-500">Loading merchant detail...</div>
      </template>

      <template v-else-if="viewState === 'error'">
        <div class="space-y-3 py-12 text-center">
          <p class="text-sm text-red-500">{{ loadError }}</p>
          <UButton icon="i-heroicons-arrow-path" @click="fetchDetail">Retry</UButton>
        </div>
      </template>

      <template v-else-if="viewState === 'empty_menu'">
        <div class="py-12 text-center text-sm text-gray-500">
          This merchant currently has no menu items.
        </div>
      </template>

      <template v-else>
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Menu ({{ menuItems.length }})
          </h2>
        </div>
        <UTable :columns="menuColumns" :data="menuItems">
          <template #name-cell="{ row }">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ row.original.name }}</p>
              <p class="text-xs text-gray-500">{{ row.original.category || 'Uncategorized' }}</p>
            </div>
          </template>
          <template #price-cell="{ row }"> ${{ row.original.price.toFixed(2) }} </template>
          <template #available-cell="{ row }">
            <UBadge :color="row.original.is_available ? 'success' : 'warning'" variant="subtle">
              {{ row.original.is_available ? 'Available' : 'Unavailable' }}
            </UBadge>
          </template>
        </UTable>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
  import type { TableColumn } from '@nuxt/ui'
  import type {
    AdminMerchantDetailResponse,
    AdminMerchantItem,
    AdminMerchantMenuItem,
  } from '~/types'
  import { getMerchantDetailViewState, statusColor } from '~/utils/merchantManagement'

  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  const route = useRoute()
  const api = useApi()
  const { isAdmin } = usePermissions()

  const merchant = ref<AdminMerchantItem | null>(null)
  const menuItems = ref<AdminMerchantMenuItem[]>([])
  const isLoading = ref(false)
  const loadError = ref('')

  const viewState = computed(() =>
    getMerchantDetailViewState({
      isLoading: isLoading.value,
      errorMessage: loadError.value,
      menuCount: menuItems.value.length,
    })
  )

  const menuColumns: TableColumn<AdminMerchantMenuItem>[] = [
    { accessorKey: 'name', id: 'name', header: 'Item' },
    { accessorKey: 'price', id: 'price', header: 'Price' },
    { accessorKey: 'is_available', id: 'available', header: 'Availability' },
  ]

  onMounted(async () => {
    if (!isAdmin()) {
      await navigateTo('/admin')
      return
    }
    await fetchDetail()
  })

  async function fetchDetail() {
    const merchantId = String(route.params.id || '')
    if (!merchantId) {
      loadError.value = 'Missing merchant ID'
      return
    }

    isLoading.value = true
    loadError.value = ''
    try {
      const response = await api.get<AdminMerchantDetailResponse>(
        `/merchants/admin/${merchantId}`,
        {
          page: 1,
          per_page: 50,
        }
      )
      merchant.value = response.merchant
      menuItems.value = response.menu.items
    } catch (error) {
      const parsed = api.parseError(error)
      loadError.value = parsed.message
    } finally {
      isLoading.value = false
    }
  }
</script>

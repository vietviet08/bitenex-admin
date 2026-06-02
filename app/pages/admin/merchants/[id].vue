<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton variant="ghost" icon="i-heroicons-arrow-left" to="/admin/merchants">
          Back
        </UButton>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ merchant?.name || 'Merchant Detail' }}
          </h1>
          <p class="text-sm text-gray-500">Manage merchant profile and menu</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          variant="ghost"
          icon="i-heroicons-arrow-path"
          :loading="isLoading"
          @click="fetchDetail"
        >
          Refresh
        </UButton>
        <UButton
          v-if="merchant?.status === 'PENDING'"
          color="success"
          :loading="approvingId === merchant?.id"
          @click="approveMerchant"
        >
          Approve
        </UButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !merchant" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-primary-500" />
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="text-center py-12">
      <p class="text-red-500 mb-4">{{ loadError }}</p>
      <UButton icon="i-heroicons-arrow-path" @click="fetchDetail">Retry</UButton>
    </div>

    <!-- Content -->
    <template v-else-if="merchant">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UCard>
          <div class="text-center">
            <p class="text-sm text-gray-500">Status</p>
            <UBadge :color="statusColor(merchant.status)" variant="subtle" class="mt-1">
              {{ merchant.status }}
            </UBadge>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <p class="text-sm text-gray-500">Rating</p>
            <div class="flex items-center justify-center gap-1 mt-1">
              <UIcon name="i-heroicons-star-solid" class="text-yellow-400 w-5 h-5" />
              <span class="text-xl font-bold">{{ merchant.average_rating.toFixed(1) }}</span>
            </div>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <p class="text-sm text-gray-500">Total Orders</p>
            <p class="text-xl font-bold mt-1">{{ merchant.total_orders }}</p>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <p class="text-sm text-gray-500">Menu Items</p>
            <p class="text-xl font-bold mt-1">{{ menuItems.length }}</p>
          </div>
        </UCard>
      </div>

      <!-- Merchant Info -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Basic Info -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-gray-900 dark:text-white">Basic Information</h3>
          </template>
          <div class="space-y-4">
            <div class="flex items-start gap-4">
              <UAvatar :src="merchant.logo_url || undefined" :alt="merchant.name" size="lg" />
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 dark:text-white">{{ merchant.name }}</h4>
                <p class="text-sm text-gray-500">{{ merchant.slug }}</p>
                <p
                  v-if="merchant.description"
                  class="text-sm text-gray-600 dark:text-gray-400 mt-2"
                >
                  {{ merchant.description }}
                </p>
              </div>
            </div>

            <UDivider />

            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500">Phone</p>
                <p class="text-sm font-medium">{{ merchant.phone || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">City</p>
                <p class="text-sm font-medium">{{ merchant.city }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Featured</p>
                <UBadge :color="merchant.is_featured ? 'success' : 'gray'" variant="subtle">
                  {{ merchant.is_featured ? 'Yes' : 'No' }}
                </UBadge>
              </div>
              <div>
                <p class="text-xs text-gray-500">Profile Complete</p>
                <UBadge
                  :color="merchant.is_profile_complete ? 'success' : 'warning'"
                  variant="subtle"
                >
                  {{ merchant.is_profile_complete ? 'Complete' : 'Incomplete' }}
                </UBadge>
              </div>
            </div>

            <UDivider />

            <div>
              <p class="text-xs text-gray-500">Address</p>
              <p class="text-sm">{{ merchant.address }}</p>
            </div>

            <div v-if="merchant.latitude && merchant.longitude">
              <p class="text-xs text-gray-500">Coordinates</p>
              <p class="text-sm text-gray-600">{{ merchant.latitude }}, {{ merchant.longitude }}</p>
            </div>
          </div>
        </UCard>

        <!-- Business Settings -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-gray-900 dark:text-white">Business Settings</h3>
          </template>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p class="text-xs text-gray-500">Min Order Amount</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ formatCurrency(merchant.min_order_amount) }}
                </p>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p class="text-xs text-gray-500">Delivery Fee</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ formatCurrency(merchant.delivery_fee) }}
                </p>
              </div>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p class="text-xs text-gray-500">Estimated Prep Time</p>
              <p class="text-lg font-bold text-gray-900 dark:text-white">
                {{ merchant.estimated_prep_time }} minutes
              </p>
            </div>

            <UDivider />

            <!-- Owner Info -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Owner Information
              </h4>
              <div class="flex items-center gap-3">
                <UAvatar :alt="merchant.owner_full_name || 'Owner'" size="sm" />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ merchant.owner_full_name || 'Unknown' }}
                  </p>
                  <p class="text-xs text-gray-500">{{ merchant.owner_email || 'No email' }}</p>
                </div>
              </div>
            </div>

            <UDivider />

            <!-- Timestamps -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500">Created</p>
                <p class="text-sm">{{ formatDate(merchant.created_at) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Updated</p>
                <p class="text-sm">{{ formatDate(merchant.updated_at) }}</p>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Menu Section -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              Menu Items ({{ menuItems.length }})
            </h3>
            <div class="flex items-center gap-2">
              <UInput
                v-model="menuSearch"
                placeholder="Search menu..."
                icon="i-heroicons-magnifying-glass"
                size="sm"
              />
              <USelectMenu
                v-model="categoryFilter"
                :items="categoryOptions"
                placeholder="All Categories"
                size="sm"
              />
            </div>
          </div>
        </template>

        <!-- Menu Table -->
        <UTable :columns="menuColumns" :data="filteredMenuItems" :loading="isLoading">
          <template #item-cell="{ row }">
            <div class="flex items-center gap-3">
              <UAvatar
                :src="row.original.image_url || undefined"
                :alt="row.original.name"
                size="sm"
              />
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ row.original.name }}</p>
                <p v-if="row.original.description" class="text-xs text-gray-500 line-clamp-1">
                  {{ row.original.description }}
                </p>
              </div>
            </div>
          </template>

          <template #category-cell="{ row }">
            <UBadge color="gray" variant="subtle">
              {{ row.original.category || 'Uncategorized' }}
            </UBadge>
          </template>

          <template #price-cell="{ row }">
            <span class="font-medium">{{ formatCurrency(row.original.price) }}</span>
          </template>

          <template #status-cell="{ row }">
            <div class="flex items-center gap-2">
              <UBadge :color="row.original.is_available ? 'success' : 'warning'" variant="subtle">
                {{ row.original.is_available ? 'Available' : 'Unavailable' }}
              </UBadge>
              <UBadge v-if="row.original.is_featured" color="primary" variant="subtle">
                Featured
              </UBadge>
            </div>
          </template>
        </UTable>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { TableColumn } from '@nuxt/ui'
  import type {
    AdminMerchantDetailResponse,
    AdminMerchantItem,
    AdminMerchantMenuItem,
  } from '~/types'
  import { statusColor } from '~/utils/merchantManagement'

  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  const route = useRoute()
  const api = useApi()
  const { isAdmin } = usePermissions()
  const toast = useToast()

  const merchant = ref<AdminMerchantItem | null>(null)
  const menuItems = ref<AdminMerchantMenuItem[]>([])
  const isLoading = ref(false)
  const loadError = ref('')
  const approvingId = ref<string | null>(null)

  const menuSearch = ref('')
  const categoryFilter = ref<string | undefined>(undefined)

  const categoryOptions = computed(() => {
    const categories = new Set(menuItems.value.map((item) => item.category).filter(Boolean))
    return [
      { label: 'All Categories', value: undefined },
      ...Array.from(categories).map((cat) => ({ label: cat!, value: cat! })),
    ]
  })

  const filteredMenuItems = computed(() => {
    let items = menuItems.value

    if (menuSearch.value) {
      const search = menuSearch.value.toLowerCase()
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          (item.description || '').toLowerCase().includes(search)
      )
    }

    if (categoryFilter.value) {
      items = items.filter((item) => item.category === categoryFilter.value)
    }

    return items
  })

  const menuColumns: TableColumn<AdminMerchantMenuItem>[] = [
    { accessorKey: 'name', id: 'item', header: 'Item' },
    { accessorKey: 'category', id: 'category', header: 'Category' },
    { accessorKey: 'price', id: 'price', header: 'Price' },
    { accessorKey: 'is_available', id: 'status', header: 'Status' },
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
        { page: 1, per_page: 100 }
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

  async function approveMerchant() {
    if (!merchant.value) return

    approvingId.value = merchant.value.id
    try {
      await api.post(`/merchants/${merchant.value.id}/approve`)
      toast.add({
        title: 'Success',
        description: 'Merchant approved successfully',
        color: 'success',
      })
      await fetchDetail()
    } catch (error) {
      const parsed = api.parseError(error)
      toast.add({
        title: 'Error',
        description: parsed.message,
        color: 'error',
      })
    } finally {
      approvingId.value = null
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
</script>

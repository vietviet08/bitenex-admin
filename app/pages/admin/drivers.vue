<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Driver Management</h1>
      <UButton
        icon="i-heroicons-arrow-path"
        variant="ghost"
        :loading="isLoading"
        @click="fetchDrivers"
      >
        Refresh
      </UButton>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <UInput
        v-model="search"
        placeholder="Search by name or vehicle plate..."
        icon="i-heroicons-magnifying-glass"
        class="flex-1"
      />
      <USelectMenu
        v-model="statusFilter"
        :items="statusOptions"
        placeholder="All Status"
        class="w-full md:w-48"
      />
      <USelectMenu
        v-model="approvalFilter"
        :items="approvalOptions"
        placeholder="All Approval"
        class="w-full md:w-48"
      />
    </div>

    <!-- Drivers Table -->
    <UCard>
      <template v-if="listViewState === 'error'">
        <div class="py-12 text-center space-y-3">
          <p class="text-sm text-red-500">{{ loadError }}</p>
          <UButton icon="i-heroicons-arrow-path" @click="fetchDrivers">Retry</UButton>
        </div>
      </template>

      <template v-else-if="listViewState === 'empty'">
        <div class="py-12 text-center text-sm text-gray-500">
          No drivers found for the selected filters.
        </div>
      </template>

      <template v-else>
        <UTable :columns="columns" :data="drivers" :loading="isLoading">
          <template #driver-cell="{ row }">
            <div class="flex items-center gap-3">
              <UAvatar :alt="row.original.userName || 'Driver'" size="sm" />
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ row.original.userName || 'Unknown' }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ row.original.userEmail || 'No email' }}
                </p>
              </div>
            </div>
          </template>

          <template #vehicle-cell="{ row }">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ row.original.vehiclePlate || 'N/A' }}
              </p>
              <p class="text-sm text-gray-500">
                {{ row.original.vehicleType || 'N/A' }} - {{ row.original.vehicleModel || 'N/A' }}
              </p>
            </div>
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="statusColor(row.original.status)" variant="subtle">
              {{ row.original.status }}
            </UBadge>
          </template>

          <template #approval-cell="{ row }">
            <UBadge :color="row.original.isApproved ? 'success' : 'warning'" variant="subtle">
              {{ row.original.isApproved ? 'Approved' : 'Pending' }}
            </UBadge>
          </template>

          <template #rating-cell="{ row }">
            <div class="flex items-center gap-1">
              <UIcon name="i-heroicons-star-solid" class="text-yellow-400 w-4 h-4" />
              <span>{{ row.original.averageRating.toFixed(1) }}</span>
            </div>
          </template>

          <template #deliveries-cell="{ row }">
            {{ row.original.totalDeliveries }}
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center gap-2">
              <UButton
                v-if="!row.original.isApproved"
                size="sm"
                color="success"
                :loading="approvingId === row.original.id"
                @click="approveDriver(row.original.id)"
              >
                Approve
              </UButton>
              <UDropdownMenu :items="getActionItems(row.original)">
                <UButton
                  icon="i-heroicons-ellipsis-vertical"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                />
              </UDropdownMenu>
            </div>
          </template>
        </UTable>
      </template>

      <!-- Pagination -->
      <div
        class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-500">Showing {{ drivers.length }} of {{ total }} drivers</p>
        <UPagination v-model="currentPage" :total="total" :page-count="pageSize" />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import type { TableColumn } from '@nuxt/ui'
import type { DriverEntity, DriverStatus, ApiDriverItem } from '~/types/driver'
import { transformDriverItem } from '~/types/driver'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const api = useApi()
const toast = useToast()

// State
const drivers = ref<DriverEntity[]>([])
const total = ref(0)
const isLoading = ref(false)
const loadError = ref('')
const approvingId = ref<string | null>(null)

const search = ref('')
const debouncedSearch = ref('')
const currentPage = ref(1)
const pageSize = 20

const statusFilterValue = ref<DriverStatus | undefined>(undefined)
const approvalFilterValue = ref<boolean | undefined>(undefined)

// Debounce
const debouncedSetSearch = useDebounceFn((value: string) => {
  debouncedSearch.value = value
  currentPage.value = 1
}, 300)

watch(search, (value) => debouncedSetSearch(value))

// Re-fetch when filters or page change
watch([statusFilterValue, approvalFilterValue, currentPage], () => fetchDrivers())
watch(debouncedSearch, () => {
  currentPage.value = 1
  fetchDrivers()
})

// Filter options
const statusOptions = [
  { label: 'All Status', value: undefined },
  { label: 'Online', value: 'ONLINE' },
  { label: 'Offline', value: 'OFFLINE' },
  { label: 'Busy', value: 'BUSY' },
  { label: 'Returning', value: 'RETURNING' },
]

const approvalOptions = [
  { label: 'All', value: undefined },
  { label: 'Approved', value: true },
  { label: 'Pending', value: false },
]

const statusFilter = computed({
  get: () => statusOptions.find((opt) => opt.value === statusFilterValue.value) || statusOptions[0],
  set: (value: { label: string; value: DriverStatus | undefined }) => {
    statusFilterValue.value = value.value
    currentPage.value = 1
  },
})

const approvalFilter = computed({
  get: () =>
    approvalOptions.find((opt) => opt.value === approvalFilterValue.value) || approvalOptions[0],
  set: (value: { label: string; value: boolean | undefined }) => {
    approvalFilterValue.value = value.value
    currentPage.value = 1
  },
})

// Table columns
const columns: TableColumn<DriverEntity>[] = [
  { accessorKey: 'userName', id: 'driver', header: 'Driver' },
  { accessorKey: 'vehiclePlate', id: 'vehicle', header: 'Vehicle' },
  { accessorKey: 'status', id: 'status', header: 'Status' },
  { accessorKey: 'isApproved', id: 'approval', header: 'Approval' },
  { accessorKey: 'averageRating', id: 'rating', header: 'Rating' },
  { accessorKey: 'totalDeliveries', id: 'deliveries', header: 'Deliveries' },
  { id: 'actions' },
]

// View state
const listViewState = computed(() => {
  if (isLoading.value) return 'loading'
  if (loadError.value) return 'error'
  if (drivers.value.length === 0) return 'empty'
  return 'data'
})

// Fetch
onMounted(() => fetchDrivers())

async function fetchDrivers() {
  isLoading.value = true
  loadError.value = ''

  try {
    const params: Record<string, unknown> = {
      page: currentPage.value,
      per_page: pageSize,
    }
    if (debouncedSearch.value) params.search = debouncedSearch.value
    if (statusFilterValue.value) params.status = statusFilterValue.value
    if (approvalFilterValue.value !== undefined) params.is_approved = approvalFilterValue.value

    const response = await api.get<ApiDriverItem[]>('/drivers/admin/list', params)
    drivers.value = response.map(transformDriverItem)
    total.value = response.length
  } catch (error) {
    const parsed = api.parseError(error)
    loadError.value = parsed.message
  } finally {
    isLoading.value = false
  }
}

// Actions
async function approveDriver(driverId: string) {
  approvingId.value = driverId
  try {
    await api.post(`/drivers/${driverId}/approve`)
    api.showSuccessToast('Driver approved successfully')
    await fetchDrivers()
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

function getActionItems(driver: DriverEntity) {
  return [
    [
      {
        label: 'View Details',
        icon: 'i-heroicons-eye',
        onSelect: () => {
          toast.add({
            title: 'Driver Details',
            description: `${driver.userName || 'Unknown'} - ${driver.vehiclePlate || 'N/A'}`,
          })
        },
      },
    ],
    ...(driver.isApproved
      ? []
      : [
          [
            {
              label: 'Approve',
              icon: 'i-heroicons-check-circle',
              color: 'success' as const,
              onSelect: () => approveDriver(driver.id),
            },
          ],
        ]),
  ]
}

// Helpers
function statusColor(status: DriverStatus) {
  switch (status) {
    case 'ONLINE':
      return 'success'
    case 'OFFLINE':
      return 'gray'
    case 'BUSY':
      return 'warning'
    case 'RETURNING':
      return 'info'
    default:
      return 'gray'
  }
}
</script>

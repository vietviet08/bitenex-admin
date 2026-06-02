<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton variant="ghost" icon="i-heroicons-arrow-left" to="/admin/drivers"> Back </UButton>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ driver?.userName || 'Driver Detail' }}
          </h1>
          <p class="text-sm text-gray-500">Driver profile and performance</p>
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
          v-if="driver && !driver.isApproved"
          color="success"
          :loading="isApproving"
          @click="approveDriver"
        >
          Approve
        </UButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !driver" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-primary-500" />
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="text-center py-12">
      <p class="text-red-500 mb-4">{{ loadError }}</p>
      <UButton icon="i-heroicons-arrow-path" @click="fetchDetail">Retry</UButton>
    </div>

    <!-- Content -->
    <template v-else-if="driver">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UCard>
          <div class="text-center">
            <p class="text-sm text-gray-500">Status</p>
            <UBadge :color="statusColor(driver.status)" variant="subtle" class="mt-1">
              {{ driver.status }}
            </UBadge>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <p class="text-sm text-gray-500">Approval</p>
            <UBadge
              :color="driver.isApproved ? 'success' : 'warning'"
              variant="subtle"
              class="mt-1"
            >
              {{ driver.isApproved ? 'Approved' : 'Pending' }}
            </UBadge>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <p class="text-sm text-gray-500">Rating</p>
            <div class="flex items-center justify-center gap-1 mt-1">
              <UIcon name="i-heroicons-star-solid" class="text-yellow-400 w-5 h-5" />
              <span class="text-xl font-bold">{{ driver.averageRating.toFixed(1) }}</span>
            </div>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <p class="text-sm text-gray-500">Deliveries</p>
            <p class="text-xl font-bold mt-1">{{ driver.totalDeliveries }}</p>
          </div>
        </UCard>
      </div>

      <!-- Driver Info -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Profile Info -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-gray-900 dark:text-white">Driver Information</h3>
          </template>
          <div class="space-y-4">
            <div class="flex items-start gap-4">
              <UAvatar :alt="driver.userName || 'Driver'" size="lg" />
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 dark:text-white">
                  {{ driver.userName || 'Unknown' }}
                </h4>
                <p class="text-sm text-gray-500">{{ driver.userEmail || 'No email' }}</p>
                <p v-if="driver.userPhone" class="text-sm text-gray-500">{{ driver.userPhone }}</p>
              </div>
            </div>

            <UDivider />

            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500">Driver ID</p>
                <p class="text-sm font-mono text-gray-600 dark:text-gray-400">{{ driver.id }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">User ID</p>
                <p class="text-sm font-mono text-gray-600 dark:text-gray-400">
                  {{ driver.userId }}
                </p>
              </div>
            </div>

            <UDivider />

            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500">Created</p>
                <p class="text-sm">{{ formatDate(driver.createdAt) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Updated</p>
                <p class="text-sm">{{ formatDate(driver.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Vehicle Info -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-gray-900 dark:text-white">Vehicle Information</h3>
          </template>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <UIcon name="i-heroicons-truck" class="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ driver.vehicleModel || 'No vehicle model' }}
                </p>
                <p class="text-sm text-gray-500">{{ driver.vehicleType || 'Unknown type' }}</p>
              </div>
            </div>

            <UDivider />

            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500">License Plate</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ driver.vehiclePlate || 'N/A' }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500">License Number</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ driver.licenseNumber || 'N/A' }}
                </p>
              </div>
            </div>

            <UDivider />

            <!-- Location -->
            <div>
              <p class="text-xs text-gray-500 mb-2">Current Location</p>
              <div
                v-if="driver.currentLatitude && driver.currentLongitude"
                class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-gray-400" />
                  <span class="text-sm">
                    {{ driver.currentLatitude.toFixed(6) }},
                    {{ driver.currentLongitude.toFixed(6) }}
                  </span>
                </div>
              </div>
              <div v-else class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                <p class="text-sm text-gray-500">Location not available</p>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Performance Stats -->
      <UCard>
        <template #header>
          <h3 class="font-semibold text-gray-900 dark:text-white">Performance Summary</h3>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <UIcon name="i-heroicons-star-solid" class="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ driver.averageRating.toFixed(1) }}
            </p>
            <p class="text-sm text-gray-500">Average Rating</p>
          </div>
          <div class="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <UIcon name="i-heroicons-shopping-bag" class="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ driver.totalDeliveries }}
            </p>
            <p class="text-sm text-gray-500">Total Deliveries</p>
          </div>
          <div class="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <UIcon
              :name="driver.isApproved ? 'i-heroicons-check-badge' : 'i-heroicons-clock'"
              :class="[
                'w-8 h-8 mx-auto mb-2',
                driver.isApproved ? 'text-green-400' : 'text-orange-400',
              ]"
            />
            <p class="text-lg font-bold text-gray-900 dark:text-white">
              {{ driver.isApproved ? 'Approved' : 'Pending' }}
            </p>
            <p class="text-sm text-gray-500">Approval Status</p>
          </div>
        </div>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { ApiDriverItem, DriverEntity } from '~/types/driver'
  import { transformDriverItem } from '~/types/driver'

  definePageMeta({
    layout: 'admin',
  })

  const route = useRoute()
  const api = useApi()
  const toast = useToast()

  const driver = ref<DriverEntity | null>(null)
  const isLoading = ref(false)
  const loadError = ref('')
  const isApproving = ref(false)

  onMounted(() => {
    fetchDetail()
  })

  async function fetchDetail() {
    const driverId = String(route.params.id || '')
    if (!driverId) {
      loadError.value = 'Missing driver ID'
      return
    }

    isLoading.value = true
    loadError.value = ''
    try {
      const response = await api.get<ApiDriverItem>(`/drivers/${driverId}`)
      driver.value = transformDriverItem(response)
    } catch (error) {
      const parsed = api.parseError(error)
      loadError.value = parsed.message
    } finally {
      isLoading.value = false
    }
  }

  async function approveDriver() {
    if (!driver.value) return

    isApproving.value = true
    try {
      await api.post(`/drivers/${driver.value.id}/approve`)
      toast.add({
        title: 'Success',
        description: 'Driver approved successfully',
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
      isApproving.value = false
    }
  }

  function statusColor(status: string): string {
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

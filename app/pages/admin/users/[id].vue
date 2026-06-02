<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton variant="ghost" icon="i-heroicons-arrow-left" to="/admin/users"> Back </UButton>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ user?.fullName || 'User Detail' }}
          </h1>
          <p class="text-sm text-gray-500">User profile and activity</p>
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
          v-if="user && !user.isActive"
          color="success"
          :loading="isToggling"
          @click="toggleActive"
        >
          Activate
        </UButton>
        <UButton
          v-if="user && user.isActive"
          color="error"
          variant="outline"
          :loading="isToggling"
          @click="toggleActive"
        >
          Deactivate
        </UButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !user" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-primary-500" />
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="text-center py-12">
      <p class="text-red-500 mb-4">{{ loadError }}</p>
      <UButton icon="i-heroicons-arrow-path" @click="fetchDetail">Retry</UButton>
    </div>

    <!-- Content -->
    <template v-else-if="user">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UCard>
          <div class="text-center">
            <p class="text-sm text-gray-500">Role</p>
            <UBadge :color="roleColor(user.role)" variant="subtle" class="mt-1">
              {{ user.role }}
            </UBadge>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <p class="text-sm text-gray-500">Status</p>
            <UBadge :color="user.isActive ? 'success' : 'error'" variant="subtle" class="mt-1">
              {{ user.isActive ? 'Active' : 'Inactive' }}
            </UBadge>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <p class="text-sm text-gray-500">Verified</p>
            <UBadge :color="user.isVerified ? 'success' : 'warning'" variant="subtle" class="mt-1">
              {{ user.isVerified ? 'Yes' : 'No' }}
            </UBadge>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <p class="text-sm text-gray-500">Addresses</p>
            <p class="text-xl font-bold mt-1">{{ addresses.length }}</p>
          </div>
        </UCard>
      </div>

      <!-- User Info -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Profile Info -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-gray-900 dark:text-white">Profile Information</h3>
          </template>
          <div class="space-y-4">
            <div class="flex items-start gap-4">
              <UAvatar :src="user.avatarUrl || undefined" :alt="user.fullName" size="lg" />
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 dark:text-white">{{ user.fullName }}</h4>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
                <p v-if="user.phone" class="text-sm text-gray-500">{{ user.phone }}</p>
              </div>
            </div>

            <UDivider />

            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500">User ID</p>
                <p class="text-sm font-mono text-gray-600 dark:text-gray-400">{{ user.id }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Email</p>
                <p class="text-sm font-medium">{{ user.email }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Phone</p>
                <p class="text-sm font-medium">{{ user.phone || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Role</p>
                <UBadge :color="roleColor(user.role)" variant="subtle">{{ user.role }}</UBadge>
              </div>
            </div>

            <UDivider />

            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500">Created</p>
                <p class="text-sm">{{ formatDate(user.createdAt) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Updated</p>
                <p class="text-sm">{{ formatDate(user.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Addresses -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-900 dark:text-white">Saved Addresses</h3>
              <UBadge color="gray" variant="subtle">{{ addresses.length }}</UBadge>
            </div>
          </template>

          <div v-if="addresses.length === 0" class="py-8 text-center text-sm text-gray-500">
            No addresses saved
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="address in addresses"
              :key="address.id"
              class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-gray-400" />
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ address.label }}
                    </span>
                    <UBadge v-if="address.is_default" color="primary" variant="subtle" size="xs">
                      Default
                    </UBadge>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ address.address_line1 }}
                  </p>
                  <p v-if="address.address_line2" class="text-sm text-gray-500">
                    {{ address.address_line2 }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ address.city }}{{ address.postal_code ? `, ${address.postal_code}` : '' }}
                  </p>
                  <p
                    v-if="address.latitude && address.longitude"
                    class="text-xs text-gray-400 mt-1"
                  >
                    {{ address.latitude }}, {{ address.longitude }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { ApiAdminUserItem, AddressResponse } from '~/types'
  import { transformUserItem } from '~/types/user'
  import { roleColor } from '~/utils/userManagement'

  definePageMeta({
    layout: 'admin',
  })

  const route = useRoute()
  const api = useApi()
  const toast = useToast()

  const user = ref<ReturnType<typeof transformUserItem> | null>(null)
  const addresses = ref<AddressResponse[]>([])
  const isLoading = ref(false)
  const loadError = ref('')
  const isToggling = ref(false)

  onMounted(() => {
    fetchDetail()
  })

  async function fetchDetail() {
    const userId = String(route.params.id || '')
    if (!userId) {
      loadError.value = 'Missing user ID'
      return
    }

    isLoading.value = true
    loadError.value = ''
    try {
      const [userResponse, addressesResponse] = await Promise.all([
        api.get<ApiAdminUserItem>(`/users/${userId}`),
        api.get<AddressResponse[]>(`/users/admin/${userId}/addresses`).catch(() => []),
      ])
      user.value = transformUserItem(userResponse)
      addresses.value = addressesResponse
    } catch (error) {
      const parsed = api.parseError(error)
      loadError.value = parsed.message
    } finally {
      isLoading.value = false
    }
  }

  async function toggleActive() {
    if (!user.value) return

    const action = user.value.isActive ? 'deactivate' : 'activate'
    isToggling.value = true
    try {
      await api.post(`/users/admin/${user.value.id}/${action}`)
      toast.add({
        title: 'Success',
        description: `User ${action}d successfully`,
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
      isToggling.value = false
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

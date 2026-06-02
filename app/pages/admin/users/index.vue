<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
      <UButton
        icon="i-heroicons-arrow-path"
        variant="ghost"
        :loading="isLoading"
        @click="fetchUsers"
      >
        Refresh
      </UButton>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <!-- Search -->
      <UInput
        v-model="search"
        placeholder="Search users by name or email..."
        icon="i-heroicons-magnifying-glass"
        class="flex-1"
      />

      <!-- Role Filter -->
      <USelectMenu
        v-model="roleFilter"
        :items="roleOptions"
        placeholder="All Roles"
        class="w-full md:w-48"
      />

      <!-- Status Filter -->
      <USelectMenu
        v-model="statusFilter"
        :items="statusOptions"
        placeholder="All Status"
        class="w-full md:w-48"
      />
    </div>

    <!-- Users Table -->
    <UCard>
      <template v-if="listViewState === 'error'">
        <div class="py-12 text-center space-y-3">
          <p class="text-sm text-red-500">{{ loadError }}</p>
          <UButton icon="i-heroicons-arrow-path" @click="fetchUsers">Retry</UButton>
        </div>
      </template>

      <template v-else-if="listViewState === 'empty'">
        <div class="py-12 text-center text-sm text-gray-500">
          No users found for the selected filters.
        </div>
      </template>

      <template v-else>
        <UTable :columns="columns" :data="users" :loading="isLoading">
          <template #name-cell="{ row }">
            <div class="flex items-center gap-3">
              <UAvatar :alt="row.original.fullName" size="sm" />
              <div>
                <NuxtLink
                  :to="`/admin/users/${row.original.id}`"
                  class="font-medium text-primary-600 hover:underline"
                >
                  {{ row.original.fullName }}
                </NuxtLink>
                <p class="text-sm text-gray-500">
                  {{ row.original.email }}
                </p>
              </div>
            </div>
          </template>

          <template #role-cell="{ row }">
            <UBadge :color="roleColor(row.original.role)" variant="subtle">
              {{ row.original.role }}
            </UBadge>
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="activeStatusColor(row.original.isActive)" variant="subtle">
              {{ row.original.isActive ? 'Active' : 'Inactive' }}
            </UBadge>
          </template>

          <template #createdAt-cell="{ row }">
            {{ formatDate(row.original.createdAt) }}
          </template>

          <template #actions-cell="{ row }">
            <UDropdownMenu :items="getActionItems(row.original)">
              <UButton
                icon="i-heroicons-ellipsis-vertical"
                variant="ghost"
                color="neutral"
                size="sm"
              />
            </UDropdownMenu>
          </template>
        </UTable>
      </template>

      <!-- Pagination -->
      <div
        class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-500">Showing {{ users.length }} of {{ total }} users</p>
        <UPagination v-model="currentPage" :total="total" :page-count="pageSize" />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
  import { useDebounceFn } from '@vueuse/core'
  import dayjs from 'dayjs'
  import type { TableColumn } from '@nuxt/ui'
  import type { UserEntity, ApiAdminUserListResponse } from '~/types/user'
  import { transformUserItem } from '~/types/user'
  import { getUserListViewState, activeStatusColor, roleColor } from '~/utils/userManagement'

  // Page meta
  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  const api = useApi()
  const toast = useToast()

  // ── State ────────────────────────────────────────────────────────────
  const users = ref<UserEntity[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const loadError = ref('')

  const search = ref('')
  const debouncedSearch = ref('')
  const currentPage = ref(1)
  const pageSize = 20

  const roleFilterValue = ref<string | undefined>(undefined)
  const statusFilterValue = ref<boolean | undefined>(undefined)

  // ── Debounce ─────────────────────────────────────────────────────────
  const debouncedSetSearch = useDebounceFn((value: string) => {
    debouncedSearch.value = value
    currentPage.value = 1
  }, 300)

  watch(search, (value) => debouncedSetSearch(value))

  // Re-fetch when filters or page change
  watch([roleFilterValue, statusFilterValue, currentPage], () => fetchUsers())
  watch(debouncedSearch, () => {
    currentPage.value = 1
    fetchUsers()
  })

  // ── Filter options ───────────────────────────────────────────────────
  const roleOptions = [
    { label: 'All Roles', value: undefined },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'User', value: 'USER' },
    { label: 'Merchant', value: 'MERCHANT' },
    { label: 'Driver', value: 'DRIVER' },
  ]

  const statusOptions = [
    { label: 'All Status', value: undefined },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ]

  const roleFilter = computed({
    get: () => roleOptions.find((opt) => opt.value === roleFilterValue.value) || roleOptions[0],
    set: (value: { label: string; value: string | undefined }) => {
      roleFilterValue.value = value.value
      currentPage.value = 1
    },
  })

  const statusFilter = computed({
    get: () =>
      statusOptions.find((opt) => opt.value === statusFilterValue.value) || statusOptions[0],
    set: (value: { label: string; value: boolean | undefined }) => {
      statusFilterValue.value = value.value
      currentPage.value = 1
    },
  })

  // ── Table columns ────────────────────────────────────────────────────
  const columns: TableColumn<UserEntity>[] = [
    { accessorKey: 'fullName', id: 'name', header: 'User' },
    { accessorKey: 'role', id: 'role', header: 'Role' },
    { accessorKey: 'isActive', id: 'status', header: 'Status' },
    { accessorKey: 'createdAt', id: 'createdAt', header: 'Created' },
    { id: 'actions' },
  ]

  // ── View state ───────────────────────────────────────────────────────
  const listViewState = computed(() =>
    getUserListViewState({
      isLoading: isLoading.value,
      errorMessage: loadError.value,
      items: users.value,
    })
  )

  // ── Fetch ────────────────────────────────────────────────────────────
  onMounted(() => fetchUsers())

  async function fetchUsers() {
    isLoading.value = true
    loadError.value = ''

    try {
      const params: Record<string, unknown> = {
        page: currentPage.value,
        per_page: pageSize,
      }
      if (debouncedSearch.value) params.search = debouncedSearch.value
      if (roleFilterValue.value) params.role = roleFilterValue.value
      if (statusFilterValue.value !== undefined) params.is_active = statusFilterValue.value

      const response = await api.get<ApiAdminUserListResponse>('/users/admin/list', params)
      users.value = response.items.map(transformUserItem)
      total.value = response.total
    } catch (error) {
      const parsed = api.parseError(error)
      loadError.value = parsed.message
    } finally {
      isLoading.value = false
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────
  async function toggleActive(user: UserEntity) {
    const action = user.isActive ? 'deactivate' : 'activate'
    try {
      await api.post(`/users/admin/${user.id}/${action}`)
      api.showSuccessToast(`User ${action}d successfully`)
      await fetchUsers()
    } catch (error) {
      const parsed = api.parseError(error)
      toast.add({
        title: `Failed to ${action} user`,
        description: parsed.message,
        color: 'error',
      })
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  function formatDate(date: string): string {
    return dayjs(date).format('MMM D, YYYY')
  }

  function getActionItems(user: UserEntity) {
    const toggleItem = user.isActive
      ? {
          label: 'Deactivate',
          icon: 'i-heroicons-no-symbol',
          color: 'error' as const,
          onSelect: () => toggleActive(user),
        }
      : {
          label: 'Activate',
          icon: 'i-heroicons-check-circle',
          color: 'success' as const,
          onSelect: () => toggleActive(user),
        }

    return [
      [
        {
          label: 'View Details',
          icon: 'i-heroicons-eye',
          onSelect: () => navigateTo(`/admin/users/${user.id}`),
        },
      ],
      [toggleItem],
    ]
  }
</script>

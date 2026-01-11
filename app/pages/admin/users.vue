<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
      <UButton icon="i-heroicons-plus"> Add User </UButton>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <!-- Search -->
      <UInput
        v-model="search"
        placeholder="Search users..."
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
      <UTable :columns="columns" :data="paginatedUsers" :loading="isLoading">
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :alt="row.original.fullName" size="sm" />
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ row.original.fullName }}
              </p>
              <p class="text-sm text-gray-500">
                {{ row.original.email }}
              </p>
            </div>
          </div>
        </template>

        <template #role-cell="{ row }">
          <UBadge :color="row.original.role === 'admin' ? 'primary' : 'neutral'" variant="subtle">
            {{ row.original.role }}
          </UBadge>
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="getStatusColor(row.original.status)" variant="subtle">
            {{ row.original.status }}
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

      <!-- Pagination -->
      <div
        class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-500">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to
          {{ Math.min(currentPage * pageSize, filteredUsers.length) }} of
          {{ filteredUsers.length }} results
        </p>
        <UPagination v-model="currentPage" :total="filteredUsers.length" :page-count="pageSize" />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
  import { useDebounceFn } from '@vueuse/core'
  import dayjs from 'dayjs'
  import type { TableColumn } from '@nuxt/ui'
  import type { UserEntity } from '~/types/user'
  import { UserStatus } from '~/types/user'
  import { Role } from '~/types/auth'

  // Page meta
  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  const toast = useToast()

  // State
  const search = ref('')
  const debouncedSearch = ref('')
  const roleFilterValue = ref<string | undefined>(undefined)
  const statusFilterValue = ref<string | undefined>(undefined)
  const currentPage = ref(1)
  const pageSize = 10
  const isLoading = ref(false)

  // Debounce search input
  const debouncedSetSearch = useDebounceFn((value: string) => {
    debouncedSearch.value = value
    currentPage.value = 1 // Reset to first page on search
  }, 300)

  watch(search, (value) => {
    debouncedSetSearch(value)
  })

  // Filter options
  const roleOptions = [
    { label: 'All Roles', value: undefined },
    { label: 'Admin', value: 'admin' },
    { label: 'Staff', value: 'staff' },
  ]

  const statusOptions = [
    { label: 'All Status', value: undefined },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Suspended', value: 'suspended' },
  ]

  // Convert filters between string and object for USelectMenu
  const roleFilter = computed({
    get: () => roleOptions.find((opt) => opt.value === roleFilterValue.value) || roleOptions[0],
    set: (value: { label: string; value: string | undefined }) => {
      roleFilterValue.value = value.value
    },
  })

  const statusFilter = computed({
    get: () =>
      statusOptions.find((opt) => opt.value === statusFilterValue.value) || statusOptions[0],
    set: (value: { label: string; value: string | undefined }) => {
      statusFilterValue.value = value.value
    },
  })

  // Table columns - Nuxt UI 4 uses accessorKey and id
  const columns: TableColumn<UserEntity>[] = [
    { accessorKey: 'fullName', id: 'name', header: 'User' },
    { accessorKey: 'role', id: 'role', header: 'Role' },
    { accessorKey: 'status', id: 'status', header: 'Status' },
    { accessorKey: 'createdAt', id: 'createdAt', header: 'Created' },
    { id: 'actions' },
  ]

  // Mock users data
  const users = ref<UserEntity[]>([
    {
      id: '1',
      fullName: 'John Admin',
      email: 'admin@example.com',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-01-01T10:00:00Z',
    },
    {
      id: '2',
      fullName: 'Jane Staff',
      email: 'staff@example.com',
      role: Role.STAFF,
      status: UserStatus.ACTIVE,
      createdAt: '2025-01-02T10:00:00Z',
      updatedAt: '2025-01-02T10:00:00Z',
    },
    {
      id: '3',
      fullName: 'Bob Manager',
      email: 'bob@example.com',
      role: Role.ADMIN,
      status: UserStatus.INACTIVE,
      createdAt: '2025-01-03T10:00:00Z',
      updatedAt: '2025-01-03T10:00:00Z',
    },
    {
      id: '4',
      fullName: 'Alice Support',
      email: 'alice@example.com',
      role: Role.STAFF,
      status: UserStatus.ACTIVE,
      createdAt: '2025-01-04T10:00:00Z',
      updatedAt: '2025-01-04T10:00:00Z',
    },
    {
      id: '5',
      fullName: 'Charlie Dev',
      email: 'charlie@example.com',
      role: Role.STAFF,
      status: UserStatus.SUSPENDED,
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
    {
      id: '6',
      fullName: 'Diana Ops',
      email: 'diana@example.com',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      createdAt: '2025-01-06T10:00:00Z',
      updatedAt: '2025-01-06T10:00:00Z',
    },
    {
      id: '7',
      fullName: 'Eve Sales',
      email: 'eve@example.com',
      role: Role.STAFF,
      status: UserStatus.ACTIVE,
      createdAt: '2025-01-07T10:00:00Z',
      updatedAt: '2025-01-07T10:00:00Z',
    },
    {
      id: '8',
      fullName: 'Frank HR',
      email: 'frank@example.com',
      role: Role.STAFF,
      status: UserStatus.INACTIVE,
      createdAt: '2025-01-08T10:00:00Z',
      updatedAt: '2025-01-08T10:00:00Z',
    },
  ])

  // Filtered users
  const filteredUsers = computed(() => {
    return users.value.filter((user) => {
      const matchesSearch =
        !debouncedSearch.value ||
        user.fullName.toLowerCase().includes(debouncedSearch.value.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearch.value.toLowerCase())

      const matchesRole = !roleFilterValue.value || user.role === roleFilterValue.value
      const matchesStatus = !statusFilterValue.value || user.status === statusFilterValue.value

      return matchesSearch && matchesRole && matchesStatus
    })
  })

  // Paginated users
  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    return filteredUsers.value.slice(start, end)
  })

  // Helper functions
  function getStatusColor(status: string): 'success' | 'warning' | 'error' | 'neutral' {
    const colors: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
      active: 'success',
      inactive: 'neutral',
      suspended: 'error',
    }
    return colors[status] || 'neutral'
  }

  function formatDate(date: string): string {
    return dayjs(date).format('MMM D, YYYY')
  }

  function getActionItems(user: UserEntity) {
    return [
      [
        {
          label: 'Edit',
          icon: 'i-heroicons-pencil',
          onSelect: () => {
            toast.add({ title: 'Edit', description: `Editing ${user.fullName}` })
          },
        },
        {
          label: 'View Details',
          icon: 'i-heroicons-eye',
          onSelect: () => {
            toast.add({ title: 'View', description: `Viewing ${user.fullName}` })
          },
        },
      ],
      [
        {
          label: 'Delete',
          icon: 'i-heroicons-trash',
          color: 'error' as const,
          onSelect: () => {
            toast.add({
              title: 'Delete',
              description: `Would delete ${user.fullName}`,
              color: 'error',
            })
          },
        },
      ],
    ]
  }
</script>

<template>
  <header
    class="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6"
  >
    <!-- Left: Mobile Menu Toggle -->
    <div class="flex items-center gap-4">
      <UButton
        icon="i-heroicons-bars-3"
        variant="ghost"
        color="neutral"
        class="md:hidden"
        @click="$emit('toggle-sidebar')"
      />
    </div>

    <!-- Right: User Menu & Theme Toggle -->
    <div class="flex items-center gap-4">
      <!-- Theme Toggle -->
      <ColorModeButton />

      <!-- Notifications -->
      <UButton icon="i-heroicons-bell" variant="ghost" color="neutral" />

      <!-- User Dropdown -->
      <UDropdownMenu :items="userMenuItems">
        <UButton variant="ghost" color="neutral" class="gap-2">
          <UAvatar :alt="user?.fullName || 'User'" size="sm" />
          <span class="hidden md:inline text-sm font-medium">
            {{ user?.fullName || 'User' }}
          </span>
          <UIcon name="i-heroicons-chevron-down" class="h-4 w-4" />
        </UButton>
      </UDropdownMenu>
    </div>
  </header>
</template>

<script setup lang="ts">
  defineEmits<{
    'toggle-sidebar': []
  }>()

  const { user, logout } = useAuth()

  const userMenuItems = [
    [
      {
        label: 'Profile',
        icon: 'i-heroicons-user',
        click: () => navigateTo('/admin/profile'),
      },
      {
        label: 'Settings',
        icon: 'i-heroicons-cog-6-tooth',
        click: () => navigateTo('/admin/settings'),
      },
    ],
    [
      {
        label: 'Logout',
        icon: 'i-heroicons-arrow-right-on-rectangle',
        click: () => logout(),
      },
    ],
  ]
</script>

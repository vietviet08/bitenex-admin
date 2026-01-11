<template>
  <aside
    :class="[
      'flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64',
    ]"
  >
    <!-- Logo -->
    <div
      class="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700"
    >
      <NuxtLink to="/admin" class="flex items-center gap-2">
        <UIcon name="i-heroicons-cube" class="h-8 w-8 text-primary-500" />
        <span v-if="!collapsed" class="text-xl font-bold text-gray-900 dark:text-white">
          Bitenex
        </span>
      </NuxtLink>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-4">
      <ul class="space-y-2">
        <li v-for="item in visibleMenuItems" :key="item.to">
          <NuxtLink
            :to="item.to"
            :class="[
              'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              isActive(item.to) &&
                'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
            ]"
          >
            <UIcon :name="item.icon" class="h-5 w-5 flex-shrink-0" />
            <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Collapse Button -->
    <div class="border-t border-gray-200 dark:border-gray-700 p-4">
      <UButton
        :icon="collapsed ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'"
        variant="ghost"
        color="neutral"
        block
        @click="$emit('toggle')"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
  defineProps<{
    collapsed: boolean
  }>()

  defineEmits<{
    toggle: []
  }>()

  const route = useRoute()
  const { visibleMenuItems } = usePermissions()

  function isActive(path: string): boolean {
    if (path === '/admin') {
      return route.path === '/admin'
    }
    return route.path.startsWith(path)
  }
</script>

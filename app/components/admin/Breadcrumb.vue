<template>
  <nav class="flex items-center text-sm">
    <ol class="flex items-center gap-2">
      <li v-for="(item, index) in breadcrumbs" :key="index" class="flex items-center gap-2">
        <!-- Separator -->
        <UIcon v-if="index > 0" name="i-heroicons-chevron-right" class="h-4 w-4 text-gray-400" />

        <!-- Link or text -->
        <NuxtLink
          v-if="index < breadcrumbs.length - 1"
          :to="item.to"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {{ item.label }}
        </NuxtLink>
        <span v-else class="font-medium text-gray-900 dark:text-white">
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
  interface BreadcrumbItem {
    label: string
    to?: string
  }

  const route = useRoute()

  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [{ label: 'Dashboard', to: '/admin' }]

    // Generate breadcrumbs from route path
    const pathSegments = route.path.split('/').filter(Boolean)

    // Skip 'admin' as it's the base
    for (let i = 1; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      if (!segment) continue
      const path = '/' + pathSegments.slice(0, i + 1).join('/')

      items.push({
        label: formatLabel(segment),
        to: i < pathSegments.length - 1 ? path : undefined,
      })
    }

    return items
  })

  function formatLabel(segment: string): string {
    // Convert kebab-case to Title Case
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
</script>

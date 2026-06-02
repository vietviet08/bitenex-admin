<template>
  <div>
    <h1 class="text-2xl font-bold mb-4 flex items-center gap-2">
      Promotions & AI Generative Marketing
      <UIcon name="i-heroicons-sparkles" class="text-amber-500 w-6 h-6" />
    </h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="col-span-2">
        <UCard>
          <template #header>
            <h3 class="font-semibold">Active Campaigns</h3>
          </template>
          <UTable :data="campaigns" :columns="columns" />
        </UCard>
      </div>

      <div class="col-span-1">
        <UCard class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 border-amber-200">
          <template #header>
            <h3 class="font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <UIcon name="i-heroicons-sparkles" />
              Generate Campaign
            </h3>
          </template>
          <div class="space-y-4">
            <UFormGroup label="Event / Goal">
              <UInput placeholder="e.g. Rainy Day, Mid-Autumn Festival..." />
            </UFormGroup>
            <UButton color="warning" block>Generate Copy & Art</UButton>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

import type { TableColumn } from '@nuxt/ui'

const columns: TableColumn<any>[] = [
  { accessorKey: 'name', header: 'Campaign' },
  { accessorKey: 'discount', header: 'Discount' },
  { accessorKey: 'status', header: 'Status' },
]

const campaigns = ref([
  { name: 'Summer Fast Food', discount: '20% OFF', status: 'Active' },
  { name: 'New User Onboarding', discount: '$5', status: 'Active' },
])
</script>
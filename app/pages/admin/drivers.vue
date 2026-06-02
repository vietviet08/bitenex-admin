<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Drivers Management</h1>
    <UCard>
      <div class="flex justify-between items-center mb-4">
        <UInput icon="i-heroicons-magnifying-glass" placeholder="Search drivers..." />
        <UButton color="primary" icon="i-heroicons-plus">Add Driver</UButton>
      </div>

      <!-- Table placeholder -->
      <UTable :data="drivers" :columns="columns" />
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

import type { TableColumn } from '@nuxt/ui'

const columns: TableColumn<any>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'vehicle', header: 'Vehicle Info' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'actions', header: 'Actions' },
]

const drivers = ref([
  { id: '1', name: 'John Doe', vehicle: 'Honda Wave - 59A1 12345', status: 'Active' },
  { id: '2', name: 'Jane Smith', vehicle: 'Yamaha Vision - 29B1 98765', status: 'Offline' },
])
</script>
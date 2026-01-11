<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Sidebar -->
    <AdminSidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />

    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Topbar -->
      <AdminTopbar @toggle-sidebar="toggleSidebar" />

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <!-- Breadcrumb -->
        <AdminBreadcrumb class="mb-4" />

        <!-- Page Slot -->
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  const sidebarCollapsed = ref(false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // Collapse sidebar on mobile by default
  onMounted(() => {
    if (window.innerWidth < 768) {
      sidebarCollapsed.value = true
    }
  })
</script>

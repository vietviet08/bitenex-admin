<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />
  </UApp>
</template>

<script setup lang="ts">
  // App-level configuration
  useHead({
    title: 'Bitenex Admin',
    titleTemplate: '%s | Bitenex Admin',
    meta: [{ name: 'description', content: 'Bitenex Administration Panel' }],
  })
</script>

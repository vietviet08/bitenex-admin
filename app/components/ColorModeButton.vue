<template>
  <UButton
    :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
    variant="ghost"
    color="neutral"
    @click="toggleColorMode"
  />
</template>

<script setup lang="ts">
  const colorMode = useColorMode()

  const isDark = computed(() => colorMode.value === 'dark')

  function toggleColorMode() {
    colorMode.preference = isDark.value ? 'light' : 'dark'
  }
</script>

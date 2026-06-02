<template>
  <div class="h-[calc(100vh-10rem)] flex flex-col">
    <div class="mb-4">
      <h1
        class="text-2xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-amber-500"
      >
        <UIcon name="i-heroicons-sparkles" class="text-amber-500" />
        AI Admin Copilot
      </h1>
      <p class="text-gray-500">
        Ask your AI assistant to generate reports, manage disputes, or analyze data.
      </p>
    </div>

    <UCard class="flex-1 flex flex-col overflow-hidden" body-class="flex-1 flex flex-col p-0">
      <!-- Chat History -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
        <div class="flex gap-3">
          <UAvatar icon="i-heroicons-sparkles" class="bg-amber-100 text-amber-600" />
          <div
            class="bg-white dark:bg-gray-800 p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 max-w-[80%]"
          >
            <p>
              Hello! I am your Bitenex AI Copilot. How can I help you manage the platform today?
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <UBadge color="neutral" variant="solid" class="cursor-pointer"
                >Show today's revenue</UBadge
              >
              <UBadge color="neutral" variant="solid" class="cursor-pointer"
                >Find drivers with low ratings</UBadge
              >
              <UBadge color="neutral" variant="solid" class="cursor-pointer"
                >Suggest a weekend promotion</UBadge
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div class="relative">
          <UInput v-model="prompt" placeholder="Ask me anything..." size="lg">
            <template #trailing>
              <UButton
                color="primary"
                variant="ghost"
                icon="i-heroicons-paper-airplane"
                :disabled="!prompt"
              />
            </template>
          </UInput>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'admin',
  })

  const prompt = ref('')
</script>

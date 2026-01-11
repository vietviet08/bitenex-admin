// https://nuxt.com/docs/api/configuration/nuxt-config
/// <reference types="node" />
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  modules: ['@nuxt/ui', '@nuxt/image', '@nuxt/eslint', '@nuxt/icon', '@pinia/nuxt', '@vueuse/nuxt'],

  // Nuxt UI configuration
  ui: {
    colorMode: true,
  },

  // Runtime configuration for API
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
    },
  },

  // Auto-imports configuration
  imports: {
    dirs: ['stores'],
  },

  // TypeScript configuration
  typescript: {
    strict: true,
  },
})

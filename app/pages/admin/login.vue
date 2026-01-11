<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">Sign in to manage Bitenex</p>
        </div>
      </template>

      <form @submit.prevent="onSubmit">
        <div class="space-y-4">
          <!-- Email Field -->
          <UFormField label="Email" :error="errors.email">
            <UInput
              v-model="email"
              type="email"
              placeholder="admin@example.com"
              icon="i-heroicons-envelope"
              :disabled="isSubmitting"
            />
          </UFormField>

          <!-- Password Field -->
          <UFormField label="Password" :error="errors.password">
            <UInput
              v-model="password"
              type="password"
              placeholder="••••••••"
              icon="i-heroicons-lock-closed"
              :disabled="isSubmitting"
            />
          </UFormField>

          <!-- Submit Button -->
          <UButton type="submit" block :loading="isSubmitting" :disabled="isSubmitting">
            Sign In
          </UButton>
        </div>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          Demo: admin@example.com / password
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'
  import { z } from 'zod'

  // Page meta
  definePageMeta({
    layout: 'default',
    middleware: 'auth',
  })

  // Form schema with Zod
  const loginSchema = toTypedSchema(
    z.object({
      email: z.string().min(1, 'Email is required').email('Invalid email address'),
      password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
    })
  )

  // Form handling with VeeValidate
  const { handleSubmit, errors, isSubmitting, defineField } = useForm({
    validationSchema: loginSchema,
  })

  const [email] = defineField('email')
  const [password] = defineField('password')

  const { login } = useAuth()

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login({
        email: values.email,
        password: values.password,
      })
    } catch {
      // Error is already handled in useAuth with toast
    }
  })
</script>

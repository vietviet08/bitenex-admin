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
          <UFormField label="Email" :error="emailError || errors.email">
            <UInput
              v-model="email"
              type="email"
              placeholder="Enter your email"
              icon="i-heroicons-envelope"
              :disabled="isSubmitting"
              @input="emailError = ''"
            />
          </UFormField>

          <!-- Password Field -->
          <UFormField label="Password" :error="passwordError || errors.password">
            <UInput
              v-model="password"
              type="password"
              placeholder="Enter your password"
              icon="i-heroicons-lock-closed"
              :disabled="isSubmitting"
              @input="passwordError = ''"
            />
          </UFormField>

          <!-- Submit Button -->
          <UButton type="submit" block :loading="isSubmitting" :disabled="isSubmitting">
            Sign In
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'
  import { z } from 'zod'
  import type { ApiError } from '~/types/api'

  // Page meta
  definePageMeta({
    layout: 'default',
    middleware: 'auth',
  })

  // Field-level error state from API
  const emailError = ref('')
  const passwordError = ref('')

  // Form schema with Zod
  const loginSchema = toTypedSchema(
    z.object({
      email: z.string().min(1, 'Email is required').email('Invalid email address'),
      password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters'),
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
    // Clear previous API errors
    emailError.value = ''
    passwordError.value = ''

    try {
      await login({
        email: values.email,
        password: values.password,
      })
    } catch (error) {
      // Handle field-level errors from API
      const apiError = error as ApiError
      if (apiError.fieldErrors) {
        const emailErrors = apiError.fieldErrors.email
        if (emailErrors && emailErrors.length > 0) {
          const firstEmailError = emailErrors[0]
          if (firstEmailError) {
            emailError.value = firstEmailError
          }
        }
        const passwordErrors = apiError.fieldErrors.password
        if (passwordErrors && passwordErrors.length > 0) {
          const firstPasswordError = passwordErrors[0]
          if (firstPasswordError) {
            passwordError.value = firstPasswordError
          }
        }
      }
      // Toast notification is already handled in useAuth
    }
  })
</script>

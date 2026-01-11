<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

    <form @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- General Settings -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">General Settings</h2>
          </template>

          <div class="space-y-4">
            <UFormField label="Site Name" :error="errors.siteName">
              <UInput v-model="siteName" placeholder="Bitenex Admin" :disabled="isSubmitting" />
            </UFormField>

            <UFormField label="Support Email" :error="errors.supportEmail">
              <UInput
                v-model="supportEmail"
                type="email"
                placeholder="support@bitenex.com"
                :disabled="isSubmitting"
              />
            </UFormField>

            <UFormField label="Contact Phone" :error="errors.contactPhone">
              <UInput
                v-model="contactPhone"
                placeholder="+1 (555) 123-4567"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>
        </UCard>

        <!-- Notification Settings -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Notification Settings
            </h2>
          </template>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p class="text-sm text-gray-500">Receive email notifications for new orders</p>
              </div>
              <USwitch v-model="emailNotifications" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                <p class="text-sm text-gray-500">Receive push notifications on mobile</p>
              </div>
              <USwitch v-model="pushNotifications" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
                <p class="text-sm text-gray-500">Receive SMS for urgent alerts</p>
              </div>
              <USwitch v-model="smsNotifications" />
            </div>
          </div>
        </UCard>

        <!-- Order Settings -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Order Settings</h2>
          </template>

          <div class="space-y-4">
            <UFormField label="Default Order Timeout (minutes)" :error="errors.orderTimeout">
              <UInput
                v-model="orderTimeout"
                type="number"
                placeholder="30"
                :disabled="isSubmitting"
              />
            </UFormField>

            <UFormField label="Max Delivery Distance (km)" :error="errors.maxDeliveryDistance">
              <UInput
                v-model="maxDeliveryDistance"
                type="number"
                placeholder="10"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>
        </UCard>

        <!-- Payment Settings -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Payment Settings</h2>
          </template>

          <div class="space-y-4">
            <UFormField label="Platform Fee (%)" :error="errors.platformFee">
              <UInput
                v-model="platformFee"
                type="number"
                step="0.1"
                placeholder="5.0"
                :disabled="isSubmitting"
              />
            </UFormField>

            <UFormField label="Currency">
              <USelectMenu v-model="currency" :items="currencyOptions" :disabled="isSubmitting" />
            </UFormField>
          </div>
        </UCard>
      </div>

      <!-- Submit Button -->
      <div class="mt-6 flex justify-end">
        <UButton type="submit" :loading="isSubmitting" :disabled="isSubmitting">
          Save Settings
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'
  import { z } from 'zod'

  // Page meta
  definePageMeta({
    layout: 'admin',
    middleware: 'auth',
  })

  const toast = useToast()

  // Form schema with Zod
  const settingsSchema = toTypedSchema(
    z.object({
      siteName: z.string().min(1, 'Site name is required'),
      supportEmail: z.string().min(1, 'Email is required').email('Invalid email address'),
      contactPhone: z.string().optional(),
      orderTimeout: z.coerce
        .number()
        .min(1, 'Must be at least 1 minute')
        .max(120, 'Max 120 minutes'),
      maxDeliveryDistance: z.coerce.number().min(1, 'Must be at least 1 km').max(50, 'Max 50 km'),
      platformFee: z.coerce.number().min(0, 'Cannot be negative').max(30, 'Max 30%'),
    })
  )

  // Form handling with VeeValidate
  const { handleSubmit, errors, isSubmitting, defineField } = useForm({
    validationSchema: settingsSchema,
    initialValues: {
      siteName: 'Bitenex Admin',
      supportEmail: 'support@bitenex.com',
      contactPhone: '+1 (555) 123-4567',
      orderTimeout: 30,
      maxDeliveryDistance: 10,
      platformFee: 5.0,
    },
  })

  const [siteName] = defineField('siteName')
  const [supportEmail] = defineField('supportEmail')
  const [contactPhone] = defineField('contactPhone')
  const [orderTimeoutField] = defineField('orderTimeout')
  const [maxDeliveryDistanceField] = defineField('maxDeliveryDistance')
  const [platformFeeField] = defineField('platformFee')

  // Convert number fields to/from string for UInput compatibility
  const orderTimeout = computed({
    get: () => String(orderTimeoutField.value ?? ''),
    set: (value) => {
      orderTimeoutField.value = value ? Number(value) : undefined
    },
  })

  const maxDeliveryDistance = computed({
    get: () => String(maxDeliveryDistanceField.value ?? ''),
    set: (value) => {
      maxDeliveryDistanceField.value = value ? Number(value) : undefined
    },
  })

  const platformFee = computed({
    get: () => String(platformFeeField.value ?? ''),
    set: (value) => {
      platformFeeField.value = value ? Number(value) : undefined
    },
  })

  // Toggle settings (not part of form validation)
  const emailNotifications = ref(true)
  const pushNotifications = ref(true)
  const smsNotifications = ref(false)
  const currencyValue = ref('USD')

  const currencyOptions = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'VND - Vietnamese Dong', value: 'VND' },
  ]

  // Convert currency between string and object for USelectMenu
  const currency = computed({
    get: () => currencyOptions.find((opt) => opt.value === currencyValue.value) || currencyOptions[0],
    set: (value: { label: string; value: string }) => {
      currencyValue.value = value.value
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log('Settings saved:', {
      ...values,
      emailNotifications: emailNotifications.value,
      pushNotifications: pushNotifications.value,
      smsNotifications: smsNotifications.value,
      currency: currencyValue.value,
    })

    toast.add({
      title: 'Settings Saved',
      description: 'Your settings have been updated successfully.',
      color: 'success',
    })
  })
</script>

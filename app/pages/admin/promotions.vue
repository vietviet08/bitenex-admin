<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          Promotions & Campaigns
          <UIcon name="i-heroicons-sparkles" class="text-amber-500 w-6 h-6" />
        </h1>
        <p class="text-sm text-gray-500">Manage marketing campaigns and promotions</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="openCreateModal"> Create Campaign </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <UCard>
        <div class="text-center">
          <p class="text-sm text-gray-500">Total Campaigns</p>
          <p class="text-2xl font-bold">{{ stats?.total_campaigns || 0 }}</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm text-gray-500">Active</p>
          <p class="text-2xl font-bold text-green-600">{{ stats?.active_campaigns || 0 }}</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm text-gray-500">Total Revenue</p>
          <p class="text-2xl font-bold">
            {{ formatCurrency(stats?.total_revenue_generated || 0) }}
          </p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm text-gray-500">Vouchers Used</p>
          <p class="text-2xl font-bold">{{ stats?.total_vouchers_used || 0 }}</p>
        </div>
      </UCard>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4">
      <USelectMenu
        v-model="statusFilter"
        :items="statusOptions"
        placeholder="All Status"
        class="w-full md:w-48"
      />
      <USelectMenu
        v-model="typeFilter"
        :items="typeOptions"
        placeholder="All Types"
        class="w-full md:w-48"
      />
    </div>

    <!-- Campaigns Table -->
    <UCard>
      <UTable :columns="columns" :data="campaigns" :loading="isLoading">
        <template #name-cell="{ row }">
          <div>
            <span
              class="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-primary-600"
              @click="editCampaign(row.original)"
            >
              {{ row.original.name }}
            </span>
            <p v-if="row.original.description" class="text-xs text-gray-500 line-clamp-1">
              {{ row.original.description }}
            </p>
          </div>
        </template>

        <template #discount-cell="{ row }">
          <span class="font-medium">{{
            formatDiscount(row.original.discountType, row.original.discountValue)
          }}</span>
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="campaignStatusColor(row.original.status)" variant="subtle">
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #period-cell="{ row }">
          <div class="text-sm">
            <p>{{ formatDate(row.original.startDate) }}</p>
            <p class="text-gray-500">to {{ formatDate(row.original.endDate) }}</p>
          </div>
        </template>

        <template #usage-cell="{ row }">
          <div>
            <p class="text-sm">{{ row.original.usedVouchers }} used</p>
            <p v-if="row.original.maxVouchers" class="text-xs text-gray-500">
              of {{ row.original.maxVouchers }} max
            </p>
          </div>
        </template>

        <template #actions-cell="{ row }">
          <UDropdownMenu :items="getActionItems(row.original)">
            <UButton
              icon="i-heroicons-ellipsis-vertical"
              variant="ghost"
              color="neutral"
              size="sm"
            />
          </UDropdownMenu>
        </template>
      </UTable>

      <!-- Pagination -->
      <div
        class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-500">Showing {{ campaigns.length }} of {{ total }} campaigns</p>
        <UPagination v-model="currentPage" :total="total" :page-count="pageSize" />
      </div>
    </UCard>

    <!-- Create/Edit Modal -->
    <UModal
      v-model:open="showDialog"
      :title="editingCampaign ? 'Edit Campaign' : 'Create Campaign'"
      :ui="{ content: 'max-w-2xl' }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            {{ editingCampaign ? 'Edit Campaign' : 'Create Campaign' }}
          </h3>
          <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="closeModal" />
        </div>
      </template>

      <template #body>
        <UForm id="campaign-form" :state="formData" class="space-y-4" @submit="handleSubmit">
          <UFormField label="Campaign Name" name="name" required>
            <UInput v-model="formData.name" placeholder="e.g. Summer Sale 2024" />
          </UFormField>

          <UFormField label="Description" name="description">
            <UTextarea v-model="formData.description" placeholder="Campaign description..." />
          </UFormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Campaign Type" name="campaign_type">
              <USelectMenu
                v-model="formData.campaign_type"
                :items="campaignTypeOptions"
                value-key="value"
              />
            </UFormField>

            <UFormField label="Target Audience" name="target_audience">
              <USelectMenu
                v-model="formData.target_audience"
                :items="audienceOptions"
                value-key="value"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UFormField label="Discount Type" name="discount_type">
              <USelectMenu
                v-model="formData.discount_type"
                :items="discountTypeOptions"
                value-key="value"
              />
            </UFormField>

            <UFormField label="Discount Value" name="discount_value" required>
              <UInput v-model.number="formData.discount_value" type="number" placeholder="20" />
            </UFormField>

            <UFormField label="Max Discount" name="max_discount">
              <UInput v-model.number="formData.max_discount" type="number" placeholder="Optional" />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Start Date" name="start_date" required>
              <UInput v-model="formData.start_date" type="datetime-local" />
            </UFormField>

            <UFormField label="End Date" name="end_date" required>
              <UInput v-model="formData.end_date" type="datetime-local" />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Voucher Code" name="voucher_code">
              <UInput v-model="formData.voucher_code" placeholder="SUMMER2024" />
            </UFormField>

            <UFormField label="Budget (VND)" name="budget">
              <UInput v-model.number="formData.budget" type="number" placeholder="Optional" />
            </UFormField>
          </div>

          <UFormField label="Min Order Value" name="min_order_value">
            <UInput v-model.number="formData.min_order_value" type="number" placeholder="0" />
          </UFormField>
        </UForm>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="outline" @click="closeModal"> Cancel </UButton>
          <UButton type="submit" form="campaign-form" :loading="isSubmitting">
            {{ editingCampaign ? 'Update' : 'Create' }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
  import type { TableColumn } from '@nuxt/ui'
  import type {
    CampaignEntity,
    CampaignStatus,
    CampaignType,
    DiscountType,
    TargetAudience,
  } from '~/types/campaign'
  import { campaignStatusColor, formatDiscount } from '~/types/campaign'
  import {
    useCampaigns,
    useCampaignStats,
    useCreateCampaign,
    useUpdateCampaign,
    useUpdateCampaignStatus,
    useDeleteCampaign,
  } from '~/composables/useCampaignQueries'

  definePageMeta({
    layout: 'admin',
  })

  const toast = useToast()

  // State
  const currentPage = ref(1)
  const pageSize = 20
  const statusFilterValue = ref<CampaignStatus | undefined>(undefined)
  const typeFilterValue = ref<CampaignType | undefined>(undefined)
  const showDialog = ref(false)
  const editingCampaign = ref<CampaignEntity | null>(null)
  const isSubmitting = ref(false)

  const formData = ref({
    name: '',
    description: '',
    campaign_type: 'DISCOUNT' as CampaignType,
    discount_type: 'PERCENTAGE' as DiscountType,
    discount_value: 0,
    max_discount: null as number | null,
    min_order_value: 0,
    voucher_code: '',
    target_audience: 'ALL' as TargetAudience,
    start_date: '',
    end_date: '',
    budget: null as number | null,
  })

  // Query params
  const queryParams = computed(() => ({
    page: currentPage.value,
    per_page: pageSize,
    status: statusFilterValue.value,
    campaign_type: typeFilterValue.value,
  }))

  // Fetch data
  const { data: campaignsData, isLoading } = useCampaigns(queryParams)
  const { data: stats } = useCampaignStats()

  const campaigns = computed(() => campaignsData.value?.items || [])
  const total = computed(() => campaignsData.value?.total || 0)

  // Mutations
  const createMutation = useCreateCampaign()
  const updateMutation = useUpdateCampaign()
  const updateStatusMutation = useUpdateCampaignStatus()
  const deleteMutation = useDeleteCampaign()

  // Filter options
  const statusOptions = [
    { label: 'All Status', value: undefined },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Scheduled', value: 'SCHEDULED' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Paused', value: 'PAUSED' },
    { label: 'Ended', value: 'ENDED' },
  ]

  const typeOptions = [
    { label: 'All Types', value: undefined },
    { label: 'Discount', value: 'DISCOUNT' },
    { label: 'Free Delivery', value: 'FREE_DELIVERY' },
    { label: 'Bundle', value: 'BUNDLE' },
    { label: 'Loyalty', value: 'LOYALTY' },
  ]

  const campaignTypeOptions = [
    { label: 'Discount', value: 'DISCOUNT' },
    { label: 'Free Delivery', value: 'FREE_DELIVERY' },
    { label: 'Bundle', value: 'BUNDLE' },
    { label: 'Loyalty', value: 'LOYALTY' },
  ]

  const discountTypeOptions = [
    { label: 'Percentage', value: 'PERCENTAGE' },
    { label: 'Fixed Amount', value: 'FIXED_AMOUNT' },
  ]

  const audienceOptions = [
    { label: 'All Users', value: 'ALL' },
    { label: 'New Users', value: 'NEW_USERS' },
    { label: 'Returning Users', value: 'RETURNING_USERS' },
    { label: 'VIP Users', value: 'VIP' },
  ]

  const statusFilter = computed({
    get: () =>
      statusOptions.find((opt) => opt.value === statusFilterValue.value) || statusOptions[0],
    set: (value: { label: string; value: CampaignStatus | undefined }) => {
      statusFilterValue.value = value.value
      currentPage.value = 1
    },
  })

  const typeFilter = computed({
    get: () => typeOptions.find((opt) => opt.value === typeFilterValue.value) || typeOptions[0],
    set: (value: { label: string; value: CampaignType | undefined }) => {
      typeFilterValue.value = value.value
      currentPage.value = 1
    },
  })

  // Table columns
  const columns: TableColumn<CampaignEntity>[] = [
    { accessorKey: 'name', id: 'name', header: 'Campaign' },
    { accessorKey: 'discountValue', id: 'discount', header: 'Discount' },
    { accessorKey: 'status', id: 'status', header: 'Status' },
    { accessorKey: 'startDate', id: 'period', header: 'Period' },
    { accessorKey: 'usedVouchers', id: 'usage', header: 'Usage' },
    { id: 'actions' },
  ]

  // Actions
  function getActionItems(campaign: CampaignEntity) {
    const items = []

    if (campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED') {
      items.push({
        label: 'Edit',
        icon: 'i-heroicons-pencil',
        onSelect: () => editCampaign(campaign),
      })
    }

    if (campaign.status === 'DRAFT') {
      items.push({
        label: 'Activate',
        icon: 'i-heroicons-play',
        color: 'success' as const,
        onSelect: () => updateStatus(campaign.id, 'ACTIVE'),
      })
    }

    if (campaign.status === 'ACTIVE') {
      items.push({
        label: 'Pause',
        icon: 'i-heroicons-pause',
        color: 'warning' as const,
        onSelect: () => updateStatus(campaign.id, 'PAUSED'),
      })
    }

    if (campaign.status === 'PAUSED') {
      items.push({
        label: 'Resume',
        icon: 'i-heroicons-play',
        color: 'success' as const,
        onSelect: () => updateStatus(campaign.id, 'ACTIVE'),
      })
    }

    if (campaign.status !== 'ACTIVE') {
      items.push({
        label: 'Delete',
        icon: 'i-heroicons-trash',
        color: 'error' as const,
        onSelect: () => handleDelete(campaign.id),
      })
    }

    return [items]
  }

  function openCreateModal() {
    editingCampaign.value = null
    resetForm()
    showDialog.value = true
  }

  function editCampaign(campaign: CampaignEntity) {
    editingCampaign.value = campaign
    formData.value = {
      name: campaign.name,
      description: campaign.description || '',
      campaign_type: campaign.campaignType,
      discount_type: campaign.discountType,
      discount_value: campaign.discountValue,
      max_discount: campaign.maxDiscount || null,
      min_order_value: campaign.minOrderValue,
      voucher_code: campaign.voucherCode || '',
      target_audience: campaign.targetAudience,
      start_date: campaign.startDate.slice(0, 16),
      end_date: campaign.endDate.slice(0, 16),
      budget: campaign.budget || null,
    }
    showDialog.value = true
  }

  function resetForm() {
    formData.value = {
      name: '',
      description: '',
      campaign_type: 'DISCOUNT',
      discount_type: 'PERCENTAGE',
      discount_value: 0,
      max_discount: null,
      min_order_value: 0,
      voucher_code: '',
      target_audience: 'ALL',
      start_date: '',
      end_date: '',
      budget: null,
    }
  }

  function closeModal() {
    showDialog.value = false
    editingCampaign.value = null
    resetForm()
  }

  async function handleSubmit() {
    isSubmitting.value = true
    try {
      if (editingCampaign.value) {
        await updateMutation.mutateAsync({
          campaignId: editingCampaign.value.id,
          data: formData.value,
        })
        toast.add({ title: 'Success', description: 'Campaign updated', color: 'success' })
      } else {
        await createMutation.mutateAsync(formData.value)
        toast.add({ title: 'Success', description: 'Campaign created', color: 'success' })
      }
      closeModal()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save campaign'
      toast.add({ title: 'Error', description: message, color: 'error' })
    } finally {
      isSubmitting.value = false
    }
  }

  async function updateStatus(campaignId: string, status: string) {
    try {
      await updateStatusMutation.mutateAsync({ campaignId, status })
      toast.add({
        title: 'Success',
        description: `Campaign ${status.toLowerCase()}`,
        color: 'success',
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update status'
      toast.add({ title: 'Error', description: message, color: 'error' })
    }
  }

  async function handleDelete(campaignId: string) {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      await deleteMutation.mutateAsync(campaignId)
      toast.add({ title: 'Success', description: 'Campaign deleted', color: 'success' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete campaign'
      toast.add({ title: 'Error', description: message, color: 'error' })
    }
  }

  // Helpers
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
</script>

import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type {
  ApiCampaignItem,
  ApiCampaignListResponse,
  ApiCampaignStats,
  CampaignEntity,
  CampaignListParams,
  CampaignCreateRequest,
  CampaignUpdateRequest,
} from '~/types/campaign'
import { transformCampaignItem } from '~/types/campaign'

/**
 * Get paginated campaigns list
 */
export function useCampaigns(params: Ref<CampaignListParams>) {
  const api = useApi()

  return useQuery({
    queryKey: ['admin-campaigns', params],
    queryFn: async (): Promise<{ items: CampaignEntity[]; total: number }> => {
      const response = await api.get<ApiCampaignListResponse>('/admin/campaigns', {
        ...params.value,
      })
      return {
        items: response.items.map(transformCampaignItem),
        total: response.total,
      }
    },
  })
}

/**
 * Get campaign statistics
 */
export function useCampaignStats() {
  const api = useApi()

  return useQuery({
    queryKey: ['admin-campaign-stats'],
    queryFn: async (): Promise<ApiCampaignStats> => {
      return await api.get<ApiCampaignStats>('/admin/campaigns/stats')
    },
  })
}

/**
 * Get single campaign
 */
export function useCampaign(campaignId: Ref<string>) {
  const api = useApi()

  return useQuery({
    queryKey: ['admin-campaign', campaignId],
    queryFn: async (): Promise<CampaignEntity> => {
      const response = await api.get<ApiCampaignItem>(`/admin/campaigns/${campaignId.value}`)
      return transformCampaignItem(response)
    },
    enabled: computed(() => !!campaignId.value),
  })
}

/**
 * Create campaign mutation
 */
export function useCreateCampaign() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CampaignCreateRequest): Promise<CampaignEntity> => {
      const response = await api.post<ApiCampaignItem>('/admin/campaigns', data)
      return transformCampaignItem(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['admin-campaign-stats'] })
    },
  })
}

/**
 * Update campaign mutation
 */
export function useUpdateCampaign() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      campaignId,
      data,
    }: {
      campaignId: string
      data: CampaignUpdateRequest
    }): Promise<CampaignEntity> => {
      const response = await api.patch<ApiCampaignItem>(
        `/admin/campaigns/${campaignId}`,
        data as Record<string, unknown>
      )
      return transformCampaignItem(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] })
    },
  })
}

/**
 * Update campaign status mutation
 */
export function useUpdateCampaignStatus() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      campaignId,
      status,
    }: {
      campaignId: string
      status: string
    }): Promise<CampaignEntity> => {
      const response = await api.patch<ApiCampaignItem>(`/admin/campaigns/${campaignId}/status`, {
        status,
      })
      return transformCampaignItem(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['admin-campaign-stats'] })
    },
  })
}

/**
 * Delete campaign mutation
 */
export function useDeleteCampaign() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (campaignId: string): Promise<void> => {
      await api.del(`/admin/campaigns/${campaignId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['admin-campaign-stats'] })
    },
  })
}

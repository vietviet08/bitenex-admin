import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type {
  DriverEntity,
  DriverListParams,
  ApiDriverItem,
  DriverStatus,
} from '~/types/driver'
import { transformDriverItem } from '~/types/driver'

/**
 * Get paginated admin drivers list
 */
export function useDrivers(params: Ref<DriverListParams>) {
  const api = useApi()

  return useQuery({
    queryKey: ['admin-drivers', params],
    queryFn: async (): Promise<{ items: DriverEntity[]; total: number }> => {
      const response = await api.get<ApiDriverItem[]>('/drivers/admin/list', {
        ...params.value,
      })
      return {
        items: response.map(transformDriverItem),
        total: response.length, // API doesn't return total, use length
      }
    },
  })
}

/**
 * Get single driver by ID
 */
export function useDriver(driverId: Ref<string>) {
  const api = useApi()

  return useQuery({
    queryKey: ['admin-driver', driverId],
    queryFn: async (): Promise<DriverEntity> => {
      const response = await api.get<ApiDriverItem>(`/drivers/${driverId.value}`)
      return transformDriverItem(response)
    },
    enabled: computed(() => !!driverId.value),
  })
}

/**
 * Approve driver mutation
 */
export function useApproveDriver() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (driverId: string): Promise<DriverEntity> => {
      const response = await api.post<ApiDriverItem>(`/drivers/${driverId}/approve`)
      return transformDriverItem(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers'] })
    },
  })
}

/**
 * Update driver status mutation
 */
export function useUpdateDriverStatus() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      driverId,
      status,
    }: {
      driverId: string
      status: DriverStatus
    }): Promise<DriverEntity> => {
      const response = await api.post<ApiDriverItem>(`/drivers/${driverId}/status`, {
        status,
      })
      return transformDriverItem(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers'] })
    },
  })
}

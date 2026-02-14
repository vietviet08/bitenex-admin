import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type {
  UserEntity,
  UserListParams,
  AdminUserUpdateRequest,
  ApiAdminUserListResponse,
  ApiAdminUserItem,
} from '~/types/user'
import { transformUserItem } from '~/types/user'

/**
 * Get paginated admin users list
 */
export function useUsers(params: Ref<UserListParams>) {
  const api = useApi()

  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: async (): Promise<{ items: UserEntity[]; total: number }> => {
      const response = await api.get<ApiAdminUserListResponse>('/users/admin/list', {
        ...params.value,
      })
      return {
        items: response.items.map(transformUserItem),
        total: response.total,
      }
    },
  })
}

/**
 * Get single user by ID
 */
export function useUser(userId: Ref<string>) {
  const api = useApi()

  return useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async (): Promise<UserEntity> => {
      const response = await api.get<ApiAdminUserItem>(`/users/${userId.value}`)
      return transformUserItem(response)
    },
    enabled: computed(() => !!userId.value),
  })
}

/**
 * Admin update user mutation
 */
export function useUpdateUser() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string
      data: AdminUserUpdateRequest
    }): Promise<UserEntity> => {
      const response = await api.patch<ApiAdminUserItem>(
        `/users/admin/${userId}`,
        data as Record<string, unknown>
      )
      return transformUserItem(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

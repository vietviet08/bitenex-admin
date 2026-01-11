import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { UserEntity, UserListParams, UpdateUserRequest } from '~/types/user'
import { UserStatus } from '~/types/user'
import { Role } from '~/types/auth'
import type { PaginatedResponse } from '~/types/api'

/**
 * Get paginated users list
 */
export function useUsers(params: Ref<UserListParams>) {
  const _api = useApi()

  return useQuery({
    queryKey: ['users', params],
    queryFn: async (): Promise<PaginatedResponse<UserEntity>> => {
      // In production, call the actual API:
      // return await _api.get<PaginatedResponse<UserEntity>>('/admin/users', params.value)

      // Mock data for development
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockUsers: UserEntity[] = [
        {
          id: '1',
          fullName: 'John Admin',
          email: 'admin@example.com',
          role: Role.ADMIN,
          status: UserStatus.ACTIVE,
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
        {
          id: '2',
          fullName: 'Jane Staff',
          email: 'staff@example.com',
          role: Role.STAFF,
          status: UserStatus.ACTIVE,
          createdAt: '2025-01-02T10:00:00Z',
          updatedAt: '2025-01-02T10:00:00Z',
        },
      ]

      return {
        data: mockUsers,
        meta: {
          page: params.value.page || 1,
          limit: params.value.limit || 10,
          total: mockUsers.length,
          totalPages: 1,
        },
      }
    },
  })
}

/**
 * Get single user by ID
 */
export function useUser(userId: Ref<string>) {
  const _api = useApi()

  return useQuery({
    queryKey: ['user', userId],
    queryFn: async (): Promise<UserEntity> => {
      // In production:
      // return await _api.get<UserEntity>(`/admin/users/${userId.value}`)

      // Mock data
      await new Promise((resolve) => setTimeout(resolve, 300))
      return {
        id: userId.value,
        fullName: 'John Admin',
        email: 'admin@example.com',
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-01T10:00:00Z',
      }
    },
    enabled: computed(() => !!userId.value),
  })
}

/**
 * Update user mutation
 */
export function useUpdateUser() {
  const _api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string
      data: UpdateUserRequest
    }): Promise<UserEntity> => {
      // In production:
      // return await _api.patch<UserEntity>(`/admin/users/${userId}`, data)

      // Mock update
      await new Promise((resolve) => setTimeout(resolve, 500))
      return {
        id: userId,
        fullName: data.fullName || 'Updated User',
        email: data.email || 'updated@example.com',
        role: data.role || Role.STAFF,
        status: data.status || UserStatus.ACTIVE,
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: new Date().toISOString(),
      }
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

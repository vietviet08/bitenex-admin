import type { AdminMerchantItem, MerchantStatus } from '~/types'

export type MerchantListViewState = 'loading' | 'error' | 'empty' | 'ready'
export type MerchantDetailViewState = 'loading' | 'error' | 'empty_menu' | 'ready'

export function filterMerchants(items: AdminMerchantItem[], query: string): AdminMerchantItem[] {
  if (!query.trim()) {
    return items
  }
  const normalized = query.toLowerCase()
  return items.filter((item) => {
    return (
      item.name.toLowerCase().includes(normalized) ||
      (item.owner_email || '').toLowerCase().includes(normalized) ||
      (item.owner_full_name || '').toLowerCase().includes(normalized)
    )
  })
}

export function getMerchantListViewState(params: {
  isLoading: boolean
  errorMessage: string
  items: AdminMerchantItem[]
}): MerchantListViewState {
  if (params.isLoading) {
    return 'loading'
  }
  if (params.errorMessage) {
    return 'error'
  }
  if (params.items.length === 0) {
    return 'empty'
  }
  return 'ready'
}

export function applyApproveSuccess(
  items: AdminMerchantItem[],
  merchantId: string
): AdminMerchantItem[] {
  return items.filter((item) => item.id !== merchantId)
}

export function statusColor(status: MerchantStatus): 'neutral' | 'success' | 'warning' | 'error' {
  if (status === 'ACTIVE') return 'success'
  if (status === 'PENDING') return 'warning'
  if (status === 'SUSPENDED' || status === 'CLOSED') return 'error'
  return 'neutral'
}

export function getMerchantDetailViewState(params: {
  isLoading: boolean
  errorMessage: string
  menuCount: number
}): MerchantDetailViewState {
  if (params.isLoading) {
    return 'loading'
  }
  if (params.errorMessage) {
    return 'error'
  }
  if (params.menuCount === 0) {
    return 'empty_menu'
  }
  return 'ready'
}

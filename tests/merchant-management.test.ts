import assert from 'node:assert/strict'
import test from 'node:test'

import type { AdminMerchantItem } from '../app/types'
import {
  applyApproveSuccess,
  filterMerchants,
  getMerchantListViewState,
  statusColor,
} from '../app/utils/merchantManagement'

const sampleItems: AdminMerchantItem[] = [
  {
    id: 'm1',
    user_id: 'u1',
    name: 'Pending Bistro',
    slug: 'pending-bistro',
    description: null,
    logo_url: null,
    cover_image_url: null,
    status: 'PENDING',
    is_featured: false,
    address: '1 Main St',
    city: 'HCM',
    latitude: null,
    longitude: null,
    phone: null,
    min_order_amount: 0,
    delivery_fee: 0,
    estimated_prep_time: 30,
    average_rating: 0,
    total_orders: 0,
    is_profile_complete: false,
    owner_email: 'owner@example.com',
    owner_full_name: 'Owner A',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

test('merchant list state resolves loading, error, empty and ready', () => {
  assert.equal(
    getMerchantListViewState({ isLoading: true, errorMessage: '', items: sampleItems }),
    'loading'
  )
  assert.equal(
    getMerchantListViewState({ isLoading: false, errorMessage: 'error', items: sampleItems }),
    'error'
  )
  assert.equal(getMerchantListViewState({ isLoading: false, errorMessage: '', items: [] }), 'empty')
  assert.equal(
    getMerchantListViewState({ isLoading: false, errorMessage: '', items: sampleItems }),
    'ready'
  )
})

test('filter and approve helpers support success/failure UI flows', () => {
  const filtered = filterMerchants(sampleItems, 'owner@example.com')
  assert.equal(filtered.length, 1)

  const afterApprove = applyApproveSuccess(sampleItems, 'm1')
  assert.equal(afterApprove.length, 0)

  assert.equal(statusColor('PENDING'), 'warning')
  assert.equal(statusColor('ACTIVE'), 'success')
  assert.equal(statusColor('SUSPENDED'), 'error')
})

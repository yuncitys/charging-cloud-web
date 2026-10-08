/* eslint-env jest */
import { adminMessageRoute } from '@/utils/adminMessageRoute'

describe('adminMessageRoute', () => {
  it('maps fault work order messages to the order list with id', () => {
    expect(adminMessageRoute({ bizType: 'FAULT_WORK_ORDER', bizId: 9 })).toEqual({ path: '/device/faultWorkOrders', query: { id: 9 }})
  })

  it('returns null for unknown type or missing bizId', () => {
    expect(adminMessageRoute({ bizType: 'OTHER', bizId: 1 })).toBeNull()
    expect(adminMessageRoute({ bizType: 'FAULT_WORK_ORDER' })).toBeNull()
    expect(adminMessageRoute(null)).toBeNull()
  })
})

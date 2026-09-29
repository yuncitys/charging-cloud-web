/* eslint-env jest */
jest.mock('@/api/monitor/faultMonitor', () => ({
  getFaultKpi: jest.fn()
}))
jest.mock('echarts', () => ({ init: jest.fn(() => ({ setOption: jest.fn(), resize: jest.fn(), dispose: jest.fn() })) }))
jest.mock('@/api/merchant/merchant', () => ({ getMerchant: jest.fn() }))
jest.mock('@/api/netWorkDot/netWorkDotList', () => ({ getChargingStationList: jest.fn() }))

import FaultMonitor from '@/views/monitor/faultMonitor.vue'

const hasTrendData = dailyTrends => FaultMonitor.computed.hasTrendData.call({ dailyTrends })

describe('FaultMonitor hasTrendData', () => {
  it('is false when every series is zero', () => {
    expect(hasTrendData([{ day: '2026-09-01', openedCount: 0, startedCount: 0, completedCount: 0, faultNoResponseCount: 0, orderSuccessRate: 0 }])).toBe(false)
  })

  it('is true when only order series has data', () => {
    expect(hasTrendData([{ day: '2026-09-01', openedCount: 0, startedCount: 5, completedCount: 0, faultNoResponseCount: 0, orderSuccessRate: 0 }])).toBe(true)
    expect(hasTrendData([{ day: '2026-09-01', openedCount: 0, faultNoResponseCount: 2 }])).toBe(true)
  })
})

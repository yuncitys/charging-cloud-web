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

describe('FaultMonitor KPI links', () => {
  const ctx = (listQuery, push) => ({
    listQuery,
    $router: { push },
    cleanQuery: FaultMonitor.methods.cleanQuery
  })

  it('opens work orders filtered by card', () => {
    const push = jest.fn()
    const listQuery = { start: '2026-10-01 00:00:00', end: '2026-10-02 23:59:59', merchantId: 5, stationId: '' }

    FaultMonitor.methods.goKpi.call(ctx(listQuery, push), { key: 'openCount', link: { statusIn: 'OPEN,IN_PROGRESS' }})

    expect(push).toHaveBeenCalledWith({
      path: '/device/faultWorkOrders',
      query: { start: '2026-10-01 00:00:00', end: '2026-10-02 23:59:59', merchantId: 5, statusIn: 'OPEN,IN_PROGRESS' }
    })
  })

  it('ignores cards without link', () => {
    const push = jest.fn()
    FaultMonitor.methods.goKpi.call(ctx({}, push), { key: 'rate' })
    expect(push).not.toHaveBeenCalled()
  })

  it('links opened, open and avg close cards only', () => {
    const cards = FaultMonitor.computed.kpiCards.call({
      kpi: {},
      num: FaultMonitor.methods.num,
      percent: () => '0%',
      decimal: () => '0.00'
    })
    const links = cards.reduce((acc, c) => Object.assign(acc, { [c.key]: c.link || null }), {})
    expect(links.openedCount).toEqual({ statusIn: 'OPEN,IN_PROGRESS,CLOSED' })
    expect(links.openCount).toEqual({ statusIn: 'OPEN,IN_PROGRESS' })
    expect(links.avgCloseHours).toEqual({ status: 'CLOSED' })
    expect(links.rate).toBeNull()
    expect(links.orderSuccessRate).toBeNull()
  })
})

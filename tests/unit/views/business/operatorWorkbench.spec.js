/* eslint-env jest */
import { shallowMount } from '@vue/test-utils'
import OperatorWorkbench from '@/views/business/operatorWorkbench/index.vue'
import * as api from '@/api/business/operatorWorkbench'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList'

jest.mock('@/api/merchant/merchant', () => ({
  getMerchant: jest.fn(() => Promise.resolve({ code: 200, data: [] }))
}))
jest.mock('@/api/netWorkDot/netWorkDotList', () => ({
  getChargingStationList: jest.fn(() => Promise.resolve({ code: 200, data: [{ id: 1, networkName: 'A' }, { id: 2, networkName: 'B' }] }))
}))
jest.mock('@/api/business/operatorWorkbench', () => {
  const ok = jest.fn(() => Promise.resolve({ code: 200, data: {} }))
  return {
    workbenchOverview: ok,
    workbenchAlerts: jest.fn(() => Promise.resolve({ code: 200, data: [], count: 0 })),
    workbenchFinance: ok,
    workbenchMarketing: ok,
    workbenchMarketingAnalysis: jest.fn(() => Promise.resolve({ code: 200, data: { trend: [], activityTop: [] } })),
    workbenchChargeUsers: jest.fn(() => Promise.resolve({
      code: 200,
      data: { chargeUserCount: 40, newChargeUserCount: 10, periodStart: '2026-10-26', periodEnd: '2026-10-26', titleHint: '昨日充电用户', subHint: '今日未收口，按昨日统计' }
    })),
    workbenchChargeUserAnalysis: jest.fn(() => Promise.resolve({
      code: 200,
      data: {
        yesterday: { chargeUserCount: 40, newChargeUserCount: 10, periodStart: '2026-10-26', periodEnd: '2026-10-26', titleHint: '昨日充电用户' },
        monthToDate: { chargeUserCount: 300, newChargeUserCount: 90, periodStart: '2026-10-01', periodEnd: '2026-10-26', titleHint: '本月充电用户', subHint: '统计区间 2026-10-01 ~ 2026-10-26' },
        trend: [{ date: '2026-10-25', chargeUserCount: 3, newChargeUserCount: 1 }],
        stationTop: [{ stationId: 1, stationName: 'A', chargeUserCount: 20 }]
      }
    })),
    getTerminalStatus: jest.fn(() => Promise.resolve({
      code: 200,
      data: {
        dc: { fault: 2, offline: 0, occupy: 1, charging: 0, idle: 13, other: 0 },
        ac: { fault: 0, offline: 0, occupy: 0, charging: 0, idle: 0, other: 0 }
      }
    })),
    getStationPowerTop: jest.fn(() => Promise.resolve({
      code: 200,
      data: [{ rank: 1, stationId: 1, stationName: 'A', totalKwh: 100, avgDailyKwh: 10, avgDailyKwhPerGun: null, gunCount: 0, utilizationRate: null, ratedPowerKw: 60 }]
    })),
    getAlertConfig: jest.fn(),
    saveAlertConfig: jest.fn(),
    dismissAlert: jest.fn(),
    batchDismissAlerts: jest.fn(),
    listDismissed: jest.fn(),
    cancelDismiss: jest.fn()
  }
})

const flush = () => new Promise(resolve => setTimeout(resolve))

const factory = () => shallowMount(OperatorWorkbench, {
  mocks: {
    $router: { push: jest.fn() },
    $message: { warning: jest.fn(), error: jest.fn(), success: jest.fn() },
    $dict: { getDeviceRuleOptions: jest.fn(() => Promise.resolve([{ value: 1, label: '电动单车' }, { value: 2, label: '新能源汽车' }])) },
    btnAuthen: { permsVerifAuthention: () => true }
  },
  directives: { loading: {} }
})

describe('OperatorWorkbench V3', () => {
  beforeEach(() => jest.clearAllMocks())

  it('buildParams carries ruleId only when selected', async () => {
    const w = factory()
    await flush()
    expect(w.vm.buildParams().ruleId).toBeUndefined()
    w.vm.searchForm.ruleId = 2
    expect(w.vm.buildParams().ruleId).toBe(2)
    w.vm.searchForm.ruleId = null
    expect(w.vm.buildParams().ruleId).toBeUndefined()
  })

  it('loads terminal status and station top with other panels', async () => {
    const w = factory()
    await flush()
    expect(api.getTerminalStatus).toHaveBeenCalledTimes(1)
    expect(api.getStationPowerTop).toHaveBeenCalledTimes(1)
    expect(w.vm.terminal.dc.idle).toBe(13)
    expect(w.vm.stationTop).toHaveLength(1)
    expect(w.vm.ruleOptions).toHaveLength(2)
  })

  it('station top accepts legacy array and { list, meta } result', async () => {
    const w = factory()
    await flush()
    expect(w.vm.stationTop).toHaveLength(1)
    expect(w.vm.stationTopMeta).toEqual({})
    api.getStationPowerTop.mockResolvedValueOnce({
      code: 200,
      data: {
        list: [{ rank: 1, stationId: 1, stationName: 'A' }, { rank: 2, stationId: 2, stationName: 'B' }],
        dataAsOf: '2026-10-27 10:00:00',
        periodStart: '2026-10-27',
        periodEnd: '2026-10-27',
        periodHint: '充电日账单约每15分钟同步'
      }
    })
    await w.vm.loadStationTop()
    await flush()
    expect(w.vm.stationTop).toHaveLength(2)
    expect(w.vm.stationTopMeta.dataAsOf).toBe('2026-10-27 10:00:00')
    expect(w.vm.stationTopMeta.periodHint).toBe('充电日账单约每15分钟同步')
  })

  it('station top title follows period; null shows --', async () => {
    const w = factory()
    await flush()
    expect(w.vm.stationTopTitle).toBe('今日电站电量前 10')
    w.vm.searchForm.periodType = 'WEEK'
    expect(w.vm.stationTopTitle).toBe('本周电站电量前 10')
    w.vm.searchForm.periodType = 'MONTH'
    expect(w.vm.stationTopTitle).toBe('本月电站电量前 10')
    expect(w.vm.num(null)).toBe('--')
    expect(w.vm.num(12.345)).toBe('12.35')
  })

  it('exposes formula tips for calculated station-top columns', async () => {
    const w = factory()
    await flush()
    const tips = w.vm.STATION_TOP_TIPS
    expect(tips.avgDailyKwh).toContain('总电量')
    expect(tips.avgDailyKwhPerGun).toContain('日均电量')
    expect(tips.utilizationRate).toContain('24')
    expect(tips.ratedPowerKw).toContain('1000')
  })

  it('rule change refetches stations by ruleId, prunes selection, and re-queries', async () => {
    const w = factory()
    await flush()
    w.vm.searchForm.stationIds = [1, 2]
    w.vm.searchForm.ruleId = 2
    getChargingStationList.mockResolvedValueOnce({ code: 200, data: [{ id: 2, networkName: 'B' }] })
    api.getTerminalStatus.mockClear()
    w.vm.onRuleChange()
    await flush()
    expect(getChargingStationList).toHaveBeenLastCalledWith({ ruleId: 2 })
    expect(w.vm.searchForm.stationIds).toEqual([2])
    expect(api.getTerminalStatus).toHaveBeenCalledWith(expect.objectContaining({ ruleId: 2 }))
  })

  it('merchant change refetches stations by merchantId and prunes selection', async () => {
    const w = factory()
    await flush()
    w.vm.searchForm.stationIds = [1, 2]
    w.vm.searchForm.merchantId = 9
    getChargingStationList.mockResolvedValueOnce({ code: 200, data: [{ id: 1, networkName: 'A' }] })
    api.getTerminalStatus.mockClear()
    w.vm.onMerchantChange()
    await flush()
    expect(getChargingStationList).toHaveBeenLastCalledWith({ merchantId: 9 })
    expect(w.vm.searchForm.stationIds).toEqual([1])
    expect(api.getTerminalStatus).toHaveBeenCalledWith(expect.objectContaining({ merchantId: 9 }))
  })

  it('opens marketing analysis drawer with merchant/rule, no stationIds, analysisDays + statDate', async () => {
    const w = factory()
    await flush()
    w.vm.searchForm.merchantId = 9
    w.vm.searchForm.ruleId = 2
    w.vm.searchForm.stationIds = [1]
    w.vm.openMarketingAnalysis()
    await flush()
    expect(w.vm.maDrawer).toBe(true)
    const p = api.workbenchMarketingAnalysis.mock.calls[0][0]
    expect(p).toEqual(expect.objectContaining({ merchantId: 9, ruleId: 2, analysisDays: 30 }))
    expect(p.stationIds).toBeUndefined()
    expect(p.statDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(w.vm.maTrend).toHaveLength(30)
  })

  it('marketing analysis maps rows, handles error and ignores stale responses', async () => {
    const w = factory()
    await flush()
    api.workbenchMarketingAnalysis.mockResolvedValueOnce({
      code: 200,
      data: { trend: [], activityTop: [{ activityId: 'a1', activityName: '满减', issueCount: 3, redeemCount: 1, activityOrderKwh: 5, discountCost: 2 }] }
    })
    await w.vm.loadMarketingAnalysis()
    expect(w.vm.maTop).toHaveLength(1)
    api.workbenchMarketingAnalysis.mockResolvedValueOnce({ code: 500, msg: '失败了' })
    await w.vm.loadMarketingAnalysis()
    expect(w.vm.maError).toBe('失败了')

    let resolveSlow
    api.workbenchMarketingAnalysis
      .mockImplementationOnce(() => new Promise(r => { resolveSlow = r }))
      .mockResolvedValueOnce({ code: 200, data: { trend: [], activityTop: [{ activityId: 'new' }] } })
    const slow = w.vm.loadMarketingAnalysis()
    await w.vm.loadMarketingAnalysis()
    resolveSlow({ code: 200, data: { trend: [], activityTop: [{ activityId: 'old' }] } })
    await slow
    expect(w.vm.maTop[0].activityId).toBe('new')
    expect(w.vm.maLoading).toBe(false)
  })

  it('loads charge user block with other panels; title/ring follow response', async () => {
    const w = factory()
    await flush()
    expect(api.workbenchChargeUsers).toHaveBeenCalledTimes(1)
    expect(api.workbenchChargeUsers).toHaveBeenCalledWith(expect.objectContaining({ periodType: 'TODAY' }))
    expect(w.vm.chargeUser.chargeUserCount).toBe(40)
    expect(w.vm.chargeUserPeriodText).toBe('今日未收口，按昨日统计')
    expect(w.vm.chargeUserNewPercent).toBe(25)
    expect(w.vm.chargeUserRingStyle.background).toContain('conic-gradient')
    w.vm.searchForm.periodType = 'WEEK'
    w.vm.search()
    await flush()
    expect(api.workbenchChargeUsers).toHaveBeenLastCalledWith(expect.objectContaining({ periodType: 'WEEK' }))
  })

  it('charge user block shows error without blocking others and falls back to period text', async () => {
    api.workbenchChargeUsers.mockResolvedValueOnce({ code: 500, msg: '用户块失败' })
    const w = factory()
    await flush()
    expect(w.vm.blocks.chargeUser.error).toBe('用户块失败')
    expect(w.vm.blocks.overview.error).toBe('')
    api.workbenchChargeUsers.mockResolvedValueOnce({ code: 200, data: { chargeUserCount: 0, newChargeUserCount: 0, periodStart: '2026-10-01', periodEnd: '2026-10-26' } })
    await w.vm.loadChargeUser()
    expect(w.vm.chargeUserPeriodText).toBe('统计区间 2026-10-01 ~ 2026-10-26')
    expect(w.vm.chargeUserNewPercent).toBe(0)
  })

  it('does not load charge users without view permission', async () => {
    const w = shallowMount(OperatorWorkbench, {
      mocks: {
        $router: { push: jest.fn() },
        $message: { warning: jest.fn(), error: jest.fn(), success: jest.fn() },
        $dict: { getDeviceRuleOptions: jest.fn(() => Promise.resolve([])) },
        btnAuthen: { permsVerifAuthention: code => code !== ':web:operatorWorkbench:view' }
      },
      directives: { loading: {} }
    })
    await flush()
    expect(w.vm.canView).toBe(false)
    expect(api.workbenchChargeUsers).not.toHaveBeenCalled()
  })

  it('opens user analysis drawer with merchant/rule/stationIds and maps cards, trend, station top', async () => {
    const w = factory()
    await flush()
    w.vm.searchForm.merchantId = 9
    w.vm.searchForm.ruleId = 2
    w.vm.searchForm.stationIds = [1]
    w.vm.openChargeUserAnalysis()
    await flush()
    expect(w.vm.cuDrawer).toBe(true)
    expect(api.workbenchChargeUserAnalysis).toHaveBeenCalledWith(expect.objectContaining({ merchantId: 9, ruleId: 2, stationIds: [1] }))
    expect(w.vm.cuYesterday.chargeUserCount).toBe(40)
    expect(w.vm.cuMonth.chargeUserCount).toBe(300)
    expect(w.vm.cuTrend).toHaveLength(1)
    expect(w.vm.cuStationTop[0].stationName).toBe('A')
    expect(w.vm.cuCompareCards).toHaveLength(2)
    expect(w.vm.cuCardPeriod({ periodStart: '2026-10-26', periodEnd: '2026-10-26' })).toBe('统计日 2026-10-26')
    expect(w.vm.cuCardPeriod({})).toBe('--')
  })

  it('user analysis handles error and ignores stale responses', async () => {
    const w = factory()
    await flush()
    api.workbenchChargeUserAnalysis.mockResolvedValueOnce({ code: 500, msg: '分析失败' })
    await w.vm.loadChargeUserAnalysis()
    expect(w.vm.cuError).toBe('分析失败')

    let resolveSlow
    api.workbenchChargeUserAnalysis
      .mockImplementationOnce(() => new Promise(r => { resolveSlow = r }))
      .mockResolvedValueOnce({ code: 200, data: { trend: [], stationTop: [{ stationId: 'new' }] } })
    const slow = w.vm.loadChargeUserAnalysis()
    await w.vm.loadChargeUserAnalysis()
    resolveSlow({ code: 200, data: { trend: [], stationTop: [{ stationId: 'old' }] } })
    await slow
    expect(w.vm.cuStationTop[0].stationId).toBe('new')
    expect(w.vm.cuError).toBe('')
    expect(w.vm.cuLoading).toBe(false)
  })
})

/* eslint-env jest */
import { shallowMount } from '@vue/test-utils'
import OperatorWorkbench from '@/views/business/operatorWorkbench/index.vue'
import * as api from '@/api/business/operatorWorkbench'

jest.mock('@/api/merchant/merchant', () => ({
  getMerchant: jest.fn(() => Promise.resolve({ code: 200, data: [] }))
}))
jest.mock('@/api/business/operatorWorkbench', () => {
  const ok = jest.fn(() => Promise.resolve({ code: 200, data: {} }))
  return {
    workbenchOverview: jest.fn(() => Promise.resolve({
      code: 200,
      data: {
        dayKey: 'today',
        dayDate: '2026-10-30',
        totalDegree: 12.5,
        orderCount: 3,
        orderTotalAmount: 100,
        electricFee: 60,
        serviceFee: 40,
        categories: ['00:00', '01:00'],
        todaySeries: [1, 2],
        yesterdaySeries: [0.5, 1]
      }
    })),
    workbenchAlerts: jest.fn(() => Promise.resolve({ code: 200, data: [], count: 0 })),
    workbenchFinance: jest.fn(() => Promise.resolve({
      code: 200,
      data: { totalIncome: 1200, todayIncome: 88.5, showWithdraw: false, balanceAmount: null }
    })),
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
      data: {
        list: [{ rank: 1, stationId: 1, stationName: 'A', totalKwh: 100, avgDailyKwh: 100, avgDailyKwhPerGun: null, gunCount: 0, utilizationRate: null, ratedPowerKw: 60 }],
        periodStart: '2026-10-30',
        periodEnd: '2026-10-30',
        periodHint: '仅统计今日电量，大约每15分钟更新；终端数与额定功率为当日快照'
      }
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
    $dict: { getDeviceRuleOptions: jest.fn(() => Promise.resolve([])) },
    btnAuthen: { permsVerifAuthention: () => true }
  },
  directives: { loading: {} }
})

describe('OperatorWorkbench merchant-align', () => {
  beforeEach(() => jest.clearAllMocks())

  it('buildParams is fixed TODAY without merchant/station filters', async () => {
    const w = factory()
    await flush()
    expect(w.vm.buildParams()).toEqual({ periodType: 'TODAY' })
  })

  it('loads charge overview with dayKey and hourly series', async () => {
    const w = factory()
    await flush()
    expect(api.workbenchOverview).toHaveBeenCalledWith(expect.objectContaining({ periodType: 'TODAY', dayKey: 'today' }))
    expect(w.vm.overview.totalDegree).toBe(12.5)
    expect(w.vm.hourlyCategories).toHaveLength(2)
    expect(w.vm.hourlyMax).toBe(2)
    w.vm.dayKey = 'yesterday'
    await w.vm.loadOverview()
    expect(api.workbenchOverview).toHaveBeenLastCalledWith(expect.objectContaining({ dayKey: 'yesterday' }))
  })

  it('loads terminal status and station top with dayKey today/yesterday', async () => {
    const w = factory()
    await flush()
    expect(api.getTerminalStatus).toHaveBeenCalledTimes(1)
    expect(api.getStationPowerTop).toHaveBeenCalledWith(expect.objectContaining({ periodType: 'TODAY', dayKey: 'today' }))
    expect(w.vm.terminal.dc.idle).toBe(13)
    expect(w.vm.stationTop).toHaveLength(1)
    expect(w.vm.stationTopMeta.periodHint).toContain('今日')
    w.vm.stationTopDayKey = 'yesterday'
    await w.vm.loadStationTop()
    expect(api.getStationPowerTop).toHaveBeenLastCalledWith(expect.objectContaining({ dayKey: 'yesterday' }))
  })

  it('finance tip via question mark; sync short is 15分钟', async () => {
    const w = factory()
    await flush()
    expect(w.vm.finance.totalIncome).toBe(1200)
    expect(w.vm.finance.todayIncome).toBe(88.5)
    expect(w.vm.finance.showWithdraw).toBe(false)
    expect(w.vm.FINANCE_TIP).toContain('累计总收入')
    expect(w.vm.FINANCE_TIP).toContain('今日收入')
    expect(w.vm.FINANCE_TIP).toContain('可提现')
    expect(w.vm.FINANCE_TIP).not.toContain('商户端')
    expect(w.vm.financeMeta.syncShort).toBe('15分钟')
  })

  it('exposes plain-language tips for station-top columns', async () => {
    const w = factory()
    await flush()
    const tips = w.vm.STATION_TOP_TIPS
    expect(tips.avgDailyKwh).toContain('所选日期')
    expect(tips.utilizationRate).toContain('占比')
    expect(tips.ratedPowerKw).toContain('千瓦')
    expect(w.vm.num(null)).toBe('--')
    expect(w.vm.num(12.345)).toBe('12.35')
  })

  it('station trend link goes to businessStatisticsThree', async () => {
    const w = factory()
    await flush()
    w.vm.go('/business/businessStatisticsThree')
    expect(w.vm.$router.push).toHaveBeenCalledWith({ path: '/business/businessStatisticsThree', query: {} })
  })

  it('marketing tip explains fields for operators', async () => {
    const w = factory()
    await flush()
    const tip = w.vm.MARKETING_TIP
    expect(tip).toContain('进行中活动')
    expect(tip).toContain('发券数')
    expect(tip).toContain('核销数')
    expect(tip).toContain('核销率')
    expect(tip).toContain('优惠成本')
    expect(tip).toContain('补贴成本')
    expect(tip).toContain('活动订单电量')
    expect(tip).toContain('参与电站数')
    expect(tip).toContain('参与用户数')
    expect(tip).toContain('核销订单实收')
    expect(tip).toContain('粗略 ROI')
    expect(tip).not.toMatch(/日表|SUM|DataScope|periodType/)
  })

  it('opens marketing analysis with TODAY params', async () => {
    const w = factory()
    await flush()
    w.vm.openMarketingAnalysis()
    await flush()
    expect(w.vm.maDrawer).toBe(true)
    const p = api.workbenchMarketingAnalysis.mock.calls[0][0]
    expect(p).toEqual(expect.objectContaining({ periodType: 'TODAY', analysisDays: 30 }))
    expect(p.statDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(w.vm.maTrend).toHaveLength(30)
  })

  it('loads charge user block with dayKey today/yesterday', async () => {
    const w = factory()
    await flush()
    expect(api.workbenchChargeUsers).toHaveBeenCalledWith(expect.objectContaining({ periodType: 'TODAY', dayKey: 'today' }))
    expect(w.vm.chargeUser.chargeUserCount).toBe(40)
    expect(w.vm.chargeUserNewPercent).toBe(25)
    w.vm.chargeUserDayKey = 'yesterday'
    await w.vm.loadChargeUser()
    expect(api.workbenchChargeUsers).toHaveBeenLastCalledWith(expect.objectContaining({ dayKey: 'yesterday' }))
  })

  it('charge user block shows error without blocking others', async () => {
    api.workbenchChargeUsers.mockResolvedValueOnce({ code: 500, msg: '用户块失败' })
    const w = factory()
    await flush()
    expect(w.vm.blocks.chargeUser.error).toBe('用户块失败')
    expect(w.vm.blocks.overview.error).toBe('')
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

  it('opens user analysis drawer and maps cards', async () => {
    const w = factory()
    await flush()
    w.vm.openChargeUserAnalysis()
    await flush()
    expect(w.vm.cuDrawer).toBe(true)
    expect(api.workbenchChargeUserAnalysis).toHaveBeenCalled()
    expect(w.vm.cuYesterday.chargeUserCount).toBe(40)
    expect(w.vm.cuCompareCards).toHaveLength(2)
  })
})

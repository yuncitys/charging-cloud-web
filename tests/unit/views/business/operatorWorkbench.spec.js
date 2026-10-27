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
})

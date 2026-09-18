/* eslint-env jest */
import { shallowMount } from '@vue/test-utils'
import StationMonitor from '@/views/monitor/stationMonitor.vue'

jest.mock('@/api/monitor/stationMonitor', () => ({
  getStationMonitorSummary: jest.fn(),
  getStationMonitorPiles: jest.fn()
}))

jest.mock('@/api/netWorkDot/netWorkDotList', () => ({
  getList: jest.fn(() => Promise.resolve({ code: 200, data: [] }))
}))

jest.mock('@/api/device/deviceList', () => ({
  closeDevice: jest.fn()
}))

jest.mock('screenfull', () => ({
  enabled: false,
  isFullscreen: false,
  toggle: jest.fn(),
  on: jest.fn(),
  off: jest.fn()
}))

const factory = (options = {}) => {
  const mocks = {
    $route: { query: {}},
    $router: { push: jest.fn() },
    $message: {
      warning: jest.fn(),
      error: jest.fn(),
      success: jest.fn()
    },
    $confirm: jest.fn(),
    $dict: { getSelector: jest.fn(), formatElectricOutType: jest.fn() },
    ...(options.mocks || {})
  }

  return shallowMount(StationMonitor, {
    mocks,
    stubs: {
      'el-select': true,
      'el-option': true,
      'el-input': true,
      'el-button': true,
      'el-card': true,
      'el-radio-group': true,
      'el-radio-button': true,
      'el-tag': true,
      'el-dropdown': true,
      'el-dropdown-menu': true,
      'el-dropdown-item': true,
      'el-tooltip': true,
      'gun-status-event-dialog': true,
      'exception-log-drawer': true
    },
    ...options
  })
}

describe('stationMonitor status chips', () => {
  it('opens the exception drawer for fault and offline detail clicks without changing the active tab', async() => {
    const wrapper = factory()
    await Promise.resolve()
    wrapper.setData({ stationId: 1001, tabStatus: null })
    wrapper.vm.loadAll = jest.fn()
    wrapper.vm.$refs.exceptionDrawer = { open: jest.fn() }

    await wrapper.vm.$nextTick()
    await Promise.resolve()
    wrapper.vm.loadAll.mockClear()

    const details = wrapper.findAll('.status-chip__detail')
    expect(details).toHaveLength(2)

    await details.at(0).trigger('click')

    expect(wrapper.vm.$refs.exceptionDrawer.open).toHaveBeenCalledWith(1001, 'fault')
    expect(wrapper.vm.tabStatus).toBeNull()
    expect(wrapper.vm.loadAll).not.toHaveBeenCalled()

    await details.at(1).trigger('click')

    expect(wrapper.vm.$refs.exceptionDrawer.open).toHaveBeenLastCalledWith(1001, 'offline')
    expect(wrapper.vm.tabStatus).toBeNull()
  })

  it('warns before opening details when no station is selected', () => {
    const wrapper = factory()
    wrapper.vm.$refs.exceptionDrawer = { open: jest.fn() }

    wrapper.vm.openExceptionDrawer('fault')

    expect(wrapper.vm.$message.warning).toHaveBeenCalledWith('请先选择站点')
    expect(wrapper.vm.$refs.exceptionDrawer.open).not.toHaveBeenCalled()
  })
})

/* eslint-env jest */
import { shallowMount } from '@vue/test-utils'
import FaultWorkOrderList from '@/views/monitor/faultWorkOrderList.vue'
import {
  pageFaultWorkOrders,
  getFaultWorkOrder
} from '@/api/monitor/faultMonitor'

jest.mock('@/api/monitor/faultMonitor', () => ({
  pageFaultWorkOrders: jest.fn(),
  getFaultWorkOrder: jest.fn(),
  createFaultWorkOrder: jest.fn(),
  assignFaultWorkOrder: jest.fn(),
  startFaultWorkOrder: jest.fn(),
  remarkFaultWorkOrder: jest.fn(),
  closeFaultWorkOrder: jest.fn(),
  cancelFaultWorkOrder: jest.fn()
}))

jest.mock('@/api/netWorkDot/netWorkDotList', () => ({
  getChargingStationList: jest.fn(() => Promise.resolve({ code: 200, data: [] }))
}))

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

const factory = (options = {}) => {
  const mocks = {
    $route: { query: {}},
    $message: { warning: jest.fn(), error: jest.fn(), success: jest.fn() },
    $confirm: jest.fn(),
    ...(options.mocks || {})
  }

  return shallowMount(FaultWorkOrderList, {
    mocks,
    directives: {
      loading: {}
    },
    stubs: {
      'el-input': true,
      'el-select': true,
      'el-option': true,
      'el-date-picker': true,
      'el-button': true,
      'el-table': true,
      'el-table-column': true,
      'el-tag': true,
      'el-dropdown': true,
      'el-dropdown-menu': true,
      'el-dropdown-item': true,
      'el-pagination': true,
      'el-drawer': true,
      'el-timeline': true,
      'el-timeline-item': true,
      'el-card': true,
      'el-dialog': true,
      'el-form': true,
      'el-form-item': true
    },
    ...options
  })
}

describe('FaultWorkOrderList route detail opening', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pageFaultWorkOrders.mockResolvedValue({ code: 200, data: [], count: 0 })
    getFaultWorkOrder.mockResolvedValue({ code: 200, data: { workOrder: { id: 99 }, actions: [] }})
  })

  it('opens detail on mount when query id is present', async() => {
    const wrapper = factory({ mocks: { $route: { query: { id: 99 }}}})
    await flush()

    expect(getFaultWorkOrder).toHaveBeenCalledWith(99)
    expect(wrapper.vm.detailVisible).toBe(true)
  })

  it('opens detail from query workOrderId on route watch', async() => {
    const wrapper = factory()
    await flush()
    getFaultWorkOrder.mockClear()
    wrapper.vm.$route.query = { workOrderId: 101 }

    wrapper.vm.$options.watch.$route.call(wrapper.vm)
    await flush()

    expect(getFaultWorkOrder).toHaveBeenCalledWith(101)
  })
})

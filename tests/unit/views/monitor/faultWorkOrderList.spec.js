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
  cancelFaultWorkOrder: jest.fn(),
  listFaultStationDevices: jest.fn(),
  checkOpenWorkOrders: jest.fn(),
  getAssigneeCandidates: jest.fn(),
  exportFaultWorkOrders: jest.fn()
}))

jest.mock('@/components/Common/downloadProgress.vue', () => ({
  name: 'DownloadProgress',
  render(h) {
    return h('div')
  }
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
    btnAuthen: { permsVerifAuthention: jest.fn(() => true) },
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
      'el-form-item': true,
      'download-progress': true
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

  it('applies route merchantId to list query', async() => {
    factory({ mocks: { $route: { query: { merchantId: 66 }}}})
    await flush()

    expect(pageFaultWorkOrders).toHaveBeenCalledWith(expect.objectContaining({ merchantId: 66 }))
  })
})

describe('FaultWorkOrderList list and detail fields', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pageFaultWorkOrders.mockResolvedValue({ code: 200, data: [], count: 0 })
  })

  it('prefers backend stationName', async() => {
    const wrapper = factory()
    await flush()

    expect(wrapper.vm.rowStationName({ stationId: 1, stationName: '一号站' })).toBe('一号站')
    expect(wrapper.vm.rowStationName({ stationId: 7 })).toBe(7)
  })

  it('sends new filters and reset clears them', async() => {
    const wrapper = factory()
    await flush()
    wrapper.vm.listQuery.deviceCode = 'D1'
    wrapper.vm.listQuery.source = 'MANUAL'
    wrapper.vm.listQuery.alarmCode = 'DEVICE_FAULT'

    wrapper.vm.handleFilter()
    expect(pageFaultWorkOrders).toHaveBeenLastCalledWith(expect.objectContaining({
      deviceCode: 'D1', source: 'MANUAL', alarmCode: 'DEVICE_FAULT'
    }))

    wrapper.vm.handleReset()
    expect(wrapper.vm.listQuery.deviceCode).toBe('')
    expect(wrapper.vm.listQuery.source).toBe('')
    expect(wrapper.vm.listQuery.alarmCode).toBe('')
  })

  it('detail shows assignedAt and createUserName', async() => {
    const wrapper = factory()
    await flush()
    wrapper.vm.detail = {
      workOrder: { id: 1, stationName: '一号站', assignedAt: '2026-09-29 10:00:00' },
      actions: [],
      createUserName: '王五'
    }

    const labels = wrapper.vm.detailFields.reduce((acc, item) => {
      acc[item.label] = item.value
      return acc
    }, {})
    expect(labels['所属站点']).toBe('一号站')
    expect(labels['指派时间']).toBe('2026-09-29 10:00:00')
    expect(labels['创建人']).toBe('王五')
  })
})

/* eslint-env jest */
import { shallowMount } from '@vue/test-utils'
import ExceptionLogDrawer from '@/views/monitor/components/ExceptionLogDrawer.vue'
import {
  findOpenWorkOrderByAlarm,
  createFaultWorkOrder
} from '@/api/monitor/faultMonitor'

jest.mock('@/api/monitor/stationMonitor', () => ({
  getStationExceptionLogs: jest.fn(),
  exportStationExceptionLogs: jest.fn()
}))

jest.mock('@/api/monitor/faultMonitor', () => ({
  findOpenWorkOrderByAlarm: jest.fn(),
  createFaultWorkOrder: jest.fn()
}))

jest.mock('@/components/Common/downloadProgress.vue', () => ({
  name: 'DownloadProgress',
  render(h) {
    return h('div')
  }
}))

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

const factory = (options = {}) => {
  const mocks = {
    $router: { push: jest.fn() },
    $message: {
      warning: jest.fn(),
      error: jest.fn(),
      success: jest.fn()
    },
    ...(options.mocks || {})
  }

  return shallowMount(ExceptionLogDrawer, {
    mocks,
    directives: {
      loading: {}
    },
    stubs: {
      'el-drawer': true,
      'el-tabs': true,
      'el-tab-pane': true,
      'el-link': true,
      'el-table': true,
      'el-table-column': true,
      'el-pagination': true,
      'el-button': true,
      'el-dialog': true,
      'el-form': true,
      'el-form-item': true,
      'el-input': true,
      'download-progress': true
    },
    ...options
  })
}

describe('ExceptionLogDrawer transfer to work order', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('only allows fault rows to be transferred', () => {
    const wrapper = factory()

    expect(wrapper.vm.canTransferToWorkOrder({ type: 'fault' })).toBe(true)
    expect(wrapper.vm.canTransferToWorkOrder({ typeLabel: '故障' })).toBe(true)
    expect(wrapper.vm.canTransferToWorkOrder({ type: 'offline', typeLabel: '离线' })).toBe(false)
  })

  it('navigates to an existing open work order before creating', async() => {
    const wrapper = factory()
    const row = {
      id: 12,
      type: 'fault',
      deviceCode: 'DEV001',
      connector: 2,
      alarmCode: 'E001',
      reason: '过温'
    }
    findOpenWorkOrderByAlarm.mockResolvedValue({ code: 200, data: { id: 99 }})

    wrapper.vm.transferToWorkOrder(row)
    await flush()

    expect(findOpenWorkOrderByAlarm).toHaveBeenCalledWith({
      deviceLogId: 12,
      deviceCode: 'DEV001',
      connectorCode: 2,
      alarmCode: 'E001'
    })
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
      path: '/device/faultWorkOrders',
      query: { id: 99, workOrderId: 99 }
    })
    expect(wrapper.vm.createDialog.visible).toBe(false)
  })

  it('opens a prefilled create dialog and posts on confirmation', async() => {
    const wrapper = factory()
    const row = {
      id: 12,
      type: 'fault',
      stationId: 5,
      deviceCode: 'DEV001',
      connector: 2,
      alarmCode: 'E001',
      reason: '过温'
    }
    findOpenWorkOrderByAlarm.mockResolvedValue({ code: 200, data: null })
    createFaultWorkOrder.mockResolvedValue({ code: 200, data: { id: 101 }})

    wrapper.vm.transferToWorkOrder(row)
    await flush()

    expect(wrapper.vm.createDialog.visible).toBe(true)
    expect(wrapper.vm.createDialog.form).toMatchObject({
      stationId: 5,
      deviceLogId: 12,
      deviceCode: 'DEV001',
      connectorCode: 2,
      alarmCode: 'E001',
      title: '过温',
      description: '过温'
    })

    wrapper.vm.submitCreateWorkOrder()
    await flush()

    expect(createFaultWorkOrder).toHaveBeenCalledWith({
      stationId: 5,
      deviceLogId: 12,
      deviceCode: 'DEV001',
      connectorCode: 2,
      alarmCode: 'E001',
      alarmItem: '过温',
      title: '过温',
      description: '过温'
    })
    expect(wrapper.vm.$message.success).toHaveBeenCalledWith('建单成功')
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
      path: '/device/faultWorkOrders',
      query: { id: 101, workOrderId: 101 }
    })
  })
})

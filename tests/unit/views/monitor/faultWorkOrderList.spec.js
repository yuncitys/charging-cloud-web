/* eslint-env jest */
import { shallowMount } from '@vue/test-utils'
import FaultWorkOrderList from '@/views/monitor/faultWorkOrderList.vue'
import {
  pageFaultWorkOrders,
  getFaultWorkOrder,
  createFaultWorkOrder,
  assignFaultWorkOrder,
  listFaultStationDevices,
  checkOpenWorkOrders,
  getAssigneeCandidates,
  exportFaultWorkOrders,
  getFaultWorkOrderStatusCounts
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
  exportFaultWorkOrders: jest.fn(),
  getFaultWorkOrderStatusCounts: jest.fn()
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
      'el-tabs': true,
      'el-tab-pane': true,
      'el-checkbox': true,
      'download-progress': true
    },
    ...options
  })
}

describe('FaultWorkOrderList route detail opening', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pageFaultWorkOrders.mockResolvedValue({ code: 200, data: [], count: 0 })
    getFaultWorkOrderStatusCounts.mockResolvedValue({ code: 200, data: {}})
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
    getFaultWorkOrderStatusCounts.mockResolvedValue({ code: 200, data: {}})
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

describe('FaultWorkOrderList manual create', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pageFaultWorkOrders.mockResolvedValue({ code: 200, data: [], count: 0 })
    getFaultWorkOrderStatusCounts.mockResolvedValue({ code: 200, data: {}})
    listFaultStationDevices.mockResolvedValue({
      code: 200,
      data: [{ deviceCode: 'D1', deviceName: '一号桩', guns: [{ gunNumber: 1 }, { gunNumber: 2 }] }]
    })
  })

  const fillForm = async wrapper => {
    wrapper.vm.openCreateDialog()
    wrapper.vm.createDialog.form.stationId = 10
    wrapper.vm.handleCreateStationChange(10)
    await flush()
    wrapper.vm.createDialog.form.deviceCode = 'D1'
    wrapper.vm.createDialog.form.connectorCode = 1
    wrapper.vm.createDialog.form.alarmCode = 'DEVICE_FAULT'
    wrapper.vm.createDialog.form.title = ' 急停 '
  }

  it('loads station devices and exposes guns of selected device', async() => {
    const wrapper = factory()
    await fillForm(wrapper)

    expect(listFaultStationDevices).toHaveBeenCalledWith(10)
    expect(wrapper.vm.createGuns.map(g => g.gunNumber)).toEqual([1, 2])
  })

  it('requires device before submit', async() => {
    const wrapper = factory()
    await flush()
    wrapper.vm.openCreateDialog()
    wrapper.vm.createDialog.form.stationId = 10
    wrapper.vm.createDialog.form.title = 't'

    wrapper.vm.submitCreate()

    expect(wrapper.vm.$message.warning).toHaveBeenCalledWith('请选择设备')
    expect(checkOpenWorkOrders).not.toHaveBeenCalled()
  })

  it('requires alarm item before submit', async() => {
    const wrapper = factory()
    await fillForm(wrapper)
    wrapper.vm.createDialog.form.alarmCode = ''

    wrapper.vm.submitCreate()

    expect(wrapper.vm.$message.warning).toHaveBeenCalledWith('请选择告警项')
    expect(checkOpenWorkOrders).not.toHaveBeenCalled()
  })

  it('shows duplicate dialog instead of creating when open orders exist', async() => {
    checkOpenWorkOrders.mockResolvedValue({ code: 200, data: [{ id: 5, workOrderNo: 'FW1', status: 'OPEN' }] })
    const wrapper = factory()
    await fillForm(wrapper)

    wrapper.vm.submitCreate()
    await flush()

    expect(checkOpenWorkOrders).toHaveBeenCalledWith({ deviceCode: 'D1', connectorCode: 1 })
    expect(wrapper.vm.duplicateDialog.visible).toBe(true)
    expect(createFaultWorkOrder).not.toHaveBeenCalled()
  })

  it('creates with alarmItem label when no duplicates, and after confirming duplicates', async() => {
    checkOpenWorkOrders.mockResolvedValue({ code: 200, data: [] })
    createFaultWorkOrder.mockResolvedValue({ code: 200 })
    const wrapper = factory()
    await fillForm(wrapper)

    wrapper.vm.submitCreate()
    await flush()

    expect(createFaultWorkOrder).toHaveBeenCalledWith({
      stationId: 10,
      deviceCode: 'D1',
      connectorCode: 1,
      alarmCode: 'DEVICE_FAULT',
      alarmItem: '电桩故障',
      title: '急停'
    })
    expect(wrapper.vm.createDialog.visible).toBe(false)

    createFaultWorkOrder.mockClear()
    wrapper.vm.duplicateDialog = { visible: true, list: [{ id: 5 }] }
    wrapper.vm.createDialog.visible = true
    wrapper.vm.confirmDuplicateCreate()
    await flush()
    expect(createFaultWorkOrder).toHaveBeenCalled()
    expect(wrapper.vm.duplicateDialog.visible).toBe(false)
  })
})

describe('FaultWorkOrderList assign, permissions and export', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pageFaultWorkOrders.mockResolvedValue({ code: 200, data: [], count: 0 })
    getFaultWorkOrderStatusCounts.mockResolvedValue({ code: 200, data: {}})
  })

  it('hides actions without button permission', async() => {
    const wrapper = factory({
      mocks: {
        $route: { query: {}},
        $message: { warning: jest.fn(), error: jest.fn(), success: jest.fn() },
        $confirm: jest.fn(),
        btnAuthen: { permsVerifAuthention: jest.fn(perm => perm === ':ops:faultWorkOrder:start') }
      }
    })
    await flush()
    const row = { id: 1, status: 'OPEN' }

    expect(wrapper.vm.canAssign(row)).toBe(false)
    expect(wrapper.vm.canStart(row)).toBe(true)
    expect(wrapper.vm.canClose(row)).toBe(false)
    expect(wrapper.vm.hasMoreActions(row)).toBe(false)
  })

  it('allows reassign on in-progress orders and labels it', async() => {
    const wrapper = factory()
    await flush()

    expect(wrapper.vm.canAssign({ status: 'IN_PROGRESS' })).toBe(true)
    expect(wrapper.vm.assignLabel({ assigneeUserId: '24' })).toBe('改派')
    expect(wrapper.vm.assignLabel({})).toBe('指派')
  })

  it('loads candidates and submits assigneeUserId', async() => {
    getAssigneeCandidates.mockResolvedValue({ code: 200, data: [{ adminId: 24, adminName: 'lisi', adminFullname: '李四' }] })
    assignFaultWorkOrder.mockResolvedValue({ code: 200 })
    const wrapper = factory()
    await flush()

    wrapper.vm.openAssign({ id: 1, status: 'OPEN' })
    await flush()
    expect(getAssigneeCandidates).toHaveBeenCalledWith(1)
    expect(wrapper.vm.candidateLabel(wrapper.vm.actionDialog.candidates[0])).toBe('李四（lisi）')

    wrapper.vm.submitAction()
    expect(wrapper.vm.$message.warning).toHaveBeenCalledWith('请选择指派人')
    expect(assignFaultWorkOrder).not.toHaveBeenCalled()

    wrapper.vm.actionDialog.form.assigneeUserId = '24'
    wrapper.vm.submitAction()
    expect(assignFaultWorkOrder).toHaveBeenCalledWith(1, { assigneeUserId: '24' })
  })

  it('reassign starts empty and shows current assignee as placeholder', async() => {
    getAssigneeCandidates.mockResolvedValue({ code: 200, data: [] })
    const wrapper = factory()
    await flush()

    wrapper.vm.openAssign({ id: 1, status: 'IN_PROGRESS', assigneeUserId: '24', assigneeName: '李四' })

    expect(wrapper.vm.actionDialog.form.assigneeUserId).toBe('')
    expect(wrapper.vm.assigneePlaceholder).toBe('当前：李四，请选择新的指派人')
    wrapper.vm.openAssign({ id: 2, status: 'OPEN' })
    expect(wrapper.vm.assigneePlaceholder).toBe('请选择指派人')
  })

  it('provides usage tips for every action', async() => {
    const wrapper = factory()
    await flush()

    ;['create', 'detail', 'assign', 'start', 'remark', 'close', 'cancel', 'export'].forEach(key => {
      expect(wrapper.vm.actionTip(key)).not.toBe('')
    })
    wrapper.vm.openFinish({ id: 1, status: 'OPEN' }, 'cancel')
    expect(wrapper.vm.remarkField.label).toBe('取消原因')
    wrapper.vm.openFinish({ id: 1, status: 'OPEN' }, 'close')
    expect(wrapper.vm.remarkField.label).toBe('处理说明')
  })

  it('detail cards show progress and finish remark by status', async() => {
    const wrapper = factory()
    await flush()

    wrapper.vm.detail = { workOrder: { id: 1, status: 'IN_PROGRESS', assigneeUserId: '24' }, actions: [] }
    expect(wrapper.vm.detailProgress.active).toBe(3)
    expect(wrapper.vm.detailFields.map(f => f.label)).not.toContain('结案说明')
    expect(wrapper.vm.detailFields.find(f => f.label === '枪口').value).toBe('整桩')
    expect(wrapper.vm.hasDetailActions).toBe(true)

    wrapper.vm.detail = { workOrder: { id: 1, status: 'CANCELLED', closeRemark: '误报' }, actions: [] }
    expect(wrapper.vm.detailProgress.steps.map(s => s.title)).toEqual(['创建', '已取消'])
    expect(wrapper.vm.detailFields.find(f => f.label === '取消原因').value).toBe('误报')
    expect(wrapper.vm.hasDetailActions).toBe(false)
  })

  it('export opens download progress with task id', async() => {
    exportFaultWorkOrders.mockResolvedValue({ code: 200, data: { id: 777 }})
    const open = jest.fn()
    const wrapper = factory({
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
        'el-tabs': true,
        'el-tab-pane': true,
        'el-checkbox': true,
        'download-progress': { render(h) { return h('div') }, methods: { open }}
      }
    })
    await flush()
    wrapper.vm.listQuery.status = 'OPEN'

    wrapper.vm.exportList()
    await flush()

    expect(exportFaultWorkOrders).toHaveBeenCalledWith(expect.objectContaining({ status: 'OPEN' }))
    expect(exportFaultWorkOrders.mock.calls[0][0].page).toBeUndefined()
    expect(open).toHaveBeenCalledWith(777)
  })
})

describe('FaultWorkOrderList status tabs and filters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pageFaultWorkOrders.mockResolvedValue({ code: 200, data: [], count: 0 })
    getFaultWorkOrderStatusCounts.mockResolvedValue({ code: 200, data: { ALL: 7, OPEN: 3 }})
  })

  it('loads status counts without status filters', async() => {
    const wrapper = factory()
    await flush()
    wrapper.vm.listQuery.assigneeName = '张三'
    wrapper.vm.listQuery.status = 'OPEN'

    wrapper.vm.handleFilter()
    await flush()

    const params = getFaultWorkOrderStatusCounts.mock.calls[getFaultWorkOrderStatusCounts.mock.calls.length - 1][0]
    expect(params.assigneeName).toBe('张三')
    expect(params.status).toBeUndefined()
    expect(params.page).toBeUndefined()
    expect(wrapper.vm.statusCounts.ALL).toBe(7)
  })

  it('tab switch sets status and clears statusIn', async() => {
    const wrapper = factory({ mocks: { $route: { query: { statusIn: 'OPEN,IN_PROGRESS' }}}})
    await flush()
    expect(pageFaultWorkOrders).toHaveBeenLastCalledWith(expect.objectContaining({ statusIn: 'OPEN,IN_PROGRESS' }))

    wrapper.vm.activeStatus = 'CLOSED'
    wrapper.vm.handleStatusTab()

    expect(wrapper.vm.listQuery.statusIn).toBe('')
    expect(pageFaultWorkOrders).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'CLOSED' }))
  })

  it('sends mine/overdue only when checked and reads them from route', async() => {
    const wrapper = factory({ mocks: { $route: { query: { mine: 'true' }}}})
    await flush()
    expect(pageFaultWorkOrders).toHaveBeenLastCalledWith(expect.objectContaining({ mine: true }))
    expect(pageFaultWorkOrders.mock.calls[0][0].overdue).toBeUndefined()

    wrapper.vm.listQuery.overdue = true
    wrapper.vm.handleFilter()
    expect(pageFaultWorkOrders).toHaveBeenLastCalledWith(expect.objectContaining({ overdue: true }))

    wrapper.vm.handleReset()
    expect(wrapper.vm.listQuery.mine).toBe(false)
    expect(wrapper.vm.activeStatus).toBe('ALL')
  })

  it('shows duration and overdue flag', async() => {
    const wrapper = factory()
    await flush()
    wrapper.vm.now = new Date('2026/10/02 12:00:00').getTime()

    const row = { status: 'OPEN', openedAt: '2026-10-02 09:00:00' }
    expect(wrapper.vm.duration(row)).toBe('3小时0分')
    expect(wrapper.vm.overdue(row)).toBe(true)
  })
})

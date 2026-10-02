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
  getFaultWorkOrderStatusCounts,
  reopenFaultWorkOrder,
  batchCloseFaultWorkOrders,
  batchAssignFaultWorkOrders,
  batchCancelFaultWorkOrders,
  remarkFaultWorkOrder,
  closeFaultWorkOrder,
  cancelFaultWorkOrder
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
  getFaultWorkOrderStatusCounts: jest.fn(),
  reopenFaultWorkOrder: jest.fn(),
  batchAssignFaultWorkOrders: jest.fn(),
  batchCloseFaultWorkOrders: jest.fn(),
  batchCancelFaultWorkOrders: jest.fn()
}))

jest.mock('@/components/Common/downloadProgress.vue', () => ({
  name: 'DownloadProgress',
  render(h) {
    return h('div')
  }
}))

jest.mock('@/api/upload/file', () => ({ upload: jest.fn() }))

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
      'download-progress': true,
      'fault-image-upload': true,
      'el-image': true
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

  it('labels connector as gun number or whole device', async() => {
    const wrapper = factory()
    await flush()

    expect(wrapper.vm.connectorText({ connectorCode: 2 })).toBe('2号枪')
    expect(wrapper.vm.connectorText({ connectorCode: 0 })).toBe('整桩')
    expect(wrapper.vm.connectorText({})).toBe('整桩')
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

    ;['create', 'detail', 'assign', 'start', 'remark', 'close', 'cancel', 'reopen', 'batch', 'export'].forEach(key => {
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

describe('FaultWorkOrderList reopen and batch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pageFaultWorkOrders.mockResolvedValue({ code: 200, data: [], count: 0 })
    getFaultWorkOrderStatusCounts.mockResolvedValue({ code: 200, data: {}})
  })

  it('reopen only for closed orders with permission and requires reason', async() => {
    const wrapper = factory()
    await flush()
    expect(wrapper.vm.canReopen({ status: 'CLOSED' })).toBe(true)
    expect(wrapper.vm.canReopen({ status: 'CANCELLED' })).toBe(false)

    wrapper.vm.openReopen({ id: 8, status: 'CLOSED' })
    expect(wrapper.vm.remarkField.label).toBe('重开原因')
    wrapper.vm.submitAction()
    expect(reopenFaultWorkOrder).not.toHaveBeenCalled()

    reopenFaultWorkOrder.mockResolvedValue({ code: 200 })
    wrapper.vm.actionDialog.form.remark = '复现'
    wrapper.vm.submitAction()
    await flush()
    expect(reopenFaultWorkOrder).toHaveBeenCalledWith(8, { reason: '复现' })
  })

  it('batch close posts ids and shows result', async() => {
    batchCloseFaultWorkOrders.mockResolvedValue({ code: 200, data: { successCount: 1, failures: [{ id: 2, workOrderNo: 'FW2', reason: '工单已结束' }] }})
    const wrapper = factory()
    await flush()
    wrapper.vm.handleSelectionChange([{ id: 1, status: 'OPEN' }, { id: 2, status: 'IN_PROGRESS' }])

    wrapper.vm.openBatch('close')
    wrapper.vm.submitAction()
    expect(batchCloseFaultWorkOrders).not.toHaveBeenCalled()

    wrapper.vm.actionDialog.form.remark = '已修复'
    wrapper.vm.submitAction()
    await flush()

    expect(batchCloseFaultWorkOrders).toHaveBeenCalledWith({ ids: [1, 2], closeRemark: '已修复' })
    expect(wrapper.vm.batchResult.visible).toBe(true)
    expect(wrapper.vm.batchResult.failures[0].workOrderNo).toBe('FW2')
    expect(wrapper.vm.selection).toEqual([])
  })

  it('batch assign offers only accounts valid for every selected station', async() => {
    getAssigneeCandidates.mockImplementation(id => Promise.resolve({
      code: 200,
      data: id === 1 ? [{ adminId: 10 }, { adminId: 11 }] : [{ adminId: 11 }, { adminId: 12 }]
    }))
    const wrapper = factory()
    await flush()
    wrapper.vm.handleSelectionChange([
      { id: 1, stationId: 100, status: 'OPEN' },
      { id: 3, stationId: 100, status: 'OPEN' },
      { id: 2, stationId: 200, status: 'OPEN' }
    ])

    wrapper.vm.openBatch('assign')
    await flush()

    expect(getAssigneeCandidates).toHaveBeenCalledTimes(2)
    expect(wrapper.vm.actionDialog.candidates.map(c => c.adminId)).toEqual([11])
  })

  it('rejects more than 100 selected', async() => {
    const wrapper = factory()
    await flush()
    wrapper.vm.handleSelectionChange(Array.from({ length: 101 }, (v, i) => ({ id: i + 1, status: 'OPEN' })))

    wrapper.vm.openBatch('cancel')

    expect(wrapper.vm.actionDialog.visible).toBe(false)
    expect(wrapper.vm.$message.warning).toHaveBeenCalledWith('一次最多处理100单')
  })
})

describe('FaultWorkOrderList attachments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pageFaultWorkOrders.mockResolvedValue({ code: 200, data: [], count: 0 })
    getFaultWorkOrderStatusCounts.mockResolvedValue({ code: 200, data: {}})
  })

  it('remark allows photos without text and posts attachments', async() => {
    remarkFaultWorkOrder.mockResolvedValue({ code: 200 })
    const wrapper = factory()
    await flush()
    wrapper.vm.openRemark({ id: 5, status: 'OPEN' })
    expect(wrapper.vm.supportsAttachments).toBe(true)

    wrapper.vm.submitAction()
    expect(remarkFaultWorkOrder).not.toHaveBeenCalled()
    expect(wrapper.vm.$message.warning).toHaveBeenCalledWith('请填写备注或上传照片')

    wrapper.vm.actionDialog.form.attachments = [{ fileUrl: '/api/web/file/image/WebAnnexFile/a.png', fileName: 'a.png' }]
    wrapper.vm.submitAction()
    await flush()
    expect(remarkFaultWorkOrder).toHaveBeenCalledWith(5, {
      remark: '',
      attachments: [{ fileUrl: '/api/web/file/image/WebAnnexFile/a.png', fileName: 'a.png' }]
    })
  })

  it('close posts attachments; cancel and batch do not support photos', async() => {
    closeFaultWorkOrder.mockResolvedValue({ code: 200 })
    const wrapper = factory()
    await flush()
    wrapper.vm.openFinish({ id: 6, status: 'IN_PROGRESS' }, 'close')
    wrapper.vm.actionDialog.form.remark = '已修复'
    wrapper.vm.actionDialog.form.attachments = [{ fileUrl: '/api/web/file/image/WebAnnexFile/b.png' }]

    wrapper.vm.submitAction()
    await flush()

    expect(closeFaultWorkOrder).toHaveBeenCalledWith(6, { closeRemark: '已修复', attachments: [{ fileUrl: '/api/web/file/image/WebAnnexFile/b.png' }] })
    wrapper.vm.openFinish({ id: 6, status: 'OPEN' }, 'cancel')
    expect(wrapper.vm.supportsAttachments).toBe(false)
    wrapper.vm.handleSelectionChange([{ id: 1, status: 'OPEN' }])
    wrapper.vm.openBatch('close')
    expect(wrapper.vm.supportsAttachments).toBe(false)
  })
})

describe('FaultWorkOrderList attachment uploading', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pageFaultWorkOrders.mockResolvedValue({ code: 200, data: [], count: 0 })
    getFaultWorkOrderStatusCounts.mockResolvedValue({ code: 200, data: {}})
  })

  it('blocks submit while photos are uploading and resets on reopen', async() => {
    remarkFaultWorkOrder.mockResolvedValue({ code: 200 })
    const wrapper = factory()
    await flush()
    wrapper.vm.openRemark({ id: 5, status: 'OPEN' })
    wrapper.vm.actionDialog.form.remark = '已到场'
    wrapper.vm.actionDialog.uploading = true

    wrapper.vm.submitAction()

    expect(remarkFaultWorkOrder).not.toHaveBeenCalled()
    expect(wrapper.vm.$message.warning).toHaveBeenCalledWith('图片上传中，请稍候')
    wrapper.vm.openRemark({ id: 7, status: 'OPEN' })
    expect(wrapper.vm.actionDialog.uploading).toBe(false)
  })

  it('close sends trimmed closeRemark', async() => {
    closeFaultWorkOrder.mockResolvedValue({ code: 200 })
    const wrapper = factory()
    await flush()
    wrapper.vm.openFinish({ id: 6, status: 'IN_PROGRESS' }, 'close')
    wrapper.vm.actionDialog.form.remark = '  已修复  '

    wrapper.vm.submitAction()

    expect(closeFaultWorkOrder).toHaveBeenCalledWith(6, { closeRemark: '已修复', attachments: [] })
  })

  it('cancel sends trimmed closeRemark', async() => {
    cancelFaultWorkOrder.mockResolvedValue({ code: 200 })
    const wrapper = factory()
    await flush()
    wrapper.vm.openFinish({ id: 6, status: 'OPEN' }, 'cancel')
    wrapper.vm.actionDialog.form.remark = '  误报  '

    wrapper.vm.submitAction()

    expect(cancelFaultWorkOrder).toHaveBeenCalledWith(6, { closeRemark: '误报' })
  })

  it('action remark textarea limits input to 500 chars', async() => {
    const wrapper = factory()
    await flush()
    wrapper.vm.openRemark({ id: 5, status: 'OPEN' })
    await wrapper.vm.$nextTick()

    const textarea = wrapper.findAll('el-input-stub').wrappers
      .find(w => w.attributes('placeholder') === wrapper.vm.remarkField.placeholder)
    expect(textarea).toBeTruthy()
    expect(textarea.attributes('maxlength')).toBe('500')
    expect(textarea.attributes('show-word-limit')).toBeDefined()
  })
})

describe('FaultWorkOrderList status counts refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pageFaultWorkOrders.mockResolvedValue({ code: 200, data: [], count: 0 })
    getFaultWorkOrderStatusCounts.mockResolvedValue({ code: 200, data: { ALL: 1 }})
  })

  it('loads counts on init but not on pagination or tab switch', async() => {
    const wrapper = factory()
    await flush()
    expect(getFaultWorkOrderStatusCounts).toHaveBeenCalledTimes(1)

    wrapper.vm.handleCurrentChange(2)
    wrapper.vm.handleSizeChange(20)
    wrapper.vm.activeStatus = 'OPEN'
    wrapper.vm.handleStatusTab()
    await flush()

    expect(pageFaultWorkOrders).toHaveBeenCalledTimes(4)
    expect(getFaultWorkOrderStatusCounts).toHaveBeenCalledTimes(1)
  })

  it('reloads counts on filter, reset and after a successful action', async() => {
    const wrapper = factory()
    await flush()
    getFaultWorkOrderStatusCounts.mockClear()

    wrapper.vm.handleFilter()
    wrapper.vm.handleReset()
    wrapper.vm.afterAction({ code: 200 })
    wrapper.vm.afterAction({ code: 500 })

    expect(getFaultWorkOrderStatusCounts).toHaveBeenCalledTimes(3)
  })

  it('reloads counts after batch completes', async() => {
    batchCancelFaultWorkOrders.mockResolvedValue({ code: 200, data: { successCount: 1, failures: [] }})
    const wrapper = factory()
    await flush()
    getFaultWorkOrderStatusCounts.mockClear()
    wrapper.vm.handleSelectionChange([{ id: 1, status: 'OPEN' }])
    wrapper.vm.openBatch('cancel')
    wrapper.vm.actionDialog.form.remark = '误报'

    wrapper.vm.submitAction()
    await flush()

    expect(getFaultWorkOrderStatusCounts).toHaveBeenCalledTimes(1)
  })

  it('ignores a stale counts response', async() => {
    const wrapper = factory()
    await flush()
    let resolveOld
    getFaultWorkOrderStatusCounts
      .mockReturnValueOnce(new Promise(resolve => { resolveOld = resolve }))
      .mockResolvedValueOnce({ code: 200, data: { ALL: 9 }})

    wrapper.vm.handleFilter()
    wrapper.vm.handleFilter()
    await flush()
    resolveOld({ code: 200, data: { ALL: 2 }})
    await flush()

    expect(wrapper.vm.statusCounts.ALL).toBe(9)
  })
})

describe('FaultWorkOrderList batch payloads', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pageFaultWorkOrders.mockResolvedValue({ code: 200, data: [], count: 0 })
    getFaultWorkOrderStatusCounts.mockResolvedValue({ code: 200, data: {}})
    getAssigneeCandidates.mockResolvedValue({ code: 200, data: [{ adminId: 11 }] })
  })

  it('batch assign sends ids and assigneeUserId', async() => {
    batchAssignFaultWorkOrders.mockResolvedValue({ code: 200, data: { successCount: 2, failures: [] }})
    const wrapper = factory()
    await flush()
    wrapper.vm.handleSelectionChange([{ id: 1, stationId: 100, status: 'OPEN' }, { id: 2, stationId: 100, status: 'OPEN' }])
    wrapper.vm.openBatch('assign')
    await flush()

    wrapper.vm.actionDialog.form.assigneeUserId = '11'
    wrapper.vm.submitAction()
    await flush()

    expect(batchAssignFaultWorkOrders).toHaveBeenCalledWith({ ids: [1, 2], assigneeUserId: '11' })
  })

  it('batch cancel sends ids and trimmed closeRemark', async() => {
    batchCancelFaultWorkOrders.mockResolvedValue({ code: 200, data: { successCount: 2, failures: [] }})
    const wrapper = factory()
    await flush()
    wrapper.vm.handleSelectionChange([{ id: 1, status: 'OPEN' }, { id: 2, status: 'IN_PROGRESS' }])
    wrapper.vm.openBatch('cancel')

    wrapper.vm.actionDialog.form.remark = ' 重复工单 '
    wrapper.vm.submitAction()
    await flush()

    expect(batchCancelFaultWorkOrders).toHaveBeenCalledWith({ ids: [1, 2], closeRemark: '重复工单' })
  })
})

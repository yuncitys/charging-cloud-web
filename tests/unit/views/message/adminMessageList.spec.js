/* eslint-env jest */
import { shallowMount } from '@vue/test-utils'
import AdminMessageList from '@/views/message/adminMessageList.vue'
import { getUnreadMessageCount, pageAdminMessages, readAdminMessage, readAllAdminMessages } from '@/api/message/adminMessage'

jest.mock('@/api/message/adminMessage', () => ({
  getUnreadMessageCount: jest.fn(),
  pageAdminMessages: jest.fn(),
  readAdminMessage: jest.fn(),
  readAllAdminMessages: jest.fn()
}))

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

const factory = () => shallowMount(AdminMessageList, {
  mocks: {
    $router: { push: jest.fn() },
    $message: { success: jest.fn(), error: jest.fn() }
  },
  directives: { loading: {}},
  stubs: {
    'el-tabs': true,
    'el-tab-pane': true,
    'el-button': true,
    'el-table': true,
    'el-table-column': true,
    'el-tag': true,
    'el-pagination': true
  }
})

const lastParams = () => pageAdminMessages.mock.calls[pageAdminMessages.mock.calls.length - 1][0]

describe('AdminMessageList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getUnreadMessageCount.mockResolvedValue({ code: 200, data: 0 })
    pageAdminMessages.mockResolvedValue({
      code: 200,
      data: [{ id: 1, title: '新故障工单', readFlag: 0, bizType: 'FAULT_WORK_ORDER', bizId: 9 }],
      count: 23
    })
    readAdminMessage.mockResolvedValue({ code: 200 })
    readAllAdminMessages.mockResolvedValue({ code: 200 })
  })

  it('loads all messages on create and uses count as total', async() => {
    const wrapper = factory()
    await flush()

    expect(lastParams()).toEqual({ page: 1, limit: 10 })
    expect(wrapper.vm.list.length).toBe(1)
    expect(wrapper.vm.total).toBe(23)
  })

  it('sends readFlag per tab and resets to first page', async() => {
    const wrapper = factory()
    await flush()
    wrapper.vm.handleCurrentChange(3)
    expect(lastParams()).toEqual({ page: 3, limit: 10 })

    wrapper.vm.activeTab = 'unread'
    wrapper.vm.handleTab()
    expect(lastParams()).toEqual({ page: 1, limit: 10, readFlag: 0 })

    wrapper.vm.activeTab = 'read'
    wrapper.vm.handleTab()
    expect(lastParams()).toEqual({ page: 1, limit: 10, readFlag: 1 })

    wrapper.vm.handleSizeChange(50)
    expect(lastParams()).toEqual({ page: 1, limit: 50, readFlag: 1 })
  })

  it('view marks unread message read, notifies and navigates', async() => {
    const wrapper = factory()
    await flush()
    const changed = jest.fn()
    wrapper.vm.$root.$on('admin-message:changed', changed)

    wrapper.vm.viewMessage(wrapper.vm.list[0])
    await flush()

    expect(readAdminMessage).toHaveBeenCalledWith(1)
    expect(wrapper.vm.list[0].readFlag).toBe(1)
    expect(changed).toHaveBeenCalled()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ path: '/device/faultWorkOrders', query: { id: 9 }})
  })

  it('reloads when re-activated by keep-alive but not on first activation', async() => {
    const wrapper = factory()
    await flush()
    expect(pageAdminMessages).toHaveBeenCalledTimes(1)

    wrapper.vm.$options.activated.forEach(fn => fn.call(wrapper.vm))
    expect(pageAdminMessages).toHaveBeenCalledTimes(1)
    wrapper.vm.$options.activated.forEach(fn => fn.call(wrapper.vm))
    expect(pageAdminMessages).toHaveBeenCalledTimes(2)
  })

  it('reloads on admin-message:changed until destroyed', async() => {
    const wrapper = factory()
    await flush()
    const root = wrapper.vm.$root
    pageAdminMessages.mockClear()

    root.$emit('admin-message:changed')
    expect(pageAdminMessages).toHaveBeenCalledTimes(1)

    wrapper.destroy()
    root.$emit('admin-message:changed')
    expect(pageAdminMessages).toHaveBeenCalledTimes(1)
  })

  it('view keeps row unread when read fails but still navigates', async() => {
    readAdminMessage.mockResolvedValue({ code: 500, msg: '失败' })
    const wrapper = factory()
    await flush()
    const changed = jest.fn()
    wrapper.vm.$root.$on('admin-message:changed', changed)

    wrapper.vm.viewMessage(wrapper.vm.list[0])
    await flush()

    expect(wrapper.vm.list[0].readFlag).toBe(0)
    expect(changed).not.toHaveBeenCalled()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ path: '/device/faultWorkOrders', query: { id: 9 }})
  })

  it('view without a linked page reloads the list', async() => {
    const wrapper = factory()
    await flush()
    pageAdminMessages.mockClear()

    wrapper.vm.viewMessage({ id: 3, readFlag: 0, bizType: 'OTHER' })
    await flush()

    expect(readAdminMessage).toHaveBeenCalledWith(3)
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled()
    expect(pageAdminMessages).toHaveBeenCalledTimes(1)
  })

  it('mark read ignores double clicks while in flight', async() => {
    let resolveRead
    readAdminMessage.mockReturnValue(new Promise(resolve => { resolveRead = resolve }))
    const wrapper = factory()
    await flush()
    const row = wrapper.vm.list[0]

    wrapper.vm.markRead(row)
    wrapper.vm.markRead(row)
    expect(readAdminMessage).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.isReading(row)).toBe(true)

    resolveRead({ code: 200 })
    await flush()
    expect(wrapper.vm.isReading(row)).toBe(false)
  })

  it('view of a read message only navigates', async() => {
    const wrapper = factory()
    await flush()

    wrapper.vm.viewMessage({ id: 2, readFlag: 1, bizType: 'FAULT_WORK_ORDER', bizId: 5 })

    expect(readAdminMessage).not.toHaveBeenCalled()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ path: '/device/faultWorkOrders', query: { id: 5 }})
  })

  it('mark read reloads list and notifies', async() => {
    const wrapper = factory()
    await flush()
    const changed = jest.fn()
    wrapper.vm.$root.$on('admin-message:changed', changed)
    pageAdminMessages.mockClear()

    wrapper.vm.markRead(wrapper.vm.list[0])
    await flush()

    expect(readAdminMessage).toHaveBeenCalledWith(1)
    expect(changed).toHaveBeenCalled()
    expect(pageAdminMessages).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled()
  })

  it('read all reloads list and notifies', async() => {
    const wrapper = factory()
    await flush()
    const changed = jest.fn()
    wrapper.vm.$root.$on('admin-message:changed', changed)
    pageAdminMessages.mockClear()

    wrapper.vm.readAll()
    await flush()

    expect(readAllAdminMessages).toHaveBeenCalled()
    expect(wrapper.vm.$message.success).toHaveBeenCalled()
    expect(changed).toHaveBeenCalled()
    expect(pageAdminMessages).toHaveBeenCalledTimes(1)
  })
})

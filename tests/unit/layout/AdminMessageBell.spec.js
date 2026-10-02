/* eslint-env jest */
import { shallowMount } from '@vue/test-utils'
import AdminMessageBell from '@/layout/components/topSidebar/AdminMessageBell.vue'
import { getUnreadMessageCount, pageAdminMessages, readAdminMessage, readAllAdminMessages } from '@/api/message/adminMessage'

jest.mock('@/api/message/adminMessage', () => ({
  getUnreadMessageCount: jest.fn(),
  pageAdminMessages: jest.fn(),
  readAdminMessage: jest.fn(),
  readAllAdminMessages: jest.fn()
}))

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

const factory = () => shallowMount(AdminMessageBell, {
  mocks: { $router: { push: jest.fn() }},
  directives: { loading: {}},
  stubs: { 'el-popover': true, 'el-badge': true, 'el-button': true }
})

describe('AdminMessageBell', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getUnreadMessageCount.mockResolvedValue({ code: 200, data: 3 })
    pageAdminMessages.mockResolvedValue({ code: 200, data: [{ id: 1, readFlag: 0, bizType: 'FAULT_WORK_ORDER', bizId: 9 }] })
    readAdminMessage.mockResolvedValue({ code: 200 })
    readAllAdminMessages.mockResolvedValue({ code: 200 })
  })

  it('loads unread count on mount', async() => {
    const wrapper = factory()
    await flush()
    expect(wrapper.vm.unreadCount).toBe(3)
    wrapper.destroy()
  })

  it('opening a fault message marks read and navigates to the order', async() => {
    const wrapper = factory()
    await flush()
    await wrapper.vm.loadList()
    await flush()

    wrapper.vm.openMessage(wrapper.vm.list[0])
    await flush()

    expect(readAdminMessage).toHaveBeenCalledWith(1)
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ path: '/device/faultWorkOrders', query: { id: 9 }})
    expect(wrapper.vm.visible).toBe(false)
    wrapper.destroy()
  })

  it('read all clears unread', async() => {
    const wrapper = factory()
    await flush()
    getUnreadMessageCount.mockResolvedValue({ code: 200, data: 0 })

    wrapper.vm.readAll()
    await flush()

    expect(readAllAdminMessages).toHaveBeenCalled()
    expect(wrapper.vm.unreadCount).toBe(0)
    wrapper.destroy()
  })

  it('skips polling while page hidden', async() => {
    const wrapper = factory()
    await flush()
    getUnreadMessageCount.mockClear()
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })

    wrapper.vm.refreshCount()

    expect(getUnreadMessageCount).not.toHaveBeenCalled()
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
    wrapper.destroy()
  })
})

/* eslint-env jest */
import { shallowMount } from '@vue/test-utils'
import DownloadProgress from '@/components/Common/downloadProgress.vue'
import { getTask } from '@/api/task/task.js'

jest.mock('@/api/task/task.js', () => ({ getTask: jest.fn() }))

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('downloadProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('stops polling and reports when the task failed', async() => {
    getTask.mockResolvedValue({ code: 200, data: { status: 2, percentage: 0, result: '' }})
    const error = jest.fn()
    const wrapper = shallowMount(DownloadProgress, {
      mocks: { $message: { error }, Global: { APIURl: '' }},
      stubs: { 'el-dialog': true, 'el-progress': true }
    })
    wrapper.vm.showDialog = true
    wrapper.vm.setInt = setInterval(() => {}, 100000)

    wrapper.vm.getTask(1)
    await flush()

    expect(error).toHaveBeenCalledWith('文件生成失败，请稍后重试')
    expect(wrapper.vm.showDialog).toBe(false)
  })

  it('ignores in-flight responses that arrive after the dialog closed', async() => {
    getTask.mockResolvedValue({ code: 200, data: { status: 2, percentage: 0, result: '' }})
    const error = jest.fn()
    const wrapper = shallowMount(DownloadProgress, {
      mocks: { $message: { error }, Global: { APIURl: '' }},
      stubs: { 'el-dialog': true, 'el-progress': true }
    })
    wrapper.vm.showDialog = true
    wrapper.vm.setInt = setInterval(() => {}, 100000)

    wrapper.vm.getTask(1)
    wrapper.vm.getTask(1)
    await flush()

    expect(error).toHaveBeenCalledTimes(1)
  })

  it('does not download when a finished response arrives after close', async() => {
    jest.useFakeTimers()
    getTask.mockResolvedValue({ code: 200, data: { status: 1, percentage: 100, result: '/file.xlsx' }})
    const wrapper = shallowMount(DownloadProgress, {
      mocks: { $message: { error: jest.fn() }, Global: { APIURl: '' }},
      stubs: { 'el-dialog': true, 'el-progress': true }
    })
    const appendChild = jest.spyOn(document.body, 'appendChild')
    wrapper.vm.showDialog = false

    wrapper.vm.getTask(1)
    await Promise.resolve()
    await Promise.resolve()
    jest.runAllTimers()

    expect(wrapper.vm.percentage).toBe(0)
    expect(appendChild).not.toHaveBeenCalled()
    appendChild.mockRestore()
    jest.useRealTimers()
  })
})

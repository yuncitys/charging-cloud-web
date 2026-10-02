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
})

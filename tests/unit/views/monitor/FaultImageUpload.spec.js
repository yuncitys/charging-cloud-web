/* eslint-env jest */
import { shallowMount } from '@vue/test-utils'
import FaultImageUpload from '@/views/monitor/components/FaultImageUpload.vue'
import { upload } from '@/api/upload/file'

jest.mock('@/api/upload/file', () => ({ upload: jest.fn() }))

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

const factory = (value = []) => shallowMount(FaultImageUpload, {
  propsData: { value },
  mocks: { $message: { error: jest.fn(), warning: jest.fn() }, Global: { APIURl: 'http://gw' }},
  stubs: { 'el-upload': true }
})

describe('FaultImageUpload', () => {
  beforeEach(() => jest.clearAllMocks())

  it('rejects non-image and oversized files', () => {
    const wrapper = factory()
    expect(wrapper.vm.beforeUpload({ name: 'a.pdf', size: 10 })).toBe(false)
    expect(wrapper.vm.beforeUpload({ name: 'a.png', size: 11 * 1024 * 1024 })).toBe(false)
    expect(wrapper.vm.beforeUpload({ name: 'a.JPG', size: 1024 })).toBe(true)
  })

  it('uploads as WebAnnexFile and emits appended list', async() => {
    upload.mockResolvedValue({ code: 200, data: { url: '/api/web/file/image/WebAnnexFile/x.png' }})
    const wrapper = factory([{ fileUrl: '/api/web/file/image/WebAnnexFile/old.png', fileName: 'old.png' }])

    await wrapper.vm.doUpload({ file: { name: 'x.png' }})
    await flush()

    expect(upload.mock.calls[0][0]).toBe('WebAnnexFile')
    expect(wrapper.emitted().input[0][0]).toEqual([
      { fileUrl: '/api/web/file/image/WebAnnexFile/old.png', fileName: 'old.png' },
      { fileUrl: '/api/web/file/image/WebAnnexFile/x.png', fileName: 'x.png' }
    ])
  })

  it('removes by fileUrl and builds preview urls', () => {
    const wrapper = factory([{ fileUrl: '/api/web/file/image/WebAnnexFile/a.png' }])
    expect(wrapper.vm.fileList[0].url).toBe('http://gw/api/web/file/image/WebAnnexFile/a.png')

    wrapper.vm.handleRemove({ fileUrl: '/api/web/file/image/WebAnnexFile/a.png' })

    expect(wrapper.emitted().input[0][0]).toEqual([])
  })
})

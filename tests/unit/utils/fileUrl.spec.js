/* eslint-env jest */
import { fullFileUrl } from '@/utils/fileUrl'

jest.mock('@/utils/global_variable', () => ({
  __esModule: true,
  default: { APIURl: 'http://gw' }
}))

describe('fullFileUrl', () => {
  it('prefixes relative paths with the gateway url', () => {
    expect(fullFileUrl('/api/web/file/image/WebAnnexFile/a.png')).toBe('http://gw/api/web/file/image/WebAnnexFile/a.png')
  })

  it('leaves absolute http(s) urls untouched', () => {
    expect(fullFileUrl('http://cdn/a.png')).toBe('http://cdn/a.png')
    expect(fullFileUrl('HTTPS://cdn/a.png')).toBe('HTTPS://cdn/a.png')
  })

  it('returns empty string for empty values', () => {
    expect(fullFileUrl('')).toBe('')
    expect(fullFileUrl(null)).toBe('')
    expect(fullFileUrl(undefined)).toBe('')
  })
})

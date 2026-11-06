import request from '@/utils/request'

// 展示位，接口契约见 spec 4.2
const BASE = '/api/web/contentPlacement'

/** 展示位列表 */
export function list(params) {
  return request({ url: `${BASE}/list`, method: 'get', params })
}

/** 新增/编辑展示位 */
export function save(data) {
  return request({ url: `${BASE}/save`, method: 'post', data })
}

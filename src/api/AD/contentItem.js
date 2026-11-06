import request from '@/utils/request'
import qs from 'qs'

// 运营内容项（替代 t_image_carousel），接口契约见后端 spec 4.2
// 后端 /contentItem/save 为表单绑定，status/delete/fromActivity 为 form 参数，
// 因此统一以 x-www-form-urlencoded 提交。
const BASE = '/api/web/contentItem'

const formHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' }

/** 把数组字段按 key=a&key=b 的多值形式编码（placementCodes 需要） */
function encodeForm(data) {
  return qs.stringify(data, { arrayFormat: 'repeat' })
}

/**
 * 分页查询。后端 mapper 只读取 params.* 下的筛选条件，
 * 因此 placementCode / itemStatus / itemTitle 需要包在 params 下。
 * effectiveStatus 不是后端筛选项，已在列表层做展示映射，这里不传。
 */
export function page(query = {}) {
  const { page: pageNum, limit, placementCode, itemStatus, itemTitle } = query
  const params = { page: pageNum, limit }
  if (placementCode) params['params[placementCode]'] = placementCode
  if (itemStatus !== undefined && itemStatus !== '' && itemStatus !== null) {
    params['params[itemStatus]'] = itemStatus
  }
  if (itemTitle) params['params[itemTitle]'] = itemTitle
  return request({ url: `${BASE}/page`, method: 'get', params })
}

/** 新增/编辑内容（含 link 与活动校验），表单提交，placementCodes 为多值 */
export function save(data) {
  return request({ url: `${BASE}/save`, method: 'post', headers: formHeaders, data: encodeForm(data) })
}

/** 上线/下线：{ id, itemStatus: 1|0 }，后端以 form 参数读取 */
export function status(data) {
  return request({ url: `${BASE}/status`, method: 'post', headers: formHeaders, data: encodeForm(data) })
}

/** 逻辑删除：{ id } */
export function remove(data) {
  return request({ url: `${BASE}/delete`, method: 'post', headers: formHeaders, data: encodeForm(data) })
}

/** 搜索可绑定的营销活动；type 为 2/4/7/8，不传则四类全部 */
export function activityOptions(params) {
  return request({ url: `${BASE}/activityOptions`, method: 'get', params })
}

/** 从活动生成推广内容：{ activityId, placementCode, mediaUrl? } */
export function fromActivity(data) {
  return request({ url: `${BASE}/fromActivity`, method: 'post', headers: formHeaders, data: encodeForm(data) })
}

/** 预览用户侧效果：{ id } */
export function preview(params) {
  return request({ url: `${BASE}/preview`, method: 'get', params })
}

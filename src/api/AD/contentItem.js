import request from '@/utils/request'

// 运营内容项（替代 t_image_carousel），接口契约见 spec 4.2
const BASE = '/api/web/contentItem'

/** 分页查询：placementCode / itemStatus / effectiveStatus / page / limit */
export function page(params) {
  return request({ url: `${BASE}/page`, method: 'get', params })
}

/** 新增/编辑内容（含 link 与活动校验） */
export function save(data) {
  return request({ url: `${BASE}/save`, method: 'post', data })
}

/** 上线/下线：{ id, itemStatus: 1|0 } */
export function status(data) {
  return request({ url: `${BASE}/status`, method: 'post', data })
}

/** 逻辑删除：{ id } */
export function remove(data) {
  return request({ url: `${BASE}/delete`, method: 'post', data })
}

/** 搜索可绑定的营销活动；type 为 2/4/7/8，不传则四类全部 */
export function activityOptions(params) {
  return request({ url: `${BASE}/activityOptions`, method: 'get', params })
}

/** 从活动生成推广内容：{ activityId, placementCode, mediaUrl? } */
export function fromActivity(data) {
  return request({ url: `${BASE}/fromActivity`, method: 'post', data })
}

/** 预览用户侧效果：{ id } */
export function preview(params) {
  return request({ url: `${BASE}/preview`, method: 'get', params })
}

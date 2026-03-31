import request from '@/utils/request'

// 地区选择器查询
export function getAreaSelector(id) {
  return request({
    url: `/api/permission/area/${id}/Selector`,
    method: 'get'
  })
}

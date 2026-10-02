import request from '@/utils/request'

export function getUnreadMessageCount() {
  return request({
    url: '/api/web/admin-messages/unread-count',
    method: 'get'
  })
}

export function pageAdminMessages(params) {
  return request({
    url: '/api/web/admin-messages',
    method: 'get',
    params
  })
}

export function readAdminMessage(id) {
  return request({
    url: `/api/web/admin-messages/${id}/read`,
    method: 'post'
  })
}

export function readAllAdminMessages() {
  return request({
    url: '/api/web/admin-messages/read-all',
    method: 'post'
  })
}

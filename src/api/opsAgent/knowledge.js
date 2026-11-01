import request from '@/utils/request'
import { agentPath } from './paths'

export function listKnowledge(params) {
  return request({
    url: agentPath('/knowledge'),
    method: 'get',
    params: params || {}
  })
}

export function getKnowledge(id) {
  return request({
    url: agentPath(`/knowledge/${encodeURIComponent(id)}`),
    method: 'get'
  })
}

export function createKnowledge(data) {
  return request({
    url: agentPath('/knowledge'),
    method: 'post',
    data: data || {}
  })
}

export function updateKnowledge(id, data) {
  return request({
    url: agentPath(`/knowledge/${encodeURIComponent(id)}`),
    method: 'put',
    data: data || {}
  })
}

export function enableKnowledge(id, enabled) {
  return request({
    url: agentPath(`/knowledge/${encodeURIComponent(id)}/enable`),
    method: 'put',
    data: { enabled: !!enabled }
  })
}

export function deleteKnowledge(id) {
  return request({
    url: agentPath(`/knowledge/${encodeURIComponent(id)}`),
    method: 'delete'
  })
}

import request from '@/utils/request'

export function getStationMonitorSummary(stationId) {
  return request({
    url: `/api/web/monitor/stations/${stationId}/summary`,
    method: 'get'
  })
}

export function getStationMonitorPiles(stationId, params) {
  return request({
    url: `/api/web/monitor/stations/${stationId}/piles`,
    method: 'get',
    params
  })
}

export function getGunStatusEvents(deviceCode, connector, params) {
  return request({
    url: `/api/web/monitor/guns/${deviceCode}/${connector}/status-events`,
    method: 'get',
    params
  })
}

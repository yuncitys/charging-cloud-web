import request from '@/utils/request'

export function getStationMapPoints(params) {
  return request({
    url: '/api/web/monitor/station-map',
    method: 'get',
    params
  })
}

export function getStationMapCities(params) {
  return request({
    url: '/api/web/monitor/station-map/cities',
    method: 'get',
    params
  })
}

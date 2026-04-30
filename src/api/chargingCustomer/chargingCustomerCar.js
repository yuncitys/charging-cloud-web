import request from '@/utils/request'

export function getChargingCustomerCarPage(data) {
  return request({
    url: '/api/web/chargingCustomer/car/page',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
      function(data) {
        let ret = ''
        for (const it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret.substring(0, ret.lastIndexOf('&'))
      }
    ],
    data
  })
}

export function addChargingCustomerCar(data) {
  return request({
    url: '/api/web/chargingCustomer/car/add',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

export function updateChargingCustomerCar(data) {
  return request({
    url: '/api/web/chargingCustomer/car/update',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

export function batchDeleteChargingCustomerCar(data) {
  return request({
    url: '/api/web/chargingCustomer/car/batchDelete',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

export function downloadChargingCustomerCar(data) {
  return request({
    url: '/api/web/chargingCustomer/car/download',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
      function(data) {
        let ret = ''
        for (const it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret.substring(0, ret.lastIndexOf('&'))
      }
    ],
    data
  })
}

// 上传导入文件
export function uploadCarFile(data) {
  return request({
    url: '/api/web/chargingCustomer/car/Upload',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

// 导入预览
export function previewCarImport(fileName) {
  return request({
    url: '/api/web/chargingCustomer/car/ImportPreview',
    method: 'get',
    params: { fileName }
  })
}

// 导入数据
export function submitCarImport(data) {
  return request({
    url: '/api/web/chargingCustomer/car/ImportData',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

// 下载导入模板
export function downloadCarTemplate() {
  return request({
    url: '/api/web/chargingCustomer/car/template',
    method: 'get',
    responseType: 'blob'
  })
}

// 根据机构ID获取车辆列表
export function getCarListByOrgId(belongToId) {
  return request({
    url: '/api/web/chargingCustomer/car/listByOrgId',
    method: 'get',
    params: { belongToId }
  })
}

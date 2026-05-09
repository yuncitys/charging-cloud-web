import request from '@/utils/request'

// 客户司机分页列表
export function getDriverPage(data) {
  return request({
    url: '/api/web/chargingCustomer/driver/page',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

export function getDriverFinanceWallet(userId) {
  return request({
    url: `/api/web/chargingCustomer/driver/finance/wallet/${userId}`,
    method: 'get'
  })
}

export function getDriverFinanceFlowPage(data) {
  return request({
    url: '/api/web/chargingCustomer/driver/finance/flow/page',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

export function downloadDriverFinanceFlow(data) {
  return request({
    url: '/api/web/chargingCustomer/driver/finance/flow/download',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

// 保存客户司机（新增/修改）
export function saveDriver(data) {
  return request({
    url: '/api/web/chargingCustomer/driver/save',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

// 更新客户司机状态
export function updateDriverStatus(params) {
  return request({
    url: '/api/web/chargingCustomer/driver/updateStatus',
    method: 'post',
    params
  })
}

// 批量保存客户司机
export function batchSaveDriver(data) {
  return request({
    url: '/api/web/chargingCustomer/driver/batchSave',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

// 删除客户司机
export function deleteDriver(id) {
  return request({
    url: `/api/web/chargingCustomer/driver/delete/${id}`,
    method: 'delete'
  })
}

// 上传导入文件
export function uploadDriverFile(data) {
  return request({
    url: '/api/web/chargingCustomer/driver/Upload',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

// 导入预览
export function previewDriverImport(fileName) {
  return request({
    url: '/api/web/chargingCustomer/driver/ImportPreview',
    method: 'get',
    params: { fileName }
  })
}

// 导入数据
export function submitDriverImport(data) {
  return request({
    url: '/api/web/chargingCustomer/driver/ImportData',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

// 下载导入模板
export function downloadDriverTemplate() {
  return request({
    url: '/api/web/chargingCustomer/driver/template',
    method: 'get',
    responseType: 'blob'
  })
}

import request from '@/utils/request'

export function periodPage(data) {
  return request({
    url: '/api/web/settlementLedger/period/page',
    method: 'post',
    data
  })
}

export function periodDetail(periodId) {
  return request({
    url: `/api/web/settlementLedger/period/${periodId}`,
    method: 'get'
  })
}

export function linePage(data) {
  return request({
    url: '/api/web/settlementLedger/period/lines',
    method: 'post',
    data
  })
}

/** 单条台账行预分账重算（不改正向台账金额） */
export function recalcLineSplitPlan(ledgerLineId) {
  return request({
    url: `/api/web/settlementLedger/line/${ledgerLineId}/recalcSplit`,
    method: 'post'
  })
}

export function exportLinePage(data) {
  return request({
    url: '/api/web/settlementLedger/period/lines/export',
    method: 'post',
    data
  })
}

export function submitPayout(data) {
  return request({
    url: '/api/web/settlementLedger/submitPayout',
    method: 'post',
    data
  })
}

/** 账期下分账执行批次列表 */
export function payoutBatchList(periodId) {
  return request({
    url: '/api/web/settlementLedger/payout/batch/list',
    method: 'get',
    params: { periodId }
  })
}

/** 分账批次详情 */
export function payoutBatchDetail(batchId) {
  return request({
    url: `/api/web/settlementLedger/payout/batch/${batchId}`,
    method: 'get'
  })
}

/** 分账批次明细分页；itemStatus 可选 SUCCESS / SKIPPED / FAILED */
export function payoutBatchItems(batchId, params) {
  return request({
    url: `/api/web/settlementLedger/payout/batch/${batchId}/items`,
    method: 'get',
    params
  })
}

/** 单笔失败订单重试分账（不整账期重跑） */
export function retryPayoutSingleOrder(periodId, orderCode) {
  return request({
    url: '/api/web/settlementLedger/payout/order/retry',
    method: 'post',
    params: { periodId, orderCode }
  })
}

export function ingestTaskStats() {
  return request({
    url: '/api/web/settlementLedger/ingestTask/stats',
    method: 'get'
  })
}

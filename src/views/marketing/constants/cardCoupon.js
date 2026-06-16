/** 卡券相关枚举与文案 */
export const DEDUCTION_TYPE = {
  '1': '电费',
  '2': '服务费',
  '3': '总费用'
}

export const CARD_COUPON_TYPE = {
  '1': '抵用卡',
  '2': '优惠券'
}

export const USE_TYPE = {
  '1': '普通',
  '2': '会员'
}

export const EFFECTIVE_TIME_TYPE = {
  '1': '相对时间',
  '2': '绝对时间'
}

export const SCOPE_TYPE = {
  '1': '按城市选择',
  '2': '按商户选择',
  '3': '按电站分组',
  '4': '全部电站',
  '5': '按电站'
}

export const UNDERTAKER_TYPE = {
  '1': '平台',
  '2': '商户'
}

export function getDeductionTypeLabel(type) {
  if (!type) return '—'
  return DEDUCTION_TYPE[String(type)] || type
}

export function getScopeTypeLabel(type) {
  if (!type) return '—'
  return SCOPE_TYPE[String(type)] || type
}

export const USER_COUPON_STATUS = [
  { value: '0', label: '未使用', tagType: 'info' },
  { value: '1', label: '使用中', tagType: 'warning' },
  { value: '2', label: '已使用', tagType: 'success' },
  { value: '3', label: '已过期', tagType: 'info' },
  { value: '4', label: '已作废', tagType: 'danger' }
]

export function getUserCouponStatusLabel(status) {
  const item = USER_COUPON_STATUS.find(s => s.value === String(status))
  return item ? item.label : status
}

export function getUserCouponStatusTagType(status) {
  const item = USER_COUPON_STATUS.find(s => s.value === String(status))
  return item ? item.tagType : 'info'
}

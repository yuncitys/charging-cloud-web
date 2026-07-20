/** 卡券相关枚举与文案 */
export const DEDUCTION_TYPE = {
  '1': '电费',
  '2': '服务费',
  '3': '总费用'
}

export const CARD_COUPON_TYPE = {
  '1': '抵用卡',
  '2': '满减券',
  '3': '电量卡',
  '4': '折扣券'
}

export const USE_TYPE = {
  '1': '普通',
  '2': '会员'
}

/** 是否优惠共享（1:共享，0:互斥） */
export const DISCOUNT_SHARE_FLAG = {
  '1': '该卡券优惠与折扣活动优惠共享',
  '0': '该卡券优惠与折扣活动优惠不共享（互斥券）'
}

export function getDiscountShareFlagLabel(flag) {
  if (flag == null || flag === '') return '—'
  return DISCOUNT_SHARE_FLAG[String(flag)] || flag
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

/** 抵用卡/电量卡/折扣券使用门槛 */
export const USE_THRESHOLD_TYPE = {
  '0': '无门槛',
  '1': '满元',
  '2': '满度'
}

/** 抵用卡/电量卡/折扣券使用限额类型 */
export const USE_LIMIT_TYPE = {
  '1': '每日限额',
  '2': '每笔限额'
}

export function getCardCouponTypeLabel(type) {
  if (!type) return '—'
  return CARD_COUPON_TYPE[String(type)] || type
}

/** 面额按金额/度数计量的卡券（抵用卡、电量卡） */
export function isQuotaCardType(type) {
  return ['1', '3'].includes(String(type))
}

export function isDiscountCardType(type) {
  return String(type) === '4'
}

export function isFullReductionType(type) {
  return String(type) === '2'
}

/** 含使用门槛与使用限额的卡券（抵用卡、电量卡、折扣券） */
export function isThresholdLimitCardType(type) {
  return ['1', '3', '4'].includes(String(type))
}

export function getFaceValueUnit(type) {
  const t = String(type)
  if (t === '3') return '度'
  if (t === '4') return '%'
  return '元'
}

export function getDeductionTypeLabel(type) {
  if (!type) return '—'
  return DEDUCTION_TYPE[String(type)] || type
}

export function getScopeTypeLabel(type) {
  if (!type) return '—'
  return SCOPE_TYPE[String(type)] || type
}

export function getUseThresholdTypeLabel(type) {
  if (type == null || type === '') return '—'
  return USE_THRESHOLD_TYPE[String(type)] || type
}

export function formatFaceValue(coupon) {
  if (!coupon) return '—'
  const value = coupon.faceValue
  if (value == null || value === '') return '—'
  const unit = getFaceValueUnit(coupon.cardCouponType)
  return `${value} ${unit}`
}

export function formatUseThreshold(coupon) {
  if (!coupon || !isThresholdLimitCardType(coupon.cardCouponType)) return '—'
  const type = String(coupon.useThresholdType || '0')
  if (type === '0') return '无门槛'
  const value = coupon.useThresholdValue
  if (value == null || value === '') return '—'
  return type === '2' ? `满 ${value} 度` : `满 ${value} 元`
}

export function formatUsageLimit(coupon) {
  if (!coupon || !isThresholdLimitCardType(coupon.cardCouponType)) return '—'
  if (isDiscountCardType(coupon.cardCouponType)) return '—'
  const limitType = String(coupon.useLimitType || '')
  const cardType = String(coupon.cardCouponType)
  const isPowerCard = cardType === '3'
  if (limitType === '1') {
    const value = coupon.dailyLimitValue
    if (value == null || value === '') return '—'
    return isPowerCard ? `每日 ${value} 度` : `每日 ${value} 元`
  }
  if (limitType === '2') {
    const value = coupon.orderLimitValue
    if (value == null || value === '') return '—'
    return isPowerCard ? `每笔 ${value} 度` : `每笔 ${value}%`
  }
  return '—'
}

export function formatDiscountCap(coupon) {
  if (!coupon || !isDiscountCardType(coupon.cardCouponType)) return '—'
  const value = coupon.amountLimit
  if (value == null || value === '') return '—'
  return `${value} 元`
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

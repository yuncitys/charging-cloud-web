/** 卡券相关枚举与文案（标签来自字典 Selector） */
import { formatDictLabel, getSelectorOptions } from '@/utils/dictionary'

export const DICT_CARD_COUPON_TYPE = 'marketing_card_coupon_type'
export const DICT_DEDUCTION_TYPE = 'marketing_deduction_type'
export const DICT_COUPON_SCOPE_TYPE = 'marketing_coupon_scope_type'
export const DICT_USE_THRESHOLD_TYPE = 'marketing_use_threshold_type'
export const DICT_USE_LIMIT_TYPE = 'marketing_use_limit_type'
export const DICT_USER_COUPON_STATUS = 'marketing_user_coupon_status'
export const DICT_CARD_COUPON_STATUS = 'marketing_card_coupon_status'
export const DICT_EFFECTIVE_TIME_TYPE = 'marketing_effective_time_type'
export const DICT_USE_TYPE = 'marketing_use_type'
export const DICT_DISCOUNT_SHARE_FLAG = 'marketing_discount_share_flag'

/** Element Tag 类型（非字典） */
export const USER_COUPON_STATUS_TAG = {
  '0': 'info',
  '1': 'warning',
  '2': 'success',
  '3': 'info',
  '4': 'danger'
}

export function loadCardCouponTypeOptions() {
  return getSelectorOptions(DICT_CARD_COUPON_TYPE)
}

export function loadDeductionTypeOptions() {
  return getSelectorOptions(DICT_DEDUCTION_TYPE)
}

export function loadCouponScopeTypeOptions() {
  return getSelectorOptions(DICT_COUPON_SCOPE_TYPE)
}

export function loadUseThresholdTypeOptions() {
  return getSelectorOptions(DICT_USE_THRESHOLD_TYPE)
}

export function loadUseLimitTypeOptions() {
  return getSelectorOptions(DICT_USE_LIMIT_TYPE)
}

export function loadCardCouponStatusOptions() {
  return getSelectorOptions(DICT_CARD_COUPON_STATUS)
}

export function loadDiscountShareFlagOptions() {
  return getSelectorOptions(DICT_DISCOUNT_SHARE_FLAG)
}

export function loadUserCouponStatusOptions() {
  return getSelectorOptions(DICT_USER_COUPON_STATUS).then(list =>
    (list || []).map(item => ({
      ...item,
      tagType: USER_COUPON_STATUS_TAG[String(item.value)] || 'info'
    }))
  )
}

export function getDiscountShareFlagLabel(flag) {
  if (flag == null || flag === '') return '—'
  const label = formatDictLabel(DICT_DISCOUNT_SHARE_FLAG, flag)
  return label === String(flag) ? String(flag) : label
}

export function getCardCouponTypeLabel(type) {
  if (!type) return '—'
  const label = formatDictLabel(DICT_CARD_COUPON_TYPE, type)
  return label === String(type) ? String(type) : label
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
  const label = formatDictLabel(DICT_DEDUCTION_TYPE, type)
  return label === String(type) ? String(type) : label
}

export function getScopeTypeLabel(type) {
  if (!type) return '—'
  const label = formatDictLabel(DICT_COUPON_SCOPE_TYPE, type)
  return label === String(type) ? String(type) : label
}

export function getUseThresholdTypeLabel(type) {
  if (type == null || type === '') return '—'
  const label = formatDictLabel(DICT_USE_THRESHOLD_TYPE, type)
  return label === String(type) ? String(type) : label
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
  if (type === '0') return getUseThresholdTypeLabel('0')
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

export function getUseTypeLabel(type) {
  if (type == null || type === '') return ''
  const label = formatDictLabel(DICT_USE_TYPE, type)
  return label === String(type) ? String(type) : label
}

export function getEffectiveTimeTypeLabel(type) {
  if (type == null || type === '') return ''
  const label = formatDictLabel(DICT_EFFECTIVE_TIME_TYPE, type)
  return label === String(type) ? String(type) : label
}

export function getUserCouponStatusLabel(status) {
  if (status == null || status === '') return status
  const label = formatDictLabel(DICT_USER_COUPON_STATUS, status)
  return label === String(status) ? String(status) : label
}

export function getUserCouponStatusTagType(status) {
  return USER_COUPON_STATUS_TAG[String(status)] || 'info'
}

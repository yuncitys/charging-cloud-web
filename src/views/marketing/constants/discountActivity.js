export const DISCOUNT_TYPE = {
  '1': '电费',
  '2': '服务费'
}

export const RATE_TYPE = {
  '1': '固定价',
  '2': '折扣'
}

export const RATE_SETTING_TYPE = {
  '1': '统一',
  '2': '尖峰平谷'
}

export const DISCOUNT_VALUE_MODE = {
  '1': '设置同一优惠',
  '2': '根据不同电站区分优惠值'
}

export const STATION_SCOPE_TYPE = {
  '1': '选择电站',
  '2': '批量添加'
}

export const USER_SCOPE_TYPE = {
  '1': '用户分组',
  '2': '选择客户'
}

export const PARTICIPANT_TYPE = {
  '1': '用户分组',
  '2': '客户'
}

export function userScopesToParticipants(userScopes, userScopeType) {
  const participantType = String(userScopeType) === '1' ? '1' : '2'
  return (userScopes || []).map(item => ({
    participantType,
    participantId: String(item.dataId),
    participantName: item.dataName
  }))
}

export function participantsToUserScopes(participants, userScopeType) {
  const participantType = String(userScopeType) === '1' ? '1' : '2'
  const customerScope = String(userScopeType) === '2'
  return (participants || [])
    .filter(item => String(item.participantType || participantType) === participantType)
    .map(item => {
      const scope = {
        dataId: Number(item.participantId),
        dataName: item.participantName || String(item.participantId)
      }
      if (customerScope && item.orgType != null && item.orgType !== '') {
        scope.orgType = String(item.orgType)
      }
      return scope
    })
}

export function getParticipantTypeLabel(type) {
  return PARTICIPANT_TYPE[String(type)] || type || '—'
}

export const WEEK_DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export function getDiscountTypeLabel(type) {
  return DISCOUNT_TYPE[String(type)] || type || '—'
}

export function getRateTypeLabel(type) {
  return RATE_TYPE[String(type)] || type || '—'
}

export function getRateUnit(rateType) {
  return String(rateType) === '1' ? '元' : '%'
}

export function formatRateValue(value, rateType) {
  if (value == null || value === '') return '—'
  return `${value} ${getRateUnit(rateType)}`
}

export function formatRateValues(config) {
  if (!config) return '—'
  const rateType = config.rateType
  const setting = String(config.rateSettingType || '1')
  if (setting === '1') {
    return `统一 ${formatRateValue(config.unifiedRateValue, rateType)}`
  }
  return [
    `尖 ${formatRateValue(config.sharpRateValue, rateType)}`,
    `峰 ${formatRateValue(config.peakRateValue, rateType)}`,
    `平 ${formatRateValue(config.flatRateValue, rateType)}`,
    `谷 ${formatRateValue(config.valleyRateValue, rateType)}`
  ].join(' / ')
}

export function formatWeekDays(weekDays) {
  const bits = String(weekDays || '1111111').split('')
  const selected = WEEK_DAY_LABELS.filter((_, i) => bits[i] === '1')
  return selected.length === 7 ? '每天' : (selected.join('、') || '—')
}

export function defaultWeekDays() {
  return '1111111'
}

export function defaultTimeSlots() {
  return [{ startTime: '00:00', endTime: '23:59', sortOrder: 0 }]
}

export function emptyRateValues() {
  return {
    unifiedRateValue: '',
    sharpRateValue: '',
    peakRateValue: '',
    flatRateValue: '',
    valleyRateValue: ''
  }
}

export function isDiscountActivityType(type) {
  return ['7', '8'].includes(String(type))
}

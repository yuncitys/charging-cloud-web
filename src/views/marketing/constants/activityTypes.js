/**
 * 营销活动类型元数据与字段可见性配置
 * 活动类型标签/权限/图标等富元数据仍维护在此；活动状态标签走字典。
 */
import { formatDictLabel, getSelectorOptions } from '@/utils/dictionary'

export const DICT_ACTIVITY_STATUS = 'marketing_activity_status'
export const DICT_LIMIT_TYPE = 'marketing_limit_type'
export const DICT_SEND_TYPE = 'marketing_send_type'
export const DICT_SEND_STATUS = 'marketing_send_status'
export const DICT_ACTIVITY_USER_SCOPE = 'marketing_activity_user_scope'
export const DICT_ACTIVITY_STATION_SCOPE = 'marketing_activity_station_scope'

export const ACTIVITY_TYPES = [
  {
    value: '1',
    label: '注册领取',
    tag: '新客拉新',
    icon: 'el-icon-user-solid',
    color: '#30B08F',
    colorLight: '#6ee7b7',
    description: '用户注册成功后自动发放卡券，降低新客首充门槛、提升转化。',
    viewPermission: ':marketing:activity:register:view',
    editPermission: ':marketing:activity:register:edit',
    platformOnly: true,
    drawerForm: true,
    showRewardThreshold: false,
    showStationScope: false,
    showUserScope: true,
    userScopeInSub: false,
    subFields: [],
    autoIssueTip: '用户通过手机号完成注册后自动发放卡券。'
  },
  {
    value: '2',
    label: '充值领取',
    tag: '提升客单价',
    icon: 'el-icon-wallet',
    color: '#22c55e',
    colorLight: '#86efac',
    description: '用户充值满指定金额后赠送卡券，激励预付费、提高资金沉淀。',
    viewPermission: ':marketing:activity:recharge:view',
    editPermission: ':marketing:activity:recharge:edit',
    platformOnly: true,
    drawerForm: true,
    showRewardThreshold: true,
    showStationScope: false,
    showUserScope: true,
    userScopeInSub: false,
    subFields: ['limitType', 'limitCount'],
    autoIssueTip: '用户余额充值成功后，按最高匹配档位自动发放卡券。'
  },
  {
    value: '3',
    label: '定向发放',
    tag: '精准触达',
    icon: 'el-icon-s-promotion',
    color: '#16a34a',
    colorLight: '#4ade80',
    description: '向指定客户、用户分组或用户定向推送卡券，适合召回与 VIP 运营。',
    viewPermission: ':marketing:activity:directional:view',
    editPermission: ':marketing:activity:directional:edit',
    drawerForm: true,
    showRewardThreshold: false,
    showStationScope: false,
    showUserScope: true,
    userScopeInSub: true,
    subFields: ['sendType', 'sendTime', 'userScope']
  },
  {
    value: '4',
    label: '充电领取',
    tag: '提升充电量',
    icon: 'el-icon-lightning',
    color: '#059669',
    colorLight: '#34d399',
    description: '用户充电满指定度数后可领取奖励，激励用户多充多领。',
    viewPermission: ':marketing:activity:charge:view',
    editPermission: ':marketing:activity:charge:edit',
    drawerForm: true,
    showRewardThreshold: false,
    showStationScope: true,
    showUserScope: true,
    userScopeInSub: true,
    subFields: ['limitPower', 'limitType', 'limitCount', 'stationScope', 'chargeUserScope'],
    autoIssueTip: '汽车充电结算后，活动期内累计充电度数达标自动发放卡券。'
  },
  {
    value: '5',
    label: '扫码领取',
    tag: '线下引流',
    icon: 'el-icon-full-screen',
    color: '#0d9488',
    colorLight: '#5eead4',
    description: '用户扫描活动二维码即可领券，适合地推、站点物料与线下活动。',
    viewPermission: ':marketing:activity:scan:view',
    editPermission: ':marketing:activity:scan:edit',
    drawerForm: true,
    showRewardThreshold: false,
    showStationScope: false,
    showUserScope: true,
    userScopeInSub: true,
    subFields: ['activityTitle', 'activityImage', 'limitType', 'limitCount', 'scanUserScope']
  },
  {
    value: '6',
    label: '券码兑换',
    tag: '渠道分发',
    icon: 'el-icon-tickets',
    color: '#10b981',
    colorLight: '#6ee7b7',
    description: '生成兑换码分发给用户，输入码即可兑换卡券，便于合作渠道投放。',
    viewPermission: ':marketing:activity:exchange:view',
    editPermission: ':marketing:activity:exchange:edit',
    drawerForm: true,
    showRewardThreshold: false,
    showStationScope: false,
    showUserScope: true,
    userScopeInSub: true,
    subFields: ['sendTotalCount', 'exchangeUserScope']
  },
  {
    value: '7',
    label: '电站折扣',
    tag: '电站促销',
    icon: 'el-icon-office-building',
    color: '#2563eb',
    colorLight: '#93c5fd',
    description: '按电站配置电费/服务费折扣或固定价，支持分电站费率、使用星期与时段控制。',
    viewPermission: ':marketing:activity:stationDiscount:view',
    editPermission: ':marketing:activity:stationDiscount:edit',
    drawerForm: true,
    isDiscount: true,
    showRewardThreshold: false,
    showStationScope: false,
    showUserScope: false,
    userScopeInSub: false,
    subFields: []
  },
  {
    value: '8',
    label: '用户折扣',
    tag: '精准优惠',
    icon: 'el-icon-user',
    color: '#7c3aed',
    colorLight: '#c4b5fd',
    description: '向指定用户分组或用户配置充电折扣/固定价，限定可用电站与生效时段。',
    viewPermission: ':marketing:activity:userDiscount:view',
    editPermission: ':marketing:activity:userDiscount:edit',
    drawerForm: true,
    isDiscount: true,
    showRewardThreshold: false,
    showStationScope: false,
    showUserScope: false,
    userScopeInSub: false,
    subFields: []
  }
]

export function getActivityTypeMeta(type) {
  return ACTIVITY_TYPES.find(item => item.value === String(type)) || null
}

/** Element Tag 类型（非字典） */
export const ACTIVITY_STATUS_TAG = {
  '1': 'success',
  '2': 'warning',
  '3': 'danger',
  '4': 'info',
  '5': 'danger',
  '6': 'danger'
}

export function loadActivityStatusOptions() {
  return getSelectorOptions(DICT_ACTIVITY_STATUS).then(list =>
    (list || []).map(item => ({
      ...item,
      tagType: ACTIVITY_STATUS_TAG[String(item.value)] || 'info'
    }))
  )
}

export function getActivityStatusLabel(status) {
  if (status == null || status === '') return status
  const label = formatDictLabel(DICT_ACTIVITY_STATUS, status)
  return label === String(status) ? String(status) : label
}

export function getActivityStatusTagType(status) {
  return ACTIVITY_STATUS_TAG[String(status)] || 'info'
}

export function loadLimitTypeOptions() {
  return getSelectorOptions(DICT_LIMIT_TYPE)
}

export function loadSendTypeOptions() {
  return getSelectorOptions(DICT_SEND_TYPE)
}

export function loadActivityUserScopeOptions() {
  return getSelectorOptions(DICT_ACTIVITY_USER_SCOPE)
}

export function loadActivityStationScopeOptions() {
  return getSelectorOptions(DICT_ACTIVITY_STATION_SCOPE)
}

export function getLimitTypeLabel(type) {
  if (type == null || type === '') return ''
  const label = formatDictLabel(DICT_LIMIT_TYPE, type)
  return label === String(type) ? '' : label
}

export function getSendTypeLabel(type) {
  if (type == null || type === '') return '—'
  const label = formatDictLabel(DICT_SEND_TYPE, type)
  return label === String(type) ? '—' : label
}

export function getSendStatusLabel(status) {
  if (status == null || status === '') return '—'
  const label = formatDictLabel(DICT_SEND_STATUS, status)
  return label === String(status) ? '—' : label
}

export function getActivityUserScopeLabel(scope) {
  if (scope == null || scope === '') return '—'
  const label = formatDictLabel(DICT_ACTIVITY_USER_SCOPE, scope)
  return label === String(scope) ? '—' : label
}

export function getActivityStationScopeLabel(scope) {
  if (scope == null || scope === '') return '—'
  const label = formatDictLabel(DICT_ACTIVITY_STATION_SCOPE, scope)
  return label === String(scope) ? '—' : label
}

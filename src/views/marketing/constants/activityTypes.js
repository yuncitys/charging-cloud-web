/**
 * 营销活动类型元数据与字段可见性配置
 */
export const ACTIVITY_TYPES = [
  {
    value: '1',
    label: '注册领取',
    tag: '新客拉新',
    icon: 'el-icon-user-solid',
    color: '#30B08F',
    colorLight: '#6ee7b7',
    description: '用户注册成功后自动发放卡券，降低新客首充门槛、提升转化。',
    platformOnly: true,
    drawerForm: true,
    showRewardThreshold: false,
    showStationScope: false,
    showUserScope: true,
    userScopeInSub: false,
    subFields: []
  },
  {
    value: '2',
    label: '充值领取',
    tag: '提升客单价',
    icon: 'el-icon-wallet',
    color: '#22c55e',
    colorLight: '#86efac',
    description: '用户充值满指定金额后赠送卡券，激励预付费、提高资金沉淀。',
    platformOnly: true,
    drawerForm: true,
    showRewardThreshold: true,
    showStationScope: false,
    showUserScope: true,
    userScopeInSub: false,
    subFields: ['limitType', 'limitCount']
  },
  {
    value: '3',
    label: '定向发放',
    tag: '精准触达',
    icon: 'el-icon-s-promotion',
    color: '#16a34a',
    colorLight: '#4ade80',
    description: '向指定客户、用户分组或用户定向推送卡券，适合召回与 VIP 运营。',
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
    p1Tip: '保存配置后，充电完成自动发券将于下一版本开通（P2）。',
    drawerForm: true,
    showRewardThreshold: false,
    showStationScope: true,
    showUserScope: true,
    userScopeInSub: true,
    subFields: ['limitPower', 'limitType', 'limitCount', 'stationScope', 'chargeUserScope']
  },
  {
    value: '5',
    label: '扫码领取',
    tag: '线下引流',
    icon: 'el-icon-full-screen',
    color: '#0d9488',
    colorLight: '#5eead4',
    description: '用户扫描活动二维码即可领券，适合地推、站点物料与线下活动。',
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
    drawerForm: true,
    showRewardThreshold: false,
    showStationScope: false,
    showUserScope: true,
    userScopeInSub: true,
    subFields: ['sendTotalCount', 'exchangeUserScope']
  }
]

export function getActivityTypeMeta(type) {
  return ACTIVITY_TYPES.find(item => item.value === String(type)) || null
}

export const ACTIVITY_STATUS = [
  { value: '1', label: '进行中', tagType: 'success' },
  { value: '2', label: '未开始', tagType: 'warning' },
  { value: '3', label: '已停用', tagType: 'info' },
  { value: '4', label: '已到期', tagType: 'info' },
  { value: '5', label: '卡券不足', tagType: 'danger' },
  { value: '6', label: '卡券失效', tagType: 'danger' }
]

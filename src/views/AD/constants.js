// 运营内容管理的常量（与后端 spec 4.2 / 2.2 对齐）

/** 跳转类型 */
export const LINK_TYPES = [
  { value: 'ACTIVITY', label: '营销活动' },
  { value: 'STATION', label: '电站' },
  { value: 'GOODS', label: '商品' },
  { value: 'PAGE', label: '小程序页面' },
  { value: 'H5', label: 'H5 外链' },
  { value: 'NONE', label: '不跳转' }
]

export const LINK_TYPE_LABEL = LINK_TYPES.reduce((map, item) => {
  map[item.value] = item.label
  return map
}, {})

/** 可绑定的营销活动类型：2 充值领取 / 4 充电领取 / 7 电站折扣 / 8 用户折扣 */
export const ACTIVITY_BIND_TYPES = [
  { value: '2', label: '充值领取' },
  { value: '4', label: '充电领取' },
  { value: '7', label: '电站折扣' },
  { value: '8', label: '用户折扣' }
]

/**
 * 生效状态（由后端计算返回，前端只展示）
 * 编码与后端返回值保持一致，待后端契约确认后可调整
 */
export const EFFECTIVE_STATUS = {
  EFFECTIVE: { label: '生效中', type: 'success' },
  NOT_STARTED: { label: '未生效', type: 'info' },
  EXPIRED: { label: '已过期', type: 'warning' },
  ACTIVITY_DISABLED: { label: '活动已停用', type: 'danger' }
}

export const EFFECTIVE_STATUS_OPTIONS = Object.keys(EFFECTIVE_STATUS).map(value => ({
  value,
  label: EFFECTIVE_STATUS[value].label
}))

export function effectiveStatusLabel(code) {
  const item = EFFECTIVE_STATUS[code]
  return item ? item.label : (code || '—')
}

export function effectiveStatusType(code) {
  const item = EFFECTIVE_STATUS[code]
  return item ? item.type : 'info'
}

/** 默认展示位（活动推广内容与旧数据迁移均落在首页顶部轮播） */
export const DEFAULT_PLACEMENT_CODE = 'HOME_TOP'

/** 素材类型：1 图片 2 视频 */
export const ITEM_TYPES = [
  { value: 1, label: '图片' },
  { value: 2, label: '视频' }
]

/** 内容来源 */
export const SOURCE_LABEL = {
  MANUAL: '手动创建',
  MIGRATE: '历史迁移',
  ACTIVITY: '活动生成'
}

/** 权限码：沿用 :AD:Content:* 体系 */
export const CONTENT_PERMS = {
  query: ':AD:Content:query',
  add: ':AD:Content:add',
  edit: ':AD:Content:edit',
  delete: ':AD:Content:delete',
  status: ':AD:Content:status'
}

/**
 * 把后端返回的 effective / effectiveReason 映射为前端生效状态编码。
 * 后端只返回布尔值与原因文案，文案与 ContentEffectiveRule 的 REASON_* 一一对应。
 * 无法归入任一已知原因时保守展示为“未生效”。
 */
const REASON_TO_STATUS = {
  '已过期': 'EXPIRED',
  '未生效': 'NOT_STARTED',
  '已下线': 'NOT_STARTED',
  '已删除': 'NOT_STARTED',
  '活动已停用': 'ACTIVITY_DISABLED',
  '活动不存在': 'ACTIVITY_DISABLED',
  '活动不在有效期内': 'ACTIVITY_DISABLED',
  '活动类型不支持': 'ACTIVITY_DISABLED'
}

export function resolveEffectiveStatus(row) {
  if (!row) return ''
  if (row.effective === true) return 'EFFECTIVE'
  if (row.effectiveStatus) return row.effectiveStatus
  const reason = row.effectiveReason || row.reason || ''
  return REASON_TO_STATUS[reason] || 'NOT_STARTED'
}

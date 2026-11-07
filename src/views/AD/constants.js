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
/**
 * 与后端 @SaCheckPermission 及 db_menu 中的权限码保持一致（见 content_placement_menu_perms_20261106.sql）：
 * - list  ：查看（列表、预览、活动搜索）
 * - edit  ：新增/编辑/上下线/生成推广内容（后端 save/status/fromActivity 均校验此码）
 * - delete：删除
 * 不再使用 query/add/status，它们在后端与数据库中都不存在。
 */
export const CONTENT_PERMS = {
  query: ':AD:Content:list',
  add: ':AD:Content:edit',
  edit: ':AD:Content:edit',
  delete: ':AD:Content:delete',
  status: ':AD:Content:edit'
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

/**
 * 取内容行绑定的展示位编码数组。
 * 后端列表行可能返回 placementCodes（数组或逗号分隔字符串），也可能只返回单数 placementCode，
 * 这里统一兜底，避免列表与表单各自取值导致展示位显示为空。
 */
export function rowPlacementCodes(row) {
  if (!row) return []
  const codes = row.placementCodes
  if (Array.isArray(codes)) return codes.filter(Boolean)
  if (typeof codes === 'string' && codes.trim()) return codes.split(',').map(s => s.trim()).filter(Boolean)
  return row.placementCode ? [row.placementCode] : []
}

export function resolveEffectiveStatus(row) {
  if (!row) return ''
  if (row.effective === true) return 'EFFECTIVE'
  if (row.effectiveStatus) return row.effectiveStatus
  const reason = row.effectiveReason || row.reason || ''
  return REASON_TO_STATUS[reason] || 'NOT_STARTED'
}

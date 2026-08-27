/** 帐号角色类型：数值越大层级越低，仅允许创建/切换为「不低于当前登录用户层级」的类型 */
import { formatDictLabel, getSelector } from '@/utils/dictionary'

export const ROLE_TYPE_DEFS = [
  { value: 1, label: '平台管理员' },
  { value: 2, label: '租户管理员' },
  { value: 3, label: '商户管理员' },
  { value: 4, label: '站点管理员' },
]

function resolveRoleLabel(value, fallback) {
  const label = formatDictLabel('sys_role_type', value)
  if (label && label !== '-' && label !== String(value)) {
    return label
  }
  return fallback
}

function withDictLabels(defs) {
  return (defs || []).map(d => ({
    ...d,
    label: resolveRoleLabel(d.value, d.label)
  }))
}

/** 预加载角色类型字典（表单打开前调用） */
export function preloadSysRoleTypeDict() {
  return getSelector('sys_role_type')
}

/**
 * 当前登录用户可操作的最低角色类型（含本级）：可选类型满足 value >= 返回值
 * @param {object} adminUser permission.store 中 currentUser 返回的 adminUser
 */
export function getLoginUserRoleTypeMin(adminUser) {
  if (adminUser == null || typeof adminUser !== 'object' || Array.isArray(adminUser)) {
    return 1
  }
  const rt = adminUser.roleType != null && adminUser.roleType !== ''
    ? adminUser.roleType
    : (adminUser.role && adminUser.role.roleType)
  if (rt == null || rt === '') {
    return 1
  }
  const n = Number(rt)
  return Number.isFinite(n) ? n : 1
}

export function getRoleTypeOptionsForAdd(adminUser) {
  const min = getLoginUserRoleTypeMin(adminUser)
  return withDictLabels(ROLE_TYPE_DEFS)
    .filter(d => d.value >= min)
    .map(d => ({ ...d, disabled: false }))
}

/**
 * 编辑：在「可创建范围」基础上，若当前帐号类型低于登录用户层级，仍回显该类型但不可选（仅展示）
 */
export function getRoleTypeOptionsForEdit(adminUser, currentRoleType) {
  const min = getLoginUserRoleTypeMin(adminUser)
  let opts = withDictLabels(ROLE_TYPE_DEFS)
    .filter(d => d.value >= min)
    .map(d => ({ ...d, disabled: false }))
  const cur = currentRoleType !== '' && currentRoleType != null ? Number(currentRoleType) : NaN
  if (Number.isFinite(cur) && !opts.some(o => o.value === cur)) {
    const def = ROLE_TYPE_DEFS.find(d => d.value === cur)
    const label = resolveRoleLabel(cur, def ? def.label : `角色类型（${cur}）`)
    opts.push({ value: cur, label, disabled: true })
  }
  opts.sort((a, b) => a.value - b.value)
  return opts
}

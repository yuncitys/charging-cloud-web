import store from '@/store'
import { getLoginUserRoleTypeMin } from '@/utils/adminRoleTypeOptions'
import { ACTIVITY_TYPES } from '../constants/activityTypes'

const GENERIC_VIEW = ':marketing:activity:view'
const GENERIC_EDIT = ':marketing:activity:edit'

function hasPerm(perms) {
  const list = store.getters.authentionList || []
  const target = String(perms || '').trim()
  return list.some(item => String(item.perms || '').trim() === target)
}

function hasAnyTypeSpecificViewPerm() {
  return ACTIVITY_TYPES.some(item => item.viewPermission && hasPerm(item.viewPermission))
}

function hasAnyTypeSpecificEditPerm() {
  return ACTIVITY_TYPES.some(item => item.editPermission && hasPerm(item.editPermission))
}

/** 某活动类型是否可查看（细粒度权限优先，否则回退通用 view） */
export function hasActivityTypeView(type) {
  const meta = ACTIVITY_TYPES.find(item => item.value === String(type))
  if (!meta) return false
  if (hasAnyTypeSpecificViewPerm()) {
    return !!(meta.viewPermission && hasPerm(meta.viewPermission))
  }
  return hasPerm(GENERIC_VIEW)
}

/** 某活动类型是否可编辑 */
export function hasActivityTypeEdit(type) {
  const meta = ACTIVITY_TYPES.find(item => item.value === String(type))
  if (!meta) return false
  if (hasAnyTypeSpecificEditPerm()) {
    return !!(meta.editPermission && hasPerm(meta.editPermission))
  }
  return hasPerm(GENERIC_EDIT)
}

/** Hub 可见的活动类型（权限 + 平台专属类型角色限制） */
export function getVisibleActivityTypes(adminUser) {
  const roleType = getLoginUserRoleTypeMin(adminUser)
  return ACTIVITY_TYPES.filter(item => {
    if (!hasActivityTypeView(item.value)) return false
    if (item.platformOnly && roleType > 1) return false
    return true
  })
}

/**
 * 发起方上下文：平台/租户可选发起方；商户/站点默认商户发起（归属商户自行选择）
 */
export function getMarketingInitiatorContext(adminUser) {
  const roleType = getLoginUserRoleTypeMin(adminUser)
  const canChooseInitiator = roleType <= 2
  const canChoosePlatformInitiator = roleType <= 2

  return {
    roleType,
    canChooseInitiator,
    canChoosePlatformInitiator,
    fixedInitiator: canChooseInitiator ? null : '2'
  }
}

/** 空商户 ID（与 el-select String 选项值一致，未选用空字符串） */
function isEmptyMerchantId(id) {
  return id == null || id === '' || id === '0' || id === 0
}

/** 新建/重置表单时写入发起方默认值 */
export function applyInitiatorDefaults(form, adminUser) {
  const ctx = getMarketingInitiatorContext(adminUser)
  if (ctx.canChooseInitiator) {
    form.activityInitiator = form.activityInitiator || '1'
    if (form.activityInitiator === '2') {
      form.activityInitiatorId = isEmptyMerchantId(form.activityInitiatorId) ? '' : String(form.activityInitiatorId)
    } else {
      form.activityInitiatorId = '0'
    }
  } else {
    form.activityInitiator = '2'
    form.activityInitiatorId = isEmptyMerchantId(form.activityInitiatorId) ? '' : String(form.activityInitiatorId)
  }
  return ctx
}

/** 提交前强制写入发起方（防止前端篡改） */
export function normalizeInitiatorPayload(form, adminUser) {
  const ctx = getMarketingInitiatorContext(adminUser)
  if (ctx.canChooseInitiator) {
    return {
      activityInitiator: form.activityInitiator || '1',
      activityInitiatorId: form.activityInitiator === '2'
        ? String(form.activityInitiatorId == null ? '' : form.activityInitiatorId)
        : '0'
    }
  }
  return {
    activityInitiator: '2',
    activityInitiatorId: form.activityInitiatorId == null ? '0' : String(form.activityInitiatorId)
  }
}

/** 表单校验：商户 ID 是否已选 */
export function isMerchantIdSelected(id) {
  return !isEmptyMerchantId(id)
}

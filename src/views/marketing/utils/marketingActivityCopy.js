export const COPY_ACTIVITY_NAME_SUFFIX = '（副本）'

export function appendCopyActivityName(name) {
  const base = (name || '').trim()
  if (!base) return COPY_ACTIVITY_NAME_SUFFIX
  if (base.endsWith(COPY_ACTIVITY_NAME_SUFFIX)) return base
  return `${base}${COPY_ACTIVITY_NAME_SUFFIX}`
}

/**
 * 复制活动时清理标识字段，并给活动名称加副本后缀。
 */
export function applyCopyFormAdjustments(form) {
  if (!form || typeof form !== 'object') return form
  delete form.activityId
  if (form.activityName != null) {
    form.activityName = appendCopyActivityName(form.activityName)
  }
  return form
}

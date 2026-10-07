/**
 * 订单/设备列表「单车、汽车」等 Tab。
 * 展示哪些、顺序由 public/BaseConfig.js 的 VUE_RULE_ID_TABS 决定；名称取字典 device_rule，
 * 字典未加载时依次回退到配置 title、内置名称。
 */
import { peekDictLabel } from './dictionary'
import { getVisibleRuleIds, getFallbackRuleTitle } from './ruleIdConfig'

/** 在 computed 中调用时，字典加载完成会自动刷新标题 */
export function getRuleIdTabs() {
  return getVisibleRuleIds().map(item => ({
    id: item.id,
    title: peekDictLabel('device_rule', item.id) || item.title || getFallbackRuleTitle(item.id) || item.id
  }))
}

/**
 * @param {string|number} [preferredId] 优先选中的 ruleId（如虚拟设备列表默认汽车 2）；不可用时回落到第一项
 */
export function getDefaultRuleIdTabName(preferredId) {
  const ids = getVisibleRuleIds().map(item => item.id)
  if (!ids.length) {
    return '1'
  }
  if (preferredId != null && preferredId !== '') {
    const id = String(preferredId)
    if (ids.includes(id)) {
      return id
    }
  }
  return ids[0]
}

export function getDefaultRuleIdNumber(preferredId) {
  const n = Number(getDefaultRuleIdTabName(preferredId))
  return Number.isFinite(n) ? n : 1
}

export function ruleIdTabTitle(ruleId) {
  const id = ruleId != null ? String(ruleId) : ''
  const hit = getRuleIdTabs().find(t => t.id === id)
  return hit ? hit.title : ''
}

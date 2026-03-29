/**
 * 订单/设备列表「单车、汽车」等 Tab：从 public/BaseConfig.js 的 VUE_RULE_ID_TABS 读取，
 * 未加载 BaseConfig 或配置无效时使用内置默认。
 */

const DEFAULT_ITEMS = [
  { id: '1', title: '单车', visible: true },
  { id: '2', title: '汽车', visible: true },
]

function getBaseConfig() {
  if (typeof globalThis !== 'undefined' && globalThis.BaseConfig) {
    return globalThis.BaseConfig
  }
  if (typeof window !== 'undefined' && window.BaseConfig) {
    return window.BaseConfig
  }
  return null
}

function normalizeEntry(raw) {
  if (raw == null || typeof raw !== 'object') {
    return null
  }
  if (raw.visible === false) {
    return null
  }
  const id = raw.id != null ? String(raw.id).trim() : ''
  const title = raw.title != null ? String(raw.title).trim() : ''
  if (!id || !title) {
    return null
  }
  return { id, title }
}

function tabsFromArray(arr) {
  if (!Array.isArray(arr)) {
    return []
  }
  const out = []
  for (let i = 0; i < arr.length; i++) {
    const n = normalizeEntry(arr[i])
    if (n) {
      out.push(n)
    }
  }
  return out
}

export function getRuleIdTabs() {
  const cfg = getBaseConfig()
  const fromFile = cfg && tabsFromArray(cfg.VUE_RULE_ID_TABS)
  if (fromFile.length) {
    return fromFile
  }
  return tabsFromArray(DEFAULT_ITEMS)
}

/**
 * @param {string|number} [preferredId] 优先选中的 ruleId（如虚拟设备列表默认汽车 2）；不可用时回落到第一项
 */
export function getDefaultRuleIdTabName(preferredId) {
  const tabs = getRuleIdTabs()
  if (!tabs.length) {
    return '1'
  }
  if (preferredId != null && preferredId !== '') {
    const id = String(preferredId)
    if (tabs.some(t => t.id === id)) {
      return id
    }
  }
  return tabs[0].id
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

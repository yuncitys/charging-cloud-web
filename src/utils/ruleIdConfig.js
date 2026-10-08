/**
 * 读取 public/BaseConfig.js 的 VUE_RULE_ID_TABS：决定本部署展示哪些产品类型（ruleId）及其顺序。
 * 名称以字典 device_rule 为准，这里的 title 仅作字典未加载时的兜底。
 * 不依赖其它模块，供 dictionary.js 与 ruleIdTabs.js 共用。
 */

const DEFAULT_ITEMS = [
  { id: '1', title: '电动单车' },
  { id: '2', title: '新能源汽车' }
]

function getBaseConfig() {
  return (typeof window !== 'undefined' && window.BaseConfig) || null
}

function normalize(list) {
  if (!Array.isArray(list)) {
    return []
  }
  const out = []
  list.forEach(raw => {
    if (raw == null || typeof raw !== 'object' || raw.visible === false) {
      return
    }
    const id = raw.id != null ? String(raw.id).trim() : ''
    if (!id || out.some(item => item.id === id)) {
      return
    }
    const title = raw.title != null ? String(raw.title).trim() : ''
    out.push({ id, title })
  })
  return out
}

/** BaseConfig 中有效配置的 ruleId 列表；未配置或配置无效时返回空数组 */
export function getConfiguredRuleIds() {
  const cfg = getBaseConfig()
  return normalize(cfg && cfg.VUE_RULE_ID_TABS)
}

/** 可见的 ruleId 列表（含兜底标题）；未配置时使用内置默认 */
export function getVisibleRuleIds() {
  const configured = getConfiguredRuleIds()
  return configured.length ? configured : normalize(DEFAULT_ITEMS)
}

export function getFallbackRuleTitle(id) {
  const hit = DEFAULT_ITEMS.find(item => item.id === String(id))
  return hit ? hit.title : ''
}

/**
 * 按 VUE_RULE_ID_TABS 过滤并排序 device_rule 字典选项；未配置时原样返回。
 * @param {Array<{value: string|number}>} options
 */
export function filterRuleOptions(options) {
  const list = options || []
  const configured = getConfiguredRuleIds()
  if (!configured.length) {
    return list
  }
  const order = configured.map(item => item.id)
  return list
    .filter(item => order.includes(String(item.value)))
    .sort((a, b) => order.indexOf(String(a.value)) - order.indexOf(String(b.value)))
}

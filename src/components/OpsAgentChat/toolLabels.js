/**
 * Shared Chinese labels for agent tools / pending actions.
 * Prefer tool-pool displayName when hydrated via setToolLabelMap().
 */

export const TOOL_LABELS = {
  lookup_order: '查订单',
  lookup_gun_status: '查枪状态',
  lookup_pay_refund: '查支付/退款',
  propose_refund: '提议退款',
  propose_remote_stop: '提议远程停充',
  search_knowledge: '查操作说明',
  refund: '退款',
  remote_stop: '远程停充'
}

/** Pending-action / confirm-card labels (subset + aliases). */
export const ACTION_LABELS = {
  refund: '退款',
  remote_stop: '远程停充',
  propose_refund: '退款',
  propose_remote_stop: '远程停充',
  lookup_order: '查单',
  lookup_gun_status: '查枪状态',
  lookup_pay_refund: '查支付/退款'
}

/** Runtime overrides from GET /api/agent/tool-pool displayName */
let poolLabelMap = Object.create(null)

export function setToolLabelMap(rows) {
  const next = Object.create(null)
  if (Array.isArray(rows)) {
    rows.forEach(row => {
      if (!row || !row.toolName) {
        return
      }
      const name = String(row.toolName)
      const dn = row.displayName != null ? String(row.displayName).trim() : ''
      if (dn) {
        next[name] = dn
      }
    })
  }
  poolLabelMap = next
}

export function toolLabel(name) {
  if (!name) {
    return '工具'
  }
  if (poolLabelMap[name]) {
    return poolLabelMap[name]
  }
  return TOOL_LABELS[name] || name
}

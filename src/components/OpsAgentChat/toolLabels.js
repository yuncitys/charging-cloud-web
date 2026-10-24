/**
 * Shared Chinese labels for agent tools / pending actions.
 * Keep in sync with backend friendlyToolLabel where possible.
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

export function toolLabel(name) {
  if (!name) {
    return '工具'
  }
  return TOOL_LABELS[name] || name
}

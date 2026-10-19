/**
 * Turn technical agent/ops errors into plain Chinese for non-dev users.
 */

const ACTION_LABELS = {
  refund: '退款',
  remote_stop: '远程停充',
  propose_refund: '退款',
  propose_remote_stop: '远程停充',
  lookup_order: '查单'
}

export function actionLabel(action) {
  if (!action) {
    return '该操作'
  }
  const fromSummary = summarizeAction(action.summary)
  if (fromSummary) {
    return fromSummary
  }
  const key = action.toolName || action.tool || ''
  return ACTION_LABELS[key] || '该操作'
}

export function summarizeAction(summary) {
  if (!summary) {
    return ''
  }
  if (typeof summary === 'object') {
    return labelFromObj(summary)
  }
  const s = String(summary).trim()
  if (!s) {
    return ''
  }
  if (s.charAt(0) === '{') {
    try {
      return labelFromObj(JSON.parse(s))
    } catch (e) {
      return s.length > 40 ? s.slice(0, 40) + '…' : s
    }
  }
  return s.length > 40 ? s.slice(0, 40) + '…' : s
}

function labelFromObj(obj) {
  if (!obj || typeof obj !== 'object') {
    return ''
  }
  const tool = obj.tool || obj.toolName || ''
  const order = obj.orderCode || obj.payId || obj.payCode || ''
  const name = ACTION_LABELS[tool] || tool || '操作'
  let label = order ? name + '（订单 ' + order + '）' : name
  if (obj.amount != null && obj.amount !== '') {
    label += '，金额 ' + obj.amount + ' 元'
  }
  return label
}

export function humanizeOpsError(raw, action) {
  const text = raw == null ? '' : String(raw)
  const label = actionLabel(action)

  if (!text) {
    return label + '没有成功。请稍后重试，或换一个真实订单再试。'
  }

  // Prefer nested msg from JSON blobs
  const msg = extractMsg(text)
  if (msg) {
    if (/交易账单不存在|账单不存在|订单不存在|不存在/.test(msg)) {
      return '没有查到对应的交易/账单记录，所以无法完成' + label + '。\n请确认订单号是否正确，或到订单列表核对后再试。'
    }
    if (/权限|无权限|forbidden|401|403/i.test(msg)) {
      return '当前账号没有权限执行' + label + '，请联系管理员开通后再试。'
    }
    if (/超时|timeout/i.test(msg)) {
      return label + '处理超时了，请稍后再试一次。'
    }
    if (/idempotency|already used|terminal/i.test(msg) || /idempotency|already used|terminal/i.test(text)) {
      return '这个操作之前已经处理过了（不能重复提交）。\n如需再试，请换一个订单号，或在订单页确认当前状态。'
    }
    // Generic business msg — still plain language wrapper
    return label + '没有成功：' + msg + '\n如有疑问，请到订单/财务页面核对，或联系运维同事。'
  }

  if (/idempotency|already used|terminal/i.test(text)) {
    return '这个操作之前已经处理过了（不能重复提交）。\n如需再试，请换一个订单号。'
  }
  if (/timeout|超时/i.test(text)) {
    return label + '处理超时了，请稍后再试。'
  }

  return label + '没有成功。请稍后重试；若一直失败，请把订单号发给运维同事协助排查。'
}

function extractMsg(text) {
  const m = /"msg"\s*:\s*"([^"]+)"/.exec(text)
  if (m) {
    return m[1]
  }
  try {
    const start = text.indexOf('{')
    if (start >= 0) {
      const obj = JSON.parse(text.slice(start))
      if (obj && obj.msg) {
        return String(obj.msg)
      }
    }
  } catch (e) {
    /* ignore */
  }
  // plain Chinese error without JSON
  if (/[\u4e00-\u9fff]/.test(text) && !/downstream rejected/i.test(text)) {
    return text.length > 80 ? text.slice(0, 80) + '…' : text
  }
  return ''
}

export function formatConfirmResult(action, result) {
  const label = actionLabel(action)
  if (result && result.code === 200) {
    return '已完成：' + label + '执行成功。'
  }
  const raw = (result && (result.userMessage || result.error || result.msg)) || ''
  return humanizeOpsError(raw, action)
}

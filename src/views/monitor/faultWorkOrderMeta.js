// 与后端 FaultWorkOrderMapper.xml pageScope 的 overdue 条件保持一致
export const OVERDUE_HOURS = { OPEN: 2, IN_PROGRESS: 24 }

const HOUR_MS = 3600 * 1000

function toMs(value) {
  if (value === null || value === undefined || value === '') return NaN
  if (typeof value === 'number') return value
  const text = String(value)
  return new Date(text.indexOf('T') > -1 ? text : text.replace(/-/g, '/')).getTime()
}

export function orderDurationMs(row, now = Date.now()) {
  if (!row) return null
  const start = toMs(row.openedAt || row.createTime)
  if (Number.isNaN(start)) return null
  const finished = row.status === 'CLOSED' || row.status === 'CANCELLED'
  const end = finished ? toMs(row.closedAt) : now
  if (Number.isNaN(end)) return null
  return Math.max(0, end - start)
}

export function isOverdue(row, now = Date.now()) {
  if (!row || !OVERDUE_HOURS[row.status]) return false
  const ms = orderDurationMs(row, now)
  return ms !== null && ms > OVERDUE_HOURS[row.status] * HOUR_MS
}

export function formatDuration(ms) {
  if (ms === null || ms === undefined) return '-'
  const minutes = Math.floor(ms / 60000)
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const mins = minutes % 60
  if (days > 0) return `${days}天${hours}小时`
  if (hours > 0) return `${hours}小时${mins}分`
  return `${mins}分`
}

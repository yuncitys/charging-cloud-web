// 工作台「营销分析」抽屉：分析窗口计算与趋势补零（纯函数，便于单测）
//
// 服务端口径（POST /operatorWorkbench/marketingAnalysis）：
// - 窗口末日 = statDate（缺省今天；晚于今天按今天夹取，含当日）；起日 = 末日 -(analysisDays-1)
// - analysisDays 缺省/<=0 按 30，>90 按 90；periodType 被忽略
// - 趋势只返回有日表行的日期，前端需补 0

export const MAX_ANALYSIS_DAYS = 90

// 抽屉周期：近 7 日 / 近 30 日
export const ANALYSIS_RANGE_OPTIONS = [
  { value: '7', label: '近 7 日' },
  { value: '30', label: '近 30 日' }
]

function pad(n) {
  return n < 10 ? '0' + n : '' + n
}

export function formatDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '')
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return isNaN(d.getTime()) ? null : d
}

function addDays(d, n) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * 计算分析窗口。
 * @param {string} mode '7' | '30'
 * @param {string} [_periodType] 保留参数兼容旧调用，已忽略
 * @param {Date} [today]
 * @param {string} [anchorDate] 期末日 yyyy-MM-dd
 */
export function buildAnalysisWindow(mode, _periodType, today, anchorDate) {
  const now = startOfDay(today || new Date())
  let end = parseDate(anchorDate) || now
  if (end.getTime() > now.getTime()) end = now
  let days = Number(mode) === 7 ? 7 : 30
  days = Math.max(1, Math.min(MAX_ANALYSIS_DAYS, days))
  return {
    analysisDays: days,
    statDate: formatDate(end),
    startDate: formatDate(addDays(end, -(days - 1))),
    endDate: formatDate(end)
  }
}

/**
 * 趋势补零：窗口内每天一行（升序），缺失日期各指标为 0。
 */
export function fillTrend(rows, win) {
  const byDate = {}
  ;(rows || []).forEach(r => {
    if (r && r.date) byDate[r.date] = r
  })
  const start = parseDate(win.startDate)
  const end = parseDate(win.endDate)
  if (!start || !end) return []
  const out = []
  for (let d = start; d.getTime() <= end.getTime(); d = addDays(d, 1)) {
    const key = formatDate(d)
    const hit = byDate[key]
    out.push(hit || {
      date: key,
      issueCount: 0,
      redeemCount: 0,
      discountCost: 0,
      activityOrderKwh: 0
    })
  }
  return out
}

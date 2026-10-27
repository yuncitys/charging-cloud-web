// 工作台「营销分析」抽屉：分析窗口计算与趋势补零（纯函数，便于单测）
//
// 服务端口径（POST /operatorWorkbench/marketingAnalysis）：
// - 窗口末日 = statDate（缺省今天；晚于今天按今天夹取，含当日）；起日 = 末日 -(analysisDays-1)
// - analysisDays 缺省/<=0 按 30，>90 按 90；periodType 被忽略
// - 趋势只返回有日表行的日期，前端需补 0
// 因此「与顶栏一致」必须由前端算好末日与天数，不能依赖服务端按周期推导。

export const MAX_ANALYSIS_DAYS = 90

// 抽屉周期模式：7 / 30 / 与顶栏一致
export const ANALYSIS_RANGE_OPTIONS = [
  { value: '7', label: '近 7 日' },
  { value: '30', label: '近 30 日' },
  { value: 'PERIOD', label: '与顶栏一致' }
]

function pad(n) {
  return n < 10 ? '0' + n : '' + n
}

// 本地日期 → 'yyyy-MM-dd'
export function formatDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 'yyyy-MM-dd' → 本地 00:00 的 Date；非法返回 null
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

// 顶栏周期天数（含末日）：TODAY=1；WEEK=周一～末日；MONTH=1 日～末日
export function periodDays(periodType, end) {
  if (periodType === 'WEEK') {
    const dow = end.getDay() === 0 ? 7 : end.getDay() // 周一=1 … 周日=7
    return dow
  }
  if (periodType === 'MONTH') return end.getDate()
  return 1
}

/**
 * 计算分析窗口。
 * @param {string} mode '7' | '30' | 'PERIOD'
 * @param {string} periodType 顶栏周期 TODAY / WEEK / MONTH
 * @param {Date} [today] 注入「今天」便于测试
 * @param {string} [anchorDate] 期末日（yyyy-MM-dd）；晚于今天夹取到今天，缺省今天
 * @returns {{analysisDays:number, statDate:string, startDate:string, endDate:string}}
 */
export function buildAnalysisWindow(mode, periodType, today, anchorDate) {
  const now = startOfDay(today || new Date())
  let end = parseDate(anchorDate) || now
  if (end.getTime() > now.getTime()) end = now
  let days
  if (mode === 'PERIOD') days = periodDays(periodType, end)
  else days = Number(mode) === 7 ? 7 : 30
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
 * 服务端日期格式 yyyy-MM-dd；无法识别的行被丢弃。
 */
export function fillTrend(trend, win) {
  const byDate = {}
  ;(Array.isArray(trend) ? trend : []).forEach(p => {
    if (p && p.date) byDate[String(p.date).slice(0, 10)] = p
  })
  const end = parseDate(win.endDate)
  const rows = []
  for (let i = win.analysisDays - 1; i >= 0; i--) {
    const date = formatDate(addDays(end, -i))
    const p = byDate[date]
    rows.push({
      date,
      issueCount: p && p.issueCount != null ? p.issueCount : 0,
      redeemCount: p && p.redeemCount != null ? p.redeemCount : 0,
      discountCost: p && p.discountCost != null ? p.discountCost : 0,
      activityOrderKwh: p && p.activityOrderKwh != null ? p.activityOrderKwh : 0
    })
  }
  return rows
}

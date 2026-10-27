// 工作台各块标题旁统一元信息：统计周期 ｜ 统计区间 ｜ 同步

export const PERIOD_LABEL = { TODAY: '今日', WEEK: '本周', MONTH: '本月' }
export const NA = '—'

/** 各块「同步」固定文案（与日表 / 实时口径一致） */
export const SYNC = {
  WORKBENCH_DAY: '约每15分钟同步',
  REALTIME: '实时',
  CHARGE_USER: '约每15分钟同步',
  ALERT: '读工作台日表（约每15分钟）',
  FINANCE: '日账单T+1出账；结算看快照',
  MARKETING: '约每15分钟同步',
  STATION_TOP: '电量约每15分钟；终端数/功率实时'
}

/**
 * @param {string} periodType TODAY|WEEK|MONTH|…
 * @param {{ followsPeriod?: boolean }} [opt]
 */
export function formatPeriodLabel(periodType, opt) {
  if (opt && opt.followsPeriod === false) return NA
  const t = periodType == null || periodType === '' ? 'TODAY' : String(periodType).toUpperCase()
  return PERIOD_LABEL[t] || (t === 'CUSTOM' ? '自定义' : t)
}

/** 单日只显示一天；起止皆空 → — */
export function formatRange(start, end) {
  if ((start == null || start === '') && (end == null || end === '')) return NA
  const s = start || end
  const e = end || start
  return s === e ? String(s) : `${s} ~ ${e}`
}

/**
 * @returns {{ period: string, range: string, sync: string, dataAsOf: string, title: string }}
 */
export function buildBlockMeta({
  periodType,
  periodStart,
  periodEnd,
  sync,
  followsPeriod = true,
  dataAsOf
} = {}) {
  const period = formatPeriodLabel(periodType, { followsPeriod })
  const range = followsPeriod ? formatRange(periodStart, periodEnd) : NA
  const syncText = sync || NA
  const asOf = dataAsOf ? String(dataAsOf) : ''
  return {
    period,
    range,
    sync: syncText,
    dataAsOf: asOf,
    title: asOf ? `最近刷新：${asOf}` : ''
  }
}

// 工作台各块标题旁统一元信息：统计日/周期 ｜ 统计区间 ｜ 同步

export const PERIOD_LABEL = {
  TODAY: '今日',
  YESTERDAY: '昨日',
  WEEK: '本周',
  MONTH: '本月'
}
export const NA = '—'

/** 各块「同步」悬停文案（面向运营，避免表名/字段名） */
export const SYNC = {
  WORKBENCH_DAY: '约每15分钟更新',
  CHARGE_DAY: '约每15分钟更新',
  REALTIME: '实时',
  CHARGE_USER: '约每15分钟更新',
  ALERT: '约每15分钟更新（按昨日已结清数据判定）',
  FINANCE: '约每15分钟更新',
  MARKETING: '约每15分钟更新',
  STATION_TOP: '约每15分钟更新'
}

/**
 * @param {string} periodType TODAY|YESTERDAY|WEEK|MONTH|…
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

/** 标题旁默认展示的短同步标签 */
export function formatSyncShort(sync) {
  if (!sync || sync === NA) return NA
  if (sync === SYNC.REALTIME) return '实时'
  if (sync === SYNC.FINANCE) return '15分钟'
  if (sync === SYNC.ALERT) return '15分钟'
  if (sync.indexOf('15') >= 0) return '15分钟'
  return sync
}

/** 悬停完整三要素（+ 可选最近刷新） */
export function formatMetaHover(meta) {
  if (!meta) return ''
  const line = `统计日 ${meta.period} ｜ 统计区间 ${meta.range} ｜ 同步 ${meta.sync}`
  return meta.dataAsOf ? `${line}\n最近刷新：${meta.dataAsOf}` : line
}

/**
 * @returns {{ period, range, sync, syncShort, dataAsOf, title, hoverTitle }}
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
  const meta = {
    period,
    range,
    sync: syncText,
    syncShort: formatSyncShort(syncText),
    dataAsOf: asOf,
    title: asOf ? `最近刷新：${asOf}` : ''
  }
  meta.hoverTitle = formatMetaHover(meta)
  return meta
}

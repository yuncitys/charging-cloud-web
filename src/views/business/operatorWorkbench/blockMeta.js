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

/** 标题旁默认展示的短同步标签 */
export function formatSyncShort(sync) {
  if (!sync || sync === NA) return NA
  if (sync === SYNC.REALTIME) return '实时'
  if (sync === SYNC.FINANCE) return 'T+1出账'
  if (sync === SYNC.STATION_TOP) return '15分钟·部分实时'
  if (sync === SYNC.ALERT) return '15分钟'
  if (sync.indexOf('15') >= 0) return '15分钟'
  return sync
}

/** 悬停完整三要素（+ 可选最近刷新） */
export function formatMetaHover(meta) {
  if (!meta) return ''
  const line = `统计周期 ${meta.period} ｜ 统计区间 ${meta.range} ｜ 同步 ${meta.sync}`
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

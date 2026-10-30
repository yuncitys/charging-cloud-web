/* eslint-env jest */
import {
  NA,
  SYNC,
  formatPeriodLabel,
  formatRange,
  formatSyncShort,
  formatMetaHover,
  buildBlockMeta
} from '@/views/business/operatorWorkbench/blockMeta'

describe('blockMeta', () => {
  it('formatPeriodLabel maps day/period labels and NA when not following', () => {
    expect(formatPeriodLabel('TODAY')).toBe('今日')
    expect(formatPeriodLabel('YESTERDAY')).toBe('昨日')
    expect(formatPeriodLabel('WEEK')).toBe('本周')
    expect(formatPeriodLabel('MONTH')).toBe('本月')
    expect(formatPeriodLabel(null)).toBe('今日')
    expect(formatPeriodLabel('TODAY', { followsPeriod: false })).toBe(NA)
  })

  it('formatRange collapses single day and empty to NA', () => {
    expect(formatRange('2026-10-27', '2026-10-27')).toBe('2026-10-27')
    expect(formatRange('2026-10-01', '2026-10-27')).toBe('2026-10-01 ~ 2026-10-27')
    expect(formatRange(null, null)).toBe(NA)
    expect(formatRange('2026-10-27', null)).toBe('2026-10-27')
  })

  it('buildBlockMeta assembles three fields and optional dataAsOf title', () => {
    const m = buildBlockMeta({
      periodType: 'WEEK',
      periodStart: '2026-10-26',
      periodEnd: '2026-10-28',
      sync: SYNC.MARKETING,
      dataAsOf: '2026-10-28 12:00:00'
    })
    expect(m.period).toBe('本周')
    expect(m.range).toBe('2026-10-26 ~ 2026-10-28')
    expect(m.sync).toBe(SYNC.MARKETING)
    expect(m.title).toContain('最近刷新')
  })

  it('realtime block ignores period range', () => {
    const m = buildBlockMeta({
      periodType: 'TODAY',
      periodStart: '2026-10-28',
      periodEnd: '2026-10-28',
      sync: SYNC.REALTIME,
      followsPeriod: false
    })
    expect(m.period).toBe(NA)
    expect(m.range).toBe(NA)
    expect(m.sync).toBe(SYNC.REALTIME)
  })

  it('formatSyncShort and hoverTitle keep compact head readable', () => {
    expect(formatSyncShort(SYNC.WORKBENCH_DAY)).toBe('15分钟')
    expect(formatSyncShort(SYNC.REALTIME)).toBe('实时')
    expect(formatSyncShort(SYNC.STATION_TOP)).toBe('15分钟')
    expect(formatSyncShort(SYNC.CHARGE_DAY)).toBe('15分钟')
    expect(formatSyncShort(SYNC.FINANCE)).toBe('15分钟')
    expect(SYNC.STATION_TOP).toContain('15分钟')
    expect(SYNC.FINANCE).toContain('15分钟')
    const m = buildBlockMeta({
      periodType: 'TODAY',
      periodStart: '2026-10-28',
      periodEnd: '2026-10-28',
      sync: SYNC.MARKETING,
      dataAsOf: '12:00'
    })
    expect(m.syncShort).toBe('15分钟')
    expect(formatMetaHover(m)).toContain('统计日')
    expect(m.hoverTitle).toContain('最近刷新')
  })
})

/* eslint-env jest */
import { buildAnalysisWindow, fillTrend, formatDate, parseDate, ANALYSIS_RANGE_OPTIONS } from '@/views/business/operatorWorkbench/marketingAnalysis'

const TUE = new Date(2026, 9, 27, 15, 30)

describe('marketingAnalysis window', () => {
  it('only offers 7 / 30 day options', () => {
    expect(ANALYSIS_RANGE_OPTIONS.map(o => o.value)).toEqual(['7', '30'])
    expect(ANALYSIS_RANGE_OPTIONS.some(o => o.label.includes('顶栏'))).toBe(false)
  })

  it('7 / 30 day modes end today', () => {
    expect(buildAnalysisWindow('7', 'MONTH', TUE)).toEqual({
      analysisDays: 7, statDate: '2026-10-27', startDate: '2026-10-21', endDate: '2026-10-27'
    })
    const w30 = buildAnalysisWindow('30', 'TODAY', TUE)
    expect(w30.analysisDays).toBe(30)
    expect(w30.startDate).toBe('2026-09-28')
  })

  it('unknown mode defaults to 30 days', () => {
    expect(buildAnalysisWindow('PERIOD', 'WEEK', TUE).analysisDays).toBe(30)
  })

  it('clamps a future anchor date to today', () => {
    const w = buildAnalysisWindow('30', 'MONTH', TUE, '2026-10-31')
    expect(w.statDate).toBe('2026-10-27')
    expect(w.analysisDays).toBe(30)
    expect(w.startDate).toBe('2026-09-28')
  })

  it('formats and parses local dates', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(parseDate('bad')).toBeNull()
    expect(formatDate(parseDate('2026-02-28'))).toBe('2026-02-28')
  })
})

describe('marketingAnalysis fillTrend', () => {
  it('fills missing days with 0, ascending, keeps existing rows', () => {
    const win = buildAnalysisWindow('7', 'TODAY', TUE)
    const rows = fillTrend([
      { date: '2026-10-23', issueCount: 5, redeemCount: 2, discountCost: 3.5, activityOrderKwh: 12.3456 }
    ], win)
    expect(rows).toHaveLength(7)
    expect(rows[0].date).toBe('2026-10-21')
    expect(rows[6].date).toBe('2026-10-27')
    expect(rows[2]).toEqual({ date: '2026-10-23', issueCount: 5, redeemCount: 2, discountCost: 3.5, activityOrderKwh: 12.3456 })
    expect(rows[0]).toEqual({ date: '2026-10-21', issueCount: 0, redeemCount: 0, discountCost: 0, activityOrderKwh: 0 })
  })

  it('handles empty / null trend', () => {
    const win = buildAnalysisWindow('7', 'TODAY', TUE)
    expect(fillTrend(null, win)).toHaveLength(7)
    expect(fillTrend([], win)[0].issueCount).toBe(0)
  })
})

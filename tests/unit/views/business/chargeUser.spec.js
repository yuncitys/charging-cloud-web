/* eslint-env jest */
import {
  newUserPercent,
  ringStyle,
  CHARGE_USER_TIP,
  CHARGE_USER_ANALYSIS_NOTE,
  CHARGE_USER_STATION_TOP_NOTE
} from '@/views/business/operatorWorkbench/chargeUser'

describe('chargeUser helpers', () => {
  it('newUserPercent handles zero denominator, clamp and rounding', () => {
    expect(newUserPercent(5, 0)).toBe(0)
    expect(newUserPercent(null, 10)).toBe(0)
    expect(newUserPercent(0, 10)).toBe(0)
    expect(newUserPercent(1, 3)).toBe(33.3)
    expect(newUserPercent(12, 10)).toBe(100)
    expect(newUserPercent('x', 10)).toBe(0)
  })

  it('ringStyle builds conic-gradient and clamps percent', () => {
    expect(ringStyle(25, '#111', '#eee').background).toBe('conic-gradient(#111 0 25%, #eee 25% 100%)')
    expect(ringStyle(0).background).toContain('0%')
    expect(ringStyle(150).background).toContain('100%')
    expect(ringStyle(-5).background).toContain('0 0%')
  })

  it('tip mentions start-day calibre and 15-min sync', () => {
    expect(CHARGE_USER_TIP).toContain('手机号')
    expect(CHARGE_USER_TIP).toContain('C 端')
    expect(CHARGE_USER_TIP).toContain('开始时间')
    expect(CHARGE_USER_TIP).toContain('进行中')
    expect(CHARGE_USER_TIP).toContain('15 分钟')
  })

  it('period counts are explained as daily-dedup sums (not live range distinct)', () => {
    expect(CHARGE_USER_TIP).toContain('各日去重之和')
    expect(CHARGE_USER_TIP).toContain('重复')
    expect(CHARGE_USER_ANALYSIS_NOTE).toContain('各日去重之和')
    expect(CHARGE_USER_ANALYSIS_NOTE).not.toContain('订单侧区间去重')
    expect(CHARGE_USER_STATION_TOP_NOTE).toContain('各日去重之和')
  })
})

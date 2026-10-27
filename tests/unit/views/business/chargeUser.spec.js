/* eslint-env jest */
import { newUserPercent, ringStyle, CHARGE_USER_TIP } from '@/views/business/operatorWorkbench/chargeUser'

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

  it('tip mentions the competitor calibre', () => {
    expect(CHARGE_USER_TIP).toContain('手机号')
    expect(CHARGE_USER_TIP).toContain('C 端')
  })
})

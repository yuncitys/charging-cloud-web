/* eslint-env jest */
import { buildOverviewRange } from '@/views/business/businessOverviewRange'

describe('businessOverviewRange', () => {
  const now = new Date(2026, 9, 29)

  it('builds inclusive 7 and 30 day ranges', () => {
    expect(buildOverviewRange('7d', now)).toEqual({
      timeType: 3,
      startDate: '2026-10-23',
      endDate: '2026-10-29'
    })
    expect(buildOverviewRange('30d', now)).toEqual({
      timeType: 3,
      startDate: '2026-09-30',
      endDate: '2026-10-29'
    })
  })

  it('builds an inclusive 12 month range', () => {
    expect(buildOverviewRange('12m', now)).toEqual({
      timeType: 2,
      startDate: '2025-11',
      endDate: '2026-10'
    })
  })
})

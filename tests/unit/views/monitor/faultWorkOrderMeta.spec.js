/* eslint-env jest */
import { orderDurationMs, isOverdue, formatDuration, OVERDUE_HOURS } from '@/views/monitor/faultWorkOrderMeta'

const HOUR = 3600 * 1000
const now = new Date('2026/10/02 12:00:00').getTime()

describe('faultWorkOrderMeta', () => {
  it('uses fixed thresholds', () => {
    expect(OVERDUE_HOURS).toEqual({ OPEN: 2, IN_PROGRESS: 24 })
  })

  it('measures open orders until now and finished orders until closedAt', () => {
    expect(orderDurationMs({ status: 'OPEN', openedAt: '2026-10-02 11:00:00' }, now)).toBe(HOUR)
    expect(orderDurationMs({ status: 'CLOSED', openedAt: '2026-10-02 08:00:00', closedAt: '2026-10-02 09:30:00' }, now)).toBe(1.5 * HOUR)
    expect(orderDurationMs({ status: 'OPEN' }, now)).toBeNull()
  })

  it('flags overdue only for active orders past threshold', () => {
    expect(isOverdue({ status: 'OPEN', openedAt: '2026-10-02 09:59:00' }, now)).toBe(true)
    expect(isOverdue({ status: 'OPEN', openedAt: '2026-10-02 10:30:00' }, now)).toBe(false)
    expect(isOverdue({ status: 'IN_PROGRESS', openedAt: '2026-10-01 11:00:00' }, now)).toBe(true)
    expect(isOverdue({ status: 'IN_PROGRESS', openedAt: '2026-10-01 13:00:00' }, now)).toBe(false)
    expect(isOverdue({ status: 'CLOSED', openedAt: '2026-09-01 00:00:00', closedAt: '2026-09-05 00:00:00' }, now)).toBe(false)
  })

  it('formats durations', () => {
    expect(formatDuration(null)).toBe('-')
    expect(formatDuration(5 * 60000)).toBe('5分')
    expect(formatDuration(HOUR + 5 * 60000)).toBe('1小时5分')
    expect(formatDuration(26 * HOUR)).toBe('1天2小时')
  })
})

/* eslint-env jest */
import { collectAllowedHrefs, isPathAllowed } from '@/router/routePermission'

describe('routePermission public paths', () => {
  it('message center is accessible without a menu grant', () => {
    expect(isPathAllowed('/message/list', new Set(['/device/faultWorkOrders']))).toBe(true)
    expect(collectAllowedHrefs([]).has('/message/list')).toBe(true)
  })

  it('other paths still require a grant', () => {
    expect(isPathAllowed('/device/faultWorkOrders', new Set(['/dashboard']))).toBe(false)
    expect(isPathAllowed('/device/faultWorkOrders', new Set(['/device/faultWorkOrders']))).toBe(true)
  })
})

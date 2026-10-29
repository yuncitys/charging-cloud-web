// 机构统计四页共用的度量列定义（与后端 ChargeMetricVo / OrgCompareMetric 字段一致）
// digits: 展示小数位；minWidth: 表格列宽
export const ORG_METRICS = [
  { key: 'totalDegree', label: '电量(度)', digits: 4, minWidth: 110, group: '充电概况' },
  { key: 'totalDuration', label: '充电时长(分钟)', digits: 0, minWidth: 130, group: '充电概况' },
  { key: 'totalOrderCount', label: '充电次数', digits: 0, minWidth: 100, group: '充电概况' },
  { key: 'totalStandardChargeFee', label: '电费(元)', digits: 4, minWidth: 110, group: '原价费用' },
  { key: 'totalStandardServiceFee', label: '服务费(元)', digits: 4, minWidth: 110, group: '原价费用' },
  { key: 'orderTotalAmount', label: '订单总金额(元)', digits: 2, minWidth: 130, group: '原价费用' },
  { key: 'operatorCouponDiscountAmount', label: '运营商优惠券抵扣(元)', digits: 2, minWidth: 170, group: '优惠抵扣' },
  { key: 'operatorStationActivityDiscountAmount', label: '运营商电站活动抵扣(元)', digits: 2, minWidth: 180, group: '优惠抵扣' },
  { key: 'platformCouponDiscountAmount', label: '平台优惠券抵扣(元)', digits: 2, minWidth: 160, group: '优惠抵扣' },
  { key: 'platformStationActivityDiscountAmount', label: '平台电站活动抵扣(元)', digits: 2, minWidth: 170, group: '优惠抵扣' },
  { key: 'userActualElectricityAmount', label: '用户实付电费(元)', digits: 2, minWidth: 140, group: '用户实付' },
  { key: 'userActualServiceAmount', label: '用户实付服务费(元)', digits: 2, minWidth: 150, group: '用户实付' },
  { key: 'userActualPayAmount', label: '用户实付总金额(元)', digits: 2, minWidth: 150, group: '用户实付' }
]

/** 按父标题分组（顺序固定）；excludeKeys 可剔除比对页特有列等 */
export function groupOrgMetrics(metrics, excludeKeys) {
  const skip = excludeKeys || []
  const order = ['充电概况', '原价费用', '优惠抵扣', '用户实付']
  const map = {}
  ;(metrics || []).forEach(m => {
    if (skip.indexOf(m.key) >= 0) return
    const g = m.group || '其它'
    if (!map[g]) map[g] = []
    map[g].push(m)
  })
  return order.filter(g => map[g] && map[g].length).map(g => ({ label: g, metrics: map[g] }))
}

// 比对页可选度量：在上面基础上增加「运营商户实收」（仅机构日表有）
export const ORG_COMPARE_METRICS = ORG_METRICS.concat([
  { key: 'operatorActualIncome', label: '运营商户实收(元)', digits: 2, minWidth: 140 }
])

// 顶部合计卡片展示的度量
export const ORG_SUMMARY_KEYS = [
  'totalOrderCount', 'totalDegree', 'totalDuration', 'orderTotalAmount', 'userActualPayAmount',
  'totalStandardChargeFee', 'totalStandardServiceFee'
]

export function formatNumber(value, fractionDigits = 0) {
  if (value === null || value === undefined || value === '') return '-'
  const num = Number(value)
  if (Number.isNaN(num)) return value
  const parts = num.toFixed(fractionDigits).split('.')
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts[1] ? `${intPart}.${parts[1]}` : intPart
}

export function fmtDate(date) {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

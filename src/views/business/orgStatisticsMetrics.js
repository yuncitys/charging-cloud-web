// 机构统计四页共用的度量列定义（与后端 ChargeMetricVo / OrgCompareMetric 字段一致）
// digits: 展示小数位；minWidth: 表格列宽
export const ORG_METRICS = [
  { key: 'totalDegree', label: '电量(度)', digits: 4, minWidth: 110 },
  { key: 'totalDuration', label: '充电时长(分钟)', digits: 0, minWidth: 130 },
  { key: 'totalOrderCount', label: '充电次数', digits: 0, minWidth: 100 },
  { key: 'totalStandardChargeFee', label: '电费(元)', digits: 4, minWidth: 110 },
  { key: 'totalStandardServiceFee', label: '服务费(元)', digits: 4, minWidth: 110 },
  { key: 'orderTotalAmount', label: '订单总金额(元)', digits: 2, minWidth: 130 },
  { key: 'operatorCouponDiscountAmount', label: '运营商优惠券抵扣(元)', digits: 2, minWidth: 170 },
  { key: 'operatorStationActivityDiscountAmount', label: '运营商电站活动抵扣(元)', digits: 2, minWidth: 180 },
  { key: 'platformCouponDiscountAmount', label: '平台优惠券抵扣(元)', digits: 2, minWidth: 160 },
  { key: 'platformStationActivityDiscountAmount', label: '平台电站活动抵扣(元)', digits: 2, minWidth: 170 },
  { key: 'userActualElectricityAmount', label: '用户实付电费(元)', digits: 2, minWidth: 140 },
  { key: 'userActualServiceAmount', label: '用户实付服务费(元)', digits: 2, minWidth: 150 },
  { key: 'userActualPayAmount', label: '用户实付总金额(元)', digits: 2, minWidth: 150 }
]

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

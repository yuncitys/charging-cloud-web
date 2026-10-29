/**
 * 统计口径说明（运营商视角大白话）——仅用于弹层展示。
 * 开发对账口径见 charging-cloud/docs/superpowers/specs/2026-10-29-stats-pages-ux-polish-design.md §3.3
 */

export const CALIBER_INTRO =
  '以下数字按充电结束当天汇总，只统计已经结束的订单。金额单位元，电量单位度。'

const F = {
  date: { label: '日期 / 时间', desc: '按充电结束的那天（或那个小时）归到哪一天/哪一小时；不是开始充电的时间。' },
  station: { label: '电站 / 设备 / 枪', desc: '电是在哪座站、哪台桩、哪把枪上充的。' },
  orgName: { label: '机构名称', desc: '这笔充电归属的机构/企业客户（谁名下的用户在充）。' },
  userAccount: { label: '用户账号', desc: '实际发起充电的那个用户。' },
  totalDegree: { label: '电量(度)', desc: '这段时间一共充了多少电。' },
  durationHours: {
    label: '充电时长',
    desc: '枪真正在充的时长合计。列表若标「分钟」按分钟看；顶部卡片换成「小时」是同一时长换算，方便扫一眼。'
  },
  totalOrderCount: { label: '充电次数', desc: '完成了多少笔充电订单（一笔算一次）。' },
  totalStandardChargeFee: { label: '电费(元)', desc: '按价费规则算出来的电费原价合计（还没扣券、没扣活动前）。' },
  totalStandardServiceFee: { label: '服务费(元)', desc: '按价费规则算出来的服务费原价合计（扣优惠前）。' },
  orderTotalAmount: { label: '订单总金额(元)', desc: '电费+服务费等算下来，订单上的应付总额（优惠前视角的订单金额）。' },
  operatorCoupon: { label: '运营商优惠券抵扣(元)', desc: '你们自己发的优惠券帮用户减免了多少（电费+服务费一起算进这笔抵扣）。' },
  operatorActivity: { label: '运营商电站活动抵扣(元)', desc: '你们电站搞的活动（如站点折扣）帮用户减免了多少。' },
  platformCoupon: { label: '平台优惠券抵扣(元)', desc: '平台发的优惠券帮用户减免了多少（不是你们出钱的那部分券）。' },
  platformActivity: { label: '平台电站活动抵扣(元)', desc: '平台侧的电站活动帮用户减免了多少。' },
  userElec: { label: '用户实付电费(元)', desc: '用户为「电」实际掏的钱（扣完相关优惠之后）。' },
  userSvc: { label: '用户实付服务费(元)', desc: '用户为「服务费」实际掏的钱（扣完相关优惠之后）。' },
  userPay: { label: '用户实付合计(元)', desc: '用户这单（或这段汇总里）一共实付多少钱。' },
  actualPrice: { label: '应收金额(元)', desc: '订单应付总额合计（优惠前视角，和「订单总金额」同一类口径）。' },
  realityPay: { label: '实收金额(元)', desc: '用户实际付出去的钱合计（扣完券和活动之后）。' },
  fundIncome: { label: '充电总收益(元)', desc: '金额明细里按支付方式加总的订单金额（各支付列之和）。' },
  fundPayCols: {
    label: '各支付方式金额',
    desc: '余额/微信/支付分/刷卡/投币/支付宝/月卡：按订单支付方式拆开的金额；只展示有同步数据的站×日。'
  },
  gunDailyAvgDegree: { label: '枪日均电量(度)', desc: '区间总电量÷区间日历天数÷运营枪数；没有运营枪数时显示 --。' },
  operatorIncome: { label: '运营商户实收(元)', desc: '落到你们商户口袋里的收入（以本表统计口径为准）。' },
  compareMetric: { label: '比对内容', desc: '一次只比一个指标（例如只比电量，或只比实付）；表里每个日期格子就是该机构当天这个指标的数。' },
  compareTotalRow: { label: '总计（首行）', desc: '当天所有机构该指标加总，方便和某一家机构对照。' },
  compareRowSum: { label: '合计（右侧）', desc: '这一行机构在所选日期范围内，该指标的加总。' }
}

const METRIC_FIELDS = [
  F.totalDegree, F.durationHours, F.totalOrderCount,
  F.totalStandardChargeFee, F.totalStandardServiceFee, F.orderTotalAmount,
  F.operatorCoupon, F.operatorActivity, F.platformCoupon, F.platformActivity,
  F.userElec, F.userSvc, F.userPay
]

const PAGE_HINT = {
  gun: '按枪查看，方便找出哪把枪忙、哪把闲。',
  hour: '按小时看，可以看出一天里哪几个钟点更忙。',
  org: '按机构（或机构下用户）看贡献，方便对账和客户经营。',
  compare: '选好要比的指标后，横着看日期、竖着看机构，一眼对比谁贡献多。',
  station:
    '本页读日汇总同步表（不是实时扫订单）。明细按日×站，汇总按站把区间加总；金额明细按支付方式拆开。无同步数据的站/日不出现。',
  charge:
    '本页看整体充电走势（日或月）。度量来自日汇总同步表；可按商户筛选。切换「月」后时间列显示 yyyy-MM。',
  overview:
    '本页读站点日汇总同步表。金额=订单总金额，服务费=标价服务费。枪日均=区间总电量÷天数÷运营枪数。设备状态四率二期提供。',
  business:
    '本页按设备汇总，度量来自枪口日同步表（不是实时扫订单，也不看设备在线状态）。区间内无同步数据的设备不出现。'
}

export function caliberForPage(pageKey) {
  const hint = PAGE_HINT[pageKey] || ''
  let fields
  switch (pageKey) {
    case 'gun':
      fields = [F.date, F.station, ...METRIC_FIELDS]
      break
    case 'hour':
      fields = [F.date, ...METRIC_FIELDS]
      break
    case 'period':
      fields = [F.date, ...METRIC_FIELDS]
      break
    case 'org':
      fields = [F.orgName, ...METRIC_FIELDS]
      break
    case 'user':
      fields = [F.userAccount, F.orgName, ...METRIC_FIELDS]
      break
    case 'compare':
      fields = [F.compareMetric, F.orgName, F.date, F.compareTotalRow, F.compareRowSum, F.operatorIncome]
      break
    case 'station':
      fields = [
        F.date, F.station,
        F.totalOrderCount, F.durationHours, F.actualPrice, F.realityPay,
        F.totalStandardChargeFee, F.totalStandardServiceFee, F.totalDegree,
        F.operatorCoupon, F.operatorActivity, F.platformCoupon, F.platformActivity,
        F.userElec, F.userSvc, F.userPay,
        F.fundIncome, F.fundPayCols
      ]
      break
    case 'charge':
      fields = [
        F.date,
        F.totalOrderCount, F.durationHours, F.totalDegree,
        F.totalStandardChargeFee, F.totalStandardServiceFee, F.orderTotalAmount,
        F.operatorCoupon, F.operatorActivity, F.platformCoupon, F.platformActivity,
        F.userElec, F.userSvc, F.userPay, F.realityPay
      ]
      break
    case 'overview':
      fields = [
        F.date, F.station, F.totalDegree, F.totalOrderCount,
        F.orderTotalAmount, F.totalStandardServiceFee, F.gunDailyAvgDegree
      ]
      break
    case 'business':
      fields = [
        F.date, F.station,
        F.totalOrderCount, F.durationHours, F.actualPrice, F.realityPay,
        F.totalStandardChargeFee, F.totalStandardServiceFee, F.totalDegree,
        F.operatorCoupon, F.operatorActivity, F.platformCoupon, F.platformActivity,
        F.userElec, F.userSvc
      ]
      break
    default:
      fields = METRIC_FIELDS
  }
  return {
    intro: hint ? `${CALIBER_INTRO}${hint}` : CALIBER_INTRO,
    fields
  }
}

/** 顶部汇总卡：variant 对应渐变色块 */
export const SUMMARY_CARD_VARIANTS = [
  'service-count', 'duration', 'amount', 'electric', 'servicefee', 'power', 'electric', 'servicefee'
]

export function buildOrgSummaryCardItems(summary, formatNumber) {
  const s = summary || {}
  return [
    { variant: 'service-count', label: '充电次数(笔)', value: formatNumber(s.totalOrderCount, 0) },
    { variant: 'duration', label: '充电时长合计(h)', value: formatNumber((s.totalDuration || 0) / 60, 2) },
    { variant: 'amount', label: '订单总金额(元)', value: formatNumber(s.orderTotalAmount, 2) },
    { variant: 'electric', label: '用户实付合计(元)', value: formatNumber(s.userActualPayAmount, 2) },
    { variant: 'power', label: '总使用电量(度)', value: formatNumber(s.totalDegree, 4) },
    { variant: 'electric', label: '总电费(元)', value: formatNumber(s.totalStandardChargeFee, 4) },
    { variant: 'servicefee', label: '总服务费(元)', value: formatNumber(s.totalStandardServiceFee, 4) }
  ]
}

export function buildGunSummaryCardItems(summary, formatNumber) {
  return buildOrgSummaryCardItems(summary, formatNumber)
}

export function sumHourListToSummary(list) {
  const zero = {
    totalOrderCount: 0,
    totalDuration: 0,
    orderTotalAmount: 0,
    userActualPayAmount: 0,
    totalDegree: 0,
    totalStandardChargeFee: 0,
    totalStandardServiceFee: 0
  }
  return (list || []).reduce((acc, row) => {
    acc.totalOrderCount += Number(row.totalOrderCount || 0)
    acc.totalDuration += Number(row.totalDuration || 0)
    acc.orderTotalAmount += Number(row.orderTotalAmount || 0)
    acc.userActualPayAmount += Number(row.userActualPayAmount || 0)
    acc.totalDegree += Number(row.totalDegree || 0)
    acc.totalStandardChargeFee += Number(row.totalStandardChargeFee || 0)
    acc.totalStandardServiceFee += Number(row.totalStandardServiceFee || 0)
    return acc
  }, zero)
}

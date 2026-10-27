// 工作台「充电用户」块 / 「用户分析」抽屉：口径文案与环图计算（纯函数，便于单测）
//
// 服务端口径（POST /operatorWorkbench/chargeUsers、/chargeUserAnalysis）：
// - chargeUsers：随顶栏周期，末日可含今天；TODAY = 今日单日；副文案 subHint 由服务端给出
// - chargeUserAnalysis：不识别 periodType；昨日对照卡仍为昨日；本月/趋势末日可含今天
// - 口径：读充电用户日表（约每 15 分钟同步）；按开始时间归天；order_status IN (1,2,3)；
//   周 / 月 = 日表人数求和（各日去重之和，跨日同一人可能重复计）

export const CHARGE_USER_TIP =
  '按订单开始时间归天（无开始时间则用创建时间）；同一手机号计 1 人（无手机号回退用户 ID）；仅统计 C 端用户，排除客户机构、内部及互联互通账号。' +
  '计入进行中、已完成、待结算订单。单日：充电用户 = 当日至少有 1 笔符合条件订单的去重人数；新增 = 在当前筛选范围内首次符合条件订单落在当日的人数。' +
  '周 / 月为各日去重之和，跨日同一人可能重复计；新增为各日新增之和。' +
  '今日随约每 15 分钟同步更新（含盘中进行中订单），与财务日账单口径独立。'

export const CHARGE_USER_ANALYSIS_NOTE =
  '趋势为「每日人数」；本月为各日去重之和，跨日同一人可能重复计，不等于本月严格去重人数。' +
  '统计范围继承顶栏商户 / 业态 / 站点筛选；今日数据约每 15 分钟同步。'

export const CHARGE_USER_STATION_TOP_NOTE = '站维日表各日去重之和：同一用户跨日、或在多个站点充电，会重复计入，故各站人数之和可能大于本月充电用户数。'

/**
 * 环图占比（新增 / 充电用户，0~100，保留 1 位小数）。
 * 分母 0 / 非法 → 0；分子大于分母时夹取到 100。
 */
export function newUserPercent(newCount, total) {
  const t = Number(total)
  const n = Number(newCount)
  if (!t || isNaN(t) || t <= 0 || isNaN(n) || n <= 0) return 0
  return Math.min(100, Math.round(n / t * 1000) / 10)
}

/** 环图 CSS：conic-gradient；0% 时仅显示底环 */
export function ringStyle(percent, color, track) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0))
  const c = color || '#409eff'
  const t = track || '#ebeef5'
  return { background: `conic-gradient(${c} 0 ${p}%, ${t} ${p}% 100%)` }
}

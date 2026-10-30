// 工作台「充电用户」块 / 「用户分析」抽屉：口径文案与环图计算（纯函数，便于单测）

/** 卡片问号：面向运营人员的短说明 */
export const CHARGE_USER_TIP =
  '切换「今 / 昨」查看当天数据。' +
  '充电用户：当天有过充电的人数（同一手机号只算 1 人）。' +
  '新增：当天第一次来充电的人数。' +
  '今日数据大约每 15 分钟更新一次。'

export const CHARGE_USER_ANALYSIS_NOTE =
  '左侧是昨日人数，右侧是本月累计（按天相加，同一人多天充电会重复计）。' +
  '下面趋势是每天有多少人充电，不是累计总数。今日数据大约每 15 分钟更新。'

export const CHARGE_USER_STATION_TOP_NOTE =
  '本月各站人数按天相加。同一人多天充电、或到多个站充电，都会重复计入，所以各站相加可能大于本月总人数。'

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

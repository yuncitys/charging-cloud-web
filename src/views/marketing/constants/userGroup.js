import { formatDictLabel, getSelectorOptions } from '@/utils/dictionary'

export const DICT_USER_GROUP_DIMENSION = 'marketing_user_group_dimension'
export const DICT_USER_GROUP_DATA_DIMENSION = 'marketing_user_group_data_dimension'
export const DICT_USER_GROUP_STATION_DIMENSION = 'marketing_user_group_station_dimension'

/** 条件单位/文案提示（非纯展示标签，保留本地） */
export const DATA_DIMENSION_META = {
  '0': { unit: '度', placeholder: '最小度数', hint: '单位：度（kWh）。示例：统计时间内累计充电量 100—500 度之间的用户将被纳入分组。' },
  '1': { unit: '次', placeholder: '最小次数', hint: '单位：次。示例：统计时间内充电 3—10 次的用户将被纳入分组。' },
  '2': { unit: '元', placeholder: '最小金额', hint: '单位：元。示例：统计时间内充电消费 100—1000 元的用户将被纳入分组。' }
}

export function loadUserGroupDimensionOptions() {
  return getSelectorOptions(DICT_USER_GROUP_DIMENSION)
}

export function loadUserGroupDataDimensionOptions() {
  return getSelectorOptions(DICT_USER_GROUP_DATA_DIMENSION)
}

export function loadUserGroupStationDimensionOptions() {
  return getSelectorOptions(DICT_USER_GROUP_STATION_DIMENSION)
}

export function getUserGroupDimensionLabel(code) {
  if (code == null || code === '') return '—'
  const label = formatDictLabel(DICT_USER_GROUP_DIMENSION, code)
  return label === String(code) ? '—' : label
}

export function getUserGroupDataDimensionLabel(code) {
  if (code == null || code === '') return '—'
  const label = formatDictLabel(DICT_USER_GROUP_DATA_DIMENSION, code)
  return label === String(code) ? '—' : label
}

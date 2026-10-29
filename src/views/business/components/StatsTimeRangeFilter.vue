<template>
  <span class="stats-time-range-filter">
    <el-select
      v-if="!dayOnly"
      :value="timeType"
      class="filter-item"
      style="width: 100px; margin-right: 12px;"
      placeholder="时间维度"
      @change="onTimeTypeChange"
    >
      <el-option label="日" :value="3" />
      <el-option label="月" :value="2" />
    </el-select>
    <el-date-picker
      :value="dateRange"
      class="filter-item"
      style="margin-right: 20px;"
      range-separator="至"
      start-placeholder="开始"
      end-placeholder="结束"
      :type="pickerType"
      :format="dateFormat"
      :value-format="dateFormat"
      :clearable="false"
      @input="onRangeInput"
    />
  </span>
</template>

<script>
function pad(n) {
  return n.toString().padStart(2, '0')
}

function formatDay(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatMonth(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

/** 日=3 近 7 天；月=2 近 3 个月（含当月） */
export function defaultRangeForTimeType(timeType) {
  const end = new Date()
  if (timeType === 2) {
    const start = new Date(end.getFullYear(), end.getMonth() - 2, 1)
    return [formatMonth(start), formatMonth(end)]
  }
  const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000)
  return [formatDay(start), formatDay(end)]
}

/** 月界 → 经营报表 createTime 用的日时分秒 */
export function monthBoundsToDateTime(startYm, endYm) {
  const [ey, em] = endYm.split('-').map(Number)
  const start = `${startYm}-01 00:00:00`
  const last = new Date(ey, em, 0)
  const end = `${formatDay(last)} 23:59:59`
  return { start, end }
}

export function dayBoundsToDateTime(startDay, endDay) {
  return {
    start: `${startDay} 00:00:00`,
    end: `${endDay} 23:59:59`
  }
}

export default {
  name: 'StatsTimeRangeFilter',
  props: {
    timeType: { type: Number, default: 3 },
    start: { type: String, default: '' },
    end: { type: String, default: '' },
    /** 仅日范围（机构比对）：隐藏日/月切换，固定 daterange */
    dayOnly: { type: Boolean, default: false }
  },
  computed: {
    effectiveTimeType() {
      return this.dayOnly ? 3 : this.timeType
    },
    pickerType() {
      return this.effectiveTimeType === 2 ? 'monthrange' : 'daterange'
    },
    dateFormat() {
      return this.effectiveTimeType === 2 ? 'yyyy-MM' : 'yyyy-MM-dd'
    },
    dateRange() {
      if (this.start && this.end) return [this.start, this.end]
      return null
    }
  },
  methods: {
    emitChange(timeType, start, end) {
      const tt = this.dayOnly ? 3 : timeType
      this.$emit('change', { timeType: tt, start, end })
      this.$emit('update:timeType', tt)
      this.$emit('update:start', start)
      this.$emit('update:end', end)
    },
    onTimeTypeChange(val) {
      if (this.dayOnly) return
      const range = defaultRangeForTimeType(val)
      this.emitChange(val, range[0], range[1])
    },
    onRangeInput(val) {
      if (!val || val.length < 2) return
      this.emitChange(this.effectiveTimeType, val[0], val[1])
    }
  }
}
</script>

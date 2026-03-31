<template>
  <el-card class="chart-card" shadow="never">
    <div class="chart-head">
      <div class="chart-head-left">
        <span class="chart-title">{{ title }}</span>
        <p v-if="hint" class="chart-hint">{{ hint }}</p>
      </div>
      <span v-if="unit" class="chart-unit">单位：{{ unit }}</span>
    </div>
    <div v-show="hasData" ref="chartEl" class="chart-canvas" />
    <div v-show="!hasData" class="chart-empty">暂无曲线数据</div>
  </el-card>
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'

export default {
  name: 'OrderTrendChart',
  mixins: [resize],
  props: {
    title: {
      type: String,
      default: ''
    },
    unit: {
      type: String,
      default: ''
    },
    hint: {
      type: String,
      default: ''
    },
    times: {
      type: Array,
      default: () => []
    },
    /** [{ name, data: number[], color }] */
    seriesList: {
      type: Array,
      default: () => []
    },
    height: {
      type: String,
      default: '320px'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  computed: {
    hasData() {
      if (!this.times || !this.times.length) return false
      return (this.seriesList || []).some(s => {
        const arr = s.data || []
        return arr.some(v => v != null && !Number.isNaN(Number(v)))
      })
    }
  },
  watch: {
    times: {
      deep: true,
      handler() {
        this.$nextTick(() => this.updateChart())
      }
    },
    seriesList: {
      deep: true,
      handler() {
        this.$nextTick(() => this.updateChart())
      }
    }
  },
  mounted() {
    this.$nextTick(() => this.initChart())
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    initChart() {
      if (!this.$refs.chartEl || !this.hasData) return
      if (this.chart) {
        this.chart.dispose()
      }
      this.chart = echarts.init(this.$refs.chartEl, 'macarons')
      this.setOption()
    },
    updateChart() {
      if (!this.hasData) {
        if (this.chart) {
          this.chart.dispose()
          this.chart = null
        }
        return
      }
      if (!this.chart && this.$refs.chartEl) {
        this.chart = echarts.init(this.$refs.chartEl, 'macarons')
      }
      if (this.chart) {
        this.setOption()
      }
    },
    setOption() {
      if (!this.chart) return
      const colors = ['#70C6E8', '#3B82F6', '#52c41a', '#94a3b8', '#0ea5e9']
      const series = (this.seriesList || []).map((s, idx) => {
        const color = s.color || colors[idx % colors.length]
        return {
          name: s.name,
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'lttb',
          itemStyle: {
            color
          },
          lineStyle: {
            width: 2,
            color
          },
          areaStyle: {
            color,
            opacity: 0.12
          },
          data: (s.data || []).map(v => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v)))
        }
      })
      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' }
        },
        legend: {
          data: series.map(s => s.name),
          top: 0,
          left: 0
        },
        grid: {
          left: 48,
          right: 24,
          bottom: 48,
          top: series.length > 1 ? 56 : 40,
          containLabel: false
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.times,
          axisTick: { show: false }
        },
        yAxis: {
          type: 'value',
          axisTick: { show: false },
          splitLine: {
            lineStyle: { type: 'dashed', opacity: 0.35 }
          }
        },
        dataZoom: [
          { type: 'inside', start: 0, end: 100 },
          { type: 'slider', start: 0, end: 100, height: 18, bottom: 8 }
        ],
        series
      }, true)
      this.$nextTick(() => this.chart && this.chart.resize())
    }
  }
}
</script>

<style scoped>
.chart-card {
  margin-bottom: 16px;
}
.chart-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
.chart-head-left {
  flex: 1;
  padding-right: 12px;
}
.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.chart-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
.chart-unit {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}
.chart-canvas {
  width: 100%;
  height: 320px;
}
.chart-empty {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 13px;
}
</style>

<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons')
import resize from '@/views/business/components/mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler() {
        this.setOptions(this.chartData)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    },
    setOptions(raw = {}) {
      if (!this.chart) {
        return
      }
      const { datetime = [], income = [] } = raw || {}
      this.chart.setOption({
        xAxis: {
          data: datetime,
          boundaryGap: false,
          axisTick: {
            show: false
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: 'black'
            }
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 56,
          top: 36,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: false
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: 'black'
            }
          }
        },
        legend: {
          type: 'scroll',
          bottom: 0,
          data: ['结算金额（元）']
        },
        series: [{
          name: '结算金额（元）',
          smooth: true,
          type: 'line',
          data: income,
          animationDuration: 2800,
          animationEasing: 'quadraticOut',
          itemStyle: {
            normal: {
              color: '#409EFF',
              lineStyle: {
                color: '#409EFF',
                width: 2
              }
            }
          }
        }],
        dataZoom: [{
          type: 'slider',
          show: true,
          xAxisIndex: 0,
          start: 0,
          end: datetime.length > 14 ? 70 : 100,
          height: 20,
          bottom: 28
        }]
      })
    }
  }
}
</script>

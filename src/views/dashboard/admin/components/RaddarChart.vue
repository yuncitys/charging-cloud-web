<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
  import echarts from 'echarts'
  require('echarts/theme/macarons') // echarts theme
  import resize from './mixins/resize'

  const animationDuration = 3000

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
        default: '300px'
      },
      autoResize: {
        type: Boolean,
        default: true
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
        handler(val) {
          this.setOptions(val)
        }
      }
    },
    beforeDestroy() {
      if (!this.chart) {
        return
      }
      this.chart.dispose()
      this.chart = null
    },
    mounted() {
      this.$nextTick(() => {
        this.initChart()
      })
    },
    methods: {
      initChart() {
        this.chart = echarts.init(this.$el, 'macarons')
        this.setOptions(this.chartData)
      },
      formatPercent(rate) {
        const num = Number(rate) || 0
        return `${(num * 100).toFixed(2)}%`
      },
      setOptions({
        items = []
      } = {}) {
        const legendData = items.map(item => item.name)
        const dataMap = items.reduce((acc, item) => {
          acc[item.name] = item
          return acc
        }, {})
        const pieData = items.map(item => ({
          value: item.count,
          name: item.name,
          itemStyle: {
            color: item.color
          }
        }))
        this.chart.setOption({
          tooltip: {
            trigger: 'item',
            formatter: params => {
              const item = dataMap[params.name] || {}
              return `${params.name}<br/>订单总数：${item.count || 0}<br/>占比：${this.formatPercent(item.rate)}`
            }
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            data: legendData,
            formatter: name => {
              const item = dataMap[name] || {}
              return `${name}  ${item.count || 0}单  ${this.formatPercent(item.rate)}`
            }
          },
          series: [{
            name: '订单占比',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: pieData,
            animationDuration: 2600
          }]
        })
      },
    }
  }

</script>

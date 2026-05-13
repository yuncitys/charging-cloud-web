<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
  import echarts from 'echarts'
  require('echarts/theme/macarons') // echarts theme
  import resize from './mixins/resize'
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
      showLoading() {
        this.chart.showLoading()
      },
      hideLoading() {
        this.chart.hideLoading()
      },
      initChart() {
        this.chart = echarts.init(this.$el, 'macarons')
        this.setOptions(this.chartData)
      },
      lineSeries(name, data, color) {
        return {
          name,
          smooth: true,
          type: 'line',
          data: data || [],
          animationDuration: 2800,
          animationEasing: 'quadraticOut',
          itemStyle: {
            normal: {
              color,
              lineStyle: {
                color,
                width: 2
              }
            }
          }
        }
      },
      setOptions(raw = {}) {
        if (!this.chart) {
          return
        }
        const {
          totalPower = [],
          orderCount = [],
          datetime = [],
          actualPrice = [],
          realityPayMoney = [],
          electricityPrice = [],
          servicePrice = []
        } = raw || {}
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
            },
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
            },
          },
          legend: {
            type: 'scroll',
            bottom: 0,
            data: ['订单数（笔）', '总电量（度）', '应收金额（元）', '实收金额（元）', '电费（元）', '服务费（元）']
          },
          series: [
            this.lineSeries('订单数（笔）', orderCount, '#f73e42'),
            this.lineSeries('总电量（度）', totalPower, '#da8f0d'),
            this.lineSeries('应收金额（元）', actualPrice, '#07b161'),
            this.lineSeries('实收金额（元）', realityPayMoney, '#409EFF'),
            this.lineSeries('电费（元）', electricityPrice, '#f97316'),
            this.lineSeries('服务费（元）', servicePrice, '#14b8a6')
          ],
          dataZoom: [
            {
                type: 'slider',
                show: true,
                xAxisIndex: 0,
                start: 0,
                end: 70,
                height: 20,
                bottom: 28,
            },
          ],
        })
      }
    }
  }
</script>

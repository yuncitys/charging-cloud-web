<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
  import echarts from 'echarts'
  require('echarts/theme/macarons') // echarts theme
  import resize from './mixins/resize'

  const animationDuration = 6000

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
      setOptions({
        deviceCount,
        orderPrice,
        userCount,
        DAY
      } = {}) {
        this.chart.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
              type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          grid: {
            top: 10,
            left: '2%',
            right: '2%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [{
            type: 'category',
            data: DAY,
            axisTick: {
              alignWithLabel: true
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: 'black'
              }
            }
          }],
          yAxis: [{
            type: 'value',
            axisTick: {
              show: false
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: 'black'
              }
            }
          }],
          series: [{
            name: '用户量',
            type: 'bar',
            stack: 'vistors',
            barWidth: '60%',
            data: userCount,
            animationDuration
          }, {
            name: '设备数',
            type: 'bar',
            stack: 'vistors',
            barWidth: '60%',
            data: deviceCount,
            animationDuration
          }, {
            name: '交易额',
            type: 'bar',
            stack: 'vistors',
            barWidth: '60%',
            itemStyle: {
              normal: {
                color: '#08d374',
                lineStyle: {
                  color: '#08d374',
                  width: 2
                },
              }
            },
            data: orderPrice,
            animationDuration
          }]
        })
      },
    }
  }

</script>

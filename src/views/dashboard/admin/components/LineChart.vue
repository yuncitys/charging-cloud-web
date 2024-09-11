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
      setOptions({
        userCount,
        orderCount,
        orderPrice,
        DAY
      } = {}) {
        this.chart.setOption({
          xAxis: {
            data: DAY,
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
            bottom: 20,
            top: 30,
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
            data: ['用户数量', '订单总数', '订单总额']
          },
          series: [{
              name: '用户数量',
              itemStyle: {
                normal: {
                  color: '#da8f0d',
                  lineStyle: {
                    color: '#da8f0d',
                    width: 2
                  }
                }
              },
              smooth: true,
              type: 'line',
              data: userCount,
              animationDuration: 2800,
              animationEasing: 'cubicInOut'
            },
            {
              name: '订单总数',
              smooth: true,
              type: 'line',
              itemStyle: {
                normal: {
                  color: '#f73e42',
                  lineStyle: {
                    color: '#f73e42',
                    width: 2
                  },
                  //   areaStyle: {
                  //     color: '#f3f8ff'
                  //   }
                }
              },
              data: orderCount,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }, {
              name: '订单总额',
              smooth: true,
              type: 'line',
              itemStyle: {
                normal: {
                  color: '#07b161',
                  lineStyle: {
                    color: '#07b161',
                    width: 2
                  },
                }
              },
              data: orderPrice,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }
          ]
        })
      }
    }
  }

</script>

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
        chargingOrderCount,
        chargingActualPrice,
        chargingUserCount,
        datetime
      } = {}) {
        this.chart.setOption({
          // title: {
          //   text: 'Stacked Area Chart'
          // },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#6a7985'
              }
            }
          },
          legend: {
            data: ['充电总用户（个）','支付总金额（元）', '充电总订单（笔）']
          },
          // toolbox: {
          //   feature: {
          //     saveAsImage: {}
          //   }
          // },
          grid: {
            // left: '3%',
            // right: '4%',
            // bottom: '3%',
            left: '1%',
            right: '2%',
            bottom: '1%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: datetime
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: '充电总用户（个）',
              type: 'line',
              smooth: true,
              stack: 'Total',
              itemStyle: {
                normal: {
                  color: '#3888fa',
                  lineStyle: {
                    color: '#3888fa',
                    width: 2
                  },
                  areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                      offset: 0,
                      color: 'rgba(56, 136, 250, 0.3)'
                    }, {
                      offset: 0.8,
                      color: 'rgba(56, 136, 250, 0)'
                    }], false),
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowBlur: 10
                  }
                }
              },
              emphasis: {
                focus: 'series'
              },
              data: chargingUserCount
            },
            {
              name: '支付总金额（元）',
              type: 'line',
              smooth: true,
              stack: 'Total',
              itemStyle: {
                normal: {
                  color: '#07b161',
                  lineStyle: {
                    color: '#07b161',
                    width: 2
                  },
                  areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                      offset: 0,
                      color: 'rgba(7, 177, 97, 0.3)'
                    }, {
                      offset: 0.8,
                      color: 'rgba(7, 177, 97, 0)'
                    }], false),
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowBlur: 10
                  }
                }
              },
              emphasis: {
                focus: 'series'
              },
              data: chargingActualPrice
            },
            {
              name: '充电总订单（笔）',
              type: 'line',
              smooth: true,
              stack: 'Total',
              itemStyle: {
                normal: {
                  color: '#f73e42',
                  lineStyle: {
                    color: '#f73e42',
                    width: 2
                  },
                  areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                      offset: 0,
                      color: 'rgba(247, 62, 66, 0.3)'
                    }, {
                      offset: 0.8,
                      color: 'rgba(247, 62, 66, 0)'
                    }], false),
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowBlur: 10
                  }
                }
              },
              emphasis: {
                focus: 'series'
              },
              data: chargingOrderCount
            }
          ]
        })
      }
    }
  }
</script>

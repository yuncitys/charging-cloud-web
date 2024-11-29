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
        totalPower,
        orderCount,
        orderPrice,
        datetime
      } = {}) {
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
            data: ['订单数（笔）','总电量（度）', '总金额（元）']
          },
          series: [
            {
              name: '订单数（笔）',
              smooth: true,
              type: 'line',
              itemStyle: {
                normal: {
                  color: '#f73e42',
                  lineStyle: {
                    color: '#f73e42',
                    width: 2
                  },
                  areaStyle: {
                    color: '#f3f8ff'
                  }
                }
              },
              data: orderCount,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            },
            {
              name: '总电量（度）',
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
              data: totalPower,
              animationDuration: 2800,
              animationEasing: 'cubicInOut'
            },
            {
              name: '总金额（元）',
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
          ],
          dataZoom: [
            {
                type: 'slider', // 滑动条型缩放控件
                show: true, // 是否显示控件
                xAxisIndex: 0, // 控制 X 轴的缩放
                start: 0, // 数据窗口的起始位置（百分比）
                end: 70, // 数据窗口的结束位置（百分比）
                height: 20,      // 水平滑块的高度
                bottom: 20,      // 水平滑块距离图表底部的距离
            },
            // {
            //     type: 'inside', // 支持鼠标滚轮缩放的方式
            //     xAxisIndex: 0,
            //     height: 20,      // 水平滑块的高度
            //     bottom: 20,      // 水平滑块距离图表底部的距离
            // },
          ],
        })
      }
    }
  }
</script>

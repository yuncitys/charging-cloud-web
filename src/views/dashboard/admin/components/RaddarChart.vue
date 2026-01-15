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
      setOptions({
        expectedData,
        actualData,
        freeOrderData,
        monthOrderData,
      } = {}) {
        this.chart.setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            data: ['扫码订单', '刷卡订单', '免费订单', '包月订单']
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
            data: [{
                value: actualData,
                name: '扫码订单',
                itemStyle: {
                    color: '#4CD263'
                }
              },
              {
                value: expectedData,
                name: '刷卡订单',
                itemStyle: {
                    color: '#F4A261'
                }
              },
              {
                value: freeOrderData,
                name: '免费订单',
                itemStyle: {
                    color: '#E76F51'
                }
              },
              {
                value: monthOrderData,
                name: '包月订单',
                itemStyle: {
                    color: '#2A9D8F'
                }
              },
            ],
            animationDuration: 2600
          }]
        })
      },
    }
  }

</script>

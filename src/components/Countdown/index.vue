<template>
  <div class="countdown-text">{{ showText }}</div>
</template>

<script>
export default {
  data() {
    return {
      showText: '05:00',
      countdown: 300, // 总时间（分钟）
      intervalId: null
    }
  },
  beforeDestroy() {
    this.stopCountdown()
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.countdown = 300
      this.showText = '05:00'
      if (this.intervalId) {
        this.stopCountdown()
      }
      this.startCountdown()
    },
    startCountdown() {
      this.intervalId = setInterval(() => {
        const m = (this.countdown / 60 < 10) ? '0' + parseInt(this.countdown / 60).toString() : parseInt(this.countdown / 60)
        const s = (this.countdown % 60 < 10) ? '0' + parseInt(this.countdown % 60).toString() : parseInt(this.countdown % 60)
        this.showText = m + ':' + s
        if (this.countdown > 0) {
          this.countdown--
        } else {
          this.stopCountdown()
          this.$emit('countdownEnd')
        }
      }, 1000)
    },
    stopCountdown() {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
</script>

<style lang="scss" scoped>
.countdown-text{
  color: red;
  font-weight: bold;
  font-size: 14px;
  display: inline-block;
}
</style>

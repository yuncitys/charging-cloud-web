<template>
	<div class="bsd-frame" ref="bsdFrame">
		<slot></slot>
	</div>
</template>

<script>
	export default {
		name: 'frame-box',
		props: {
			width: {
				type: Number,
				default: 1920
			},
			height: {
				type: Number,
				default: 1080
			},
			bgColor: {
				default: 'rgb(2, 2, 37)'
			},
			pageType: {
				type: String,
				default: 'home'
			}
		},
		data() {
			return {
				frameWidth: 0,
				frameHeight: 0
			}
		},
		methods: {
			setSize() {
				this.frameWidth = this.width || screen.width
				this.frameHeight = this.height || screen.height
				const frame = this.$refs.bsdFrame
				frame.style.width = this.frameWidth + 'px'
				frame.style.height = this.frameHeight + 'px'
			},
			setScale() {
				const bodyWidth = document.body.clientWidth
				const bodyHeight = document.body.clientHeight
				const scaleX = bodyWidth / this.frameWidth
				const scaleY = bodyHeight / this.frameHeight
				this.$refs.bsdFrame.style.transform = `scale(${scaleX},${scaleY})`
			},
			myBrowser() {
				let userAgent = navigator.userAgent
				if (userAgent.indexOf('OPR') > -1 || userAgent.indexOf('Opera') > -1) {
					return 'Opera'
				} else if (userAgent.indexOf('Firefox') > -1) {
					return 'FF'
				} else if (userAgent.indexOf('Chrome') > -1) {
					return 'Chrome'
				} else if (userAgent.indexOf('Safari') > -1) {
					return 'Safari'
				} else {
					return '未考虑'
				}
			}
		},
		mounted() {
			this.setSize()
			this.setScale()
			window.addEventListener('resize', this.setScale)
			console.log('运行环境 ', this.myBrowser())
			console.log('设备尺寸 ', this.frameWidth, this.frameHeight)
		},
		destroyed() {
			window.removeEventListener('resize', this.setScale)
		}
	}
</script>

<style lang="scss" scoped>
	.bsd-frame {
		position: fixed;
		transform-origin: left top;
	}
</style>

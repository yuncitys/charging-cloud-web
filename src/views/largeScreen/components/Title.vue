<template>
	<div>
		<div :class="[isDark ? '' : 'light_titleBoxs','titleBoxs','flex']">
			<div class="titleBox flex">
				<div :class="['text',isDark ? 'dark_text' : 'light_text']" style="margin-left:30px ;">云创智城</div>
				<div :class="['text',isDark ? 'dark_text' : 'light_text']">Visualize data</div>
			</div>
			<div class="flex titleBoxs_right">
				<div :class="['timeBox',isDark ? 'dark_timeBox' : 'light_timeBox']">{{ dateYear }} {{ dateDay }}</div>
				<div :class="['modeBox',isDark ? 'dark_timeBox' : 'light_timeBox']" @click="changeMode">
					{{!isDark ? '切换夜间' : '切换白天'}}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	export default {
		name: 'Title',
		components: {

		},
		data() {
			return {
				dateDay: null,
				dateYear: null,
				dateWeek: null,
				weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
			}
		},
		watch: {

		},
		methods: {
			changeMode() {
				let isDark = window.sessionStorage.getItem('isDark') ? window.sessionStorage.getItem('isDark') : 0
				if (typeof(isDark) !== Number) {
					isDark = Number(isDark)
				}
				isDark = isDark ? 0 : 1
				window.sessionStorage.setItem('isDark', isDark)
				window.sessionStorage.setItem('isAuto', 'no')
				this.$router.go(0)
			},
			getDarkStrtus() {
				this.darking = setInterval(() => {
					if (this.checkAuditTime('18:00', '23:59') || this.checkAuditTime('00:00', '08:00')) {
						let isDark = this.isDark
						let sessionIsDark = window.sessionStorage.getItem('isDark') ? window.sessionStorage
							.getItem('isDark') : 0
						if (typeof(sessionIsDark) !== Number) {
							sessionIsDark = Number(sessionIsDark)
						}
						window.sessionStorage.setItem('isDark', 1)
						if (isDark !== sessionIsDark) {
							this.$router.go(0)
						}
					} else {
						let isDark = this.isDark
						let sessionIsDark = window.sessionStorage.getItem('isDark') ? window.sessionStorage
							.getItem('isDark') : 0
						if (typeof(sessionIsDark) !== Number) {
							sessionIsDark = Number(sessionIsDark)
						}
						window.sessionStorage.setItem('isDark', 0)
						if (isDark !== sessionIsDark) {
							this.$router.go(0)
						}
					}
					console.log('计时')
				}, 1000)
			},
			checkAuditTime(beginTime, endTime) {
				var nowDate = new Date();
				var beginDate = new Date(nowDate);
				var endDate = new Date(nowDate);

				var beginIndex = beginTime.lastIndexOf("\:");
				var beginHour = beginTime.substring(0, beginIndex);
				var beginMinue = beginTime.substring(beginIndex + 1, beginTime.length);
				beginDate.setHours(beginHour, beginMinue, 0, 0);

				var endIndex = endTime.lastIndexOf("\:");
				var endHour = endTime.substring(0, endIndex);
				var endMinue = endTime.substring(endIndex + 1, endTime.length);
				endDate.setHours(endHour, endMinue, 0, 0);
				return nowDate.getTime() - beginDate.getTime() >= 0 && nowDate.getTime() <= endDate.getTime();
			},
			timeFn() {
				this.timing = setInterval(() => {
					this.dateDay = this.formatTime(new Date(), 'HH: mm: ss')
					this.dateYear = this.formatTime(new Date(), 'yyyy-MM-dd')
					this.dateWeek = this.weekday[new Date().getDay()]
				}, 1000)
			},
			formatTime(time, fmt) {
				if (!time) return '';
				else {
					const date = new Date(time);
					const o = {
						'M+': date.getMonth() + 1,
						'd+': date.getDate(),
						'H+': date.getHours(),
						'm+': date.getMinutes(),
						's+': date.getSeconds(),
						'q+': Math.floor((date.getMonth() + 3) / 3),
						S: date.getMilliseconds(),
					};
					if (/(y+)/.test(fmt))
						fmt = fmt.replace(
							RegExp.$1,
							(date.getFullYear() + '').substr(4 - RegExp.$1.length)
						);
					for (const k in o) {
						if (new RegExp('(' + k + ')').test(fmt)) {
							fmt = fmt.replace(
								RegExp.$1,
								RegExp.$1.length === 1 ?
								o[k] :
								('00' + o[k]).substr(('' + o[k]).length)
							);
						}
					}
					return fmt;
				}
			}
		},
		mounted() {

		},
		created() {
			this.timeFn()
			let isAuto = window.sessionStorage.getItem('isAuto') || 'yes'
			if (isAuto == 'yes') {
				this.getDarkStrtus()
			} else {
				setTimeout(() => {
					window.sessionStorage.setItem('isAuto', 'yes')
					this.$router.go(0)
				}, 1000 * 300)
			}
		},
		destroyed() {

		}
	}
</script>

<style scoped="scoped" lang="scss">
	.light_titleBoxs {
		background: rgba(255, 255, 255, 0.5);
		border: 1px solid #FFFFFF;
	}

	.titleBoxs {
		align-items: center;
		justify-content: space-between;
		height: 90px;
		width: 100%;

		.titleBox {
			align-items: center;

			.img {
				margin-left: 68px;
				width: 43px;
				height: 37px;
			}

			.dark_text {
				color: #fff;
			}

			.light_text {
				color: rgba(0, 0, 0, 1);
			}

			.text {
				margin-left: 16px;
				font-size: 40px;
				font-weight: bold;
			}
		}

		.titleBoxs_right {
			align-items: center;
			margin-right: 68px;

			.dark_timeBox {
				color: #fff;
			}

			.light_timeBox {
				color: rgba(0, 0, 0, 1);
			}

			.timeBox {
				font-size: 40px;
				font-weight: bold;
			}

			.modeBox {
				font-size: 40px;
				font-weight: bold;
				margin-left: 10px;
				cursor: pointer;
			}
		}
	}
</style>

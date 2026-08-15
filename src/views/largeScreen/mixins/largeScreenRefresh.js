import { getLargeScreenMockStatus } from '@/api/largeScreen/largeScreen.js'

/**
 * 大屏组件统一轮询：仅在后端开启虚拟数据时定时刷新接口。
 * 间隔默认用 mockStatus.tickIntervalMs，也可传入自定义毫秒数。
 */
export default {
	data() {
		return {
			_largeScreenRefreshTimer: null,
			_largeScreenDailyTimer: null,
		}
	},
	methods: {
		getLargeScreenMockStatus() {
			return getLargeScreenMockStatus()
		},
		isLargeScreenMockEnabled() {
			return this.getLargeScreenMockStatus().mockEnabled
		},
		startLargeScreenInterval(callback, intervalMs) {
			this.clearLargeScreenInterval()
			if (!this.isLargeScreenMockEnabled() || typeof callback !== 'function') return
			const tick = this.getLargeScreenMockStatus().tickIntervalMs
			const ms = Number(intervalMs)
			const delay = Number.isFinite(ms) && ms >= 1000 ? Math.floor(ms) : tick
			this._largeScreenRefreshTimer = setInterval(callback, delay)
		},
		clearLargeScreenInterval() {
			if (this._largeScreenRefreshTimer) {
				clearInterval(this._largeScreenRefreshTimer)
				this._largeScreenRefreshTimer = null
			}
		},
		/** 跨天再拉一次（曲线/设备等日更数据） */
		startLargeScreenDailyRefresh(callback) {
			this.clearLargeScreenDailyRefresh()
			if (!this.isLargeScreenMockEnabled() || typeof callback !== 'function') return
			const now = new Date()
			const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5)
			const delay = Math.max(1000, next.getTime() - now.getTime())
			this._largeScreenDailyTimer = setTimeout(() => {
				callback()
				this._largeScreenDailyTimer = setInterval(callback, 24 * 60 * 60 * 1000)
			}, delay)
		},
		clearLargeScreenDailyRefresh() {
			if (this._largeScreenDailyTimer) {
				clearTimeout(this._largeScreenDailyTimer)
				clearInterval(this._largeScreenDailyTimer)
				this._largeScreenDailyTimer = null
			}
		},
	},
	beforeDestroy() {
		this.clearLargeScreenInterval()
		this.clearLargeScreenDailyRefresh()
	},
}

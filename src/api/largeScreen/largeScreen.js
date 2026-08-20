import request from '@/utils/request'

const MODE_STORAGE_KEY = 'largeScreenDataMode'
const TICK_STORAGE_KEY = 'largeScreenTickIntervalMs'
const DEFAULT_TICK_INTERVAL_MS = 5000

function writeStorage(storage, key, value) {
	try {
		if (storage) storage.setItem(key, value)
	} catch (e) {}
}

function readStorage(key) {
	try {
		const fromSession = window.sessionStorage.getItem(key)
		if (fromSession) return fromSession
	} catch (e) {}
	try {
		return window.localStorage.getItem(key) || ''
	} catch (e) {
		return ''
	}
}

/** 由大屏页根据后端 /visual/mockStatus 写入，供子组件决定是否轮询 */
export function setLargeScreenMockStatus({ mockEnabled, tickIntervalMs } = {}) {
	const mode = mockEnabled ? 'mock' : 'real'
	const tick = Number(tickIntervalMs)
	const normalizedTick = Number.isFinite(tick) && tick >= 1000 ? Math.floor(tick) : DEFAULT_TICK_INTERVAL_MS
	writeStorage(window.sessionStorage, MODE_STORAGE_KEY, mode)
	writeStorage(window.localStorage, MODE_STORAGE_KEY, mode)
	writeStorage(window.sessionStorage, TICK_STORAGE_KEY, String(normalizedTick))
	writeStorage(window.localStorage, TICK_STORAGE_KEY, String(normalizedTick))
	return {
		mockEnabled: mode === 'mock',
		tickIntervalMs: normalizedTick,
	}
}

export function getLargeScreenMockStatus() {
	const mode = String(readStorage(MODE_STORAGE_KEY) || '').trim().toLowerCase()
	const tickRaw = Number(readStorage(TICK_STORAGE_KEY))
	return {
		mockEnabled: mode === 'mock',
		tickIntervalMs: Number.isFinite(tickRaw) && tickRaw >= 1000 ? Math.floor(tickRaw) : DEFAULT_TICK_INTERVAL_MS,
	}
}

/** @deprecated 兼容旧调用，请优先使用 getLargeScreenMockStatus */
export function getLargeScreenDataMode() {
	return getLargeScreenMockStatus().mockEnabled ? 'mock' : 'real'
}

/** @deprecated 兼容旧调用，请优先使用 setLargeScreenMockStatus */
export function setLargeScreenDataMode(mode) {
	return setLargeScreenMockStatus({ mockEnabled: String(mode || '').toLowerCase() === 'mock' }).mockEnabled
		? 'mock'
		: 'real'
}

function formBody(data) {
	return {
		url: '',
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		},
		transformRequest: [
			function(payload) {
				var ret = ''
				for (var it in payload) {
					ret += encodeURIComponent(it) + '=' + encodeURIComponent(payload[it]) + '&'
				}
				ret = ret.substring(0, ret.lastIndexOf('&'))
				return ret
			}
		],
		data
	}
}

export function getVisualMockStatus() {
	return request({
		url: '/api/web/visual/mockStatus',
		method: 'post'
	})
}

export function getCount(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getCount',
	})
}

export function getCurve(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getCurve',
	})
}

export function getSevenDayTrendByOrder(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getSevenDayTrendByOrder',
	})
}

export function getProvinceByDevice(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getProvinceByDevice',
	})
}

export function getOrderList(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getOrderList',
	})
}

export function getDeviceCountAndDeviceFeeBack(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getDeviceCountAndDeviceFeeBack',
	})
}

export function getOrderByGe15Day(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getOrderByGe15Day',
	})
}

export function getListByNetWorkDot(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getListByNetWorkDot',
	})
}

export function getDeviceLogList(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getDeviceLogList',
	})
}

export function getDeviceCount(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getDeviceCount',
	})
}

import request from '@/utils/request'

function getBaseConfig() {
	if (typeof globalThis !== 'undefined' && globalThis.BaseConfig) {
		return globalThis.BaseConfig
	}
	if (typeof window !== 'undefined' && window.BaseConfig) {
		return window.BaseConfig
	}
	return null
}

export function getLargeScreenDataMode() {
	let fromStorage = ''
	try {
		fromStorage = window.sessionStorage.getItem('largeScreenDataMode') || ''
	} catch (e) {}
	if (!fromStorage) {
		try {
			fromStorage = window.localStorage.getItem('largeScreenDataMode') || ''
		} catch (e) {}
	}
	const storageMode = String(fromStorage || '').trim().toLowerCase()
	if (storageMode === 'mock' || storageMode === 'real') {
		return storageMode
	}

	const cfg = getBaseConfig()
	const cfgMode = cfg && cfg.VUE_LARGE_SCREEN_DATA_SOURCE != null ? String(cfg.VUE_LARGE_SCREEN_DATA_SOURCE) : ''
	const normalized = cfgMode.trim().toLowerCase()
	if (normalized === 'mock' || normalized === 'real') {
		return normalized
	}

	const envMode = process.env.VUE_APP_LARGE_SCREEN_DATA_SOURCE != null ? String(process.env.VUE_APP_LARGE_SCREEN_DATA_SOURCE) : ''
	const envNormalized = envMode.trim().toLowerCase()
	if (envNormalized === 'mock' || envNormalized === 'real') {
		return envNormalized
	}

	return 'real'
}

function useMock() {
	return getLargeScreenDataMode() === 'mock'
}

const MOCK_GROWTH_STORAGE_KEY = 'largeScreen_mock_growth_state_v2'
const MOCK_GROWTH_STORAGE_VERSION = 2
const MOCK_DEVICE_COUNT_STORAGE_KEY = 'largeScreen_mock_device_count_state_v1'
const MOCK_DEVICE_COUNT_STORAGE_VERSION = 1
const MOCK_VISUAL_TICK_INTERVAL_MS = 5000
const MOCK_USER_GROWTH_INTERVAL_MS = 2 * 60 * 1000
const MOCK_WX_ORDER_GROWTH_INTERVAL_MS = 60 * 1000
const MOCK_CARD_ORDER_GROWTH_INTERVAL_MS = 2 * 60 * 1000
const ONE_DAY_MS = 24 * 60 * 60 * 1000

function pad2(n) {
	return String(n).padStart(2, '0')
}

function formatDateTime(d) {
	const date = d instanceof Date ? d : new Date(d)
	return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
}

function formatDay(d) {
	const date = d instanceof Date ? d : new Date(d)
	return `${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function formatDateKey(d) {
	const date = d instanceof Date ? d : new Date(d)
	return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function seeded(seed) {
	const x = Math.sin(seed) * 10000
	return x - Math.floor(x)
}

function getMockStorage() {
	if (typeof window === 'undefined') return null
	try {
		if (window.localStorage) return window.localStorage
	} catch (e) {}
	try {
		if (window.sessionStorage) return window.sessionStorage
	} catch (e) {}
	return null
}

function getDayStartTs(time) {
	const date = time instanceof Date ? new Date(time.getTime()) : new Date(time)
	date.setHours(0, 0, 0, 0)
	return date.getTime()
}

function toFiniteNumber(value, fallback) {
	return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function createMockGrowthState(previousState, now = Date.now()) {
	const dayStartTs = getDayStartTs(now)
	const totalUserBase = toFiniteNumber(previousState && previousState.totalUserNow, 320000)
	const baseMoney = toFiniteNumber(previousState && previousState.moneyNow, 130000000)
	const baseWxTotalOrder = toFiniteNumber(previousState && previousState.wxTotalNow, 1200000)
	const baseCardTotalOrder = toFiniteNumber(previousState && previousState.cardTotalNow, 82000)
	const newUserBase = 18 + Math.floor(seeded(dayStartTs + 101) * 15)
	return {
		version: MOCK_GROWTH_STORAGE_VERSION,
		dayKey: formatDateKey(now),
		dayStartTs,
		baseMoney,
		moneyNow: baseMoney,
		lastMoneyMinute: -1,
		totalUserBase,
		totalUserNow: totalUserBase,
		newUserBase,
		newUserNow: newUserBase,
		lastUserSlot: -1,
		baseWxTotalOrder,
		wxTotalNow: baseWxTotalOrder,
		lastWxOrderSlot: -1,
		baseCardTotalOrder,
		cardTotalNow: baseCardTotalOrder,
		lastCardOrderSlot: -1,
	}
}

function getMockUserDelta(dayStartTs, slot) {
	const ratio = seeded(dayStartTs + slot * 29 + 5)
	if (ratio > 0.98) return 2
	if (ratio > 0.72) return 1
	return 0
}

function getMockOrderDelta(dayStartTs, slot, base, size) {
	return base + Math.floor(seeded(dayStartTs + slot * 31 + 9) * size)
}

function advanceMockGrowthState(state, now = Date.now()) {
	const nextState = {
		...state,
		baseMoney: toFiniteNumber(state.baseMoney, 130000000),
		moneyNow: toFiniteNumber(state.moneyNow, toFiniteNumber(state.baseMoney, 130000000)),
		lastMoneyMinute: Math.max(-1, Math.floor(toFiniteNumber(state.lastMoneyMinute, -1))),
		totalUserBase: toFiniteNumber(state.totalUserBase, 320000),
		totalUserNow: toFiniteNumber(state.totalUserNow, toFiniteNumber(state.totalUserBase, 320000)),
		newUserBase: toFiniteNumber(state.newUserBase, 18),
		newUserNow: toFiniteNumber(state.newUserNow, toFiniteNumber(state.newUserBase, 18)),
		lastUserSlot: Math.max(-1, Math.floor(toFiniteNumber(state.lastUserSlot, -1))),
		baseWxTotalOrder: toFiniteNumber(state.baseWxTotalOrder, 1200000),
		wxTotalNow: toFiniteNumber(state.wxTotalNow, toFiniteNumber(state.baseWxTotalOrder, 1200000)),
		lastWxOrderSlot: Math.max(-1, Math.floor(toFiniteNumber(state.lastWxOrderSlot, -1))),
		baseCardTotalOrder: toFiniteNumber(state.baseCardTotalOrder, 82000),
		cardTotalNow: toFiniteNumber(state.cardTotalNow, toFiniteNumber(state.baseCardTotalOrder, 82000)),
		lastCardOrderSlot: Math.max(-1, Math.floor(toFiniteNumber(state.lastCardOrderSlot, -1))),
	}

	const elapsedMinutes = Math.max(0, Math.floor((now - nextState.dayStartTs) / 60000))
	if (elapsedMinutes > nextState.lastMoneyMinute) {
		for (let m = nextState.lastMoneyMinute + 1; m <= elapsedMinutes; m++) {
			const delta = 8 + Math.floor(seeded(nextState.dayStartTs + m * 17 + 1) * 5800) / 100
			nextState.moneyNow += delta
		}
		nextState.lastMoneyMinute = elapsedMinutes
	}

	const userSlot = Math.max(0, Math.floor((now - nextState.dayStartTs) / MOCK_USER_GROWTH_INTERVAL_MS))
	if (userSlot > nextState.lastUserSlot) {
		for (let slot = nextState.lastUserSlot + 1; slot <= userSlot; slot++) {
			const delta = getMockUserDelta(nextState.dayStartTs, slot)
			nextState.newUserNow += delta
			nextState.totalUserNow += delta
		}
		nextState.lastUserSlot = userSlot
	}

	const wxOrderSlot = Math.max(0, Math.floor((now - nextState.dayStartTs) / MOCK_WX_ORDER_GROWTH_INTERVAL_MS))
	if (wxOrderSlot > nextState.lastWxOrderSlot) {
		for (let slot = nextState.lastWxOrderSlot + 1; slot <= wxOrderSlot; slot++) {
			nextState.wxTotalNow += getMockOrderDelta(nextState.dayStartTs, slot, 9, 10)
		}
		nextState.lastWxOrderSlot = wxOrderSlot
	}

	const cardOrderSlot = Math.max(0, Math.floor((now - nextState.dayStartTs) / MOCK_CARD_ORDER_GROWTH_INTERVAL_MS))
	if (cardOrderSlot > nextState.lastCardOrderSlot) {
		for (let slot = nextState.lastCardOrderSlot + 1; slot <= cardOrderSlot; slot++) {
			nextState.cardTotalNow += getMockOrderDelta(nextState.dayStartTs, slot, 2, 4)
		}
		nextState.lastCardOrderSlot = cardOrderSlot
	}

	return nextState
}

function getMockGrowthState(now = Date.now()) {
	const storage = getMockStorage()
	let parsed = null
	if (storage) {
		try {
			const raw = storage.getItem(MOCK_GROWTH_STORAGE_KEY)
			if (raw) {
				parsed = JSON.parse(raw)
			}
		} catch (e) {}
	}

	let state = parsed && typeof parsed === 'object' ? parsed : null
	if (!state || state.version !== MOCK_GROWTH_STORAGE_VERSION || state.dayKey !== formatDateKey(now)) {
		state = createMockGrowthState(state, now)
	}
	state = advanceMockGrowthState(state, now)

	if (storage) {
		try {
			storage.setItem(MOCK_GROWTH_STORAGE_KEY, JSON.stringify(state))
		} catch (e) {}
	}

	return state
}

function createMockDeviceCountState(previousState) {
	return {
		version: MOCK_DEVICE_COUNT_STORAGE_VERSION,
		dayKey: '',
		dayStartTs: 0,
		chargingStationCount: Math.max(0, Math.floor(toFiniteNumber(previousState && previousState.chargingStationCount, 86))),
		onLineCount: Math.max(0, Math.floor(toFiniteNumber(previousState && previousState.onLineCount, 1260))),
		unLineCount: Math.max(0, Math.floor(toFiniteNumber(previousState && previousState.unLineCount, 60))),
	}
}

function applyMockDeviceCountDailyGrowth(state, dayStartTs) {
	state.chargingStationCount += Math.floor(seeded(dayStartTs + 61) * 2)
	state.onLineCount += 6 + Math.floor(seeded(dayStartTs + 62) * 18)
	state.unLineCount += Math.floor(seeded(dayStartTs + 63) * 4)
}

function advanceMockDeviceCountState(state, now = Date.now()) {
	const nextState = createMockDeviceCountState(state)
	const currentDayStartTs = getDayStartTs(now)
	let cursorDayStartTs = Math.floor(toFiniteNumber(state && state.dayStartTs, currentDayStartTs))

	if (cursorDayStartTs <= 0 || cursorDayStartTs > currentDayStartTs) {
		cursorDayStartTs = currentDayStartTs
	}

	while (cursorDayStartTs < currentDayStartTs) {
		cursorDayStartTs += ONE_DAY_MS
		applyMockDeviceCountDailyGrowth(nextState, cursorDayStartTs)
	}

	nextState.dayStartTs = currentDayStartTs
	nextState.dayKey = formatDateKey(now)
	return nextState
}

function getMockDeviceCountState(now = Date.now()) {
	const storage = getMockStorage()
	let parsed = null
	if (storage) {
		try {
			const raw = storage.getItem(MOCK_DEVICE_COUNT_STORAGE_KEY)
			if (raw) {
				parsed = JSON.parse(raw)
			}
		} catch (e) {}
	}

	let state = parsed && typeof parsed === 'object' ? parsed : createMockDeviceCountState()
	state = advanceMockDeviceCountState(state, now)

	if (storage) {
		try {
			storage.setItem(MOCK_DEVICE_COUNT_STORAGE_KEY, JSON.stringify(state))
		} catch (e) {}
	}

	return state
}

function getMockVisualTick(now = Date.now(), state) {
	const currentState = state || getMockGrowthState(now)
	return Math.max(0, Math.floor((now - currentState.dayStartTs) / MOCK_VISUAL_TICK_INTERVAL_MS))
}

function mockResolve(data) {
	return new Promise((resolve) => {
		setTimeout(() => resolve({ code: 200, data }), 120)
	})
}

function mockGetCount() {
	const now = Date.now()
	const growthState = getMockGrowthState(now)
	const t = getMockVisualTick(now, growthState)
	const totalMoney = growthState.moneyNow.toFixed(2)
	const currentMonth = 186000 + t * 67 + Math.floor(seeded(growthState.dayStartTs + t + 2) * 200)
	const currentDay = 5200 + t * 11 + Math.floor(seeded(growthState.dayStartTs + t + 3) * 50)

	const totalUser = growthState.totalUserNow
	const newUser = growthState.newUserNow

	const cardTotal = growthState.cardTotalNow
	const wxTotal = growthState.wxTotalNow

	const cardDay = 180 + (t % 30)
	const wxDay = 260 + (t % 40)

	const cardWeek = 980 + (t % 120)
	const wxWeek = 1420 + (t % 180)

	return {
		countOrderMoney: {
			totalMoeny: totalMoney,
			currentMonth,
			currentDay,
		},
		countUser: {
			totalUser,
			currentDay: newUser,
		},
		orderCountByOrderStatus1: 120 + (t % 35),
		countOrder: [
			{
				orderType: 0,
				currentDay: cardDay,
				currentWeek: cardWeek,
				totalOrder: cardTotal,
			},
			{
				orderType: 1,
				currentDay: wxDay,
				currentWeek: wxWeek,
				totalOrder: wxTotal,
			},
		],
		countPayMoney: [
			{ type: 1, payMoney: 286000 + t * 59 },
			{ type: 2, payMoney: 42000 + t * 7 },
		],
	}
}

function mockGetCurve() {
	const t = getMockVisualTick()
	const currentDate = new Date()
	const days = 7
	const out = []
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(currentDate)
		d.setDate(currentDate.getDate() - i)
		const seed = t * 13 + i * 7
		out.push({
			DAY: formatDay(d),
			userCount: 40 + Math.floor(seeded(seed + 1) * 60) + (t % 6),
			orderCount: 120 + Math.floor(seeded(seed + 2) * 160) + (t % 12),
			totalMoney: 4800 + Math.floor(seeded(seed + 3) * 5200) + t * 8,
		})
	}
	return out
}

function mockGetSevenDayTrendByOrder() {
	const t = getMockVisualTick()
	const currentDate = new Date()
	const days = 7
	const out = []
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(currentDate)
		d.setDate(currentDate.getDate() - i)
		const seed = t * 17 + i * 11
		const chargingOrder = 260 + Math.floor(seeded(seed + 1) * 240) + (t % 10)
		out.push({
			DAY: formatDay(d),
			chargingAmount: 8600 + Math.floor(seeded(seed + 2) * 7800) + t * 12,
			chargingOrder,
			chargingDegree: 1200 + Math.floor(seeded(seed + 3) * 1400) + Math.floor(chargingOrder * 0.4),
		})
	}
	return out
}

const provinceNames = [
	// '北京市',
	// '天津市',
	'河北省',
	'山西省',
	// '内蒙古自治区',
	// '辽宁省',
	// '吉林省',
	'黑龙江省',
	'上海市',
	'江苏省',
	'浙江省',
	'安徽省',
	'福建省',
	'江西省',
	'山东省',
	'河南省',
	'湖北省',
	'湖南省',
	'广东省',
	'广西壮族自治区',
	// '海南省',
	// '重庆市',
	// '四川省',
	// '贵州省',
	// '云南省',
	// '西藏自治区',
	// '陕西省',
	// '甘肃省',
	// '青海省',
	// '宁夏回族自治区',
	// '新疆维吾尔自治区',
	// '台湾省',
	// '香港特别行政区',
	// '澳门特别行政区',
]

const provinceGeoJsonContext = require.context('@/common/map/province', false, /\.json$/)

function mockGetProvinceByDevice(data = {}) {
	const provinceName = data && data.provinceName ? String(data.provinceName) : ''
	if (provinceName) {
		let geoJson = null
		try {
			const mod = provinceGeoJsonContext(`./${provinceName}.json`)
			geoJson = mod && mod.default ? mod.default : mod
		} catch (e) {
			geoJson = null
		}
		if (!geoJson || !geoJson.features) {
			return []
		}
		const t = getMockVisualTick()
		const cityNames = Array.from(
			new Set(
				geoJson.features
					.map(f => (f && f.properties ? f.properties.name : ''))
					.filter(Boolean)
			)
		)
		return cityNames.map((city, idx) => {
			const seed = t * 31 + idx * 7
			const base = idx % 9 === 0 ? 0 : 10
			return {
				networkProvince: provinceName,
				networkCity: city,
				totalDevice: base + Math.floor(seeded(seed) * 180) + (t % 6),
			}
		})
	}
	const t = getMockVisualTick()
	return provinceNames.map((p, idx) => {
		const seed = t * 19 + idx * 3
		const base = idx % 7 === 0 ? 0 : 30
		return {
			networkProvince: p,
			totalDevice: base + Math.floor(seeded(seed) * 260) + (t % 8),
		}
	})
}

const stationNames = [
	'华东充电站',
	'华南枢纽站',
	'中心广场站',
	'滨江停车场站',
	'高新区运营站',
	'科技园站',
	'机场停车楼站',
	'火车站南广场站',
	'大学城站',
	'物流园站',
]

function mockGetOrderList() {
	const t = getMockVisualTick()
	const now = Date.now()
	const size = 18
	const out = []
	for (let i = 0; i < size; i++) {
		const seed = t * 23 + i * 5
		const start = new Date(now - (i * 45 + Math.floor(seeded(seed) * 30)) * 1000)
		const yy = String(start.getFullYear()).slice(-2)
		const mm = pad2(start.getMonth() + 1)
		const dd = pad2(start.getDate())
		const hh = pad2(start.getHours())
		const mi = pad2(start.getMinutes())
		const pilePart = `${yy}${mm}${dd}${String(1 + ((t + i) % 99999999)).padStart(8, '0')}`
		const gunPart = String(1 + ((t + i) % 99)).padStart(2, '0')
		const dateTimePart = `${start.getFullYear()}${mm}${dd}${hh}${mi}`
		const seqPart = String(1 + ((t * 37 + i * 11) % 9999)).padStart(4, '0')
		out.push({
			orderCode: `${pilePart}${gunPart}${dateTimePart}${seqPart}`,
			networkName: stationNames[(i + t) % stationNames.length],
			chargingDuration: 12 + (t % 18) + Math.floor(seeded(seed + 1) * 40),
			startTime: formatDateTime(start),
		})
	}
	return out
}

function mockGetListByNetWorkDot(data) {
	const t = getMockVisualTick()
	const type = data && data.type != null ? Number(data.type) : 1
	const size = 12
	const out = []
	for (let i = 0; i < size; i++) {
		const seed = t * 29 + i * 7 + type * 101
		const orderMoeny = Number((28600 + seeded(seed + 2) * 32000 + t * 31 + seeded(seed + 20)).toFixed(2))
		const chargingDegree = Number((8600 + seeded(seed + 3) * 12000 + t * 19 + seeded(seed + 21)).toFixed(2))
		out.push({
			num: i + 1,
			networkName: stationNames[i % stationNames.length],
			orderCount: 680 + Math.floor(seeded(seed + 1) * 420) + (t % 30),
			orderMoeny,
			chargingDegree,
		})
	}
	return out
}

function mockGetDeviceCount() {
	const state = getMockDeviceCountState()
	const chargingStationCount = state.chargingStationCount
	const onLineCount = state.onLineCount
	const unLineCount = state.unLineCount
	return {
		onLineCount,
		unLineCount,
		chargingStationCount,
	}
}

function mockGetDeviceLogList() {
	const now = Date.now()
	const dayStartTs = getDayStartTs(now)
	const size = 1 + Math.floor(seeded(dayStartTs + 41) * 5)
	const out = []
	const alarmNames = [
		'设备上线',
		'设备下线',
		'电桩故障',
		'电压电流异常',
		'实时数据异常',
		'SOC异常',
		'温度超高',
		'充电阶段BMS中止',
		'充电阶段充电机中止',
	]
	for (let i = 0; i < size; i++) {
		const seed = dayStartTs + i * 101
		const hour = 6 + Math.floor(seeded(seed + 1) * 16)
		const minute = Math.floor(seeded(seed + 2) * 60)
		const second = Math.floor(seeded(seed + 3) * 60)
		const seqSeed = Math.floor(seeded(seed + 4) * 99999999)
		const ts = new Date(dayStartTs + hour * 3600000 + minute * 60000 + second * 1000)
		const yy = String(ts.getFullYear()).slice(-2)
		const mm = pad2(ts.getMonth() + 1)
		const dd = pad2(ts.getDate())
		const seq = String(1 + seqSeed).padStart(8, '0')
		const alarmItem = { name: alarmNames[Math.floor(seeded(seed + 5) * alarmNames.length) % alarmNames.length] }
		out.push({
			deviceCode: `${yy}${mm}${dd}${seq}`,
			createTime: formatDateTime(ts),
			alarmItem,
		})
	}
	return out.sort((a, b) => String(b.createTime).localeCompare(String(a.createTime)))
}

//统计
export function getCount(data) {
	if (useMock()) {
		return mockResolve(mockGetCount())
	}
	return request({
		url: '/api/web/visual/getCount',
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		transformRequest: [
			function(data) {
				var ret = ''
				for (var it in data) {
					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
				}
				ret = ret.substring(0, ret.lastIndexOf('&'))
				return ret
			}
		],
		data
	})
}
//每日数据走势
export function getCurve(data) {
	if (useMock()) {
		return mockResolve(mockGetCurve())
	}
	return request({
		url: '/api/web/visual/getCurve',
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		transformRequest: [
			function(data) {
				var ret = ''
				for (var it in data) {
					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
				}
				ret = ret.substring(0, ret.lastIndexOf('&'))
				return ret
			}
		],
		data
	})
}

//七日充电趋势
export function getSevenDayTrendByOrder(data) {
	if (useMock()) {
		return mockResolve(mockGetSevenDayTrendByOrder())
	}
	return request({
		url: '/api/web/visual/getSevenDayTrendByOrder',
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		transformRequest: [
			function(data) {
				var ret = ''
				for (var it in data) {
					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
				}
				ret = ret.substring(0, ret.lastIndexOf('&'))
				return ret
			}
		],
		data
	})
}

//地图省份
export function getProvinceByDevice(data) {
	if (useMock()) {
		return mockResolve(mockGetProvinceByDevice(data))
	}
	return request({
		url: '/api/web/visual/getProvinceByDevice',
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		transformRequest: [
			function(data) {
				var ret = ''
				for (var it in data) {
					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
				}
				ret = ret.substring(0, ret.lastIndexOf('&'))
				return ret
			}
		],
		data
	})
}

//实时订单
export function getOrderList(data) {
	if (useMock()) {
		return mockResolve(mockGetOrderList())
	}
	return request({
		url: '/api/web/visual/getOrderList',
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		transformRequest: [
			function(data) {
				var ret = ''
				for (var it in data) {
					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
				}
				ret = ret.substring(0, ret.lastIndexOf('&'))
				return ret
			}
		],
		data
	})
}

//设备数据
export function getDeviceCountAndDeviceFeeBack(data) {
	if (useMock()) {
		return mockResolve({
			deviceCount: mockGetDeviceCount(),
			feeBack: [],
		})
	}
	return request({
		url: '/api/web/visual/getDeviceCountAndDeviceFeeBack',
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		transformRequest: [
			function(data) {
				var ret = ''
				for (var it in data) {
					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
				}
				ret = ret.substring(0, ret.lastIndexOf('&'))
				return ret
			}
		],
		data
	})
}

//15天内无订单列表
export function getOrderByGe15Day(data) {
	if (useMock()) {
		return mockResolve([])
	}
	return request({
		url: '/api/web/visual/getOrderByGe15Day',
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		transformRequest: [
			function(data) {
				var ret = ''
				for (var it in data) {
					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
				}
				ret = ret.substring(0, ret.lastIndexOf('&'))
				return ret
			}
		],
		data
	})
}

//网点排名统计
export function getListByNetWorkDot(data) {
	if (useMock()) {
		return mockResolve(mockGetListByNetWorkDot(data))
	}
	return request({
		url: '/api/web/visual/getListByNetWorkDot',
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		transformRequest: [
			function(data) {
				var ret = ''
				for (var it in data) {
					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
				}
				ret = ret.substring(0, ret.lastIndexOf('&'))
				return ret
			}
		],
		data
	})
}


//设备上下线日志
export function getDeviceLogList(data) {
	if (useMock()) {
		return mockResolve(mockGetDeviceLogList())
	}
	return request({
		url: '/api/web/visual/getDeviceLogList',
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		transformRequest: [
			function(data) {
				var ret = ''
				for (var it in data) {
					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
				}
				ret = ret.substring(0, ret.lastIndexOf('&'))
				return ret
			}
		],
		data
	})
}

//设备统计
export function getDeviceCount(data) {
	if (useMock()) {
		return mockResolve(mockGetDeviceCount())
	}
	return request({
		url: '/api/web/visual/getDeviceCount',
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		transformRequest: [
			function(data) {
				var ret = ''
				for (var it in data) {
					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
				}
				ret = ret.substring(0, ret.lastIndexOf('&'))
				return ret
			}
		],
		data
	})
}

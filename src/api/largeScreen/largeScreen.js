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

const mockState = {
	tick: 0,
	timer: null,
}

function ensureMockTicking() {
	if (mockState.timer) return
	mockState.timer = setInterval(() => {
		mockState.tick += 1
	}, 3000)
}

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

function seeded(seed) {
	const x = Math.sin(seed) * 10000
	return x - Math.floor(x)
}

function mockResolve(data) {
	ensureMockTicking()
	return new Promise((resolve) => {
		setTimeout(() => resolve({ code: 200, data }), 120)
	})
}

function mockGetCount() {
	const t = mockState.tick
	const totalMoney = 1280000 + t * 523 + Math.floor(seeded(t + 1) * 500)
	const currentMonth = 186000 + t * 67 + Math.floor(seeded(t + 2) * 200)
	const currentDay = 5200 + t * 11 + Math.floor(seeded(t + 3) * 50)

	const totalUser = 36800 + t * 2 + Math.floor(seeded(t + 4) * 5)
	const newUser = 18 + (t % 12)

	const cardTotal = 82000 + t * 23 + Math.floor(seeded(t + 5) * 50)
	const wxTotal = 136000 + t * 37 + Math.floor(seeded(t + 6) * 60)

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
	const t = mockState.tick
	const now = new Date()
	const days = 7
	const out = []
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(now)
		d.setDate(now.getDate() - i)
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
	const t = mockState.tick
	const now = new Date()
	const days = 7
	const out = []
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(now)
		d.setDate(now.getDate() - i)
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
	'北京市',
	'天津市',
	'河北省',
	'山西省',
	'内蒙古自治区',
	'辽宁省',
	'吉林省',
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
	'海南省',
	'重庆市',
	'四川省',
	'贵州省',
	'云南省',
	'西藏自治区',
	'陕西省',
	'甘肃省',
	'青海省',
	'宁夏回族自治区',
	'新疆维吾尔自治区',
	'台湾省',
	'香港特别行政区',
	'澳门特别行政区',
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
		const t = mockState.tick
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
	const t = mockState.tick
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
	const t = mockState.tick
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
	const t = mockState.tick
	const type = data && data.type != null ? Number(data.type) : 1
	const size = 12
	const out = []
	for (let i = 0; i < size; i++) {
		const seed = t * 29 + i * 7 + type * 101
		out.push({
			num: i + 1,
			networkName: stationNames[i % stationNames.length],
			orderCount: 680 + Math.floor(seeded(seed + 1) * 420) + (t % 30),
			orderMoeny: 28600 + Math.floor(seeded(seed + 2) * 32000) + t * 31,
			chargingDegree: 8600 + Math.floor(seeded(seed + 3) * 12000) + t * 19,
		})
	}
	return out
}

function mockGetDeviceCount() {
	const t = mockState.tick
	const chargingStationCount = 86 + Math.floor(seeded(t + 1) * 6)
	const onLineCount = 1260 + t * 3 + Math.floor(seeded(t + 2) * 20)
	const unLineCount = 60 + (t % 25)
	return {
		onLineCount,
		unLineCount,
		chargingStationCount,
	}
}

function mockGetDeviceLogList() {
	const t = mockState.tick
	const now = Date.now()
	const size = 22
	const out = []
	for (let i = 0; i < size; i++) {
		const seed = t * 31 + i * 11
		const ts = new Date(now - (i * 28 + Math.floor(seeded(seed) * 20)) * 1000)
		const yy = String(ts.getFullYear()).slice(-2)
		const mm = pad2(ts.getMonth() + 1)
		const dd = pad2(ts.getDate())
		const seq = String(1 + ((t * 17 + i * 3) % 99999999)).padStart(8, '0')
		out.push({
			deviceCode: `${yy}${mm}${dd}${seq}`,
			createTime: formatDateTime(ts),
			Type: (i + t) % 2 === 0 ? 1 : 0,
		})
	}
	return out
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

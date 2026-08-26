import { getDictionarySelector } from '@/api/permission/dictionaryData'

const CACHE_TTL_MS = 5 * 60 * 1000
const cache = new Map()
/** @type {Map<string, Record<string, string>>} */
const labelMaps = new Map()

function extractList(res) {
	const data = res && res.data
	return Array.isArray(data) ? data : (data && Array.isArray(data.list) ? data.list : [])
}

function mapSelectorItems(list) {
	return (list || []).map(item => ({
		label: item.fullName,
		value: item.enCode
	}))
}

function rememberLabels(enCode, items) {
	const map = {}
	;(items || []).forEach(item => {
		map[String(item.value)] = item.label
	})
	labelMaps.set(enCode, map)
}

/**
 * @param {string} enCode
 * @returns {Promise<Array<{label:string,value:string}>>}
 */
export function getSelector(enCode) {
	const cached = cache.get(enCode)
	if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
		return Promise.resolve(cached.items)
	}
	return getDictionarySelector(enCode).then(res => {
		if (!res || res.code !== 200) {
			return []
		}
		const items = mapSelectorItems(extractList(res))
		cache.set(enCode, { items, timestamp: Date.now() })
		rememberLabels(enCode, items)
		return items
	}).catch(() => [])
}

/**
 * 下拉选项；numeric=true 时把纯数字 enCode 转为 Number，兼容原 el-option :value 数字绑定。
 * @param {string} enCode
 * @param {{ numeric?: boolean }} [opts]
 */
export function getSelectorOptions(enCode, opts = {}) {
	const numeric = !!opts.numeric
	return getSelector(enCode).then(items =>
		(items || []).map(item => {
			const raw = item.value
			const asNum = Number(raw)
			const useNum = numeric && raw !== '' && raw != null && !Number.isNaN(asNum) && String(asNum) === String(raw)
			return {
				label: item.label,
				value: useNum ? asNum : raw,
				name: item.label,
				fullName: item.label,
				enCode: raw,
				code: raw
			}
		})
	)
}

/**
 * 同步取标签；未加载到时回显原始 code（不伪造文案）。
 * @param {string} typeEnCode
 * @param {string|number} code
 */
export function formatDictLabel(typeEnCode, code) {
	if (code === null || code === undefined || code === '') {
		return '-'
	}
	const map = labelMaps.get(typeEnCode)
	if (!map) {
		getSelector(typeEnCode)
		return String(code)
	}
	const key = String(code)
	return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : String(code)
}

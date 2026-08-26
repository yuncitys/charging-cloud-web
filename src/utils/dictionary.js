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
		id: item.id,
		parentId: item.parentId == null || item.parentId === '' ? '0' : String(item.parentId),
		label: item.fullName,
		value: item.enCode,
		sortCode: item.sortCode,
		isDefault: item.isDefault
	}))
}

function rememberLabels(enCode, items) {
	const map = {}
	;(items || []).forEach(item => {
		// 树形中间节点 en_code 以 node: 开头，不进标签映射，避免污染叶子编码查标
		if (String(item.value || '').startsWith('node:')) return
		map[String(item.value)] = item.label
	})
	labelMaps.set(enCode, map)
}

/**
 * @param {string} enCode
 * @returns {Promise<Array<{id?:string,parentId?:string,label:string,value:string,sortCode?:number}>>}
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
 * 将 Selector 扁平数据组装为 el-cascader 树。
 * 叶子节点带 code（=enCode），与进件页 props `{ label:'label', value:'code', emitPath:false }` 对齐。
 * @param {Array<{id:string,parentId:string,label:string,value:string,sortCode?:number}>} items
 */
export function buildSelectorCascaderTree(items) {
	const byParent = {}
	;(items || []).forEach(item => {
		const pid = String(item.parentId || '0')
		if (!byParent[pid]) byParent[pid] = []
		byParent[pid].push(item)
	})
	Object.keys(byParent).forEach(key => {
		byParent[key].sort((a, b) => Number(a.sortCode || 0) - Number(b.sortCode || 0))
	})

	const walk = parentId => {
		return (byParent[parentId] || []).map(item => {
			const children = walk(String(item.id))
			const node = {
				label: item.label,
				value: item.value
			}
			if (children.length) {
				node.children = children
			} else {
				node.code = item.value
			}
			return node
		})
	}
	return walk('0')
}

/**
 * 树形字典 cascader 选项（如经营类目 trade_bus_kind）
 * @param {string} enCode
 */
export function getSelectorCascaderOptions(enCode) {
	return getSelector(enCode).then(items => buildSelectorCascaderTree(items))
}

/**
 * 开户行列表：兼容原 { bank_name, bank_code }
 * @param {string} [enCode='bank_no']
 */
export function getBankNoOptions(enCode = 'bank_no') {
	return getSelectorOptions(enCode).then(list =>
		(list || []).map(item => ({
			bank_name: item.label,
			bank_code: String(item.value),
			label: item.label,
			value: item.value
		}))
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

export function getOrderStatus(val) {
	return formatDictLabel('order_status', val)
}

export function getFinanceUserFlowTypeOptions() {
	return getSelectorOptions('finance_user_flow_type')
}

/** @deprecated 使用 getSelectorCascaderOptions('trade_bus_kind') */
export function getBusKindData() {
	return getSelectorCascaderOptions('trade_bus_kind')
}

/** @deprecated 使用 getBankNoOptions() */
export function getBankNo() {
	return getBankNoOptions()
}

/** Vue.prototype.$dict 挂载对象（兼作默认导出，兼容原 dictData 用法） */
const dictApi = {
	getSelector,
	getSelectorOptions,
	getSelectorCascaderOptions,
	getBankNoOptions,
	formatDictLabel,
	getOrderStatus,
	getFinanceUserFlowTypeOptions,
	getBusKindData,
	getBankNo
}

export default dictApi

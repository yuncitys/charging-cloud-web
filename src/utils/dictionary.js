import Vue from 'vue'
import { getDictionarySelector } from '@/api/permission/dictionaryData'

const CACHE_TTL_MS = 5 * 60 * 1000
const cache = new Map()
/** 进行中的同 code 请求去重，避免并发重复打接口 */
const inflight = new Map()
/** @type {Map<string, Record<string, string>>} */
const labelMaps = new Map()
/**
 * 字典加载完成后递增，供 formatDictLabel 在渲染期建立依赖，避免冷缓存一直显示原始 code。
 */
export const dictState = Vue.observable({ version: 0 })

function bumpDictVersion() {
	dictState.version += 1
}

/**
 * 清除所有前端字典本地缓存
 */
export function clearAllDictCache() {
	cache.clear()
	inflight.clear()
	labelMaps.clear()
	bumpDictVersion()
}

/**
 * 清除指定字典编码的前端本地缓存
 * @param {string} enCode
 */
export function clearDictCache(enCode) {
	if (!enCode) return
	cache.delete(enCode)
	inflight.delete(enCode)
	labelMaps.delete(enCode)
	bumpDictVersion()
}


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
		isDefault: item.isDefault,
		description: item.description || ''
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
	const pending = inflight.get(enCode)
	if (pending) {
		return pending
	}
	const req = getDictionarySelector(enCode).then(res => {
		if (!res || res.code !== 200) {
			return []
		}
		const items = mapSelectorItems(extractList(res))
		cache.set(enCode, { items, timestamp: Date.now() })
		rememberLabels(enCode, items)
		bumpDictVersion()
		return items
	}).catch(() => []).finally(() => {
		inflight.delete(enCode)
	})
	inflight.set(enCode, req)
	return req
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
				code: raw,
				description: item.description || ''
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
 * 渲染期会读取 dictState.version，加载完成后触发依赖更新。
 * @param {string} typeEnCode
 * @param {string|number} code
 */
export function formatDictLabel(typeEnCode, code) {
	void dictState.version
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

export function formatOrderType(val) {
	return formatDictLabel('order_type', val)
}

export function formatElectricOutType(val) {
	return formatDictLabel('electric_out_type', val)
}

export function formatChargingType(val) {
	return formatDictLabel('charging_type', val)
}

export function formatDeviceStatus(val) {
	return formatDictLabel('device_status', val)
}

const ORDER_PAY_METHOD_ALIASES = {
	BALANCE_PAY: 'BALANCE',
	WECHAT_PAY: 'WECHAT',
	ALI_PAY: 'ALIPAY',
	WECHAT_SCORE_PAY: 'WECHAT_SCORE',
	COMPANY_BALANC: 'COMPANY_BALANCE',
	COMPANY_BALANCE_PAY: 'COMPANY_BALANCE'
}

export function normalizeOrderPayMethodCode(payType) {
	if (payType == null || payType === '') return ''
	const text = String(payType).toUpperCase()
	return ORDER_PAY_METHOD_ALIASES[text] || text
}

export function formatOrderPayMethod(payType) {
	const code = normalizeOrderPayMethodCode(payType)
	if (!code) return '-'
	return formatDictLabel('order_pay_method', code)
}

export function formatOrderStartType(val) {
	return formatDictLabel('order_start_type', val)
}

export function formatPriceType(val) {
	return formatDictLabel('price_type', val)
}

export function formatDeviceRule(val) {
	return formatDictLabel('device_rule', val)
}

export function formatDeviceActivateStatus(val) {
	return formatDictLabel('device_activate_status', val)
}

export function formatConnectorStatus(val) {
	return formatDictLabel('connector_status', val)
}

/** 设备控制页枪口状态颜色：0空闲 1占用 2离线 3故障 4占位 5预约占位 */
export function getConnectorStatusColor(status) {
	const colors = {
		0: '',
		1: '#FCCC40',
		2: '#909399',
		3: '#F56C6C',
		4: '#E6A23C',
		5: '#409EFF'
	}
	if (status === null || status === undefined || status === '') return '#606266'
	return colors[Number(status)] !== undefined ? colors[Number(status)] : '#606266'
}

export function formatOrgType(val) {
	return formatDictLabel('org_type', val)
}

export function formatFeeCollectFlag(val) {
	return formatDictLabel('fee_collect_flag', val)
}

export function formatFinanceSplitType(val) {
	const code = val === null || val === undefined || val === '' ? val : (String(val) === '0' ? '0' : '1')
	return formatDictLabel('finance_split_type', code)
}

export function formatMerchantInvoiceType(val) {
	return formatDictLabel('merchant_invoice_type', val)
}

export function formatMerchantRoleType(val) {
	if (val === null || val === undefined || val === '') return '-'
	let roles = []
	if (typeof val === 'string') {
		roles = val.split(',')
	} else if (Array.isArray(val)) {
		roles = val
	} else {
		roles = [String(val)]
	}
	const labels = roles.map(r => formatDictLabel('merchant_role_type', String(r).trim())).filter(Boolean)
	return labels.length ? labels.join('，') : '-'
}

export function formatWithdrawCashStatus(val) {
	return formatDictLabel('withdraw_cash_status', val)
}

export function formatWithdrawPayType(val) {
	return formatDictLabel('withdraw_pay_type', val)
}

export function formatAccountStatus(val) {
	return formatDictLabel('account_status', val)
}

export function formatBindStatus(val) {
	return formatDictLabel('bind_status', val)
}

export function formatSysRoleType(val) {
	return formatDictLabel('sys_role_type', val)
}

export function formatIotCardStatus(val) {
	return formatDictLabel('iot_card_status', val)
}

export function formatSysDataScope(val) {
	return formatDictLabel('sys_data_scope', val)
}

export function formatChargeCardStatus(val) {
	return formatDictLabel('charge_card_status', val)
}

export function formatAdMediaType(val) {
	return formatDictLabel('ad_media_type', val)
}

export function formatRechargeRuleMode(val) {
	return formatDictLabel('recharge_rule_mode', val)
}

export function formatTaskExportStatus(val) {
	return formatDictLabel('task_export_status', val)
}

export function formatChargeMode(val) {
	return formatDictLabel('charge_mode', val)
}

export function formatChargeCollectType(val) {
	return formatDictLabel('charge_collect_type', val)
}

export function formatChargeBillingCycle(val) {
	const code = val === true || val === 'true' ? 1 : val === false || val === 'false' ? 0 : val
	return formatDictLabel('charge_billing_cycle', code)
}

export function formatDeviceChargePattern(val) {
	return formatDictLabel('device_charge_pattern', val)
}

/** 列表「是否免费」：2=是，其它=否 */
export function formatDeviceIsFree(val) {
	return Number(val) === 2 ? '是' : '否'
}

export function formatInterCheckBillType(val) {
	return formatDictLabel('inter_check_bill_type', val)
}

export function formatInterPushPriceType(val) {
	return formatDictLabel('inter_push_price_type', val)
}

export function formatElectricDecimalPlaces(val) {
	return formatDictLabel('electric_decimal_places', val)
}

export function formatSettlementLedgerLineType(val) {
	return formatDictLabel('settlement_ledger_line_type', val)
}

export function formatSysOperBusinessType(val) {
	return formatDictLabel('sys_oper_business_type', val)
}

export function formatSysOperOperatorType(val) {
	return formatDictLabel('sys_oper_operator_type', val)
}

export function formatSysCommonResult(val) {
	return formatDictLabel('sys_common_result', val)
}

export function formatDriverEnableStatus(val) {
	return formatDictLabel('driver_enable_status', val)
}

export function formatEnableStatus(val) {
	return formatDictLabel('enable_status', val)
}

export function formatDeviceQrcodeSyncType(val) {
	return formatDictLabel('device_qrcode_sync_type', val)
}

export function formatInvoiceChannelType(val) {
	return formatDictLabel('invoice_channel_type', val)
}

export function formatInvoiceChannelFlag(val) {
	return formatDictLabel('invoice_channel_flag', val)
}

export function formatInvoiceRoleTypePt(val) {
	return formatDictLabel('invoice_role_type_pt', val)
}

export function formatInvoiceRoleTypeWq(val) {
	return formatDictLabel('invoice_role_type_wq', val)
}

export function formatInvoiceRoleType(channelType, val) {
	return Number(channelType) === 4 ? formatInvoiceRoleTypePt(val) : formatInvoiceRoleTypeWq(val)
}

export function formatPowerChargeType(val) {
	return formatDictLabel('power_charge_type', val)
}

export function getInvoiceChannelTypeOptions() {
	return getSelectorOptions('invoice_channel_type')
}

export function getInvoiceChannelFlagOptions() {
	return getSelectorOptions('invoice_channel_flag')
}

export function getInvoiceRoleTypePtOptions() {
	return getSelectorOptions('invoice_role_type_pt')
}

export function getInvoiceRoleTypeWqOptions() {
	return getSelectorOptions('invoice_role_type_wq')
}

export function getPowerChargeTypeOptions() {
	return getSelectorOptions('power_charge_type', { numeric: true })
}

export function getStationLocationOptions() {
	return getSelectorOptions('station_location', { numeric: true })
}

export function getChargeCardStatusOptions() {
	return getSelectorOptions('charge_card_status', { numeric: true })
}

export function getAdMediaTypeOptions() {
	return getSelectorOptions('ad_media_type', { numeric: true })
}

export function getRechargeRuleModeOptions() {
	return getSelectorOptions('recharge_rule_mode')
}

export function getTaskExportStatusOptions() {
	return getSelectorOptions('task_export_status', { numeric: true })
}

export function getChargeModeOptions() {
	return getSelectorOptions('charge_mode', { numeric: true })
}

export function getChargeCollectTypeOptions() {
	return getSelectorOptions('charge_collect_type', { numeric: true })
}

export function getChargeBillingCycleOptions() {
	return getSelectorOptions('charge_billing_cycle', { numeric: true })
}

export function getDeviceChargePatternOptions() {
	return getSelectorOptions('device_charge_pattern', { numeric: true })
}

export function getInterCheckBillTypeOptions() {
	return getSelectorOptions('inter_check_bill_type', { numeric: true })
}

export function getInterPushPriceTypeOptions() {
	return getSelectorOptions('inter_push_price_type', { numeric: true })
}

export function getElectricDecimalPlacesOptions() {
	return getSelectorOptions('electric_decimal_places', { numeric: true })
}

export function getSettlementLedgerLineTypeOptions() {
	return getSelectorOptions('settlement_ledger_line_type', { numeric: true })
}

export function getSysOperBusinessTypeOptions() {
	return getSelectorOptions('sys_oper_business_type', { numeric: true })
}

export function getSysOperOperatorTypeOptions() {
	return getSelectorOptions('sys_oper_operator_type', { numeric: true })
}

export function getSysCommonResultOptions() {
	return getSelectorOptions('sys_common_result', { numeric: true })
}

export function getDriverEnableStatusOptions() {
	return getSelectorOptions('driver_enable_status', { numeric: true })
}

export function getEnableStatusOptions() {
	return getSelectorOptions('enable_status', { numeric: true })
}

export function getDeviceQrcodeSyncTypeOptions() {
	return getSelectorOptions('device_qrcode_sync_type', { numeric: true })
}

export function getAccountStatusOptions() {
	return getSelectorOptions('account_status', { numeric: true })
}

export function getBindStatusOptions() {
	return getSelectorOptions('bind_status', { numeric: true })
}

export function getSysRoleTypeOptions() {
	return getSelectorOptions('sys_role_type', { numeric: true })
}

export function getIotCardStatusOptions() {
	return getSelectorOptions('iot_card_status', { numeric: true })
}

/** 角色表单可选数据权限（与历史表单一致：仅本人及下级 / 仅本人） */
export function getSysDataScopeFormOptions() {
	return getSelectorOptions('sys_data_scope', { numeric: true }).then(list =>
		(list || []).filter(item => [2, 3].includes(Number(item.value)))
	)
}

export function getDeviceStatusOptions() {
	return getSelectorOptions('device_status', { numeric: true })
}

export function getElectricOutTypeOptions() {
	return getSelectorOptions('electric_out_type', { numeric: true })
}

/** 单车业态仅交流；汽车业态交流+直流 */
export function getElectricOutOptionsForRule(ruleId) {
	return getElectricOutTypeOptions().then(list => {
		const all = list || []
		if (Number(ruleId) === 1) {
			return all.filter(item => Number(item.value) === 0)
		}
		return all
	})
}

/** 按字典 description（ruleId）过滤接入协议选项 */
export function filterDeviceProtocolOptionsByRule(list, ruleId) {
	const rule = String(Number(ruleId))
	return (list || []).filter(item => {
		const desc = (item.description || '').trim()
		if (!desc) return true
		return desc.split(/[,，]/).map(s => s.trim()).includes(rule)
	})
}

export function getDeviceBrandOptions() {
	return getSelectorOptions('device_brand')
}

export function getTcecEquipmentTypeOptions() {
	return getSelectorOptions('tcec_equipment_type', { numeric: true })
}

export function getDeviceProtocolOptions() {
	return getSelectorOptions('device_protocol')
}

export function getDeviceProtocolOptionsForRule(ruleId) {
	return getDeviceProtocolOptions().then(list => filterDeviceProtocolOptionsByRule(list, ruleId))
}

export function formatDeviceBrand(val) {
	return formatDictLabel('device_brand', val)
}

export function formatDeviceProtocol(val) {
	return formatDictLabel('device_protocol', val)
}

export function formatTcecEquipmentType(val) {
	return formatDictLabel('tcec_equipment_type', val)
}

export function getDeviceRuleOptions() {
	return getSelectorOptions('device_rule', { numeric: true })
}

export function getPriceTypeOptions() {
	return getSelectorOptions('price_type', { numeric: true })
}

export function getFinanceUserFlowTypeOptions() {
	return getSelectorOptions('finance_user_flow_type')
}

export function getFinanceOrgFlowTypeOptions() {
	return getSelectorOptions('finance_org_flow_type')
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
	formatOrderType,
	formatElectricOutType,
	formatChargingType,
	formatDeviceStatus,
	normalizeOrderPayMethodCode,
	formatOrderPayMethod,
	formatOrderStartType,
	formatPriceType,
	formatDeviceRule,
	formatDeviceBrand,
	formatDeviceProtocol,
	formatTcecEquipmentType,
	formatDeviceActivateStatus,
	formatConnectorStatus,
	getConnectorStatusColor,
	formatOrgType,
	formatFeeCollectFlag,
	formatFinanceSplitType,
	formatMerchantInvoiceType,
	formatMerchantRoleType,
	formatWithdrawCashStatus,
	formatWithdrawPayType,
	formatAccountStatus,
	formatBindStatus,
	formatSysRoleType,
	formatIotCardStatus,
	formatSysDataScope,
	formatChargeCardStatus,
	formatAdMediaType,
	formatRechargeRuleMode,
	formatTaskExportStatus,
	formatChargeMode,
	formatChargeCollectType,
	formatChargeBillingCycle,
	formatDeviceChargePattern,
	formatDeviceIsFree,
	formatInterCheckBillType,
	formatInterPushPriceType,
	formatElectricDecimalPlaces,
	formatSettlementLedgerLineType,
	formatSysOperBusinessType,
	formatSysOperOperatorType,
	formatSysCommonResult,
	formatDriverEnableStatus,
	formatEnableStatus,
	formatDeviceQrcodeSyncType,
	formatInvoiceChannelType,
	formatInvoiceChannelFlag,
	formatInvoiceRoleTypePt,
	formatInvoiceRoleTypeWq,
	formatInvoiceRoleType,
	formatPowerChargeType,
	getInvoiceChannelTypeOptions,
	getInvoiceChannelFlagOptions,
	getInvoiceRoleTypePtOptions,
	getInvoiceRoleTypeWqOptions,
	getPowerChargeTypeOptions,
	getStationLocationOptions,
	getChargeCardStatusOptions,
	getAdMediaTypeOptions,
	getRechargeRuleModeOptions,
	getTaskExportStatusOptions,
	getChargeModeOptions,
	getChargeCollectTypeOptions,
	getChargeBillingCycleOptions,
	getDeviceChargePatternOptions,
	getInterCheckBillTypeOptions,
	getInterPushPriceTypeOptions,
	getElectricDecimalPlacesOptions,
	getSettlementLedgerLineTypeOptions,
	getSysOperBusinessTypeOptions,
	getSysOperOperatorTypeOptions,
	getSysCommonResultOptions,
	getDriverEnableStatusOptions,
	getEnableStatusOptions,
	getDeviceQrcodeSyncTypeOptions,
	getAccountStatusOptions,
	getBindStatusOptions,
	getSysRoleTypeOptions,
	getIotCardStatusOptions,
	getSysDataScopeFormOptions,
	getDeviceStatusOptions,
	getElectricOutTypeOptions,
	getElectricOutOptionsForRule,
	getDeviceRuleOptions,
	getDeviceBrandOptions,
	getTcecEquipmentTypeOptions,
	getDeviceProtocolOptions,
	getDeviceProtocolOptionsForRule,
	getPriceTypeOptions,
	getFinanceUserFlowTypeOptions,
	getFinanceOrgFlowTypeOptions,
	getBusKindData,
	getBankNo,
	clearAllDictCache,
	clearDictCache
}

export default dictApi

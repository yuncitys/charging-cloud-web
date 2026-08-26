import { getSelector as fetchDictionarySelector, formatDictLabel, getSelectorOptions, getSelectorCascaderOptions, getBankNoOptions } from './dictionary'

class dictData {
	getSelector(enCode) {
		return fetchDictionarySelector(enCode)
	}

	getSelectorOptions(enCode, opts) {
		return getSelectorOptions(enCode, opts)
	}

	getSelectorCascaderOptions(enCode) {
		return getSelectorCascaderOptions(enCode)
	}

	getOrderStatus(val) {
		return formatDictLabel('order_status', val)
	}

	/**
	 * @returns {Promise<Array<{label:string,value:string}>>}
	 */
	getFinanceUserFlowTypeOptions() {
		return getSelectorOptions('finance_user_flow_type')
	}

	/** @deprecated 使用 getSelectorCascaderOptions('trade_bus_kind') */
	getBusKindData() {
		return getSelectorCascaderOptions('trade_bus_kind')
	}

	/** @deprecated 使用 getBankNoOptions() */
	getBankNo() {
		return getBankNoOptions()
	}
}
export default new dictData()

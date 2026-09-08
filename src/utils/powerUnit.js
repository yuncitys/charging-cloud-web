/** 库内功率单位为 W，Web 录入/展示使用 kW */

export function wattsToKw(watts) {
	if (watts == null || watts === '') return ''
	const w = Number(watts)
	if (!Number.isFinite(w) || w < 0) return ''
	if (w === 0) return '0'
	return parseFloat((w / 1000).toFixed(3)).toString()
}

export function kwToWatts(kw) {
	if (kw == null || kw === '') return null
	const k = Number(kw)
	if (!Number.isFinite(k) || k <= 0) return null
	return Math.round(k * 1000)
}

export function formatWattsAsKw(watts, fallback = '—') {
	const kw = wattsToKw(watts)
	return kw === '' ? fallback : `${kw} kW`
}

/** 表单校验：正数 kW，最多 3 位小数 */
export function createKwValidator(emptyMessage = '必填信息', invalidMessage = '请输入大于 0 的功率(kW)') {
	return (rule, value, callback) => {
		if (value === '' || value == null) {
			callback(new Error(emptyMessage))
			return
		}
		const k = Number(value)
		if (!Number.isFinite(k) || k <= 0) {
			callback(new Error(invalidMessage))
			return
		}
		callback()
	}
}

/** 设备参数：较大功率用 kW 录入，小阈值仍用 W */
export const DEVICE_PARAM_KW_FIELDS = ['totalPowerUpper', 'powerUpper', 'highPowerUpper']

export function convertDevicePowerFieldsToKw(form, fields = DEVICE_PARAM_KW_FIELDS) {
	if (!form) return
	fields.forEach(key => {
		if (form[key] != null && form[key] !== '') {
			form[key] = wattsToKw(form[key])
		}
	})
}

export function convertDevicePowerFieldsToWatts(form, fields = DEVICE_PARAM_KW_FIELDS) {
	if (!form) return { ...form }
	const out = { ...form }
	fields.forEach(key => {
		if (out[key] != null && out[key] !== '') {
			const w = kwToWatts(out[key])
			if (w != null) out[key] = w
		}
	})
	return out
}

/** Excel 批量导入：「设备功率」列填 kW，提交前 ×1000 转为 W */
export function convertDeviceImportRowsToWatts(rows) {
	if (!Array.isArray(rows)) return rows
	return rows.map(row => {
		if (!row) return row
		if (row.deviceTotalPower == null || row.deviceTotalPower === '') return row
		const w = kwToWatts(row.deviceTotalPower)
		return {
			...row,
			deviceTotalPower: w != null ? w : row.deviceTotalPower
		}
	})
}

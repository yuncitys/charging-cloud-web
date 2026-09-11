/** 设备档案总功率：表单 kW，接口 W */
import { wattsToKw, kwToWatts, createKwValidator } from '@/utils/powerUnit.js'

export default {
	methods: {
		wattsToKw,
		kwToWatts,
		validateDeviceTotalPowerKw: createKwValidator('请输入设备总功率', '请输入大于 0 的功率(kW)'),
		toApiDeviceTotalPower(kwValue) {
			return kwToWatts(kwValue)
		},
		toFormDeviceTotalPowerKw(wattsValue) {
			return wattsToKw(wattsValue)
		}
	}
}

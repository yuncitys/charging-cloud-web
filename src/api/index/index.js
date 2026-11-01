import request from '@/utils/request'

function postForm(url, data) {
	return request({
		url,
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		},
		transformRequest: [
			function(data) {
				var ret = ''
				for (var it in data) {
					if (data[it] === undefined || data[it] === null || data[it] === '') continue
					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
				}
				return ret.substring(0, ret.lastIndexOf('&'))
			}
		],
		data
	})
}

/** 首页顶部合计 */
export function findHomePanelSummary(data) {
	return postForm('/api/web/home/panelSummary', data || {})
}

/** 首页近 7 日趋势 */
export function findHomeDailyTrend(data) {
	return postForm('/api/web/home/dailyTrend', data || {})
}

/** 首页支付类型笔数占比 */
export function findHomePayTypeRatio(data) {
	return postForm('/api/web/home/payTypeRatio', data || {})
}

/** 首页近 12 月趋势 */
export function findHomeMonthTrend(data) {
	return postForm('/api/web/home/monthTrend', data || {})
}

/** 首页站点省份占比 */
export function findHomeDataByNetWork(data) {
	return postForm('/api/web/home/networkdot', data || {})
}

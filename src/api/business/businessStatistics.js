import request from '@/utils/request'

export function getReportsStatistics(data) {
	return request({
		url: '/api/web/reports/statistics',
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

//  查询设备
export function getDeviceStatistics(data) {
	return request({
		url: '/api/web/reports/device',
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

// 导出报表信息
export function exportDeviceReport(data) {
	return request({
		url: '/api/web/reports/export',
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

// 查询经销商列表信息
export function findDealerList(data) {
	return request({
		url: '/api/web/device/findDealerList',
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

// 充电趋势详情
export function chargingTrendList(data) {
  return request({
    url: '/api/web/reports/chargingTrend/list',
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

// 充电趋势曲线
export function chargingTrend(data) {
  return request({
    url: '/api/web/reports/chargingTrend/statistics',
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

// 充电站趋势
export function chargingStationSection(data) {
  return request({
    url: '/api/web/reports/chargingStationSection',
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

// 充电站趋势
export function chargingStationSingle(data) {
  return request({
    url: '/api/web/reports/chargingStationSingle',
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

// 充电站趋势
export function chargingStationFund(data) {
  return request({
    url: '/api/web/reports/chargingStationFund',
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

// 交易趋势
export function chargingUserTradingCurve(data) {
  return request({
    url: '/api/web/reports/chargingUserTradingCurve',
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

// 交易趋势
export function chargingUserTradingSection(data) {
  return request({
    url: '/api/web/reports/chargingUserTradingSection',
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

// 交易趋势
export function chargingUserTradingSingle(data) {
  return request({
    url: '/api/web/reports/chargingUserTradingSingle',
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


// 用户充电明细
export function chargingUserChargeSingle(data) {
  return request({
    url: '/api/web/reports/chargingUserChargeSingle',
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


// 用户充电汇总
export function chargingUserChargeSection(data) {
  return request({
    url: '/api/web/reports/chargingUserChargeSection',
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

// 用户充电趋势
export function chargingUserChargeCurve(data) {
  return request({
    url: '/api/web/reports/chargingUserChargeCurve',
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


// 分账明细
export function chargingOrderSplitSingle(data) {
  return request({
    url: '/api/web/reports/chargingOrderSplitSingle',
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


// 分账汇总
export function chargingOrderSplitSection(data) {
  return request({
    url: '/api/web/reports/chargingOrderSplitSection',
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

// 分账趋势
export function chargingOrderSplitCurve(data) {
  return request({
    url: '/api/web/reports/chargingOrderSplitCurve',
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

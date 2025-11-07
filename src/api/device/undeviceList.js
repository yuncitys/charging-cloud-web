// import request from '@/utils/request'

// export function getList(data) {
// 	return request({
// 		url: '/sys/device/findDeviceInfoList',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }
// // 查询设备操作指令列表
// export function findDeviceCommand(data) {
// 	return request({
// 		url: '/sys/command/findDeviceCommand',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }

// // 启动全部端口
// export function openAllPort(data) {
// 	return request({
// 		url: '/mqtt/device/openAllPort',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }



// // 启动单个端口
// export function openOnePort(data) {
// 	return request({
// 		url: '/mqtt/device/openOnePort',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }


// // 关闭单个端口
// export function closePort(data) {
// 	return request({
// 		url: '/mqtt/device/closePort',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }

// // 删除设备
// export function deleteDevice(data) {
// 	return request({
// 		url: '/sys/device/deleteDevice',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }


// // 指令查询操作
// export function queryDeviceToCommand(data) {
// 	return request({
// 		url: '/mqtt/device/queryDeviceToCommand',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }


// // 查询设备单个端口剩余时间/电量
// export function queryOneProtStatus(data) {
// 	return request({
// 		url: '/mqtt/device/queryOneProtStatus',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }

// // 续充设备单端口
// export function chargeOnePort(data) {
// 	return request({
// 		url: '/mqtt/device/chargeOnePort',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }


// // 添加设备
// export function addDevice(data) {
// 	return request({
// 		url: '/sys/device/addDevice',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }

// // 编辑设备
// export function updateDevice(data) {
// 	return request({
// 		url: '/sys/device/updateDevice',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }

// // 查询设备类型
// export function findDeviceType(data) {
// 	return request({
// 		url: '/sys/device/findDeviceType',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }

// // 根据id查询设备详情
// export function findDeviceInfoById(data) {
// 	return request({
// 		url: '/sys/device/findDeviceInfoById',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }


// // 查询经销商列表信息
// export function findDealerList(data) {
// 	return request({
// 		url: '/sys/device/findDealerList',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }

// // 根据经销商id查询对应的网点信息
// export function findOrderInfo(data) {
// 	return request({
// 		url: '/sys/device/findNetworkList',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }

// // 分配设备
// export function deviceAllocation(data) {
// 	return request({
// 		url: '/sys/device/deviceAllocation',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }


// // 批量分配设备
// export function batchUpdateNetworkDot(data) {
// 	return request({
// 		url: '/sys/device/batchUpdateNetworkDot',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }

// // 导出excel
// export function downloadExcel(data) {
// 	return request({
// 		url: '/sys/device/downLoadFindDeviceList',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }

// //设备导入
// export function uploadExcel(data) {
// 	return request({
// 		url: '/sys/device/uploadDeviceExcel',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "multipart/form-data",
// 		},
// 		data
// 	})
// }


// // 添加收费方案
// export function addDevicePrice(data) {
// 	return request({
// 		url: '/sys/device/addDevicePrice',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }

// // 批量添加收费方案
// export function batchAddDevicePrice(data) {
// 	return request({
// 		url: '/sys/device/batchAddDevicePrice',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }


// // 查询方案名称
// export function findDevicePriceByPriceType(data) {
// 	return request({
// 		url: '/sys/price/findDevicePriceByPriceType',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }


// // 设备配置导出
// export function downLoadDeviceCodes(data) {
// 	return request({
// 		url: '/sys/device/downloadDeviceCodes',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }


// // 设置参数
// export function setParmDevice(data) {
// 	return request({
// 		url: '/mqtt/device/setParmDevice',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }


// // 查询设备操作指令
// export function findDeviceCommandDetails(data) {
// 	return request({
// 		url: '/mqtt/device/findDeviceCommandDetails',
// 		method: 'post',
// 		headers: {
// 			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
// 		},
// 		transformRequest: [
// 			function(data) {
// 				var ret = ''
// 				for (var it in data) {
// 					ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
// 				}
// 				ret = ret.substring(0, ret.lastIndexOf('&'))
// 				return ret
// 			}
// 		],
// 		data
// 	})
// }
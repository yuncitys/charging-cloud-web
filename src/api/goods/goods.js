import request from '@/utils/request'

//商品列表
export function getList(query) {
	return request({
		url: '/goods/list',
		method: 'get',
		params: query
	})
}
//海报上架
export function updateBannerById(query) {
	return request({
		url: '/goods/updateBannerById',
		method: 'get',
		params: query,
	})
}

//删除
export function deleteGood(query) {
	return request({
		url: '/goods',
		method: 'delete',
		params: query,
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
	})
}

//更新商品
export function putGood(data) {
	return request({
		url: '/goods',
		method: 'put',
		data
	})
}

//获取 商品所属分类、所属品牌商数据
export function catAndBrand(query) {
	return request({
		url: '/goods/catAndBrand',
		method: 'get',
		params: query,
	})
}

//商品上架
export function setGoods(data) {
	return request({
		url: '/goods/create',
		method: 'post',
		data
	})
}

//获取 商品详情
export function getdetail(data) {
	return request({
		url: '/goods/detail',
		method: 'post',
		data,
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
	})
}

//订单详情
export function getOrderdetail(query) {
	return request({
		url: '/webOrder/detail',
		method: 'get',
		params: query,
	})
}


//订单发货
export function setship(data) {
	return request({
		url: '/webOrder/ship',
		method: 'post',
		data,
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
	})
}

//订单退款
export function setrefund(data) {
	return request({
		url: '/webOrder/refund',
		method: 'post',
		data,
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
	})
}


export function webOrder(data) {
	return request({
		url: '/webOrder/delete',
		method: 'post',
		data,
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
	})
}

//订单详情
export function getOrderList(query) {
	return request({
		url: '/webOrder/list',
		method: 'get',
		params: query,
	})
}

//上传图片
export function uploadImg(data) {
	return request({
		url: '/sys/uploadImg/banner',
		method: 'post',
		headers: {
			"Content-Type": "multipart/form-data",
		},
		data
	})
}
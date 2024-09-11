import QrCode from 'qrcode-decoder'
let timer, flag;
class Common {
	/**
	 * 节流原理：在一定时间内，只能触发一次
	 * 
	 * @param {Function} func 要执行的回调函数 
	 * @param {Number} wait 延时的时间
	 * @param {Boolean} immediate 是否立即执行
	 * @return null
	 */
	throttle(func, wait = 500, immediate = true) {
		if (immediate) {
			if (!flag) {
				flag = true;
				// 如果是立即执行，则在wait毫秒内开始时执行
				typeof func === 'function' && func();
				timer = setTimeout(() => {
					flag = false;
				}, wait);
			}
		} else {
			if (!flag) {
				flag = true
				// 如果是非立即执行，则在wait毫秒内的结束处执行
				timer = setTimeout(() => {
					flag = false
					typeof func === 'function' && func();
				}, wait);
			}

		}
	};
	//判断是否为移动端
	isMobile() {
		let flag = navigator.userAgent.match(
			/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
		)
		return flag;
	}
	getQrUrl(file) {
		// 获取临时路径 chrome有效，其他浏览器的方法请自行查找
		const url = window.webkitURL.createObjectURL(file)
		// 初始化
		const qr = new QrCode()
		// 解析二维码，返回promise
		return qr.decodeFromImage(url)
	}
	//获取链接参数
	gup(name, url) {
		if (!url) url = location.href;
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(url);
		return results == null ? null : results[1];
	}
	//截取url参数
	parseQueryString(url) {
		var params = {};
		var arr = url.split("?");
		if (arr.length <= 1) {
			return params;
		}
		arr = arr[1].split("&");
		for (var i = 0, l = arr.length; i < l; i++) {
			var a = arr[i].split("=");
			params[a[0]] = a[1];
		}
		console.log(params)
		return params;
	}
	setSeconds(value) {
		value = value * 60
		var result = ""
		var sencond = parseInt(value)
		//3600秒等于60分钟等于1小时
		if (sencond > 3600 * 24) { //表示大于一天
			var day = sencond / (3600 * 24);
			sencond = sencond % (3600 * 24); //求天数整除外剩余的秒数
			var hour = sencond / 3600; //1小时==60分钟==3600秒，所以剩余的秒数÷3600= 得到几个小时数
			result = parseInt(day) + "天" + parseInt(hour) + "小时";
		} else if (sencond > 3600) { //表示大于一个小时
			var hour = sencond / 3600;
			var minute = sencond % 3600 / 60; //求小时数整除外剩余的秒数， 秒数÷60秒 = 得到几分钟
			result = parseInt(hour) + "小时" + parseInt(minute) + "分钟";
		} else if (sencond > 60) { //表示大于一分钟
			var minute = sencond / 60;
			var sec = sencond % 60; //求分钟数整除外剩余的秒数
			result = parseInt(minute) + "分"
		}
		return result
	}
}
export default new Common()
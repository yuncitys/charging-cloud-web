const base = (typeof window !== 'undefined' && window.BaseConfig) ? window.BaseConfig : {}

// 二维码地址
const codeUrl = base.VUE_APP_DOWNLOAD ? `${base.VUE_APP_DOWNLOAD}/weixin/miniprogram` : 'http://127.0.0.1:8868/weixin/miniprogram'
// 服务接口网关
const APIURl = base.VUE_BASE_API || 'http://127.0.0.1:8868'
export default {
	codeUrl,
  APIURl
}

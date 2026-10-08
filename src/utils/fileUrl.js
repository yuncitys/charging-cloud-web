import Global from './global_variable'

/** 网关相对路径（/api/...）补全为完整地址；http(s) 绝对地址原样返回 */
export function fullFileUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return ((Global && Global.APIURl) || '') + url
}

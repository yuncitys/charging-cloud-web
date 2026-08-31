import { getSelector } from './dictionary'

/** 字典类型编码：支付渠道服务商 */
export const PAY_SERVICE_PROVIDER_DICT = 'pay_service_provider'

let labelMap = {}
let loadPromise = null

function toOptionList(items) {
  return (items || []).map(item => ({
    enCode: item.value,
    fullName: item.label,
    code: item.value,
    name: item.label,
    label: item.label,
    value: item.value
  }))
}

/**
 * 从字典 Selector 加载服务商列表，并刷新本地 label 缓存。
 * 失败或空结果返回 []，不伪造本地映射。
 * @returns {Promise<Array<{enCode,fullName,code,name,label,value}>>}
 */
export function loadServiceProviderDict() {
  if (!loadPromise) {
    loadPromise = getSelector(PAY_SERVICE_PROVIDER_DICT)
      .then(items => {
        if (items && items.length) {
          const next = {}
          items.forEach(item => {
            next[item.value] = item.label
          })
          labelMap = next
          return toOptionList(items)
        }
        labelMap = {}
        return []
      })
      .catch(() => {
        loadPromise = null
        labelMap = {}
        return []
      })
  }
  return loadPromise
}

export function formatServiceProvider(code) {
  loadServiceProviderDict()
  return labelMap[code] || code || '-'
}

export function isLocalChannel(code) {
  return code === 'local'
}

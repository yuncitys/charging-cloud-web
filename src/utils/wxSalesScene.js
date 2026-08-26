import { getSelector, formatDictLabel } from './dictionary'

/** 字典类型：微信进件经营场景 */
export const WX_SALES_SCENE_DICT = 'wx_sales_scene'

/** 场景附件配置（含 field/multiple，不适合纯字典） */
export const WX_SCENE_ATTACHMENT = {
  SALES_SCENES_STORE: [
    { type: '05', label: '门头照', field: 'storeEntranceImg' },
    { type: '06', label: '店内环境照', field: 'storeInteriorImg' }
  ],
  SALES_SCENES_MINI_PROGRAM: [
    { type: '07', label: '小程序截图', field: 'miniProgramPics', multiple: true }
  ],
  SALES_SCENES_MP: [
    { type: '08', label: '公众号页面截图', field: 'mpPics', multiple: true }
  ],
  SALES_SCENES_WEB: [
    { type: '11', label: '网站授权函', field: 'webAuthorisationImg', optional: true }
  ],
  SALES_SCENES_APP: [
    { type: '09', label: 'App 截图', field: 'appPics', multiple: true }
  ],
  SALES_SCENES_WEWORK: [
    { type: '10', label: '企业微信截图', field: 'weworkPics', multiple: true }
  ]
}

export function loadWxSalesSceneOptions() {
  return getSelector(WX_SALES_SCENE_DICT)
}

export function formatSalesSceneLabels(values) {
  if (!Array.isArray(values) || !values.length) return '-'
  return values.map(v => formatDictLabel(WX_SALES_SCENE_DICT, v)).join('、')
}

export function defaultWxTradeEntryWx() {
  return {
    settlementId: '',
    qualificationType: '',
    salesScenesTypes: ['SALES_SCENES_STORE'],
    mpAppid: '',
    mpSubAppid: '',
    miniProgramAppid: '',
    miniProgramSubAppid: '',
    webDomain: '',
    webAppid: '',
    appAppid: '',
    appSubAppid: '',
    weworkSubCorpId: ''
  }
}

/** 将 API 返回的 tradeEntryWx 扁平化为表单对象 */
export function flattenTradeEntryWx(wxExt) {
  const base = defaultWxTradeEntryWx()
  if (!wxExt || typeof wxExt !== 'object') return base
  Object.assign(base, wxExt)
  if (typeof wxExt.salesScenesTypes === 'string') {
    try {
      base.salesScenesTypes = JSON.parse(wxExt.salesScenesTypes)
    } catch (e) {
      base.salesScenesTypes = ['SALES_SCENES_STORE']
    }
  }
  if (wxExt.extJson) {
    try {
      const ext = typeof wxExt.extJson === 'string' ? JSON.parse(wxExt.extJson) : wxExt.extJson
      Object.assign(base, ext)
    } catch (e) {
      // ignore
    }
  }
  if (!base.salesScenesTypes || !base.salesScenesTypes.length) {
    base.salesScenesTypes = ['SALES_SCENES_STORE']
  }
  if (!base.settlementId && base.qualificationType && /^\d+$/.test(String(base.qualificationType))) {
    base.settlementId = base.qualificationType
    base.qualificationType = ''
  }
  return base
}

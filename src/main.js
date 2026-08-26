import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
// import 'lib-flexible/flexible'
import i18n from './lang' // internationalization
import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log
import './directives' // global directives

import VueQuillEditor from 'vue-quill-editor'
Vue.use(VueQuillEditor);
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import Editor from './components/editor/edit.vue';
Vue.component("Editor", Editor);

import Print from 'vue-print-nb'
Vue.prototype.$print = Print;
Vue.use(Print)


import Global from './utils/global_variable.js'

Vue.prototype.Global = Global

import common from './utils/common.js'
Vue.prototype.$common = common

import dictData from './utils/dictData.js'
import { getSelector } from './utils/dictionary'
Vue.prototype.$dict = dictData
;['order_status', 'pay_payment_status', 'pay_refund_status', 'finance_user_flow_type', 'invoice_type', 'invoice_state', 'wx_sales_scene', 'pay_service_provider', 'recharge_pay_status', 'recharge_trade_type', 'order_pay_status', 'charging_car_type', 'car_purpose', 'car_property_right', 'invoice_title_type', 'driver_client_channel', 'trade_entry_mer_type', 'trade_entry_trade_mer_type', 'trade_entry_mer_cert_type', 'trade_entry_leg_id_type', 'trade_entry_sett_bank_acc_type', 'trade_entry_status', 'trade_entry_audit_status', 'settlement_cycle_type', 'settlement_mode', 'settlement_ledger_status'].forEach(code => {
  getSelector(code)
})

import * as filters from './filters' // global filters
import vueSeamlessScroll from 'vue-seamless-scroll'
Vue.use(vueSeamlessScroll)


import echarts from 'echarts'
Vue.prototype.$echarts = echarts
// 全局混入
Vue.mixin({
  data() {
    return {
      isPc: true
    }
  },
  created() {
    //判断是否是PC端
    this.isPc = !this.$common.isMobile()
  },
  computed: {
    isDark() {
      let isDark = window.sessionStorage.getItem('isDark') ? window.sessionStorage.getItem('isDark') : 0
      if (typeof (isDark) !== Number) {
        isDark = Number(isDark)
      }
      return isDark
    }
  },
})

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
// if (process.env.NODE_ENV === 'production') {
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

import btnAuthen from './utils/buttonVerifAuthention.js'

Vue.use(btnAuthen)

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})

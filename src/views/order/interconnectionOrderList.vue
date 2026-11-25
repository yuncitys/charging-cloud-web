<template>
  <scan-order-list
    :order-type="4"
    :advanced-actions="false"
    :fixed-rule-id="2"
    :default-thead="interconnectionThead"
  />
</template>

<script>
import ScanOrderList from './scanOrderList.vue'

// 互联单定制列：突出「类型 / 互联机构 / 支付方式 / 订单创建」，
// 隐藏 C 端用户与余额类字段（互联单 user_code 恒为 evcs，余额类字段无意义）
export const INTERCONNECTION_THEAD = {
  orderType: true,
  createTime: true,
  companyName: true,
  payType: true,
  payCode: false,
  userName: false,
  totalPrice: false,
  realityPayMoney: false,
  userCode: false,
  phoneNumber: false,
  plateNumber: false,
  vinCode: false,
  startType: false,
  channel: false,
  startCash: false,
  endCash: false
}

export default {
  // eslint-disable-next-line vue/name-property-casing, vue/component-definition-name-casing -- 与路由 name 保持一致，keep-alive include 才能命中
  name: 'interconnectionOrderList',
  components: { ScanOrderList },
  data() {
    return { interconnectionThead: INTERCONNECTION_THEAD }
  }
}
</script>

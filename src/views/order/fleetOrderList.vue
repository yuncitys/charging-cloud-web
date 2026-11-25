<template>
  <scan-order-list :order-type="5" />
</template>

<script>
import ScanOrderList from './scanOrderList.vue'

// 车队订单（企业钱包支付的订单，order_type=5）：普通钱包支付单，保留汽车/电单车 tab 与退款/关单操作
export default {
  // eslint-disable-next-line vue/name-property-casing, vue/component-definition-name-casing -- 与路由 name 一致，keep-alive include 才能命中
  name: 'fleetOrderList',
  components: { ScanOrderList }
}
</script>

<template>
  <div class="app-container">
    <order-search-panel
      :list-query="listQuery"
      :time.sync="time"
      :charging-station-list="chargingStationList"
      :tags="tags"
      :pay-tags="payTags"
      :export-keys="exportKeys"
      @filter="handleFilter"
      @reset="resetSearch"
      @date-change="dateChange"
    />

    <div class="filter-container order-list-toolbar">
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane v-for="item in ruleIdList" :key="item.id" :label="item.title" :name="item.id" />
      </el-tabs>

      <div class="filter-container" style="margin: 15px 0;">
        <el-row>
          <el-col :span="1"><span style="color:#08d374;font-weight:600;font-size:15px">订单：</span></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.orderType" label="订单类型">订单类型</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.orderCode" label="业务单号">业务单号</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.payCode" label="支付单号">支付单号</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.channel" label="渠道">渠道</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.createTime" label="订单创建">订单创建</el-checkbox></el-col>
        </el-row>
        <el-row>
          <el-col :span="1"><span style="color:#08d374;font-weight:600;font-size:15px">电站：</span></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.networkName" label="电站名称">电站名称</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.deviceCode" label="桩编号">桩编号</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.devicePort" label="端口/枪号">端口/枪号</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.electricOut" label="设备类型">设备类型</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.networkAddress" label="设备地址">设备地址</el-checkbox></el-col>
        </el-row>
        <el-row>
          <el-col :span="1"><span style="color:#08d374;font-weight:600;font-size:15px">用户：</span></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.userCode" label="用户编号">用户编号</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.userName" label="用户帐号">用户帐号</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.companyName" label="企业名称">企业名称</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.plateNumber" label="车牌号">车牌号</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.phoneNumber" label="手机号">手机号</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.vinCode" label="VIN码">VIN码</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.startType" label="启动方式">启动方式</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.startCash" label="开始前余额">开始前余额</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.endCash" label="扣费后余额">扣费后余额</el-checkbox></el-col>
        </el-row>
        <el-row>
          <el-col :span="1"><span style="color:#08d374;font-weight:600;font-size:15px">充电：</span></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.orderStatus" label="充电状态">充电状态</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.startTime" label="充电开始时间">充电开始时间</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.endTime" label="充电结束时间">充电结束时间</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.actualDuration" label="实际充电时长">实际充电时长</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.hours" label="工作时长/电量">工作时长/电量</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.priceType" label="计费类型">计费类型</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.stopReason" label="停止原因">停止原因</el-checkbox></el-col>
        </el-row>
        <el-row>
          <el-col :span="1"><span style="color:#08d374;font-weight:600;font-size:15px">付款：</span></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.totalPower" label="订单电量">订单电量</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.totalPrice" label="订单原价金额">订单原价金额</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.electricityPrice" label="基础电费">基础电费</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.servicePrice" label="服务费">服务费</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.actualPrice" label="订单支付金额">订单支付金额</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.realityPayMoney" label="订单实付金额">订单实付金额</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.payStatus" label="支付状态">支付状态</el-checkbox></el-col>
          <el-col :span="2"><el-checkbox v-model="formThead.payType" label="支付方式">支付方式</el-checkbox></el-col>
        </el-row>
      </div>

      <el-table
        id="tableBox"
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        element-loading-text="拼命加载中......"
        fit
        :max-height="tableMaxHeight"
        style="width: 100%;"
        class="order-layout-table"
      >
        <el-table-column label="订单信息" min-width="260">
          <template slot-scope="scope">
            <div class="order-layout-col order-layout-col--order">
              <div v-if="formThead.orderType" class="order-layout-item"><span>类型：</span><span v-overflow-title class="order-layout-value">{{ orderTypeText(scope.row.orderType) }}</span></div>
              <div v-if="formThead.orderCode" class="order-layout-item"><span>业务单号：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.orderCode) }}</span></div>
              <div v-if="formThead.payCode" class="order-layout-item"><span>支付单号：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.payCode) }}</span></div>
              <div v-if="formThead.channel" class="order-layout-item"><span>渠道：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.userLabel) }}</span></div>
              <div v-if="formThead.createTime" class="order-layout-item"><span>订单创建：</span><span v-overflow-title class="order-layout-value">{{ scope.row.createTime | formatDate }}</span></div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="电站信息" min-width="230">
          <template slot-scope="scope">
            <div class="order-layout-col order-layout-col--station">
              <div v-if="formThead.networkName" class="order-layout-item"><span>电站名称：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.networkName) }}</span></div>
              <div v-if="formThead.deviceCode" class="order-layout-item"><span>桩编号：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.deviceCode) }}</span></div>
              <div v-if="formThead.devicePort" class="order-layout-item"><span>端口/枪号：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.devicePort) }}</span></div>
              <div v-if="formThead.electricOut" class="order-layout-item"><span>设备类型：</span><span v-overflow-title class="order-layout-value">{{ electricOutText(scope.row.electricOut) }}</span></div>
              <div v-if="formThead.networkAddress" class="order-layout-item"><span>设备地址：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.networkAddress) }}</span></div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="用户信息" min-width="260">
          <template slot-scope="scope">
            <div class="order-layout-col order-layout-col--user">
              <div v-if="formThead.userCode" class="order-layout-item"><span>用户编号：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.userCode) }}</span></div>
              <div v-if="formThead.userName" class="order-layout-item"><span>用户帐号：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.userAccount) }}</span></div>
              <div v-if="formThead.companyName" class="order-layout-item"><span>企业名称：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.companyName) }}</span></div>
              <div v-if="formThead.plateNumber" class="order-layout-item"><span>车牌号：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.plateNumber) }}</span></div>
              <div v-if="formThead.phoneNumber" class="order-layout-item"><span>手机号：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.phoneNumber) }}</span></div>
              <div v-if="formThead.vinCode" class="order-layout-item"><span>VIN码：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.vinCode) }}</span></div>
              <div v-if="formThead.startType" class="order-layout-item"><span>启动方式：</span><span v-overflow-title class="order-layout-value">{{ startTypeText(scope.row.startType) }}</span></div>
              <div v-if="formThead.startCash" class="order-layout-item"><span>开始前余额：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.userStartCash) }}</span></div>
              <div v-if="formThead.endCash" class="order-layout-item"><span>扣费后余额：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.userEndCash) }}</span></div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="充电信息" min-width="260">
          <template slot-scope="scope">
            <div class="order-layout-col order-layout-col--charge">
              <div v-if="formThead.orderStatus" class="order-layout-item"><span>充电状态：</span><span v-overflow-title class="order-layout-value">{{ orderStatusText(scope.row.orderStatus) }}</span></div>
              <div v-if="formThead.startTime" class="order-layout-item"><span>充电开始时间：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.startTimeAll) }}</span></div>
              <div v-if="formThead.endTime" class="order-layout-item"><span>充电结束时间：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.endTimeAll) }}</span></div>
              <div v-if="formThead.actualDuration" class="order-layout-item"><span>实际充电时长：</span><span v-overflow-title class="order-layout-value">{{ durationWithMinute(scope.row.actualDuration) }}</span></div>
              <div v-if="formThead.hours" class="order-layout-item"><span>工作时长/电量：</span><span v-overflow-title class="order-layout-value">{{ hoursWithUnit(scope.row.hours, scope.row.chargeMod) }}</span></div>
              <div v-if="formThead.priceType" class="order-layout-item"><span>计费类型：</span><span v-overflow-title class="order-layout-value">{{ priceTypeText(scope.row.priceType) }}</span></div>
              <div v-if="formThead.stopReason" class="order-layout-item"><span>停止原因：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.stopReason) }}</span></div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="付款详情" min-width="280">
          <template slot-scope="scope">
            <div class="order-layout-col order-layout-col--pay">
              <div v-if="formThead.totalPower" class="order-layout-item"><span>订单电量：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.totalPower) }}</span></div>
              <div v-if="formThead.totalPrice" class="order-layout-item"><span>订单原价金额：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.totalPrice) }}</span></div>
              <div v-if="formThead.electricityPrice" class="order-layout-item"><span>基础电费：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.electricityPrice) }}</span></div>
              <div v-if="formThead.servicePrice" class="order-layout-item"><span>服务费：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.servicePrice) }}</span></div>
              <div v-if="formThead.actualPrice" class="order-layout-item"><span>订单支付金额：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.actualPrice) }}</span></div>
              <div v-if="formThead.realityPayMoney" class="order-layout-item"><span>订单实付金额：</span><span v-overflow-title class="order-layout-value">{{ disp(scope.row.realityPayMoney) }}</span></div>
              <div v-if="formThead.payStatus" class="order-layout-item"><span>支付状态：</span><span v-overflow-title class="order-layout-value">{{ payStatusText(scope.row.payStatus) }}</span></div>
              <div v-if="formThead.payType" class="order-layout-item"><span>支付方式：</span><span v-overflow-title class="order-layout-value">{{ payTypeText(scope.row.payType) }}</span></div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="190" fixed="right" align="center">
          <template slot-scope="scope">
            <div class="order-layout-actions">
              <el-button
                v-if="btnAuthen.permsVerifAuthention(':sys:orderInfo:findOrderInfoById')"
                size="mini"
                type="primary"
                icon="el-icon-view"
                @click="goOrderDetail(scope.row)"
              >详情</el-button>
              <el-dropdown size="mini" trigger="click" @command="(command) => handleCommand(command, scope.row)">
                <el-button size="mini" type="primary" icon="el-icon-d-arrow-right" style="margin-top: 8px;">更多</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-if="btnAuthen.permsVerifAuthention(':sys:orderInfo:closeOrder') && scope.row.orderStatus == 1"
                    command="handleCloseOrder"
                    icon="el-icon-caret-right"
                  >结束订单</el-dropdown-item>
                  <el-dropdown-item
                    v-if="btnAuthen.permsVerifAuthention(':sys:orderInfo:abnormalOrderSettlement') && scope.row.orderStatus == 1"
                    command="handleAbnormalOrderSettlement"
                    icon="el-icon-warning-outline"
                  >异常结算</el-dropdown-item>
                  <!-- <el-dropdown-item
                    v-if="btnAuthen.permsVerifAuthention(':sys:orderInfo:orderRefund') && showReturn(scope.row.orderStatus,scope.row.payStatus)"
                    command="handleOrderRefund"
                    icon="el-icon-money"
                  >订单退款</el-dropdown-item>
                  <el-dropdown-item command="handleOrderSplitRecord" icon="el-icon-s-operation">分账明细</el-dropdown-item> -->
                  <el-dropdown-item
                    v-if="btnAuthen.permsVerifAuthention(':order:scanOrderList:delete')"
                    command="handleDeleteOrder"
                    icon="el-icon-delete"
                    divided
                  >删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          :current-page="listQuery.page"
          :page-sizes="[10,20,30, 50]"
          :page-size="listQuery.limit"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {
  getList,
  deleteOrder,
  closeOrder,
  orderRefund,
  abnormalOrderSettlement
} from '@/api/order/scanOrderList.js'
import {
  getChargingStationList
} from '@/api/netWorkDot/netWorkDotList.js'
import { parseTime } from '@/utils/index'
import { getRuleIdTabs, getDefaultRuleIdTabName, getDefaultRuleIdNumber } from '@/utils/ruleIdTabs'
import OrderSearchPanel from './components/OrderSearchPanel.vue'
import { createDefaultListQuery, sanitizeOrderListQuery } from './utils/orderListQuery.js'

const ORDER_TYPE = 2

export default {
  name: 'FreeOrderList',
  components: {
    OrderSearchPanel
  },
  filters: {
    formatDate: function(time) {
      if (!time) {
        return ''
      }
      return parseTime(time)
    }
  },
  data() {
    return {
      activeName: getDefaultRuleIdTabName(),
      listLoading: true,
      page: 1,
      limit: 10,
      list: [],
      total: 10,
      tableKey: 0,
      tableMaxHeight: 620,
      chargingStationList: [],
      listQuery: createDefaultListQuery(ORDER_TYPE, getDefaultRuleIdNumber()),
      cacheKey: 'freeOrderList',
      formThead: {
        orderCode: true,
        payCode: true,
        deviceCode: true,
        userName: false,
        totalPrice: false,
        orderType: false,
        devicePort: true,
        electricityPrice: true,
        servicePrice: true,
        networkName: true,
        networkAddress: false,
        electricOut: true,
        payStatus: true,
        orderStatus: true,
        stopReason: true,
        hours: true,
        priceType: true,
        actualDuration: true,
        startTime: true,
        endTime: true,
        createTime: false,
        actualPrice: true,
        realityPayMoney: true,
        totalPower: true,
        userCode: true,
        phoneNumber: true,
        companyName: true,
        plateNumber: true,
        vinCode: true,
        startType: true,
        payType: true,
        channel: true,
        startCash: true,
        endCash: true
      },
      payTags: [{
        id: 0,
        title: '未支付'
      },
      {
        id: 1,
        title: '已支付'
      }
      ],
      tags: [{
        id: 0,
        title: '故障'
      },
      {
        id: 1,
        title: '进行中'
      },
      {
        id: 2,
        title: '已完成'
      },
      {
        id: 3,
        title: '待结算'
      }
      ],
      time: ''
    }
  },
  computed: {
    ruleIdList() {
      return getRuleIdTabs()
    },
    exportKeys() {
      return Object.keys(this.formThead).filter((k) => this.formThead[k] === true)
    }
  },
  watch: {
    formThead: {
      handler(newVal) {
        // 这里做持久化或别的业务
        window.localStorage.setItem(this.cacheKey, JSON.stringify(newVal))
      },
      deep: true // 监听内部任意属性变化
    }
  },
  mounted() {
    this.getChargingStationList(this.activeName)
  },
  created() {
    // 进入页面时读缓存
    const raw = localStorage.getItem(this.cacheKey)
    if (raw) {
      try {
        this.formThead = JSON.parse(raw)
      } catch (e) {
        console.warn('parse cache error', e)
      }
    }
    const orderCode = this.$route.query.orderCode
    if (orderCode !== undefined && orderCode !== '') {
      this.listQuery.orderCode = orderCode
      this.getLists()
    } else {
      this.getLists()
    }
  },
  methods: {
    disp(v) {
      if (v === null || v === undefined || v === '') {
        return '-'
      }
      return v
    },
    orderTypeText(type) {
      if (type === 0) return '刷卡'
      if (type === 1) return '扫码'
      if (type === 2) return '免费'
      if (type === 3) return '包月'
      return this.disp(type)
    },
    electricOutText(type) {
      if (type === 0) return '交流'
      if (type === 1) return '直流'
      return this.disp(type)
    },
    hoursWithUnit(hours, chargeMod) {
      const value = this.disp(hours)
      if (value === '-') return value
      if (chargeMod === 0 || String(chargeMod) === '0') return `${value} 分钟`
      if (chargeMod === 1 || String(chargeMod) === '1') return `${value} kw/h`
      if (chargeMod === 2 || String(chargeMod) === '2') return `${value} 元`
      return value
    },
    durationWithMinute(duration) {
      const value = this.disp(duration)
      if (value === '-') return value
      return `${value} 分钟`
    },
    startTypeText(startType) {
      const value = String(startType || '')
      if (value === '1') return '扫码启动'
      if (value === '2') return '电卡启动'
      if (value === '3') return 'VIN启动'
      if (value === '4') return '互联互通'
      if (value === '5') return '命令启动'
      return this.disp(startType)
    },
    priceTypeText(type) {
      if (type === 0) return '时间'
      if (type === 1) return '电量'
      if (type === 2) return '功率'
      return this.disp(type)
    },
    orderStatusText(status) {
      if (status === 0) return '故障'
      if (status === 1) return '进行中'
      if (status === 2) return '已完成'
      if (status === 3) return '待结算'
      return this.disp(status)
    },
    payStatusText(status) {
      if (status === 0) return '未支付'
      if (status === 1) return '已支付'
      return this.disp(status)
    },
    payTypeText(payType) {
      if (!payType) return '-'
      const text = String(payType).toUpperCase()
      if (text === 'BALANCE_PAY' || text === 'BALANCE') return '个人钱包'
      if (text === 'WECHAT_PAY' || text === 'WECHAT') return '微信支付'
      if (text === 'ALI_PAY' || text === 'ALIPAY') return '支付宝支付'
      if (text === 'WECHAT_SCORE_PAY') return '微信支付分'
      if (text === 'COMPANY_BALANC' || text === 'COMPANY_BALANCE' || text === 'COMPANY_BALANCE_PAY') return '企业钱包'
      if (text === 'SWIPE_CARD') return '刷卡支付'
      if (text === 'MONTH_CARD') return '月卡支付'
      if (text === 'FREE') return '免费'
      return payType
    },
    goOrderDetail(row) {
      if (!row || row.id == null) {
        this.$message.warning('缺少订单 ID')
        return
      }
      this.$router.push({ path: '/order/orderDetail', query: { orderId: row.id }})
    },
    getChargingStationList(ruleId) {
      const data = {
        ruleId: ruleId
      }
      getChargingStationList(data).then(res => {
        if (res.code === 200) {
          this.chargingStationList = res.data
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case 'handleCloseOrder':
          this.closeOrder(row.id)
          break
        case 'handleAbnormalOrderSettlement':
          this.abnormalOrderSettlement(row.orderCode)
          break
        case 'handleOrderRefund':
          this.orderRefund(row.orderCode)
          break
        case 'handleOrderSplitRecord':
          this.toOrderSplitRecord(row.orderCode)
          break
        case 'handleDeleteOrder':
          this.deleteOrder(row.orderCode)
          break
        default:
          break
      }
    },
    // 切换导航
    handleClick(tab, event) {
      this.getChargingStationList(tab.name)
      this.listQuery.ruleId = tab.name
      this.listQuery.page = 1
      this.listQuery.limit = 10
      this.getLists()
    },
    // 显示退款按钮
    showReturn(orderStatus, payStatus) {
      return (orderStatus === 2 || orderStatus === 3) && payStatus === 1
    },
    dateChange(e) {
      console.log(e)
      if (e) {
        this.listQuery.createTimeStart = e[0]
        this.listQuery.createTimeEnd = e[1]
      } else {
        this.listQuery.createTimeStart = ''
        this.listQuery.createTimeEnd = ''
      }
      this.handleFilter()
    },
    handleFilter(e) {
      this.listQuery.page = 1
      this.getLists()
    },
    resetSearch() {
      const ruleId = this.listQuery.ruleId
      this.listQuery = createDefaultListQuery(ORDER_TYPE, ruleId)
      this.time = ''
      this.listQuery.page = 1
      this.getLists()
    },
    getLists() {
      this.listLoading = true
      const listQuery = sanitizeOrderListQuery(this.listQuery)
      getList(listQuery).then(res => {
        if (res.code === 200) {
          const list = res.data || []
          this.list = list
          this.total = res.count
          this.listLoading = false
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 删除订单
    deleteOrder(orderCode) {
      this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(() => {
        const data = {
          orderCode
        }
        console.log(data)
        deleteOrder(data).then(res => {
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.getLists()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getLists()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getLists()
    },
    // 结束订单
    closeOrder(id) {
      this.$confirm('是否结束订单?', '警告', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(() => {
        const data = {
          id: id
        }
        closeOrder(data).then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg)
            this.getLists()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    orderRefund(orderCode) {
      this.$confirm('是否确认退款?', '警告', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(() => {
        const data = {
          orderCode
        }
        orderRefund(data).then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg)
            this.getLists()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    abnormalOrderSettlement(orderCode) {
      this.$confirm('是否要异常结束订单?', '警告', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(() => {
        const data = {
          orderCode: orderCode
        }
        abnormalOrderSettlement(data).then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg)
            this.getLists()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    }
  }
}

</script>

<style>
  .order-list-toolbar {
    margin-bottom: 12px;
  }

  .order-layout-table .el-table__cell {
    padding: 0 !important;
  }

  .order-layout-table .el-table__header-wrapper th .cell {
    text-align: center;
  }

  .order-layout-table .el-table__body tr:hover > td.el-table__cell {
    background-color: #fff !important;
  }

  .order-layout-table.el-table--enable-row-hover .el-table__body tr:hover > td,
  .order-layout-table .el-table__body tr.hover-row > td,
  .order-layout-table .el-table__body tr.current-row > td,
  .order-layout-table .el-table__body tr.current-row:hover > td {
    background-color: #fff !important;
  }

  .order-layout-col {
    padding: 10px 0;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .order-layout-item {
    font-size: 14px;
    color: #000;
    line-height: 20px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    text-align: left;
    display: flex;
    align-items: center;
  }

  .order-layout-item > span:first-child {
    color: #909399;
    width: auto;
    flex-shrink: 0;
    margin-right: 6px;
    text-align: left;
  }

  .order-layout-col--order .order-layout-item > span:first-child { width: 70px; }
  .order-layout-col--station .order-layout-item > span:first-child { width: 70px; }
  .order-layout-col--user .order-layout-item > span:first-child { width: 84px; }
  .order-layout-col--charge .order-layout-item > span:first-child { width: 98px; }
  .order-layout-col--pay .order-layout-item > span:first-child { width: 98px; }

  .order-layout-value {
    color: #000 !important;
    flex: 1;
    text-align: left;
    display: block;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .order-layout-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

</style>

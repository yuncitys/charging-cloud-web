<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.orderCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
        placeholder="请输入订单号" clearable @clear="handleFilter()" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.deviceCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
        placeholder="请输入设备号" clearable @clear="handleFilter()" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.userCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
        placeholder="请输入用户ID号" clearable @clear="handleFilter()" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.phoneNumber" style="width: 200px;margin-right: 20px ;" class="filter-item"
        placeholder="请输入手机号" clearable @clear="handleFilter()" @keyup.enter.native="handleFilter" />
      <!-- <el-input v-model="listQuery.networkProvince" style="width: 200px;margin-right: 20px ;" class="filter-item"
        placeholder="请输入站点省份" clearable @clear="handleFilter()" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.networkName" style="width: 200px;margin-right: 20px ;" class="filter-item"
        placeholder="请输入站点名称" clearable @clear="handleFilter()" @keyup.enter.native="handleFilter" /> -->
      <el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.chargingStationIds" multiple filterable clearable
        @change="handleFilter()" placeholder="请选择充电站">
          <el-option
            v-for="item in chargingStationList"
            :key="item.id"
            :label="item.networkName"
            :value="item.id">
          </el-option>
      </el-select>
      <el-select v-model="listQuery.orderStatus" style="width: 200px;margin-right: 20px ;" class="filter-item"
        placeholder="请选择订单状态" clearable @change="handleFilter">
        <el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
      </el-select>
      <el-select v-model="listQuery.payStatus" style="width: 200px;margin-right: 20px ;" class="filter-item"
        placeholder="请选择支付状态" clearable @change="handleFilter">
        <el-option v-for="item in payTags" :key="item.id" :label="item.title" :value="item.id" />
      </el-select>
      <el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item"
        style="margin-right: 20px ;" start-placeholder="开始日期" end-placeholder="结束日期" @change="dateChange"
        format="yyyy-MM-dd" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']">
      </el-date-picker>
      <el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
        icon="el-icon-search">
        查询
      </el-button>

      <!-- 导出Excel -->
      <downExcel :queryData="listQuery" :exportKeys="exportKeys" />

      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane v-for="(item, index) in ruleIdList" :key="item.id" :label="item.title" :name="item.id">
        </el-tab-pane>
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

      <el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......" fit
        :max-height="tableMaxHeight"
        style="width: 100%;" id="tableBox" class="order-layout-table">
        <el-table-column label="订单信息" min-width="260">
          <template slot-scope="scope">
            <div class="order-layout-col order-layout-col--order">
              <div class="order-layout-item" v-if="formThead.orderType"><span>类型：</span><span class="order-layout-value" v-overflow-title>{{ orderTypeText(scope.row.orderType) }}</span></div>
              <div class="order-layout-item" v-if="formThead.orderCode"><span>业务单号：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.orderCode) }}</span></div>
              <div class="order-layout-item" v-if="formThead.payCode"><span>支付单号：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.payCode) }}</span></div>
              <div class="order-layout-item" v-if="formThead.channel"><span>渠道：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.userLabel) }}</span></div>
              <div class="order-layout-item" v-if="formThead.createTime"><span>订单创建：</span><span class="order-layout-value" v-overflow-title>{{ scope.row.createTime | formatDate }}</span></div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="电站信息" min-width="230">
          <template slot-scope="scope">
            <div class="order-layout-col order-layout-col--station">
              <div class="order-layout-item" v-if="formThead.networkName"><span>电站名称：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.networkName) }}</span></div>
              <div class="order-layout-item" v-if="formThead.deviceCode"><span>桩编号：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.deviceCode) }}</span></div>
              <div class="order-layout-item" v-if="formThead.devicePort"><span>端口/枪号：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.devicePort) }}</span></div>
              <div class="order-layout-item" v-if="formThead.electricOut"><span>设备类型：</span><span class="order-layout-value" v-overflow-title>{{ electricOutText(scope.row.electricOut) }}</span></div>
              <div class="order-layout-item" v-if="formThead.networkAddress"><span>设备地址：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.networkAddress) }}</span></div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="用户信息" min-width="260">
          <template slot-scope="scope">
            <div class="order-layout-col order-layout-col--user">
              <div class="order-layout-item" v-if="formThead.userCode"><span>用户编号：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.userCode) }}</span></div>
              <div class="order-layout-item" v-if="formThead.userName"><span>用户帐号：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.userAccount) }}</span></div>
              <div class="order-layout-item" v-if="formThead.companyName"><span>企业名称：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.companyName) }}</span></div>
              <div class="order-layout-item" v-if="formThead.plateNumber"><span>车牌号：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.plateNumber) }}</span></div>
              <div class="order-layout-item" v-if="formThead.phoneNumber"><span>手机号：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.phoneNumber) }}</span></div>
              <div class="order-layout-item" v-if="formThead.vinCode"><span>VIN码：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.vinCode) }}</span></div>
              <div class="order-layout-item" v-if="formThead.startType"><span>启动方式：</span><span class="order-layout-value" v-overflow-title>{{ startTypeText(scope.row.startType) }}</span></div>
              <div class="order-layout-item" v-if="formThead.startCash"><span>开始前余额：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.userStartCash) }}</span></div>
              <div class="order-layout-item" v-if="formThead.endCash"><span>扣费后余额：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.userEndCash) }}</span></div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="充电信息" min-width="260">
          <template slot-scope="scope">
            <div class="order-layout-col order-layout-col--charge">
              <div class="order-layout-item" v-if="formThead.orderStatus"><span>充电状态：</span><span class="order-layout-value" v-overflow-title>{{ orderStatusText(scope.row.orderStatus) }}</span></div>
              <div class="order-layout-item" v-if="formThead.startTime"><span>充电开始时间：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.startTimeAll) }}</span></div>
              <div class="order-layout-item" v-if="formThead.endTime"><span>充电结束时间：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.endTimeAll) }}</span></div>
              <div class="order-layout-item" v-if="formThead.actualDuration"><span>实际充电时长：</span><span class="order-layout-value" v-overflow-title>{{ durationWithMinute(scope.row.actualDuration) }}</span></div>
              <div class="order-layout-item" v-if="formThead.hours"><span>工作时长/电量：</span><span class="order-layout-value" v-overflow-title>{{ hoursWithUnit(scope.row.hours, scope.row.chargeMod) }}</span></div>
              <div class="order-layout-item" v-if="formThead.priceType"><span>计费类型：</span><span class="order-layout-value" v-overflow-title>{{ priceTypeText(scope.row.priceType) }}</span></div>
              <div class="order-layout-item" v-if="formThead.stopReason"><span>停止原因：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.stopReason) }}</span></div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="付款详情" min-width="280">
          <template slot-scope="scope">
            <div class="order-layout-col order-layout-col--pay">
              <div class="order-layout-item" v-if="formThead.totalPower"><span>订单电量：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.totalPower) }}</span></div>
              <div class="order-layout-item" v-if="formThead.totalPrice"><span>订单原价金额：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.totalPrice) }}</span></div>
              <div class="order-layout-item" v-if="formThead.electricityPrice"><span>基础电费：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.electricityPrice) }}</span></div>
              <div class="order-layout-item" v-if="formThead.servicePrice"><span>服务费：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.servicePrice) }}</span></div>
              <div class="order-layout-item" v-if="formThead.actualPrice"><span>订单支付金额：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.actualPrice) }}</span></div>
              <div class="order-layout-item" v-if="formThead.realityPayMoney"><span>订单实付金额：</span><span class="order-layout-value" v-overflow-title>{{ disp(scope.row.realityPayMoney) }}</span></div>
              <div class="order-layout-item" v-if="formThead.payStatus"><span>支付状态：</span><span class="order-layout-value" v-overflow-title>{{ payStatusText(scope.row.payStatus) }}</span></div>
              <div class="order-layout-item" v-if="formThead.payType"><span>支付方式：</span><span class="order-layout-value" v-overflow-title>{{ payTypeText(scope.row.payType) }}</span></div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="190" fixed="right" align="center">
          <template slot-scope="scope">
            <div class="order-layout-actions">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-view"
                @click="goOrderDetail(scope.row)"
                v-if="btnAuthen.permsVerifAuthention(':sys:orderInfo:findOrderInfoById')"
              >详情</el-button>
              <el-dropdown size="mini" trigger="click" @command="(command) => handleCommand(command, scope.row)">
                <el-button size="mini" type="primary" icon="el-icon-d-arrow-right" style="margin-top: 8px;">更多</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="handleCloseOrder" icon="el-icon-caret-right"
                    v-if="btnAuthen.permsVerifAuthention(':sys:orderInfo:closeOrder') && scope.row.orderStatus == 1">结束订单</el-dropdown-item>
                  <el-dropdown-item command="handleAbnormalOrderSettlement" icon="el-icon-warning-outline"
                    v-if="btnAuthen.permsVerifAuthention(':sys:orderInfo:abnormalOrderSettlement') && scope.row.orderStatus == 1">异常结算</el-dropdown-item>
                  <el-dropdown-item command="handleOrderRefund" icon="el-icon-money"
                    v-if="btnAuthen.permsVerifAuthention(':sys:orderInfo:orderRefund') && showReturn(scope.row.orderStatus,scope.row.payStatus)">订单退款</el-dropdown-item>
                  <el-dropdown-item command="handleOrderSplitRecord" icon="el-icon-s-operation">分账明细</el-dropdown-item>
                  <el-dropdown-item command="handleDeleteOrder" icon="el-icon-delete" divided
                    v-if="btnAuthen.permsVerifAuthention(':order:scanOrderList:delete')">删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
          :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>

<script>
  import {
    getList,
    deleteOrder,
    closeOrder,
    downloadExcel,
    orderRefund,
    abnormalOrderSettlement,
  } from '@/api/order/scanOrderList.js'
  import {
    getChargingStationList
  } from '@/api/netWorkDot/netWorkDotList.js'
  import {
    parseTime,
    numTime,
    formatSeconds,
    getNowTime
  } from '@/utils/index'
  import { getRuleIdTabs, getDefaultRuleIdTabName, getDefaultRuleIdNumber } from '@/utils/ruleIdTabs'
  import downExcel from './components/downExcel.vue'
  import imgView from '@/components/Common/imgView.vue'
  export default {
    name: 'scanOrderList',
    components: {
      downExcel,
      imgView
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
        listQuery: {
          page: 1,
          limit: 10,
          payStatus: '',
          orderStatus: '',
          orderCode: '',
          deviceCode: '',
          phoneNumber: '',
          userCode: '',
          createTimeStart: '',
          createTimeEnd: '',
          networkProvince: '',
          networkName: '',
          orderType: 1,
          ruleId: getDefaultRuleIdNumber(),
          chargingStationIds: ''
        },
        cacheKey: 'scanOrderList',
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
          },
          {
            id: 2,
            title: '已退款'
          },
          {
            id: 3,
            title: '部分退款'
          },
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
    filters: {
      formatDate: function (time) {
        if (!time) {
          return ''
        }
        return parseTime(time)
      },
    },
    watch: {
      formThead: {
        handler(newVal) {
          // 这里做持久化或别的业务
          window.localStorage.setItem(this.cacheKey, JSON.stringify(newVal))
        },
        deep: true   // 监听内部任意属性变化
      }
    },
    mounted() {
      this.getChargingStationList(this.activeName)
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
        if (status === 2) return '充电完成'
        if (status === 3) return '充电中'
        return this.disp(status)
      },
      payStatusText(status) {
        if (status === 0) return '未支付'
        if (status === 1) return '已支付'
        if (status === 2) return '已退款'
        if (status === 3) return '部分退款'
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
      getChargingStationList(ruleId){
        const data = {
          ruleId: ruleId
        }
        getChargingStationList(data).then(res => {
          if (res.code == 200) {
            this.chargingStationList = res.data;
          } else {
            this.$message.error(res.msg)
          }
        })
      },
      // 更多操作触发
      handleCommand(command, row) {
        switch (command) {
          case "handleCloseOrder":
            this.closeOrder(row.id);
            break;
          case "handleAbnormalOrderSettlement":
            this.abnormalOrderSettlement(row.orderCode);
            break;
          case "handleOrderRefund":
            this.orderRefund(row.orderCode)
            break;
          case "handleOrderSplitRecord":
            this.toOrderSplitRecord(row.orderCode)
            break;
          case "handleDeleteOrder":
            this.deleteOrder(row.orderCode)
            break;
          default:
            break;
        }
      },
      //资金流水
      toOrderSplitRecord(orderCode) {
      	this.$router.push({
      		name: 'orderSplitRecord',
      		query: {
      			bizOrderCode: orderCode
      		}
      	})
      },
      //切换导航
      handleClick(tab, event) {
        this.getChargingStationList(tab.name)
        this.listQuery.ruleId = tab.name
        this.listQuery.page = 1,
        this.listQuery.limit = 10,
        this.getLists()
      },
      //显示退款按钮
      showReturn(orderStatus, payStatus) {
        let flag = false
        if ((orderStatus === 2 || orderStatus === 3) && payStatus === 1) {
          flag = true
        }
        return flag
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
      getLists() {
        this.listLoading = true
        let listQuery = JSON.parse(JSON.stringify(this.listQuery))
        if (listQuery.createTimeStart == null) {
          listQuery.createTimeStart = ''
        }
        if (listQuery.createTimeEnd == null) {
          listQuery.createTimeEnd = ''
        }
        getList(listQuery).then(res => {
          if (res.code == 200) {
            console.log(res)
            let list = res.data || []
            
            this.list = list
            this.total = res.count
            this.listLoading = false
          } else {
            this.$message.error(res.msg)
          }
        })
      },
      //删除订单
      deleteOrder(orderCode) {
        this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning'
        }).then(() => {
          let data = {
            orderCode
          }
          console.log(data)
          deleteOrder(data).then(res => {
            if (res.code == 200) {
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
      //结束订单
      closeOrder(id) {
        this.$confirm('是否结束订单?', '警告', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning'
        }).then(() => {
          let data = {
            id: id
          }
          closeOrder(data).then(res => {
            if (res.code == 200) {
              this.$message.success(res.msg)
              this.getLists()
            } else {
              this.$message.error(res.msg)
            }
          })
        })
      },
      abnormalOrderSettlement(orderCode){
        this.$confirm('是否要异常结束订单?', '警告', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning'
        }).then(() => {
          let data = {
            orderCode: orderCode
          }
          abnormalOrderSettlement(data).then(res => {
            if (res.code == 200) {
              this.$message.success(res.msg)
              this.getLists()
            } else {
              this.$message.error(res.msg)
            }
          })
        })
      },
      orderRefundClick(item) {
        this.$common.throttle(this.orderRefund(item.orderCode), 2000)
      },
      //退款
      orderRefund(orderCode) {
        this.$confirm('是否确认退款?', '警告', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning'
        }).then(() => {
          let data = {
            orderCode: orderCode
          }
          orderRefund(data).then(res => {
            if (res.code == 200) {
              this.$message.success(res.msg)
              this.getLists()
            } else {
              this.$message.error(res.msg)
            }
          })
        })
      },
      //获取当前时间
      getTime() {
        var date = new Date()
        var y = date.getFullYear()
        var m = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
        var d = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate())
        var hh = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours())
        var mm = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes())
        var ss = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds())
        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
      },
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
      // 路由跳转读参数
      const orderCode = this.$route.query.orderCode;
      if (orderCode !== undefined && orderCode != '') {
        this.listQuery.orderCode = orderCode;
        this.getLists();
      } else {
        this.getLists();
      }
    },
  }

</script>

<style>
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

  .order-layout-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 10px;
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

  /* 同一分组内标签按最长字段对齐，分组间独立宽度（仅标签） */
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

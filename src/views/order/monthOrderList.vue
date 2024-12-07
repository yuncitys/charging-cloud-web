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
      <el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.adminId" filterable
        clearable @change="handleFilter()" placeholder="请选择代理商">
        <el-option v-for="item in dealerList" :key="item.id" :label="item.adminFullname" :value="item.id">
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
        format="yyyy-MM-dd" value-format="yyyy-MM-dd">
      </el-date-picker>
      <el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
        icon="el-icon-search">
        查询
      </el-button>

      <!-- 导出Excel -->
      <downExcel :queryData="listQuery" />

      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane v-for="(item, index) in ruleIdList" :key="item.id" :label="item.title" :name="item.id">
        </el-tab-pane>
      </el-tabs>

      <div class="filter-container" style="margin: 15px 0;">
        <el-row>
          <el-col :span="1"> <span style="color:#08d374;font-weight:600;font-size:15px">用户：</span> </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.userName" label="昵称">昵称</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.phoneNumber" label="手机号">手机号</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.userCode" label="用户ID">用户ID</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.headImg" label="微信头像">微信头像</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.wxName" label="小程序名称">小程序名称</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.actualPrice" label="消费金额">消费金额</el-checkbox>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="1">
            <span style="color:#08d374;font-weight:600;font-size:15px">设备：</span>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.deviceCode" label="设备号">设备号</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.devicePort" label="端口号">端口号</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.networkName" label="站点名称">站点名称</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.networkAddress" label="设备地址">设备地址</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.hours" label="工作时长/电量">工作时长/电量</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.totalPower" label="总用电量">总用电量</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.stopReason" label="停止原因">停止原因</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.avgPower" label="平均功率">平均功率</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.maxPower" label="最大功率">最大功率</el-checkbox>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="1">
            <span style="color:#08d374;font-weight:600;font-size:15px">订单：</span>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.orderCode" label="订单号">订单号</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.createTime" label="订单创建">订单创建</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.orderStatus" label="订单状态">订单状态</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.payStatus" label="支付状态">支付状态</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.priceType" label="收费类型">收费类型</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.electricityPrice" label="电费">电费</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.totalPrice" label="订单总价">订单总价</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.userdTime" label="实际时长">实际时长</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.startTime" label="开始时间">开始时间</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.hasTime" label="剩余时间">剩余时间</el-checkbox>
          </el-col>
          <el-col :span="2">
            <el-checkbox v-model="formThead.endTime" label="结束时间">结束时间</el-checkbox>
          </el-col>
        </el-row>
      </div>

      <el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......" fit
        highlight-current-row style="width: 100%;" align="center" id="tableBox">
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
        </el-table-column>
        <el-table-column prop="orderCode" label="订单号" v-if="formThead.orderCode" align="center"
          :show-overflow-tooltip='isPc' width="150px" fixed="left">
        </el-table-column>
        <el-table-column prop="userCode" label="用户ID" v-if="formThead.userCode" align="center"
          :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="startCash" label="开始前余额" align="center" :show-overflow-tooltip="isPc" width="100px">
        </el-table-column>
        <el-table-column prop="endCash" label="扣费后余额" align="center" :show-overflow-tooltip="isPc" width="100px">
        </el-table-column>
        <el-table-column prop="phoneNumber" label="手机号" v-if="formThead.phone" align="center"
          :show-overflow-tooltip="isPc" fixed="left">
        </el-table-column>
        <el-table-column prop="deviceCode" label="设备号" v-if="formThead.deviceCode" align="center"
          :show-overflow-tooltip='isPc' fixed="left">
        </el-table-column>
        <el-table-column prop="devicePort" label="端口号" v-if="formThead.devicePort" align="center"
          :show-overflow-tooltip="isPc"  fixed="left">
        </el-table-column>
        <el-table-column label="昵称" prop="userName" v-if="formThead.userName" align="center"
          :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="headImg" label="微信头像" v-if="formThead.headImg" align="center"
          :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
            <imgView :imgSrc="scope.row.headImg" style="text-align: center;" />
          </template>
        </el-table-column>
        <el-table-column prop="wxName" label="小程序名称" v-if="formThead.wxName" align="center"
          :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="avgPower" label="平均功率" v-if="formThead.avgPower" align="center"
          :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="maxPower" label="最大功率" v-if="formThead.maxPower" align="center"
          :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="totalPower" label="总用电量" v-if="formThead.totalPower" align="center"
          :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="electricityPrice" label="电费" v-if="formThead.electricityPrice" align="center"
          :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="servicePrice" label="服务费" v-if="formThead.servicePrice" align="center"
          :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="totalPrice" label="订单总价" v-if="formThead.totalPrice" align="center"
          :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="actualPrice" label="消费金额" v-if="formThead.actualPrice" align="center"
          :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="orderType" label="充电类型" v-if="formThead.orderType" align="center"
          :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.orderType == 0">刷卡充电</el-tag>
            <el-tag type="success" v-if="scope.row.orderType == 1">扫码充电</el-tag>
            <el-tag type="success" v-if="scope.row.orderType == 2">免费充电</el-tag>
            <el-tag type="success" v-if="scope.row.orderType == 3">包月充电</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priceType" label="收费类型" v-if="formThead.priceType" align="center"
          :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.priceType == 0">计时</el-tag>
            <el-tag type="danger" v-if="scope.row.priceType == 1">电量</el-tag>
            <el-tag type="danger" v-if="scope.row.priceType == 2">功率</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payStatus" label="支付状态" v-if="formThead.payStatus" align="center"
          :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.payStatus == 0">未支付</el-tag>
            <el-tag type="success" v-if="scope.row.payStatus == 1">已支付</el-tag>
            <el-tag type="warning" v-if="scope.row.payStatus == 2">已退款 </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" v-if="formThead.orderStatus" align="center" min-width="120"
          :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.orderStatus == 0">故障</el-tag>
            <el-tag type="warning" v-if="scope.row.orderStatus == 1">进行中</el-tag>
            <el-tag type="success" v-if="scope.row.orderStatus == 2">已完成 </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stopReason" label="停止原因" v-if="formThead.stopReason" align="center"
          :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="networkName" label="所属站点" v-if="formThead.networkName" align="center"
          :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="networkAddress" label="设备地址" v-if="formThead.networkAddress" align="center"
          :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="hours" label="工作时长/电量" v-if="formThead.hours" align="center"
          :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
            <span v-if="scope.row.priceType == 0">{{ scope.row.hours}}</span>
            <span v-if="scope.row.priceType == 1">{{ scope.row.eleNum}}</span>
            <span v-if="scope.row.priceType == 2">{{ scope.row.hours}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="userdTime" label="实际时长" v-if="formThead.userdTime" align="center"
          :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
            <span v-if="scope.row.orderStatus != 0">{{ scope.row.userdTime}}</span>
            <span v-if="scope.row.orderStatus == 0">0分钟</span>
          </template>
        </el-table-column>
        <el-table-column prop="hasTime" label="剩余时间" v-if="formThead.hasTime" align="center"
          :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
            <span v-if="scope.row.orderStatus != 0">
              <span v-if="scope.row.orderStatus == 2">0分钟</span>
              <span v-if="scope.row.orderStatus != 2">{{ scope.row.hasTime}}</span>
            </span>
            <span v-if="scope.row.orderStatus == 0">{{ scope.row.hours}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="startTimeAll" label="开始时间" v-if="formThead.startTime" align="center"
          :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
            <span>{{ scope.row.startTimeAll}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="endTimeAll" label="结束时间" v-if="formThead.endTime" align="center"
          :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
            <span>{{ scope.row.endTimeAll}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="订单创建" v-if="formThead.createTime" align="center"
          :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="320" fixed="right">
          <template slot-scope="scope">
            <div style="display: flex;justify-content: center;align-items: center;">
              <el-button type="primary" @click="closeOrder(scope.row.id)" style="margin-left: 10px;" size="mini"
                v-if="scope.row.orderStatus == 1 && btnAuthen.permsVerifAuthention(':sys:orderInfo:closeOrder')">
                结束订单
              </el-button>
              <el-button type="primary" size="mini" @click="abnormalOrderSettlement(scope.row.orderCode)"
                v-if="scope.row.orderStatus != 2 && btnAuthen.permsVerifAuthention(':sys:orderInfo:abnormalOrderSettlement')">
                异常结算
              </el-button>
              <!-- 功率图 -->
              <power-charts :row_data="scope.row" />

              <!-- 详情 -->
              <order-detail :row_data="scope.row" />

              <el-button type="danger" @click="del(scope.row.orderCode)" style="margin-left: 10px;"
                v-if="btnAuthen.permsVerifAuthention(':order:scanOrderList:delete')" size="mini">
                删除
              </el-button>
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
    findOrderInfoById,
    closeOrder,
    downloadExcel,
    orderRefund,
    findDevicePowerDetails,
    abnormalOrderSettlement,
  } from '@/api/order/scanOrderList.js'
  import {
    parseTime,
    numTime,
    formatSeconds,
    getNowTime
  } from '@/utils/index'
  import {
    findDealerList,
  } from '@/api/device/deviceList.js'
  import {
    getChargingStationList
  } from '@/api/netWorkDot/netWorkDotList.js'
  import orderDetail from './components/orderDetail.vue'
  import powerCharts from './components/powerCharts.vue'
  import downExcel from './components/downExcel.vue'
  import imgView from '@/components/Common/imgView.vue'
  export default {
    name: 'monthOrderList',
    components: {
      orderDetail,
      powerCharts,
      downExcel,
      imgView
    },
    data() {
      return {
        activeName: '1',
        ruleIdList: [{
          id: '1',
          title: '单车'
        }, {
          id: '2',
          title: '汽车'
        }],
        listLoading: true,
        page: 1,
        limit: 10,
        list: [],
        dealerList: [],
        chargingStationList: [],
        total: 10,
        tableKey: 0,
        listQuery: {
          page: 1,
          limit: 10,
          payStatus: '',
          orderStatus: '',
          orderCode: '',
          deviceCode: '',
          phoneNumber: '',
          userCode: '',
          orderType: 3,
          createTimeStart: '',
          createTimeEnd: '',
          networkProvince: '',
          networkName: '',
          adminId: '',
          adminName: '',
          ruleId: 1,
          chargingStationIds: ''
        },
        formThead: {
          orderCode: true,
          deviceCode: true,
          userName: false,
          headImg: false,
          totalPrice: false,
          orderType: false,
          devicePort: true,
          electricityPrice: true,
          servicePrice: true,
          networkName: true,
          networkAddress: false,
          orderStatus: true,
          payStatus: true,
          stopReason: true,
          hours: true,
          userdTime: true,
          hasTime: false,
          startTime: true,
          endTime: true,
          createTime: false,
          actualPrice: true,
          proxyMoneyStatus: false,
          realityPayMoney: true,
          avgPower: false,
          maxPower: false,
          totalPower: true,
          power: true,
          userCode: true,
          phoneNumber: true,
          wxName: false,
          wxAppId: false,
          priceType: false
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
        ],
        time: ''
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
    mounted() {
      getChargingStationList().then(res => {
      	if (res.code == 200) {
      		this.chargingStationList = res.data;
      	} else {
      		this.$message.error(res.msg)
      	}
      })
    },
    methods: {
      //切换导航
      handleClick(tab, event) {
        this.listQuery.ruleId = tab.name
        this.listQuery.page = 1,
        this.listQuery.limit = 10,
        this.getLists()
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
            if (list.length != 0) {
              list.forEach((item, index) => {
                item.eleNum = item.hours
                let userdTime = ''
                if (item.orderStatus != 1) {
                  userdTime = numTime(item.endTimeAll, item.startTimeAll, 1) ||
                    '00:00:00'
                  item.userdTime = numTime(item.endTimeAll, item.startTimeAll, 0)
                } else {
                  let nowDate = this.getTime()
                  userdTime = numTime(nowDate, item.startTimeAll, 1) || '00:00:00'
                  item.userdTime = numTime(nowDate, item.startTimeAll, 0)
                }
                userdTime = userdTime.split(':')
                let num1 = parseFloat(userdTime[0]) * 60 * 60 + parseFloat(userdTime[1]) *
                  60 + parseFloat(userdTime[2])
                let num2 = parseFloat(item.hours) * 60
                let num3 = num2 - num1
                item.hasTime = formatSeconds(num3)
                item.hours = formatSeconds(num2)
              })
            }
            this.list = list
            this.total = res.count
            this.listLoading = false
          } else {
            this.$message.error(res.msg)
          }
        })
      },
      findDealerList() {
        findDealerList().then(res => {
          if (res.code == 200) {
            this.dealerList = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      },
      //删除订单
      del(orderCode) {
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
      this.getLists()
      this.findDealerList()
    },

  }

</script>

<style>
  .boerdno {
    border-top: none;
  }

  .itemdivs {
    display: flex;
    align-items: center;
    width: 205px;
    height: 50px;
    text-indent: 10px;
  }

  .itemdiv {
    width: 100px;
    height: 50px;
    display: flex;
    padding: 12px;
    justify-content: center;
    align-items: center;
    background-color: #EEEEEE;
    color: #666666;
  }

  .borsa {
    /* border: 1px solid #EEEEEE; */
    border-bottom: 1px solid #EEEEEE;
    border-right: 1px solid #EEEEEE;
  }

  .borenone {
    border-top: 1px solid #EEEEEE;
    ;
    /* border-bottom: none; */
  }

  .borderItem {
    /* overflow: ; */
    /* width: 100%; */
    display: flex;
  }

  .borderFather {
    display: flex;
    /* justify-content: center; */
    flex-wrap: wrap;
    width: 101%;
    /* background-color: pink; */
  }

</style>

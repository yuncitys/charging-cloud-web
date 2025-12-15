<template>
  <div class="order-page">
    <!-- 触发按钮-->
    <el-button size="mini" type="primary" icon="el-icon-view" @click="handleShow()">
      详情
    </el-button>

    <!-- 弹窗 -->
    <el-dialog title="订单详情" :visible.sync="showDialog" width="80%" :before-close="handleClose" :append-to-body="true">
      <!-- 订单信息 -->
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card class="box-card">
            <h3>订单信息</h3>
            <el-row :gutter="10">
              <el-col :span="12"><strong>订单编号：</strong>{{ orderInfo.orderCode }}</el-col>
              <el-col :span="4">
                <span v-if="orderInfo.orderType != 0" style="color: blue;">扫码启动</span>
                <span v-if="orderInfo.orderType == 0" style="color: blue;">刷卡启动</span>
              </el-col>
              <el-col :span="4">
                <span v-if="orderInfo.orderStatus === 0" style="color: red;">故障</span>
                <span v-if="orderInfo.orderStatus === 1" style="color: orange;">进行中</span>
                <span v-if="orderInfo.orderStatus === 2" style="color: green;">已完成</span>
                <span v-if="orderInfo.orderStatus === 3" style="color: green;">待结算</span>
              </el-col>
              <el-col :span="4">
                <span v-if="orderInfo.payStatus === 0" style="color: red;">未支付</span>
                <span v-if="orderInfo.payStatus === 1" style="color: green;">已支付</span>
                <span v-if="orderInfo.payStatus === 2" style="color: orange;">已退款</span>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="12"><strong>充电用户：</strong>{{ orderInfo.phoneNumber }}</el-col>
              <el-col :span="12"><strong>用户昵称：</strong>{{ orderInfo.userName }}</el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="12"><strong>终端编号：</strong>{{ orderInfo.deviceCode }}</el-col>
              <el-col :span="12"><strong>充电插座：</strong>{{ orderInfo.devicePort }} 口</el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="12"><strong>所属站点：</strong>{{ orderInfo.networkName }}</el-col>
              <el-col :span="12"><strong>详细地址：</strong>{{ orderInfo.networkAddress }}</el-col>
            </el-row>
          </el-card>
        </el-col>

        <!-- 右侧费用信息 -->
        <el-col :span="8">
          <el-card class="box-card">
            <h3>费用信息</h3>
            <el-row>
              <el-col :span="12"><strong>订单总价：</strong>{{ orderInfo.totalPrice }} 元</el-col>
              <el-col :span="12"><strong>用户实付：</strong>{{ orderInfo.actualPrice }} 元</el-col>
            </el-row>
            <el-row>
              <el-col :span="12"><strong>商户实收：</strong>{{ orderInfo.realityPayMoney }} 元</el-col>
              <el-col :span="12"><strong>充电电量：</strong>{{ orderInfo.totalPower }} 度</el-col>
            </el-row>
            <el-row>
              <el-col :span="12"><strong>充电电费：</strong>{{ orderInfo.electricityPrice }} 元</el-col>
              <el-col :span="12"><strong>充电服务费：</strong>{{ orderInfo.servicePrice }} 元</el-col>
            </el-row>
            <el-row>
              <el-col :span="12"><strong>充电前余额：</strong>{{ orderInfo.startCash }} 元</el-col>
              <el-col :span="12"><strong>支付后余额：</strong>{{ orderInfo.endCash }} 元</el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>

      <!-- 充电明细 -->
      <el-card class="box-card charge-details">
        <h3>充电明细</h3>
        <el-table :data="chargeDetails" style="width: 100%">
          <el-table-column prop="timeFrame" label="充电时段" >
            <template slot-scope="scope">
              <span v-if="scope.row.timeFrame == '0'">尖</span>
              <span v-if="scope.row.timeFrame == '1'">峰</span>
              <span v-if="scope.row.timeFrame == '2'">平</span>
              <span v-if="scope.row.timeFrame == '3'">谷</span>
            </template>
          </el-table-column>
          <el-table-column prop="timeInterval" label="计费区间" ></el-table-column>
          <el-table-column prop="electricityPrice" label="电费单价(元/度)"></el-table-column>
          <el-table-column prop="servicePrice" label="服务费单价(元/度)"></el-table-column>
          <el-table-column prop="electric" label="充电度数(度)"></el-table-column>
          <el-table-column prop="electricityCharge" label="电费(元)"></el-table-column>
          <el-table-column prop="serviceCharge" label="服务费(元)"></el-table-column>
        </el-table>
      </el-card>

      <!-- 弹窗底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
	import {
		findOrderInfoById,
	} from '@/api/order/scanOrderList.js'
  import {
  	getOrderExpenseInfo,
  } from '@/api/orderExpenseInfo/orderExpenseInfo.js'
	export default {
		props: {
			row_data: {
				type: Object
			}
		},
		data() {
			return {
        showDialog: false, // 控制弹窗显示
				orderInfo: {},
        chargeDetails: [],
			}
		},
		mounted() {

		},
		methods: {
      handleClose(done) {
        // 弹窗关闭前的逻辑，例如确认提示
        this.showDialog = false;
      },
			handleShow() {
        this.showDialog = true;
				this.getOrderInfoById()
        this.getOrderExpenseInfo(this.orderInfo.orderCode)
			},
			getOrderInfoById(id) {
        this.orderInfo = this.row_data
        console.log(this.orderInfo)
			},
      getOrderExpenseInfo(orderCode){
        getOrderExpenseInfo(orderCode).then(res => {
        	if (res.code == 200) {
        		this.chargeDetails = res.data
        		console.log(this.chargeDetails)
        	} else {
        		this.$message.error(res.msg)
        	}
        })
      }
		},
		created() {

		},

	}
</script>

<style scoped>
  .order-page {
    /* padding: 20px; */
    /* margin-left: 10px; */
    display: inline-block;
  }
  .box-card {
    margin-bottom: 20px;
  }
  .charge-details {
    margin-top: 20px;
  }
  .dialog-footer {
    text-align: right;
  }
  .el-row {
    margin-bottom: 15px; /* 设置默认行间距 */
  }
  .el-row:last-child {
    margin-bottom: 0; /* 最后一行不需要额外间距 */
  }
</style>

<template>
	<div style="display: inline-block;">
		<el-button type="primary" @click="showDialog()" size="mini"
			v-if="btnAuthen.permsVerifAuthention(':web:refundCenter:tradingRefund')">
      退款
		</el-button>
		<!-- 编辑 -->
		<el-dialog :visible.sync="dialogVisible" title="交易退款" @close="dialogVisible = false" :append-to-body="true" width="60%">
			<!-- 温馨提示 -->
      <div>
        <p style="color: orange;">温馨提示1：退款仅支持180天内的交易订单。</p>
        <p style="color: orange;">温馨提示2：若该笔交易记录存在交易订单则视为订单退款否则视为用户余额退款，退款金额原路返回。</p>
        <p style="color: orange;">温馨提示3：用户充值月卡不支持退款；交易订单未结算不允许退款。</p>
      </div>
      <el-form ref="refundData" :model="refundData" label-position="left" label-width="80px">
        <el-form-item :label="'支付单号'" prop="payCode">
        	<el-input v-model="refundData.payCode" placeholder="请输入支付单号" disabled/>
        </el-form-item>
      	<el-form-item :label="'退款金额'" prop="refundMoney">
      		<el-input v-model="refundData.refundMoney" placeholder="请输入退款金额" clearable
            type="number"/>
      	</el-form-item>
      	<el-form-item :label="'退款说明'" prop="remark">
      		<el-input v-model="refundData.remark" placeholder="请输入退款说明" clearable
            type="textarea" :rows="2" />
      	</el-form-item>
        <!-- 表格 -->
        <el-table :data="tableData" border style="width: 100%; margin-top: 10px;" v-loading="loading" element-loading-text="loading……">
          <el-table-column prop="orderCode" label="交易订单" width="420">
            <template #default="scope">
              <el-input
                v-model="scope.row.orderCode"
                placeholder="交易订单"
                style="width: 100%;"
                disabled
              />
            </template>
          </el-table-column>
          <el-table-column prop="tradingType" label="交易类型">
            <template #default="scope">
              <el-input
                v-model="scope.row.tradingType"
                placeholder="交易类型"
                style="width: 100%;"
                disabled
              />
            </template>
          </el-table-column>
          <el-table-column prop="tradingStatus" label="交易状态">
            <template #default="scope">
              <el-input
                v-model="scope.row.tradingStatus"
                placeholder="交易状态"
                style="width: 100%;"
                disabled
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" >
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="handleTradingRecord(scope.row)"
              >详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>

      <!-- 弹窗底部 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="tradingRefund">确定</el-button>
      </div>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getTradingOrder,
    tradingRefund
	} from '@/api/finance/refundCenter.js'
	import {
		parseTime
	} from '@/utils/index'
	export default {
		name: 'refundCenterPage',
		components: {

		},
		props: {
			row_data: {
				type: Object
			}
		},
		data() {
			return {
				dialogVisible: false, // 弹窗是否显示
				loading: false, // 表格加载状态
				tableData: [], // 表格数据
        refundData: {
          "payCode": '',
          "tradingOrders": [],
          "refundMoney": '',
          "remark": ''
        }, //退款数据
			}
		},
		filters: {
			formatDate: function(time) {
				if (!time) {
					return ''
				}
				return parseTime(time)
			},
		},
		mounted() {

		},
		methods: {
			showDialog() {
				let scope = this.row_data
				this.dialogVisible = true
        this.refundData.payCode = scope.payCode
        this.getTradingOrder(scope.payCode)
			},
      getTradingOrder(payCode) {
        let data = {
          payCode
        }
      	getTradingOrder(data).then(res => {
      		if (res.code == 200) {
              this.tableData = res.data
      		} else {
      			this.$message.error(res.msg)
      		}
      	})
      },
      // 交易退款
      tradingRefund() {
        if(this.refundData.payCode == ''){
          this.$message.error('支付单号不能为空')
          return false
        }
        if(this.refundData.refundMoney == ''){
          this.$message.error('退款金额不能为空')
          return false
        }
        if(this.refundData.refundMoney <= 0){
          this.$message.error('退款金额必须大于0')
          return false
        }
        if(this.refundData.remark == ''){
          this.$message.error('退款备注不能为空')
          return false
        }
        let tradingOrders = []
        this.tableData.forEach((item, index) => {
          tradingOrders.push(item.orderCode)
        })
        this.refundData.tradingOrders = tradingOrders
        tradingRefund(this.refundData).then(res => {
        	if (res.code == 200) {
              this.$message.success(res.msg)
        	} else {
        		this.$message.error(res.msg)
        	}
        })
      },
      handleTradingRecord(row){
        const orderCode = row.orderCode || '';
        this.$router.push({
        	name: 'scanOrderList',
        	query: {
        		orderCode: orderCode
        	}
        })
      }
		},
		created() {

		},
	}
</script>

<style>
	.el-dialog {
		display: flex;
		flex-direction: column;
		margin: 0 !important;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		/*height:600px;*/
		max-height: calc(100% - 30px);
		max-width: calc(100% - 30px);
	}

	.el-dialog .el-dialog__body {
		flex: 1;
		overflow: auto;

	}

  /* 添加表格内容对齐的样式 */
  .el-table .el-table-column {
    text-align: center;
  }
</style>

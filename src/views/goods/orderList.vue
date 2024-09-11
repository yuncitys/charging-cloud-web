<template>
	<div class="app-container">
		<div class="filter-container">

			<el-input v-model="formItem.orderSn" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入订单编号" @keyup.enter.native="search" @clear="search()"/>
			<el-input v-model="formItem.consignee" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入收货人姓名" @keyup.enter.native="search" @clear="search()"/>
			<el-select v-model="formItem.orderStatus" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="订单状态" clearable @change="handleFilter">
				<el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-date-picker v-model="formItem.startTime" type="datetime" placeholder="开始时间" align="right"
				style="width: 200px;margin-right: 20px ;" class="filter-item" format="yyyy-MM-dd HH:mm:ss"
				value-format="yyyy-MM-dd HH:mm:ss" @change="handleFilter"></el-date-picker>
			<el-date-picker v-model="formItem.overTime" type="datetime" placeholder="结束时间" align="right"
				style="width: 200px;margin-right: 20px ;" class="filter-item" format="yyyy-MM-dd HH:mm:ss"
				value-format="yyyy-MM-dd HH:mm:ss" @change="handleFilter"></el-date-picker>

			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" icon="el-icon-search"
				@click="search()">查询</el-button>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column label="订单编号" prop="orderSn" align="center">
				</el-table-column>
				<el-table-column label="用户ID" prop="userId" align="center">
				</el-table-column>
				<el-table-column prop="userName" label="用户昵称" align="center">
				</el-table-column>
				<el-table-column prop="orderStatus" label="订单状态" align="center">
					<template slot-scope="scope">
						<el-tag type="info" v-if="scope.row.orderStatus == 101">待支付</el-tag>
						<el-tag type="success" v-if="scope.row.orderStatus == 102">已关闭</el-tag>
						<el-tag type="success" v-if="scope.row.orderStatus == 103">已关闭</el-tag>
						<el-tag type="success" v-if="scope.row.orderStatus == 201">待发货</el-tag>
						<el-tag type="success" v-if="scope.row.orderStatus == 301">待收货</el-tag>
						<el-tag type="success" v-if="scope.row.orderStatus == 401">已完成</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="orderPrice" label="订单金额" align="center">
				</el-table-column>
				<el-table-column prop="actualPrice" label="支付金额" align="center">
				</el-table-column>
				<el-table-column prop="payId" label="付款编号" align="center">
				</el-table-column>
				<el-table-column prop="payTime" label="支付时间" align="center">
				</el-table-column>
				<el-table-column prop="shipSn" label="物流单号" align="center">
				</el-table-column>
				<el-table-column prop="shipChannel" label="物流渠道" align="center">
				</el-table-column>
				<el-table-column prop="address" label="地址" align="center">
				</el-table-column>
				<el-table-column prop="goodsList" label="商品" align="center" :show-overflow-tooltip='true'>
					<template slot-scope="scope" style="text-align: center;">
						<el-popover placement="left" trigger="click" width="550">
							<el-table :data="scope.row.goodsList">
								<el-table-column property="goodsName" label="商品名称" :show-overflow-tooltip="true"
									align="center">
									<template slot-scope="scope" v-show="scope.row.goodsName">
										<span>{{scope.row.goodsName}}</span>
									</template>
								</el-table-column>
								<el-table-column property="picUrl" label="商品图片" :show-overflow-tooltip="true"
									align="center">
									<template slot-scope="scope" style="text-align: center;" v-show="scope.row.picUrl">
										<img :src="scope.row.picUrl"
											style="height: 40px;width: 40px;border-radius: 50%;">
									</template>
								</el-table-column>
								<el-table-column property="specifications" label="商品规格" :show-overflow-tooltip="true"
									align="center">
									<template slot-scope="scope" v-show="scope.row.specifications">
										<span>{{scope.row.specifications[0]}}</span>
									</template>
								</el-table-column>
								<el-table-column property="number" label="数量" :show-overflow-tooltip="true"
									align="center">
									<template slot-scope="scope" v-show="scope.row.number">
										<span>{{scope.row.number}}</span>
									</template>
								</el-table-column>
							</el-table>
							<el-button slot="reference" type="primary" size="mini">点击查看</el-button>
						</el-popover>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center">
					<template slot-scope="scope">
						<el-button size="mini" type="primary" @click="ship(scope.row)"
							v-if="scope.row.orderStatus == 201">发货 
						</el-button>
						<el-button size="mini" type="danger" @click="remove(scope.row)"
							v-if="scope.row.orderStatus == 401 || scope.row.orderStatus == 102">删除
						</el-button>
					</template>
				</el-table-column>
			</el-table>

			<div class="pagination-container">
				<el-pagination :current-page="formItem.pageNum" :page-sizes="[10,20,30, 50]"
					:page-size="formItem.pageSize" :total="total" background
					layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
					@current-change="handleCurrentChange" />
			</div>




			<el-dialog title="订单发货" :visible.sync="shipshow" width="50%" :close-on-click-modal="false" :append-to-body="true">
				<el-form :model="shipform" label-width="90px" ref="shipform" style="width: 90%" size="small">
					<el-form-item label="发货编号:" prop="shipSn">
						<el-input v-model="shipform.shipSn"></el-input>
					</el-form-item>
					<el-form-item label="快递公司:" prop="shipChannel">
						<el-input v-model="shipform.shipChannel"></el-input>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button type="primary" @click="ship_confirm('shipform')">确认</el-button>
					<el-button @click="ship_cancel('shipform')">取消</el-button>
				</div>
			</el-dialog>

			<el-dialog title="订单退款" :visible.sync="refundshow" width="50%" :close-on-click-modal="false" :append-to-body="true">
				<el-form :model="refundform" label-width="90px" ref="refundform" style="width: 90%" size="small">
					<el-form-item label="订单编号:" prop="orderId">
						<el-input v-model="shipform.orderId" readonly></el-input>
					</el-form-item>
					<el-form-item label="退款金额:" prop="refundMoney">
						<el-input v-model="shipform.refundMoney"></el-input>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button type="primary" @click="refund_confirm('refundform')">确认</el-button>
					<el-button @click="refund_cancel('refundform')">取消</el-button>
				</div>
			</el-dialog>
		</div>
	</div>
</template>
<script>
	import {
		getdetail,
		getOrderdetail,
		setship,
		setrefund,
		webOrder,
		getOrderList,
	} from '@/api/goods/goods.js'
	export default {
		name:'orderList',
		data() {
			return {
				records: [],
				listLoading: false,
				tableKey: 0,
				detailshow: true, //订单详情弹窗
				shipshow: false, //订单发货弹窗
				refundshow: false, //订单退款弹窗
				formItem: {
					orderStatus: "",
					userName: "",
					orderSn: "",
					consignee: "",
					startTime: "",
					overTime: "",
					pageNum: 1,
					pageSize: 10
				},
				detailform: {
					order: {},
					user: {},
					orderGoods: []
				},
				shipform: {
					orderId: "",
					shipSn: "",
					shipChannel: "",
				},
				refundform: {
					orderId: "",
					refundMoney: "",
				},
				tags: [{
						id: 101,
						title: '待支付'
					},
					{
						id: 201,
						title: '待发货'
					},
					{
						id: 301,
						title: '待收货'
					},
					{
						id: 401,
						title: '已完成'
					},
					{
						id: 102,
						title: '已关闭'
					},
				],
				columns: [ //主页列表 表头
					{
						title: "订单编号",
						key: "orderSn",
						align: "center",
					},
					{
						title: "用户ID",
						key: "userId",
						align: "center"
					},
					{
						title: "用户昵称",
						key: "userName",
						align: "center"
					},
					{
						title: "订单状态",
						key: "orderStatus",
						align: "center"
					},
					{
						title: "订单金额",
						key: "orderPrice",
						align: "center",
					},
					{
						title: "支付金额",
						key: "actualPrice",
						align: "center"
					},
					{
						title: "付款编号",
						key: "payId",
						align: "center"
					},
					{
						title: "支付时间",
						key: "payTime",
						align: "center",
					},
					{
						title: "物流单号",
						slot: "shipSn",
						align: "center"
					},
					{
						title: "物流渠道",
						key: "shipChannel",
						align: "center"
					},
					{
						title: "操作",
						slot: "action",
						width: 250,
						align: "center"
					}
				],
				data: [ //主页列表  数据
					//{id: 1,phone: "13525362152"}
				],
				total: 0,
				size: 10,
				page: 1,
				list: []
			};
		},
		methods: {
			handleSizeChange(val) {
				this.formItem.pageSize = val
				this.request();
			},
			handleCurrentChange(val) {
				this.formItem.pageNum = val
				this.request();
			},
			startChange(d) { //搜索栏  开始时间
				this.formItem.startTime = d;
			},
			endChange(d) { //搜索栏  结束时间
				this.formItem.overTime = d;
			},
			search() { //搜索
				this.request();
			},
			detail(row) { //订单详情
				this.detailshow = true;
				let data = {
					id: row.id
				}
				getdetail(data).then(res => {
					if (res.code == 200) {
						console.log(res);
						this.detailform = res.data;
					}
				})
			},
			ship(row) { //订单发货
				this.shipshow = true;
				console.log(row)
				this.shipform.orderId = row.id;
				this.shipform.shipSn = row.shipSn;
				this.shipform.shipChannel = row.shipChannel;
			},
			refund(row) { //订单退款
				this.refundshow = true;
				this.refundform.orderId = row.orderId;
				this.refundform.refundMoney = row.refundMoney;
			},
			ship_confirm(name) { // 订单发货弹窗  确认
				this.$refs[name].validate((valid) => {
					if (valid) {
						let data = {
							orderId: this.shipform.orderId,
							shipSn: this.shipform.shipSn,
							shipChannel: this.shipform.shipChannel,
						}
						setship(data).then(res => {
							if (res.code == 200) {
								this.shipshow = false; //关闭订单发货弹窗
								this.$refs[name].resetFields(); // 重置弹窗内容
								this.request();
							} else {
								this.$message.error(res.msg)
							}
						})
					}
				});
			},
			ship_cancel(name) { // 订单发货弹窗  关闭
				this.$refs[name].resetFields(); // 重置弹窗内容
				this.shipshow = false;
			},
			refund_confirm(name) { // 订单退款弹窗  确认
				this.$refs[name].validate((valid) => {
					if (valid) {
						let data = {
							orderId: this.refundform.orderId,
							refundMoney: this.refundform.refundMoney,
						}
						setrefund(data).then(res => {
							if (res.code == 200) {
								this.refundshow = false; //关闭订单退款弹窗
								this.$refs[name].resetFields(); // 重置弹窗内容
								this.request();
							} else {
								this.$message.error(res.msg)
							}
						})
					}
				});
			},
			refund_cancel(name) { // 订单退款弹窗  关闭
				this.$refs[name].resetFields(); // 重置弹窗内容
				this.refundshow = false;
			},
			remove(row) { // 删除
				console.log(row)
				this.$confirm("此操作将永久删除该条记录, 是否继续?", "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					closeOnClickModal: false,
					type: "warning"
				}).then(() => {
					let data = {
						ids: row.id,
					}
					webOrder(data).then(res => {
						if (res.code == 200) {
							this.request()
						} else {
							this.$message.error(res.msg)
						}
					})
				});
			},
			request() {
				getOrderList(this.formItem).then(res => {
					if (res.code == 200) {
						this.list = res.data.records;
						this.total = res.data.total;
					}
				})
			},
		},
		created() {
			this.request()
		},
	};
</script>

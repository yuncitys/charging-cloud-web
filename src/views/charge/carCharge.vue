<template>
	<div class="app-container" v-if="1">
		<div class="filter-container">
			<el-input v-model="listQuery.feeName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入方案名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询
			</el-button>
			<addPage @getLists="getLists" />

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" row-key="id"
				:tree-props="{children: 'children', hasChildren: 'hasChildren'}">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{ scope.$index + (page - 1) * limit + 1 }} </span></template>
				</el-table-column>
				<el-table-column prop="feeName" label="方案名称" align="center">
				</el-table-column>
				<el-table-column prop="detailList" label="方案详情" align="center"  width="350"
          :show-overflow-tooltip="true">
					<template slot-scope="scope">
						<div v-for="(item,index) in scope.row.detailList">
							时间段:{{item.stTime}}~{{item.enTime}};电费:￥{{item.powerPrice}};服务费:￥{{item.serviceFee}}
						</div>
					</template>
				</el-table-column>
        <el-table-column prop="createUser" label="创建用户" align="center"
        	:show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="updateUser" label="更新用户" align="center"
        	:show-overflow-tooltip="isPc">
        </el-table-column>
				<el-table-column prop="createTime" label="创建时间" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
        <el-table-column prop="updateTime" label="更新时间" align="center" :show-overflow-tooltip="isPc">
        	<template slot-scope="scope">
        		<span>{{ scope.row.updateTime | formatDate }}</span>
        	</template>
        </el-table-column>
				<el-table-column label="操作" align="center" fixed="right">
					<template slot-scope="scope">
            <div style="display: flex;align-items: center;justify-content: space-around;">
              <div>
                <div>
                  <editPage @getLists="getLists" :row_data="scope.row" />
                </div>
                <div class="top10">
                  <el-button type="danger" @click="del(scope.row.id)"
                  	icon="el-icon-delete"
                  	v-if="btnAuthen.permsVerifAuthention(':netWorkDot:charge:carCharge:delete')">
                  	删除
                  </el-button>
                </div>
              </div>
            </div>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination-container">
				<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
					:total="total" background layout="total, sizes, prev, pager, next, jumper"
					@size-change="handleSizeChange" @current-change="handleCurrentChange" />
			</div>
		</div>
	</div>
</template>
<script>
	import {
		getList,
		batchDevicePrices,
		updateDevicePrice,
		deleteDevicePrice
	} from '@/api/netWorkDot/charge/chargeList.js'
	import {
		parseTime
	} from '@/utils/index'
	import addPage from './components/carCharge/addPage.vue'
	import editPage from './components/carCharge/editPage.vue'
	import SelectTime from '@/components/SelectTime/index'
	export default {
		components: {
			SelectTime,
			addPage,
			editPage
		},
		name: 'carCharge',
		data() {
			return {
				tableKey: 0,
				listLoading: true,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10,
					feeName: '',
					ruleId: 2
				},
			}
		},
		filters: {
			formatDate: function(time) {
				if (!time) {
					return ''
				}
				return parseTime(time)
			}
		},
		methods: {
			getLists() {
				this.listLoading = true
				getList(this.listQuery).then(res => {
					if (res.code == 200) {
						console.log(res)
						let list = res.data || []
						this.list = list
						list.forEach((item, index) => {
							if (item.bill) {
								let bill = JSON.parse(item.bill)
								item.detailList = []
								item.priceContents.forEach((item1, index1) => {
									let stTime = item1.beginTime.substring(0, 2) + ':' + item1.beginTime.substring(2,4)
									let stMinutes = Number(item1.beginTime.substring(0, 2) * 60) + Number(item1.beginTime.substring(2, 4))

									let enTime = item1.endTime.substring(0, 2) + ':' + item1.endTime.substring(2,4)
									let enMinutes = Number(item1.endTime.substring(0, 2) * 60) + Number(item1.endTime.substring(2, 4))

									let obj = {
										stTime: stTime,
										enTime: enTime,
										powerPrice: '',
										serviceFee: '',
										totalPrice: '',
									}

									if (Number(item1.flag) === 0) {
										obj.powerPrice = bill.jian
										obj.serviceFee = bill.jianEx
										obj.totalPrice = Number(bill.jianEx) + Number(bill.jian)
									} else if (Number(item1.flag) === 1) {
										obj.powerPrice = bill.feng
										obj.serviceFee = bill.fengEx
										obj.totalPrice = Number(bill.fengEx) + Number(bill.feng)
									} else if (Number(item1.flag) === 2) {
										obj.powerPrice = bill.ping
										obj.serviceFee = bill.pingEx
										obj.totalPrice = Number(bill.pingEx) + Number(bill.ping)
									} else if (Number(item1.flag) === 3) {
										obj.powerPrice = bill.gu
										obj.serviceFee = bill.guEx
										obj.totalPrice = Number(bill.guEx) + Number(bill.gu)
									}
									item.detailList.push(obj)
								})
							}
						})
						this.total = res.count
						this.listLoading = false
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			del(id) {
				this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						id
					}
					console.log(data)
					deleteDevicePrice(data).then(res => {
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
			handleFilter() {
				this.listQuery.page = 1
				this.getLists()
			},
			resetForm(formName) {
				this.$refs[formName].resetFields()
			}
		},
		created() {
			this.getLists()
		}
	}
</script>

<style scoped="scoped" lang="scss">
	.flex {
		display: flex;
	}

	.left {
		margin-right: 20px;
	}

	.inputBoxx2 {
		margin-top: 10px !important;
		width: 100%;
	}

	.inputBoxx2 .inputCom {
		width: 35%;
		margin-right: 30px;
	}

	.inputBoxx1 {
		width: 100%;
	}

	.inputBoxx1 .inputCom {
		width: 35%;
		margin-right: 30px;
	}

	.inputBtnn {
		margin-top: 10px !important;
	}

	.formItem {
		margin-bottom: 25px;
	}

	.price-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;

		.price-input {
			margin-left: 10px;
		}
	}

	.price-period-item {
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}

	.select-priod-type {
		margin-left: 20px;
		min-width: 250px;
	}

	.scheme-dialog {
		min-width: 550px;
	}

	.reduce-svg {
		width: 24px;
		height: 24px;
		margin-right: 5px;
		flex-grow: 0;
		flex-shrink: 0;
	}

	.add-svg {
		width: 28px;
		height: 28px;
		margin-right: 10px;
	}

	.add-period-item {
		padding-bottom: 15px;
		padding-top: 15px;
	}
</style>

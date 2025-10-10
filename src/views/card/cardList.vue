<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.cardNo" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入卡号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-select v-model="listQuery.cardStatus" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请选择卡状态" clearable @change="handleFilter">
				<el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item"
				style="margin-right: 20px ;" start-placeholder="开始日期" end-placeholder="结束日期" @change="dateChange"
				format="yyyy-MM-dd" value-format="yyyy-MM-dd">
			</el-date-picker>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询
      		</el-button>


			<div style="margin: 15px 0;">
				<!-- 新增 -->
				<addPage @getLists="getLists" />
				<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="handleDownload1"
					:loading="downloadLoading" icon="el-icon-download">模板下载
				</el-button>
				<!-- <el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="showExcel=true"
					icon="el-icon-upload" v-if="btnAuthen.permsVerifAuthention(':card:cardList:allAdd')">导入Excel
				</el-button> -->
				<uploadExcel @getLists="getLists"></uploadExcel>
			</div>


			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column prop="cardNo" label="卡号" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="userName" label="用户名" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="cardCash" label="余额" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="realityPayMoney" label="实际支付金额" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="giveMoney" label="赠送金额" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="perPayMoney" label="每次刷卡支付金额" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="cardStatus" label="卡状态" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<el-tag type="success" v-if="scope.row.cardStatus == 0">正常</el-tag>
						<el-tag type="danger" v-if="scope.row.cardStatus == 1">挂失</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="createUser" label="创建用户" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="updateUser" label="更新用户" align="center" :show-overflow-tooltip="isPc">
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
				<el-table-column label="操作" align="center" width="300">
					<template slot-scope="scope">
						<div style="display: flex;justify-content: center;align-items: center;">
							<!-- 编辑 -->
							<editPage :row_data="scope.row" @getLists="getLists" />
							<!-- 充值 -->
							<addMoney :row_data="scope.row" @getLists="getLists" />
							<el-button type="warning" style="margin-left: 10px;" @click="onlossCard(scope.row.cardNo)"
								v-if="scope.row.cardStatus == 0 && btnAuthen.permsVerifAuthention(':card:cardList:loss')"
								size="mini">挂失
							</el-button>
							<el-button type="danger" @click="del(scope.row.id)" style="margin-left: 10px;"
								icon="el-icon-delete" v-if="btnAuthen.permsVerifAuthention(':card:cardList:delete')"
								size="mini">删除
							</el-button>
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
		deleteCard,
		updateElectricity,
		addCard,
		lossCard,
		updateCard,
	} from '@/api/card/cardList.js'
	import {
		parseTime
	} from '@/utils/index'
	import addPage from './components/addPage.vue'
	import editPage from './components/editPage.vue'
	import addMoney from './components/addMoney.vue'
	import uploadExcel from './components/uploadExcel.vue'
	export default {
		name: 'cardList',
		components: {
			addPage,
			editPage,
			uploadExcel,
			addMoney
		},
		data() {
			return {
				fullscreenLoading: false,
				showExcel: false,
				downloadLoading: false,
				listLoading: true,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10,
					cardNo: '',
					cardStatus: '',
					createTimeStart: '',
					createTimeEnd: ''
				},
				tags: [{
					title: '正常',
					id: 0,
				}, {
					title: '已挂失',
					id: 1,
				}],
				tableKey: 0,
				showAddMoney: false,
				addMoney: {
					cardNo: '',
					realityPayMoney: '',
					giveMoney: ''
				},
				time: ''
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
		methods: {
			//模板下载
			handleDownload1() {
				import('@/vendor/Export2Excel').then(excel => {
					const tHeader = ['卡号', '用户名', '卡余额', '实际支付金额', '赠送金额']
					const data = []
					excel.export_json_to_excel({
						header: tHeader,
						data,
						filename: '充电卡导入模板'
					})
					this.downloadLoading = false
				})
			},
			formatJson(filterVal, jsonData) {
				return jsonData.map(v => filterVal.map(j => v[j]))
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
						this.list = res.data
						this.total = res.count
						this.listLoading = false
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			onlossCard(cardNo) {
				this.$confirm('是否挂失充电卡?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						cardNo
					}
					console.log(data)
					lossCard(data).then(res => {
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
					deleteCard(data).then(res => {
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
			dateChange(e) {
				if (e) {
					this.listQuery.createTimeStart = e[0]
					this.listQuery.createTimeEnd = e[1]
				} else {
					this.listQuery.createTimeStart = ''
					this.listQuery.createTimeEnd = ''
				}
				this.handleFilter()
			},
			handleFilter() {
				this.listQuery.page = 1
				this.getLists()
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
		},
		created() {
			this.getLists()
		},
	}
</script>

<style scoped="scoped">
	.avatar-uploader-icon {
		border: 1px dashed #d9d9d9 !important;
		border-radius: 6px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.avatar-uploader-icon {
		font-size: 28px;
		color: #8c939d;
		width: 178px;
		height: 178px;
		line-height: 178px;
		text-align: center;
	}

	.avatar {
		width: 178px;
		height: 178px;
		display: block;
	}
</style>

<template>
	<div class="app-container">
		<div class="filter-container">
			<el-select v-model="listQuery.ruleId" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请选择归属系列" clearable @change="handleFilter">
				<el-option v-for="item in ruleIds" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-select v-model="listQuery.electricOut" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请选择电流输出类型" clearable @change="handleFilter">
				<el-option v-for="item in electricOuts" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询
      		</el-button>
			<!-- 新增 -->
			<addPage @getLists="getLists" />

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column prop="deviceTypeId" label="设备类型ID" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="deviceTypeName" label="设备类型名称" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="ruleId" label="归属系列" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						{{scope.row.ruleId === 1 ? '单车' : '汽车'}}
					</template>
				</el-table-column>
				<el-table-column prop="electricOut" label="电流输出" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						{{scope.row.electricOut === 1 ? '直流充电桩' : '交流充电桩'}}
					</template>
				</el-table-column>
				<el-table-column prop="portCount" label="设备端口数" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="操作" align="center" width="200">
					<template slot-scope="scope">
						<editPage @getLists="getLists" :row_data="scope.row" style="margin-right: 20px;" />
						<el-button size="mini" type="danger"
							v-if="btnAuthen.permsVerifAuthention(':device:deviceType:deleteDeviceType')"
							@click="deleteItem(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>

			<div class="pagination-container">
				<el-pagination :current-page="listQuery.page" :page-sizes="[10,50,100,500]" :page-size="listQuery.limit"
					:total="total" background layout="total, sizes, prev, pager, next, jumper"
					@size-change="handleSizeChange" @current-change="handleCurrentChange" />
			</div>
		</div>
	</div>
</template>

<script>
	import {
		findDeviceTypeList,
		saveDeviceType,
		deleteDeviceType,
		updateDeviceType,
	} from '@/api/device/deviceList.js'
	import addPage from './components/deliveryType/addPage.vue'
	import editPage from './components/deliveryType/editPage.vue'
	export default {
		components: {
			addPage,
			editPage
		},
		name: 'deviceList',
		data() {
			return {
				limit: 10,
				page: 1,
				showeditDevice: false,
				tableKey: 0,
				loading: false,
				addDelicery: false,
				total: 10,
				list: [],
				listQuery: {
					page: 1,
					limit: 10,
					ruleId: '',
					electricOut: '',
				},
				ruleIds:[
					{
						title: '单车',
						id: 1,
					}, {
						title: '汽车',
						id: 2,
					}
				],
				electricOuts:[
					{
						title: '交流',
						id: 0,
					}, {
						title: '直流',
						id: 1,
					}
				]
			}
		},
		mounted() {

		},
		methods: {
			//设置表格一页数量
			handleSizeChange(val) {
				this.listQuery.limit = val
				this.getLists()
			},
			//设置表格页数
			handleCurrentChange(val) {
				this.listQuery.page = val
				this.getLists()
			},
			handleFilter() {
				this.listQuery.page = 1
				this.getLists()
			},
			getLists() {
				this.listLoading = true
				findDeviceTypeList(this.listQuery).then(res => {
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
			deleteItem(item) {
				console.log(item)
				this.$confirm(`是否确认删除设备类型名称为:${item.deviceTypeName}的信息吗?`, '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						deviceTypeId: item.deviceTypeId
					}
					console.log(data)
					deleteDeviceType(data).then(res => {
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
		},
		created() {
			this.getLists()

			this.isPc = !this.$common.isMobile()
		},
	}
</script>

<style scoped="scoped">
	.portText {
		font-weight: bold;
		color: #000000;
		margin-top: 20px;
	}
</style>

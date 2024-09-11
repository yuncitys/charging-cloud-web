<template>
	<div id="page">
		<el-form label-position="left" label-width="80px" :inline="true">
			<el-form-item :label="''">
				<el-input placeholder="请输入设备号" v-model="listQuery.deviceCode" class="filter-item" clearable
					@keyup.enter.native="handleFilter" @clear="handleFilter()" />
			</el-form-item>
			<!-- <el-autocomplete style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.adminName"
				:fetch-suggestions="querySearch" placeholder="请选择代理商" @select="handleSelect" clearable :debounce='0'
				@change="changeName" @clear="handleFilter()">
      </el-autocomplete> -->
      <el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.dealerId" filterable clearable @change="handleFilter()"
        placeholder="请选择代理商">
          <el-option
            v-for="item in dealerList"
            :key="item.id"
            :label="item.adminFullname"
            :value="item.id">
          </el-option>
      </el-select>
			<el-form-item>
        <el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter" icon="el-icon-search">
          查询
        </el-button>
			</el-form-item>
		</el-form>

		<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
			highlight-current-row style="width: 100%;" align="center" id="tableBox">
			<el-table-column type="index" width="55" label="序号" align="center">
				<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
			</el-table-column>
			<el-table-column prop="deviceCode" label="设备号" align="center" :show-overflow-tooltip="isPc">
			</el-table-column>
      <el-table-column prop="deviceName" label="设备名称" align="center" :show-overflow-tooltip="isPc">
      </el-table-column>
      <el-table-column prop="networkName" label="站点名称" align="center" :show-overflow-tooltip="isPc">
      </el-table-column>
      <el-table-column prop="networkAddress" label="站点地址" align="center" :show-overflow-tooltip="isPc">
      </el-table-column>
      <el-table-column prop="orderCount" label="订单总数" align="center" sortable :show-overflow-tooltip="isPc">
      </el-table-column>
			<el-table-column prop="countCashByCard" label="刷卡收入" align="center" sortable :show-overflow-tooltip="isPc">
			</el-table-column>
			<el-table-column prop="countCashByScan" label="扫码收入" align="center" sortable :show-overflow-tooltip="isPc">
			</el-table-column>
			<el-table-column prop="adminId" label="代理商" align="center" :show-overflow-tooltip="isPc">
				<template slot-scope="scope">
					<div v-if="scope.row.adminId">
						<deviceAdmin :row_data="scope.row"></deviceAdmin>
					</div>
				</template>
			</el-table-column>
		</el-table>
		<div class="pagination-container">
			<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="limit" :total="total"
				background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
				@current-change="handleCurrentChange" />
		</div>
	</div>
</template>

<script>
	import {
		getList,
		findDealerList,
		findReportsAndStatisticsByDevice
	} from '@/api/business/businessStatistics.js'
	import {
		parseTime
	} from '@/utils/index'
	import deviceAdmin from '../device/components/deviceAdmin.vue'
	export default {
		components: {
			deviceAdmin
		},
		name: 'businessDevList',
		data() {
			return {
				listLoading: false,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10,
					dealerId: '',
					deviceCode: ''
				},
        dealerList: [],
				tableKey: 0,
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
			//查询搜索代理商
			// querySearch(queryString, cb) {
			// 	var restaurants = this.restaurants;
			// 	let restaurantsText = restaurants.map((item) => {
			// 		let value = item.adminName + "(" + item.adminFullname + ")"
			// 		let dealerId = item.id
			// 		return {
			// 			value,
			// 			dealerId
			// 		}
			// 	})
			// 	var results = queryString ? restaurantsText.filter(this.createFilter(queryString)) : restaurantsText;
			// 	// 调用 callback 返回建议列表的数据
			// 	cb(results);
			// },
			// createFilter(queryString) {
			// 	return (restaurant) => {
			// 		return (restaurant.value.toLowerCase().includes(queryString.toLowerCase()))
			// 	};
			// },
			//选择代理商
			// handleSelect(item) {
			// 	console.log(item);
			// 	this.listQuery.dealerId = item.dealerId + ''
			// 	this.listQuery.adminName = item.value + ''
			// 	this.handleFilter()
			// },
			//清除已选择代理商
			// changeName() {
			// 	if (this.listQuery.adminName == '') {
			// 		this.listQuery.dealerId = ''
			// 	}
			// },
			findDealerList() {
				findDealerList().then(res => {
					if (res.code == 200) {
						this.dealerList = res.data;
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			getLists() {
				this.listLoading = true
				findReportsAndStatisticsByDevice(this.listQuery).then(res => {
					if (res.code == 200) {
						this.list = res.data
						this.total = res.count
						this.listLoading = false
					} else {
						this.$message.error(res.msg)
					}
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
				this.$refs[formName].resetFields();
			},
		},
		created() {
			this.findDealerList()
			this.getLists()
		},
	}
</script>

<style scoped="scoped">
	#page {
		margin-top: 30px;
		margin-left: 20px;
	}
</style>

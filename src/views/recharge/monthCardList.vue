<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.name" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入套餐名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()"/>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询</el-button>

      <addPage @getLists="getLists"/>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" row-key="id"
				:tree-props="{children: 'children', hasChildren: 'hasChildren'}" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
        <el-table-column prop="wxName" label="小程序名称" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="networkName" label="运营充电站" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="networkAddress" label="充电站位置" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
				<el-table-column prop="name" label="套餐名称" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="monthCardType" label="月卡类型" align="center" :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
          	<span type="success" v-if="scope.row.monthCardType == 0">仅充电</span>
          	<span type="success" v-if="scope.row.monthCardType == 1">仅停车</span>
          	<span type="success" v-if="scope.row.monthCardType == 2">停车+充电</span>
          </template>
				</el-table-column>
        <el-table-column prop="buyLimit" label="购买权限" align="center" :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
          	<span v-if="scope.row.buyLimit == 0">无限制</span>
          	<span v-if="scope.row.buyLimit == 1">仅小区用户</span>
          </template>
        </el-table-column>
        <el-table-column prop="renewType" label="续费规则" align="center" :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
          	<span type="success" v-if="scope.row.renewType == 0">常规续费</span>
          	<span type="success" v-if="scope.row.renewType == 1">从过期时间开始续费</span>
          </template>
        </el-table-column>
        <el-table-column prop="virtualCardEnabled" label="是否开通虚拟卡" align="center" :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
          	<span v-if="scope.row.virtualCardEnabled == 0">否</span>
          	<span v-if="scope.row.virtualCardEnabled == 1">是</span>
          </template>
        </el-table-column>
        <el-table-column prop="chargingMonthType" label="包月类型" align="center" :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
          	<span v-if="scope.row.chargingMonthType == 1">限次数包月</span>
          	<span v-if="scope.row.chargingMonthType == 2">限总时长包月</span>
          </template>
        </el-table-column>
        <el-table-column prop="monthTotalStr" label="单月限制" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="dayTotalStr" label="单日限制" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="createUser" label="创建用户" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="updateUser" label="编辑用户" align="center" :show-overflow-tooltip="isPc">
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
				<el-table-column label="操作" align="center" width="200">
					<template slot-scope="scope">
						<!--编辑方案-->
						<editPage @getLists="getLists" :row_data="scope.row"/>

						<el-button type="danger" @click="del(scope.row.id)" style="margin-left: 10px;" size="mini"
							icon="el-icon-delete" v-if="btnAuthen.permsVerifAuthention(':sys:month:card:delete')">
							删除
						</el-button>
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
    page,
    del
	} from '@/api/monthCard/monthCardList.js'
	import {
		parseTime
	} from '@/utils/index'
	import qs from 'qs'
	import addPage from './components/monthCard/addPage.vue'
	import editPage from './components/monthCard/editPage.vue'
	export default {
		name: 'balanceList',
		components:{
			addPage,
			editPage
		},
		data() {
			return {
				listLoading: true,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10,
					name:''
				},
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
			getLists() {
				this.listLoading = true
				page(this.listQuery).then(res => {
					if (res.code == 200) {
						console.log(res)
            let list = res.data || []
            list.forEach((item, index) => {
              let unit = ''
              if(item.chargingMonthType === 1){
                unit = '次';
              } else {
                unit = '分钟'
              }
            	let monthTotalStr = item.monthTotal === undefined ? 0 + unit : item.monthTotal  + unit
            	let dayTotalStr = item.dayTotal === undefined ? 0 + unit : item.dayTotal + unit
            	item.monthTotalStr = monthTotalStr;
            	item.dayTotalStr = dayTotalStr;
            })
						this.list = list
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
						id:id
					}
					console.log(data)
					del(data).then(res => {
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
				this.$refs[formName].resetFields();
			},
		},
		created() {
			this.getLists()
			this.isPc=!this.$common.isMobile()
		},
	}
</script>

<style scoped="scoped">
	.flex {
		display: flex;
	}
</style>

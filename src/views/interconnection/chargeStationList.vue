<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.networkAddress" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入充电站地址" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.networkProvince" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入充电站省份" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()"/>
			<el-input v-model="listQuery.networkName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入充电站名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()"/>
			<el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.merchantId" filterable clearable @change="handleFilter()"
			  placeholder="运营商户">
			    <el-option
			      v-for="item in merchantList"
			      :key="item.id"
			      :label="item.name"
			      :value="item.id">
			    </el-option>
			</el-select>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter" icon="el-icon-search">
				查询
			</el-button>

			<!--同步站点-->
			<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="onSyncStation">
				同步站点
			</el-button>

			<!--导出Excel  -->
			<downExcel :queryData="listQuery" />

			<el-tabs v-model="activeName" type="card" @tab-click="handleClick">
				<el-tab-pane
					v-for="(item, index) in ruleIdList"
					:key="item.id"
					:label="item.title"
					:name="item.id">
				</el-tab-pane>
			</el-tabs>

			<el-table
				id="tableBox"
				:key="tableKey"
				v-loading="listLoading"
				:data="list"
				element-loading-text="拼命加载中......"
				fit
				highlight-current-row
				style="width: 100%;"
				align="center"
			>
				<el-table-column label="电站信息" min-width="260" align="left">
					<template slot-scope="scope">
						<div class="station-list-cell">
							<div class="station-list-cell__row">
								<span class="station-list-cell__label">名称：</span>
								<span class="station-list-cell__value" :title="disp(scope.row.networkName)">{{ disp(scope.row.networkName) }}</span>
							</div>
							<div class="station-list-cell__row">
								<span class="station-list-cell__label">ID：</span>
								<span class="station-list-cell__value" :title="disp(scope.row.externalStationId)">{{ disp(scope.row.externalStationId) }}</span>
							</div>
							<div class="station-list-cell__row">
								<span class="station-list-cell__label">内部ID：</span>
								<span class="station-list-cell__value">{{ disp(scope.row.id) }}</span>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					prop="merchantName"
					label="运营商户"
					min-width="120"
					align="center"
					:show-overflow-tooltip="true"
				/>
				<el-table-column label="设备数" width="100" align="left">
					<template slot-scope="scope">
						<div class="station-list-cell">
							<div class="station-list-cell__row">
								<span class="station-list-cell__label">直：</span>
								<span class="station-list-cell__value">{{ countOrZero(scope.row.dcGunCount) }}</span>
							</div>
							<div class="station-list-cell__row">
								<span class="station-list-cell__label">交：</span>
								<span class="station-list-cell__value">{{ countOrZero(scope.row.acGunCount) }}</span>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="枪总数" width="90" align="center">
					<template slot-scope="scope">
						<span>{{ countOrZero(scope.row.gunTotalCount) }}</span>
					</template>
				</el-table-column>
				<el-table-column label="额定功率" width="110" align="center">
					<template slot-scope="scope">
						<span>{{ formatRatedPower(scope.row.ratedPowerKw) }}</span>
					</template>
				</el-table-column>
				<el-table-column label="建设状态" width="130" align="center">
					<template slot-scope="scope">
						<el-tooltip content="互联站状态由同步更新" placement="top">
							<el-tag
								size="small"
								effect="plain"
								:type="operateStatusTagType(scope.row.operateStatus)"
							>
								{{ operateStatusText(scope.row.operateStatus) }}
							</el-tag>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column label="App展示" align="center" width="110">
					<template slot-scope="scope">
						<el-switch
							v-model="scope.row.isAppDisplay"
							:active-value="1"
							:inactive-value="0"
							:disabled="!btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:edit') || !!appDisplayUpdating[scope.row.id]"
							@change="handleAppDisplayChange(scope.row, $event)"
						/>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="180" fixed="right">
					<template slot-scope="scope">
						<el-button type="primary" size="mini" @click="toStationSetting(scope.row)">设置</el-button>
						<el-button
							v-if="btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:delete')"
							style="margin-left: 10px;"
							type="danger"
							size="mini"
							icon="el-icon-delete"
							@click="del(scope.row.id)"
						>
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
		<el-dialog :visible.sync="showSyncStation" title="同步站点" @close="showSyncStation = false">
			<el-form ref="syncStation" :model="syncStationForm" :rules="rules" label-position="left"
				label-width="100px" style="width: 600px; margin-left:50px;">
				<el-form-item :label="'互联商户'" prop="merchantId">
				<el-select v-model="syncStationForm.merchantId" class="filter-item" placeholder="请选择互联商户" clearable style="width: 100%">
					<el-option v-for="item in merchantList" 
						:key="item.id" 
						:label="item.name + '(' + item.companyName + ')'"
						:value="item.id" 
					/>
				</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" :loading="btnLoading" @click="synchronizationStation()">确定</el-button>
					<el-button @click="showSyncStation = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
		updateNetworkDot,
		updateSwitch,
		deleteNetworkDot,
	} from '@/api/netWorkDot/netWorkDotList.js'
	import {
		getMerchantList,
		synchronizationStation
	} from '@/api/interconnection/merchant.js'
	import {
		parseTime
	} from '@/utils/index'
	import { getRuleIdTabs, getDefaultRuleIdTabName, getDefaultRuleIdNumber } from '@/utils/ruleIdTabs'
	import downExcel from '../netWorkDot/components/downExcel.vue'
	export default {
		name: 'interconnectionChargeStationList',
		components: {
			downExcel
		},
		data() {
			return {
				activeName: getDefaultRuleIdTabName('2'),
				listLoading: true,
				showSyncStation: false,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				merchantList: [],
				appDisplayUpdating: {},
				listQuery: {
					page: 1,
					limit: 10,
					ruleId: getDefaultRuleIdNumber('2'),
					type: 2,
					adminId: '',
					merchantId: '',
					networkName: '',
					networkProvince: '',
					networkAddress: '',
					
				},
				tableKey: 0,

				btnLoading: false,
				syncStationForm: {
					merchantId: ''
				},
				rules: {
					merchantId: [{
						required: true,
						message: '请选择需要同步的商户',
						trigger: 'blur'
					}],
				}
			}
		},
		computed: {
			ruleIdList() {
				return getRuleIdTabs()
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
			normalizeFlag01(val) {
				if (val === 1 || val === '1' || val === true) return 1
				return 0
			},
			disp(val) {
				if (val === null || val === undefined || val === '') return '-'
				return val
			},
			countOrZero(val) {
				const n = Number(val)
				return isNaN(n) ? 0 : n
			},
			formatRatedPower(val) {
				if (val === null || val === undefined || val === '') return '-'
				const n = Number(val)
				if (isNaN(n)) return '-'
				const text = Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000)
				return text + 'kW'
			},
			operateStatusText(status) {
				const map = {
					0: '未知',
					1: '建设中',
					5: '关闭下线',
					6: '维护中',
					50: '正常使用'
				}
				const key = status === null || status === undefined || status === '' ? '' : Number(status)
				return map[key] || (status === null || status === undefined || status === '' ? '-' : String(status))
			},
			operateStatusTagType(status) {
				const key = Number(status)
				if (key === 50) return 'success'
				if (key === 1) return 'warning'
				if (key === 6) return 'warning'
				if (key === 5) return 'info'
				return 'info'
			},
			handleAppDisplayChange(row, val) {
				if (!row || !row.id) return
				const nextVal = this.normalizeFlag01(val)
				const prevVal = nextVal === 1 ? 0 : 1

				this.$set(this.appDisplayUpdating, row.id, true)
				updateSwitch({ id: row.id, field: 'isAppDisplay', value: nextVal === 1 }).then(res => {
					if (res && res.code == 200) {
						this.$message.success(res.msg || '更新成功')
					} else {
						row.isAppDisplay = prevVal
						this.$message.error((res && res.msg) || '更新失败')
					}
				}).catch(() => {
					row.isAppDisplay = prevVal
					this.$message.error('更新失败')
				}).finally(() => {
					this.$delete(this.appDisplayUpdating, row.id)
				})
			},
			toStationSetting(row) {
				const stationId = row && row.id ? row.id : ''
				if (!stationId) {
					this.$message.error('缺少站点ID')
					return
				}
				this.$router.push({
					path: `/netWorkDot/setting/${stationId}`,
					query: {
						merchantId: row.merchantId || row.merchant_id || row.merchantID || '',
						merchantName: row.merchantName || row.merchant_name || '',
						stationName: row.networkName || ''
					}
				})
			},
			addOrUpdateHandle(row,isDetail) {
				console.log("row:",row)
				this.$nextTick(() => {
					this.$refs.chargeStationForm.onshowAdd(row,isDetail)
				})
      		},
			//同步站点
			onSyncStation() {
				this.showSyncStation = true
				this.syncStationForm = {merchantId: ''}
				this.getMerchantList()
			},
			synchronizationStation() {
				this.btnLoading = true;
				const merchantId = this.syncStationForm.merchantId
				synchronizationStation(merchantId).then(res => {
					if (res.code == 200) {
						console.log(res)
						this.showSyncStation = false
						this.getLists()
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
					this.btnLoading = false
				})
				
			},
			//切换导航
			handleClick(tab, event) {
				this.listQuery.ruleId = tab.name
				this.listQuery.page = 1,
				this.listQuery.limit = 10,
				this.getLists()
			},
			handleFilter() {
				this.listQuery.page = 1
				this.getLists()
			},
			getLists() {
				this.listLoading = true
				getList(this.listQuery).then(res => {
					if (res.code == 200) {
						console.log(res)
						const list = Array.isArray(res.data) ? res.data : []
						this.list = list.map(item => {
							const isAppDisplay = this.normalizeFlag01(item.isAppDisplay ?? item.is_app_display)
							const operateStatus = (item.operateStatus === null || item.operateStatus === undefined || item.operateStatus === '')
								? item.operateStatus
								: Number(item.operateStatus)
							return { ...item, isAppDisplay, operateStatus }
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
					deleteNetworkDot(data).then(res => {
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
			getMerchantList() {
				getMerchantList({ roleType: 'OPERATOR', type: 2 }).then(res => {
					this.merchantList = (res && res.code == 200) ? (res.data || []) : []
				}).catch(() => {
					this.merchantList = []
				})
			},
		},
		created() {
			this.getLists()
			this.getMerchantList()
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

	.amap-sug-result {
		z-index: 9999 !important;
	}

	#tipinput {
		-webkit-appearance: none;
		background-color: #FFFFFF;
		background-image: none;
		border-radius: 4px;
		border: 1px solid #DCDFE6;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		color: #606266;
		display: inline-block;
		font-size: inherit;
		height: 40px;
		line-height: 40px;
		outline: none;
		padding: 0 15px;
		-webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		width: 100%;
	}

	#tipinput1 {
		-webkit-appearance: none;
		background-color: #FFFFFF;
		background-image: none;
		border-radius: 4px;
		border: 1px solid #DCDFE6;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		color: #606266;
		display: inline-block;
		font-size: inherit;
		height: 40px;
		line-height: 40px;
		outline: none;
		padding: 0 15px;
		-webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		width: 100%;
	}

	.station-list-cell {
		line-height: 1.7;
		padding: 2px 0;
	}

	.station-list-cell__row {
		display: flex;
		align-items: flex-start;
		word-break: break-all;
	}

	.station-list-cell__label {
		flex: none;
		color: #909399;
	}

	.station-list-cell__value {
		color: #303133;
	}
</style>

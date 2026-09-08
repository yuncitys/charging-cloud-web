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
			<el-select v-model="listQuery.protocolCode" style="width: 220px;margin-right: 20px ;" class="filter-item"
				placeholder="接入协议" clearable filterable @change="handleFilter">
				<el-option v-for="item in protocolFilterOptions" :key="item.value" :label="item.label" :value="item.value" />
			</el-select>
			<el-select v-model="listQuery.typeStatus" style="width: 160px;margin-right: 20px ;" class="filter-item"
				placeholder="类型状态" clearable @change="handleFilter">
				<el-option label="启用" :value="1" />
				<el-option label="停用" :value="0" />
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
				<el-table-column prop="manufacturerName" label="厂商" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span v-if="scope.row.manufacturerName">{{ scope.row.manufacturerName }}</span>
						<span v-else class="text-muted">-</span>
					</template>
				</el-table-column>
				<el-table-column prop="brandName" label="品牌" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span v-if="scope.row.brandName">{{ $dict.formatDeviceBrand(scope.row.brandName) }}</span>
						<span v-else class="text-muted">-</span>
					</template>
				</el-table-column>
				<el-table-column prop="equipmentModel" label="硬件型号" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span v-if="scope.row.equipmentModel">{{ scope.row.equipmentModel }}</span>
						<span v-else class="text-muted">-</span>
					</template>
				</el-table-column>
				<el-table-column prop="protocolCode" label="接入协议" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						{{ $dict.formatDeviceProtocol(scope.row.protocolCode) }}
					</template>
				</el-table-column>
				<el-table-column prop="typeStatus" label="状态" align="center" width="80">
					<template slot-scope="scope">
						<el-tag v-if="scope.row.typeStatus === 0" type="info" size="mini">停用</el-tag>
						<el-tag v-else type="success" size="mini">启用</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="ruleId" label="归属系列" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						{{ $dict.formatDeviceRule(scope.row.ruleId) }}
					</template>
				</el-table-column>
				<el-table-column prop="electricOut" label="电流输出" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						{{ $dict.formatElectricOutType(scope.row.electricOut) }}充电桩
					</template>
				</el-table-column>
				<el-table-column prop="portCount" label="设备端口数" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="chargingType" label="充电速度" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span v-if="scope.row.chargingType != null">{{ $dict.formatChargingType(scope.row.chargingType) }}</span>
						<span v-else class="text-muted">自动</span>
					</template>
				</el-table-column>
				<el-table-column label="额定功率" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span v-if="typePowerWatts(scope.row)">{{ formatGunPower(typePowerWatts(scope.row)) }}</span>
						<span v-else class="text-muted">-</span>
					</template>
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
	import { formatWattsAsKw } from '@/utils/powerUnit.js'
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
					protocolCode: '',
					typeStatus: '',
				},
				ruleIds: [],
				electricOuts: [],
				protocolFilterOptions: []
			}
		},
		mounted() {
			this.$dict.getSelectorOptions('device_rule', { numeric: true }).then(list => {
				this.ruleIds = (list || []).map(item => ({ id: item.value, title: item.label }))
			})
			this.$dict.getSelectorOptions('electric_out_type', { numeric: true }).then(list => {
				this.electricOuts = (list || []).map(item => ({ id: item.value, title: item.label }))
			})
			this.$dict.getDeviceProtocolOptions().then(list => {
				this.protocolFilterOptions = list || []
			})
			this.$dict.getSelector('device_rule')

		},
		methods: {
			typePowerWatts(row) {
				if (!row) return null
				return row.defaultGunPower || row.cabinetRatedPower || null
			},
			formatGunPower(power) {
				return formatWattsAsKw(power)
			},
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

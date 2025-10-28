<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="handleDownload"
			:loading="downloadLoading" icon="el-icon-download"
			v-if="btnAuthen.permsVerifAuthention(':device:deviceList:download')">导出Excel
		</el-button>
	</div>
</template>

<script>
	import {
		downloadExcel,
	} from '@/api/device/deviceList.js'
	import {
		parseTime,
		numTime,
		formatSeconds,
		getNowTime
	} from '@/utils/index'
	export default {
		name: 'downExcel',
		props: {
			queryData: {
				type: Object,
				default () {
					return {}
				}
			}
		},
		components: {

		},
		data() {
			return {
				downloadLoading: false,
			}
		},
		mounted() {

		},
		computed: {

		},
		methods: {
			//导出设备
			handleDownload() {
				this.downloadLoading = true
				let downloadData = {
					deviceCode: this.queryData.deviceCode,
					networkName: this.queryData.networkName,
					networkAddress: this.queryData.networkAddress,
					deviceStatus: this.queryData.deviceStatus,
					dealerId: this.queryData.dealerId,
					allocationStatus: this.queryData.allocationStatus,
					ruleId: this.queryData.ruleId,
					chargingStationIds: this.queryData.chargingStationIds != undefined ? this.queryData.chargingStationIds : '',
					deviceChargePattern: this.queryData.deviceChargePattern != undefined ? this.queryData.deviceChargePattern : '',
					devicePurpose: this.queryData.devicePurpose != undefined ? this.queryData.devicePurpose : ''
				}
				const tHeader = downloadData.allocationStatus === 0 ? ['设备号', '设备类型', '设备信号', '设备版本', 'imei号', 'sim号', '设备状态', '收费方案类型', '收费方案', '激活时间', '创建时间',] : ['设备号', '设备类型', '设备信号', '设备版本', 'imei号', 'sim号', '站点名称','设备地址','设备状态', '收费方案类型', '收费方案', '激活时间', '创建时间',]
				const filterVal = downloadData.allocationStatus === 0 ? ['deviceCode', 'deviceTypeName', 'deviceSignal','deviceVersion', 'deviceImei', 'deviceSim', 'deviceStatusText','priceTypeText','feeName','activateTime', 'createTime',] : ['deviceCode', 'deviceTypeName', 'deviceSignal','deviceVersion', 'deviceImei', 'deviceSim','networkName', 'networkAddress', 'deviceStatusText','priceTypeText','feeName','activateTime', 'createTime',]
				downloadExcel(downloadData).then(res => {
					this.downloadLoading = false
					if (res.code == 200) {
						import('@/vendor/Export2Excel').then(excel => {
							const list = res.data || []
							list.forEach((item, index) => {
								if (item.deviceStatus == 0) {
									item.deviceStatusText = '离线'
								} else if (item.deviceStatus == 1) {
									item.deviceStatusText = '在线'
								}

								if (item.priceType === 0) {
									item.priceTypeText = '时间'
								} else if (item.priceType === 1) {
									item.priceTypeText = '电量'
								} else if (item.priceType === 2) {
									item.priceTypeText = '功率'
								}
								item.onLineTimeStr = this.$common.setSeconds(item.onLineTime)
							})
							const data = this.formatJson(filterVal, list)
							let filename = '设备列表' + getNowTime()
							excel.export_json_to_excel({
								header: tHeader,
								data,
								filename: filename
							})
							this.downloadLoading = false
						})
					} else {
						this.$message({
							message: '导出失败，请重试',
							type: 'warning'
						})
					}
				}).catch(err => {
					this.downloadLoading = false
				})
			},
			formatJson(filterVal, jsonData) {
				return jsonData.map(v => filterVal.map(j => v[j]))
			},
		},
		created() {

		},
	}
</script>

<style>

</style>

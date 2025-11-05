<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="downloadStation"
			:loading="downloadLoading" icon="el-icon-download"
			v-if="btnAuthen.permsVerifAuthention(':sys:networkDot:exportNetworkDot')">导出Excel
		</el-button>
		<downloadProgress ref="downloadProgress" />
	</div>
</template>

<script>
	import {
		downloadExcel,
	} from '@/api/netWorkDot/netWorkDotList.js'
	import {
		parseTime,
		numTime,
		formatSeconds,
		getNowTime
	} from '@/utils/index'
	import downloadProgress from '@/components/Common/downloadProgress.vue'
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
			downloadProgress
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
			//站点导出（进度条
			downloadStation() {
				let downloadData = {
					limit: 500,
					networkAddress: this.queryData.networkAddress,
					adminId: this.queryData.adminId,
					ruleId: this.queryData.ruleId,
					type: this.queryData.type
				}
				downloadExcel(downloadData).then(res => {
					if (res.code == 200) {
						let taskId = res.data.id
						this.$refs.downloadProgress.open(taskId)
					}
				})
			},
			//导出站点(流)
			handleDownload() {
				this.downloadLoading = true
				let downloadData = {
					networkAddress: this.queryData.networkAddress,
					adminId: this.queryData.adminId,
					ruleId: this.queryData.ruleId,
					type: this.queryData.type
				}
				downloadExcel(downloadData).then(res => {
					this.downloadLoading = false
					if (res.code == 200) {
						import('@/vendor/Export2Excel').then(excel => {
							const tHeader = ['充电站名称', '省', '市', '区', '投放地', '站点运营商', '地址经度','地址纬度', '创建时间', '更新时间']
							const filterVal = ['networkName', 'networkProvince', 'networkCity','networkRegion', 'networkAddress', 'operatorName','networkLongitude', 'networkLatitude', 'createTime', 'updateTime',]
							const list = res.data || []
							const data = this.formatJson(filterVal, list)
							let filename = '区域列表' + getNowTime()
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
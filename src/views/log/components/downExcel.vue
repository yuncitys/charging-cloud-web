<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="exportExcel"
			:loading="downloadLoading" icon="el-icon-download"
			v-if="btnAuthen.permsVerifAuthention(':sys:deviceLog:downLoadDeviceLogList')">导出Excel
		</el-button>

		<downloadProgress ref="downloadProgress" />
	</div>
</template>

<script>
	import {
		downLoadDeviceLogList,
	} from '@/api/upDownRecord/upDownRecordList.js'
	import downloadProgress from '@/components/Common/downloadProgress.vue'
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
			//设备日志导出（进度条
			exportExcel() {
				let downloadData = {
					limit: 5000,
					deviceCode: this.queryData.deviceCode,
					createTimeStart: this.queryData.createTimeStart,
					createTimeEnd: this.queryData.createTimeEnd
				}
				downLoadDeviceLogList(downloadData).then(res => {
					if (res.code == 200) {
						let taskId = res.data.id
						this.$refs.downloadProgress.open(taskId)
					}
				})
			},
			//导出
			handleDownload() {
				this.downloadLoading = true
				let downloadData = {
					deviceCode: this.queryData.deviceCode,
					createTimeStart: this.queryData.createTimeStart,
					createTimeEnd: this.queryData.createTimeEnd
				}
				downLoadDeviceLogList(downloadData).then(res => {
					this.downloadLoading = false
					if (res.code == 200) {
						import('@/vendor/Export2Excel').then(excel => {
							const tHeader = ['设备号', '网点名称', '设备地址', '状态', '时间']
							const filterVal = ['deviceCode', 'networkName', 'networkAddress', 'typeStr',
								'createTime',
							]
							const list = res.data || []
							list.forEach((item, index) => {
								item.typeStr = item.type ? '上线' : '离线'
							})
							const data = this.formatJson(filterVal, list)
							let filename = '设备上下线记录列表' + getNowTime()
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
			//获取当前时间
			getTime() {
				var date = new Date()
				var y = date.getFullYear()
				var m = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
				var d = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate())
				var hh = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours())
				var mm = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes())
				var ss = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds())
				return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
			},
		},
		created() {

		},
	}
</script>

<style>

</style>

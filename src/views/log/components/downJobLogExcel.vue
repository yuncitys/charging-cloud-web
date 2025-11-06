<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="exportExcel"
			:loading="downloadLoading" icon="el-icon-download"
			v-if="btnAuthen.permsVerifAuthention(':monitor:job:export')">导出Excel
		</el-button>

		<downloadProgress ref="downloadProgress" />
	</div>
</template>

<script>
	import { downloadExcel } from "@/api/monitor/jobLog";
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
			//任务日志导出（进度条
			exportExcel() {
				let downloadData = {
					limit: 8000,
					jobName: this.queryData.jobName,
					jobGroup: this.queryData.jobGroup,
					status: this.queryData.status,
					createTimeStart: this.queryData.createTimeStart,
					createTimeEnd: this.queryData.createTimeEnd
				}
				downloadExcel(downloadData).then(res => {
					if (res.code == 200) {
						let taskId = res.data.id
						this.$refs.downloadProgress.open(taskId)
					} else {
						this.$message.error('下载失败')
					}
				})
			},
		},
		created() {

		},
	}
</script>

<style>

</style>

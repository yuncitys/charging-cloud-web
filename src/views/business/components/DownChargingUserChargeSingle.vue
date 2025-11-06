<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="exportChargingUserChargeSingle"
			:loading="downloadLoading" icon="el-icon-download" v-if="btnAuthen.permsVerifAuthention(':web:reports:export')">
      		导出
		</el-button>
    <downloadProgress ref="downloadProgress" />
	</div>
</template>

<script>
	import {
    	exportChargingUserChargeSingle
	} from '@/api/business/businessStatistics.js'
	import {
		parseTime,
		numTime,
		formatSeconds,
		getNowTime
	} from '@/utils/index'
  	import downloadProgress from '@/components/Common/downloadProgress.vue'
	export default {
		name: 'DownChargingTrendStatistics',
		components: {
			downloadProgress
		},
		props: {
			queryData: {
				type: Object,
				default () {
					return {}
				}
			}
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
			//订单导出（进度条
			exportChargingUserChargeSingle() {
				let downloadData = JSON.parse(JSON.stringify(this.queryData))
				downloadData.limit = 2000
				exportChargingUserChargeSingle(downloadData).then(res => {
					if (res.code == 200) {
						let taskId = res.data.id
						this.$refs.downloadProgress.open(taskId)
					} else {
						this.$message.error(res.msg)
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

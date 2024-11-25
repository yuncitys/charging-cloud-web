<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="exportDeviceReports"
			:loading="downloadLoading" icon="el-icon-download" v-if="btnAuthen.permsVerifAuthention(':web:reports:export')">
      导出Excel
		</el-button>
    <downloadProgress ref="downloadProgress" />
	</div>
</template>

<script>
	import {
    exportDeviceReport
	} from '@/api/business/businessStatistics.js'
	import {
		parseTime,
		numTime,
		formatSeconds,
		getNowTime
	} from '@/utils/index'
  import downloadProgress from '@/components/Common/downloadProgress.vue'
	export default {
		name: 'downDeviceReportsExcel',
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
      exportDeviceReports() {
      	let downloadData = {
          dearId: this.queryData.dearId,
          allocationStatus: this.queryData.allocationStatus,
          chargingStationIds: this.queryData.chargingStationIds,
      		deviceCode: this.queryData.deviceCode,
      		createTimeStart: this.queryData.createTimeStart,
      		createTimeEnd: this.queryData.createTimeEnd
      	}
      	exportDeviceReport(downloadData).then(res => {
      		if (res.code == 200) {
      			let taskId = res.data.id
      			this.$refs.downloadProgress.open(taskId)
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

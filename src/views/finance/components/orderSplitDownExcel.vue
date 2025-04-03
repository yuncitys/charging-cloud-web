<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="exportExcel"
			:loading="downloadLoading" icon="el-icon-download"
			v-if="btnAuthen.permsVerifAuthention(':web:splitRecord:export')">
			导出Excel
		</el-button>

    	<downloadProgress ref="downloadProgress" />
	</div>
</template>

<script>
	import {
		exportExcel
	} from '@/api/finance/orderSplitRecord.js';

  	import downloadProgress from '@/components/Common/downloadProgress.vue'

	export default {
		name: 'exportSplitRecordExcel',
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
			exportExcel() {
				let downloadData = {
					orderCode: this.queryData.orderCode,
					status: this.queryData.status,
					adminId: this.queryData.adminId,
					createTimeStart: this.queryData.createTimeStart,
					createTimeEnd: this.queryData.createTimeEnd
				}
				exportExcel(downloadData).then(res => {
					if (res.code == 200) {
						let taskId = res.data.id
						this.$refs.downloadProgress.open(taskId)
					}
				})
			},
			created() {

			},
		}
	}
</script>

<style>

</style>

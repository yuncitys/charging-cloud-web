<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="handleDownload"
			:loading="downloadLoading" icon="el-icon-download"
			v-if="btnAuthen.permsVerifAuthention(':sys:payDetails:downloadPayDetails')">导出Excel
		</el-button>
	</div>
</template>

<script>
	import {
		downloadExcel,
	} from '@/api/finance/rechargeRecord.js'
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
			//导出订单
			handleDownload() {
				this.downloadLoading = true
				let downloadData = {
					payCode: this.queryData.payCode,
					userName: this.queryData.userName,
					userId:this.queryData.userId,
					phone: this.queryData.phone,
					type: this.queryData.type,
					createTimeStart: this.queryData.createTimeStart,
					createTimeEnd: this.queryData.createTimeEnd
				}
				downloadExcel(downloadData).then(res => {
					this.downloadLoading = false
					if (res.code == 200) {
						import('@/vendor/Export2Excel').then(excel => {
							const tHeader = ['付款编号','用户id','用户昵称','主体','付款金额','赠送金额','充值类型','状态','创建时间']
							const filterVal = ['payCode','userCode','userName','wxName','payMoeny','giftMoney','typeStr','payStatusStr','createTime']
							const list = res.data || []
							list.forEach((item,index)=>{
								if(item.type === 0){
									item.typeStr='单次充值'
								}else if(item.type === 1){
									item.typeStr='充值套餐'
								}else if(item.type === 2){
									item.typeStr='充值IC卡'
								}else if(item.type === 3){
									item.typeStr='充值月卡'
								}
								if(item.payStatus === 0){
									item.payStatusStr='未支付'
								}else if(item.payStatus === 1){
									item.payStatusStr='已支付'
								}
							})
							const data = this.formatJson(filterVal, list)
							let filename = '充值记录' + getNowTime()
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

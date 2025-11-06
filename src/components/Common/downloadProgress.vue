<template>
	<div>
		<el-dialog :visible.sync="showDialog" title="文件下载" :append-to-body="true" width="40%" @close="close"
			:before-close="beforeClose">
			<div class="title">文件下载中,请稍等...</div>
			<div class="tipBox">
				关闭弹窗后会终止下载，可进入<span @click="downloadList">文件下载中心</span>重新下载
			</div>
			<div class="progressBox"><el-progress type="circle" :percentage="percentage" :width="width"></el-progress>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getTask
	} from '@/api/task/task.js'
	export default {
		data() {
			return {
				showDialog: false,
				percentage: 0,
				width: 200
			}
		},
		methods: {
			beforeClose() {
				if (this.percentage != 100) {
					this.$alert('关闭弹窗后，会自动进入下载中心，不影响下载。', '提示', {
						confirmButtonText: '确定',
						callback: action => {
							this.close()
						}
					});
				}
			},
			downloadList() {
				this.$router.push({
					name: 'taskList'
				})
				this.showDialog = false
			},
			close() {
				this.percentage = 0
				clearInterval(this.setInt)
				this.showDialog = false
			},
			open(taskId) {
				console.log("打开下载进度框:",taskId)
				this.showDialog = true
				this.setInt = setInterval(() => {
					this.getTask(taskId)
				}, 500)
			},
			getTask(taskId) {
				let data = {
					taskId
				}
				getTask(data).then(res => {
					if (res.code == 200) {
						this.percentage = res.data.percentage
						let result = res.data.result
						if (result) {
							if (this.percentage == 100) {
								clearInterval(this.setInt)
								setTimeout(() => {
									let a = document.createElement('a');
									a.href = this.Global.APIURl + res.data.result;
									// let time = getNowTime()
									// a.download = `订单列表${time}.xlsx`
									document.body.appendChild(a);
									a.click();
									document.body.removeChild(a);
									this.close()
								}, 1000)
							}
						}
					}
				})
			},
			getPercentage(percentage) {
				this.percentage = percentage
			}
		},
		destroyed() {
			clearInterval(this.setInt)
		}
	}
</script>

<style lang="scss">
	.title {
		font-size: 30px;
		text-align: center;
	}

	.progressBox {
		display: flex;
		justify-content: center;
		margin-top: 20px;
	}

	.tipBox {
		display: flex;
		justify-content: center;
		margin-top: 20px;
		font-size: 14px;
		color: red;

		span {
			color: blue;
			cursor: pointer;
			text-decoration: underline;
		}
	}
</style>

<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="showExcel=true"
			icon="el-icon-upload" v-if="btnAuthen.permsVerifAuthention(':iot:card:upload')">
      批量导入
		</el-button>
		<el-dialog :visible.sync="showExcel" title="导入Excel" @close="showExcel = false" :append-to-body="true">
			<el-upload drag :multiple="false" :show-file-list="false" :http-request="upload" accept=".xls,.xlsx"
				action="" v-loading.fullscreen.lock="fullscreenLoading">
				<i class="el-icon-upload"></i>
				<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
			</el-upload>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
		upload
	} from '@/api/iotCard/iotCard.js'
	export default {
		data() {
			return {
				fullscreenLoading: false,
				showExcel: false,
			}
		},
		methods: {
			//导入
			upload(file) {
				// console.log(file.file)
				// 创建FormData对象
				let param = new FormData()
				// 将得到的文件流添加到FormData对象
				param.append('file', file.file)
				console.log(param, "11111")
				this.fullscreenLoading = true
				upload(param).then(res => {
					this.fullscreenLoading = false
					if (res.code == 200) {
						this.$message.success('上传成功')
						this.showExcel = false
						this.$emit('getLists')
					} else {
						this.$message.error('上传失败，原因' + res.msg)
					}
				}).catch((err) => {
					this.$message.error('上传失败，请重试')
					this.fullscreenLoading = false
				})
			},
		},
		created() {

		},
		mounted() {

		},
	}
</script>

<style lang="scss">

</style>

<template>
	<div class="app-container">
		<div class="filter-container">
			<!-- <el-card>
				<div slot="header">
					<h3 style="text-align: center;">加盟合作</h3>
				</div>
				<div>
					<editor v-model="formData.JOIN_IN" toref="Editorc1" />
				</div>
			</el-card> -->
			<div style="height: 30px;"></div>
			<el-card>
				<div slot="header">
					<h3 style="text-align: center;">关于我们</h3>
				</div>
				<div>
					<editor1 v-model="formData.ABOUT_AS" toref="Editorc2" />
				</div>
			</el-card>
			<el-card>
				<div slot="header">
					<h3 style="text-align: center;">使用说明协议</h3>
				</div>
				<div>
					<editor1 v-model="formData.USE_INFO" toref="Editorc3" />
				</div>
			</el-card>
			<el-card>
				<div slot="header">
					<h3 style="text-align: center;">隐私声明协议</h3>
				</div>
				<div>
					<editor1 v-model="formData.PRIVATE_INFO" toref="Editorc4" />
				</div>
			</el-card>
			<div class="" style="margin-top: 50px; display: flex; justify-content: center;">
				<el-button type="primary" @click="onSubmit">保存</el-button>
				<el-button>取消</el-button>
			</div>
		</div>
	</div>
</template>

<script>
	import {
		getList,
		saveConfig
	} from '@/api/configAdmin/configAdmin.js'
	import editor from '@/components/editor/edit.vue'
	import editor1 from '@/components/editor/edit1.vue'
	export default {
		name: 'wxPublicConfig',
		components: {
			editor,
			editor1
		},
		data() {
			return {
				formData: {
					JOIN_IN: '',
					ABOUT_AS: '',
					USE_INFO: '',
					PRIVATE_INFO: '',
				}
			}
		},
		methods: {
			onSubmit() {
				console.log(this.formData)
				// if (!this.formData.JOIN_IN) {
				// 	this.$message.error('请添加加盟合作')
				// 	return false
				// }
				if (!this.formData.ABOUT_AS) {
					this.$message.error('请添加关于我们')
					return false
				}
				saveConfig(this.formData).then(res => {
					console.log(res)
					if (res.code == 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			getLists() {
				getList().then(res => {
					console.log(res)
					if (res.code == 200) {
						console.log(res.data)
						let formData = res.data
						this.formData.JOIN_IN = formData.JOIN_IN || ''
						this.formData.ABOUT_AS = formData.ABOUT_AS || ''
						this.formData.USE_INFO = formData.USE_INFO || ''
						this.formData.PRIVATE_INFO = formData.PRIVATE_INFO || ''
					} else {
						this.$message.error(res.msg)
					}
				})
			},
		},
		created() {
			this.getLists()
		}
	}
</script>

<style>

</style>

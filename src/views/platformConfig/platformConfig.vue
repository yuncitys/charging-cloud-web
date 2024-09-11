<template>
	<div>
		<div style="height: 60px;"></div>
		<el-form ref="formData" :model="formData" label-position="left" label-width="120px"
			style="width: 400px; margin-left:50px;" :rules="Rules">
			<el-form-item :label="'平台标题'" prop="TITLE">
				<el-input v-model="formData.TITLE" placeholder="请输入平台标题"  />
			</el-form-item>
			<el-form-item :label="'平台logo'" prop="LOGO_IMG">
				<uploadFile v-model="formData.LOGO_IMG" ref="upload" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="onformData('formData')">确定</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
	import {
		getList,
		updateLogo
	} from '@/api/platformConfig/platformConfig.js'
	import uploadFile from '@/components/Common/uploadFile.vue'
	export default {
		name:'platformConfig',
		components: {
		    uploadFile
		},
		data(){
			return {
				formData:{
					LOGO_IMG:'',
					TITLE:'',
				},
				Rules: {
					TITLE: [{
						required: true,
						message: '请输入平台标题',
						trigger: 'change'
					}],
					LOGO_IMG: [{
						required: true,
						message: '请上传图片',
						trigger: 'change'
					}],
				},
			}
		},
		created() {
			this.getLists()
		},
		methods:{
			getLists() {
				getList().then(res => {
					console.log(res)
					if (res.code == 200) {
						let formData = res.data
						this.formData.LOGO_IMG=formData.LOGO_IMG || ''
						this.formData.TITLE=formData.TITLE || ''
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			onformData(formName) {
				this.$refs[formName].validate(valid => {
					if (valid) {
						updateLogo(this.formData).then(res=>{
							if(res.code == 200){
								this.$message.success(res.msg)
								this.getLists()
								this.$router.go(0)
							}else{
								this.$message.error(res.msg)
							}
						})
					} else {
						console.log("不通过")
						return false
					}
				})
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
		}
	}
</script>

<style>
</style>

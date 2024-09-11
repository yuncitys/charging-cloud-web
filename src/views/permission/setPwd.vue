<template>
	<div class="app-container">
		<div class="filter-container">
			<el-form ref="editData" :model="editData" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;" :rules="rules">
				<el-form-item :label="'用户名'">
					<el-input v-model="adminName" placeholder="请输入用户名" clearable disabled/>
				</el-form-item>
				<el-form-item :label="'旧密码'" prop="oldPassword">
					<el-input v-model="editData.oldPassword" placeholder="请输入旧密码" clearable type="password"/>
				</el-form-item>
				<el-form-item :label="'新密码'" prop="newPassword">
					<el-input v-model="editData.newPassword" placeholder="请输入新密码" clearable type="password"/>
				</el-form-item>
				<el-form-item :label="'确认密码'" prop="confirmPassword">
					<el-input v-model="editData.confirmPassword" placeholder="请输入确认密码" clearable type="password"/>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="oneditData('editData')">确定</el-button>
					<el-button @click="resetForm('editData')">重置</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script>
	import {
      updatePasswordAdminUser
	} from '@/api/permission/menu.js'
	import { getRouter } from '@/api/user'
	import {
		parseTime
	} from '@/utils/index'
	export default {
		name: 'ADList1',
		data() {
			const equalToPassword = (rule, value, callback) => {
				if (this.editData.newPassword !== value) {
					callback(new Error("两次输入的密码不一致"));
				} else {
					callback();
				}
			};
			return {
				adminName:'',
				editData: {
					id: '',
					oldPassword: '',
					newPassword: '',
					confirmPassword: ''
				},
				rules: {
					oldPassword: [{
						required: true,
						message: '请输入旧密码',
						trigger: 'blur'
					}],
					newPassword: [{
							required: true,
							message: "新密码不能为空",
							trigger: "blur"
						},
						{
							min: 6,
							max: 16,
							message: "长度在 6 到 16个字符",
							trigger: "blur"
						}
					],
					confirmPassword: [{
							required: true,
							message: "确认密码不能为空",
							trigger: "blur"
						},
						{
							required: true,
							validator: equalToPassword,
							trigger: "blur"
						}
					]
				},
			}
		},
		watch: {

		},
		methods: {
			oneditData(formName) {
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						let data={
							id:this.editData.id,
							oldPassword:this.editData.oldPassword,
							newPassword:this.editData.newPassword
						}
						updatePasswordAdminUser(this.editData).then(res => {
							if (res.code == 200) {
								this.$message.success(res.msg)
								setTimeout(()=>{
									this.$store.dispatch('user/resetToken')
									this.$router.push(`/login?redirect=${this.$route.fullPath}`)
								},1000)
							} else {
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
		},
		created() {
           getRouter().then(res=>{
           		  if(res.code == 200){
           			  let adminUser=res.data.adminUser
           			  this.editData.id=adminUser.adminId
                  this.adminName=adminUser.adminName
           		  }else{

           		  }
           })
		},
	}
</script>

<style scoped="scoped">

</style>

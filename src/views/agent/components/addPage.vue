<!--
*添加代理商
-->
<template>
	<div style="display: inline-block;">
		<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click='onShowAdd'
			v-if="btnAuthen.permsVerifAuthention(':sys:admin:addAdminUser')">添加帐号
		</el-button>
		<!-- 添加代理商-->
		<el-dialog :visible.sync="showAdd" title="添加帐号" @close="showAdd = false" style="width: 100%;"
			:append-to-body="true">
			<el-form ref="addData" :model="addData" label-position="left" label-width="120px"
				style="margin-left:50px;width: 450px;" :rules="rules">
				<el-form-item :label="'登录账号'" prop="adminName">
					<el-input v-model="addData.adminName" placeholder="请输入登录账号" clearable />
				</el-form-item>
				<el-form-item :label="'姓名'" prop="adminFullname">
					<el-input v-model="addData.adminFullname" placeholder="请输入姓名" clearable />
				</el-form-item>
				<el-form-item :label="'手机号'" prop="adminPhone">
					<el-input v-model="addData.adminPhone" placeholder="请输入手机号" clearable />
				</el-form-item>
				<el-form-item :label="'角色'" prop="roleId" style="width: 100%;">
					<el-select v-model="addData.roleId" class="filter-item" placeholder="请选择角色" clearable
						@keyup.enter.native="handleFilter" style="width: 100%;">
						<el-option v-for="item in agentList" :key="item.id" :label="item.roleName" :value="item.id" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onaddData('addData')">确定</el-button>
					<el-button @click="showAdd = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		addAdminUser
	} from '@/api/agent/agentList.js'
	import {
		findRoleAllList,
	} from '@/api/permission/role.js'
	import {
		uploadImg
	} from '@/api/AD/ADList.js'
	import {
		parseTime
	} from '@/utils/index'
	export default {
		name: 'agentAddpage',
		components: {

		},
		data() {
			let checkNum = (rule, value, callback) => {
				let regx = /^\d+\.\d+$/;
				if (regx.test(value)) {
					callback(new Error('请输入整数'))
				} else {
					if (parseInt(value) < 0) {
						console.log("111")
						callback(new Error('不能小于0'))
						console.log("222")
					} else if (parseInt(value) > 100) {
						callback(new Error('不能大于100'))
					} else {
						callback()
						console.log("333")
					}
				}
			}
			let checkPhone = (rule, value, callback) => {
				if (!(/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(value))) {
					callback(new Error('手机号码格式有误，请重填'))
					return false;
				} else {
					callback()
				}
			}
			return {
				showAdd: false,
				addData: {
					adminName: '',
					adminFullname: '',
					adminPhone: '',
					roleId: '',
				},
				rules: {
					adminName: [{
						required: true,
						message: '请输入登录账号',
						trigger: 'blur'
					}],
					adminFullname: [{
						required: true,
						message: '请输入姓名',
						trigger: 'blur'
					}],
					adminPhone: [{
						required: true,
						message: '请输入手机号',
						trigger: 'blur'
					}, {
						validator: checkPhone,
						trigger: 'blur'
					}],
					roleId: [{
						required: true,
						message: '请选择角色',
						trigger: 'blur'
					}],
				},
				agentList: [],
			}
		},
		filters: {
			formatDate: function(time) {
				if (!time) {
					return ''
				}
				return parseTime(time)
			},
		},
		mounted() {

		},
		methods: {
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
			onShowAdd() {
				this.showAdd = true
				this.findRoleAllList()
			},
			onaddData(formName) {
				let addData = JSON.parse(JSON.stringify(this.addData))
				this.$refs[formName].validate(valid => {
					if (valid) {
						console.log("通过")
						addAdminUser(addData).then(res => {
							if (res.code == 200) {
								this.showAdd = false
								this.resetForm(formName)
								this.$message.success(res.msg)
								this.$emit('getLists')
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
			findRoleAllList() {
				findRoleAllList().then(res => {
					if (res.code == 200) {
						this.agentList = res.data
					}
				})
			},
			//上传图片
			uploadShopSteps(file) {
				// console.log(file.file)
				// 创建FormData对象
				let param = new FormData()
				// 将得到的文件流添加到FormData对象
				param.append('file', file.file)
				console.log(param, "11111")
				this.loadingAdd = true
				uploadImg(param).then(res => {
					this.loadingAdd = false
					if (res.code == 200) {
						this.addData.wxQrcode = res.data
						console.log(this.addData.wxQrcode)
					} else {
						this.$message.error('图片上传失败，原因' + err)
					}
				}).catch((err) => {
					this.$message.error('图片上传失败，原因' + err)
					this.loadingAdd = false
				})
			},
			beforeUploadShopSteps(file) {
				const isRightType = (file.type === 'image/jpeg') || (file.type === 'image/png') || (file.type ===
					'image/jpg')
				const isLt2M = file.size / 1024 / 1024 < 2

				if (!isRightType) {
					this.$message.error('只能上传jgp,jpeg和png格式!')
				}
				if (!isLt2M) {
					this.$message.error('图片大小不能超过2M')
				}
				return isRightType && isLt2M
			},
			handleRemoveShopSteps() {
				this.addData.wxQrcode = ''
			},
			successShopSteps(res) {
				this.addData.wxQrcode = res.url
			},
		},
		created() {

		},
	}
</script>

<style>

</style>

<!--
*编辑代理商
-->
<template>
	<div style="display: inline-block;">
		<el-button type="primary" size="mini" v-if="btnAuthen.permsVerifAuthention(':sys:admin:updateAdminUser')" @click='showDidlaoEditData()' >
      编辑
		</el-button>
		<!-- 编辑代理商-->
		<el-dialog :visible.sync="showEdit" title="编辑代理商" @close="showEdit = false" style="width: 100%;"
			:append-to-body="true">
			<el-form ref="editData" :model="editData" label-position="left" label-width="120px"
				style="margin-left:50px;width: 450px;" :rules="rules">
				<el-form-item :label="'登录账号'" prop="adminName">
					<el-input v-model="editData.adminName" placeholder="请输入登录账号" clearable />
				</el-form-item>
				<el-form-item :label="'姓名'" prop="adminFullname">
					<el-input v-model="editData.adminFullname" placeholder="请输入姓名" clearable />
				</el-form-item>
				<el-form-item :label="'手机号'" prop="adminPhone">
					<el-input v-model="editData.adminPhone" placeholder="请输入手机号" clearable />
				</el-form-item>
				<el-form-item :label="'角色'" prop="roleId" style="width: 100%;">
					<el-select v-model="editData.roleId" class="filter-item" placeholder="请选择角色" clearable
						@keyup.enter.native="handleFilter" style="width: 100%;">
						<el-option v-for="item in tags" :key="item.id" :label="item.roleName" :value="item.id" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onEditData('editData')">确定</el-button>
					<el-button @click="showEdit = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
		updateAdminUser,
		deleteAdminUser,
		addAdminUser,
		editPasswordAdminUser,
		findAdminUserSonList,
		findRoleList,
		freezeAdminUser
	} from '@/api/agent/agentList.js'
	import {
		findDealerList,
	} from '@/api/device/deviceList.js'
	import {
		parseTime
	} from '@/utils/index'
	import {
		uploadImg
	} from '@/api/AD/ADList.js'
	export default {
		name: 'agentEditpage',
		components: {

		},
		props: {
			row_data: {
				type: Object
			}
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
				showEdit: false,
				editData: {
          id: '',
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
				tags: [],
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
			showDidlaoEditData() {
				let item = this.row_data
        this.editData.id = item.id
				this.editData.adminName = item.adminName
				this.editData.adminFullname = item.adminFullname
				this.editData.adminPhone = item.adminPhone
				this.editData.roleId = item.roleId
				this.showEdit = true
				this.getRoleList()
			},
			onEditData(formName) {
				let editData = JSON.parse(JSON.stringify(this.editData))
				this.$refs[formName].validate(valid => {
					if (valid) {
						console.log("通过")
						updateAdminUser(editData).then(res => {
							if (res.code == 200) {
								this.showEdit = false
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
			getRoleList() {
				let data = {
					page: 1,
					limit: 1000
				}
				findRoleList(data).then(res => {
					if (res.code == 200) {
						this.tags = res.data
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
						this.editData.wxQrcode = res.data
						console.log(this.editData.wxQrcode)
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
				this.editData.wxQrcode = ''
			},
			successShopSteps(res) {
				this.editData.wxQrcode = res.url
			},
		},
		created() {

		},
	}
</script>

<style>

</style>

<!--
*添加运营商
-->
<template>
	<div style="display: inline-block;">
		<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click='onShowAdd'
			v-if="btnAuthen.permsVerifAuthention(':sys:admin:addAdminUser')">添加运营商
		</el-button>
		<!-- 添加运营商-->
		<el-dialog :visible.sync="showAdd" title="添加运营商" @close="showAdd = false" style="width: 100%;"
			:append-to-body="true">
			<el-form ref="addData" :model="addData" label-position="left" label-width="120px"
				style="margin-left:120px;width: 420px;" :rules="rules">
				<el-form-item :label="'登录账号'" prop="adminName">
					<el-input v-model="addData.adminName" placeholder="请输入登录账号" clearable />
				</el-form-item>
				<el-form-item :label="'姓名'" prop="adminFullname">
					<el-input v-model="addData.adminFullname" placeholder="请输入姓名" clearable />
				</el-form-item>
				<el-form-item :label="'手机号'" prop="adminPhone">
					<el-input v-model="addData.adminPhone" placeholder="请输入手机号" clearable />
				</el-form-item>
				<el-form-item :label="'小程序名称'" prop="wxName" v-if="addData.roleId == 3">
					<el-input v-model="addData.wxName" placeholder="请输入小程序名称" clearable />
				</el-form-item>
				<el-form-item :label="'小程序APPID'" prop="wxAppId" v-if="addData.roleId == 3">
					<el-input v-model="addData.wxAppId" placeholder="请输入小程序APPID" clearable />
				</el-form-item>
				<el-form-item :label="'小程序秘钥'" prop="wxSecret" v-if="addData.roleId == 3">
					<el-input v-model="addData.wxSecret" placeholder="请输入小程序秘钥" clearable type="password" />
				</el-form-item>
				<el-form-item :label="'商户号'" prop="wxMchId" v-if="addData.roleId == 3">
					<el-input v-model="addData.wxMchId" placeholder="请输入商户号" clearable />
				</el-form-item>
				<el-form-item :label="'商户秘钥V2'" prop="wxMchKey" v-if="addData.roleId == 3">
					<el-input v-model="addData.wxMchKey" placeholder="请输入商户V2秘钥" clearable type="password" />
				</el-form-item>
        <el-form-item :label="'商户秘钥V3'" prop="wxMchKeyV3" v-if="addData.roleId == 3">
        	<el-input v-model="addData.wxMchKeyV3" placeholder="请输入商户V3秘钥" clearable type="password" />
        </el-form-item>
        <el-form-item :label="'域名'" prop="domainName" v-if="addData.roleId == 3">
        	<el-input v-model="addData.domainName" placeholder="请输入域名" clearable />
        </el-form-item>
        <el-form-item :label="'证书序列号'" prop="certSerialNo" v-if="addData.roleId == 3">
        	<el-input v-model="addData.certSerialNo" placeholder="请输入微信证书序列号" clearable />
        </el-form-item>
        <el-form-item :label="'API证书'">
        	<el-upload class="upload-demo" ref="uploadCertificateFile" :on-remove="handleRemoveCertificateFile" :file-list="certificateFileList"
        		:http-request="uploadCertificateFile" action='' :on-change="handleChangeCertificateFile">
        		<el-button slot="trigger" size="small" type="text" >选取.p12文件</el-button>
        		<el-button style="margin-left: 120px;" size="small"  @click="submitUpload('certificateFile')"
        			:loading="loading">开始上传
        		</el-button>
        	</el-upload>
        </el-form-item>
        <el-form-item :label="'私钥文件'">
        	<el-upload class="upload-demo" ref="uploadCertificateKeyFile" :on-remove="handleRemoveCertificateKeyFile" :file-list="certificateKeyFileList"
        		:http-request="uploadCertificateKeyFile" action='' :on-change="handleChangeCertificateKeyFile">
        		<el-button slot="trigger" size="small" type="text">选取.pem文件</el-button>
        		<el-button style="margin-left: 120px;" size="small" @click="submitUpload('certificateKeyFile')"
        			:loading="loading">开始上传
        		</el-button>
        	</el-upload>
        </el-form-item>
				<el-form-item :label="'开始充电模板推送ID'" prop="templateKscdId" v-if="addData.roleId == 3">
					<el-input v-model="addData.templateKscdId" placeholder="开始充电模板推送ID" clearable />
				</el-form-item>
				<el-form-item :label="'结束充电模板推送ID'" prop="templateJscdId" v-if="addData.roleId == 3">
					<el-input v-model="addData.templateJscdId" placeholder="结束充电模板推送ID" clearable />
				</el-form-item>
				<!-- <el-form-item label="小程序图片" prop="wxQrcode" v-if="addData.roleId == 3">
					<el-upload :show-file-list="false" :multiple="false" :http-request="uploadShopSteps"
						:before-upload="beforeUploadShopSteps" :on-remove="handleRemoveShopSteps"
						:on-success="successShopSteps" action="" class="avatar-uploader" accept=".jpg,.jpeg,.png,.gif">
						<img v-if="addData.wxQrcode" :src="addData.wxQrcode" class="avatar">
						<i v-else class="el-icon-plus avatar-uploader-icon" />
					</el-upload>
				</el-form-item> -->
				<el-form-item>
					<el-button type="primary" @click="onaddData('addData')">确定</el-button>
					<el-button @click="showAdd = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
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
		upload
	} from '@/api/upload/file.js'
	import {
		parseTime
	} from '@/utils/index'
	export default {
		name: 'agentList1',
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
					roleId: 3,
          domainName: '',
					wxAppId: '',
					wxSecret: '',
					wxName: '',
					wxMchId: '',
					wxMchKey: '',
          wxMchKeyV3: '',
					wxQrcode: '',
					templateKscdId: '',
					templateJscdId: '',
          certSerialNo: '',
          certificateFile: '',
          certificateKeyFile: ''
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
          domainName: [{
          	required: true,
          	message: '请输入域名',
          	trigger: 'blur'
          }],
          wxName: [{
          	required: true,
          	message: '请输入小程序名称',
          	trigger: 'blur'
          }],
          wxAppId: [{
          	required: true,
          	message: '请输入小程序APPID',
          	trigger: 'blur'
          }],
          wxSecret: [{
          	required: true,
          	message: '请输入小程序密钥',
          	trigger: 'blur'
          }],
          wxMchId: [{
          	required: true,
          	message: '请输入商户号',
          	trigger: 'blur'
          }],
          wxMchKey: [{
          	required: true,
          	message: '请输入微信支付API密钥',
          	trigger: 'blur'
          }],
          wxMchKeyV3: [{
          	required: true,
          	message: '请输入微信支付APIV3密钥',
          	trigger: 'blur'
          }],
          certSerialNo: [{
          	required: true,
          	message: '请输入微信证书序列号',
          	trigger: 'blur'
          }],
				},
        certificateFileList: [],
        certificateKeyFileList: [],
        certificateFile: null,
        certificateKeyFile: null,
        loading: false,
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
      //选择文件
      uploadCertificateFile(files) {
      	console.log(files)
      	this.certificateFile = files
      },
      //选择文件
      uploadCertificateKeyFile(files) {
      	console.log(files)
      	this.certificateKeyFile = files
      },
      //上传服务器
      submitUpload(type) {
      	if (this.certificateFile == null && type == 'certificateFile') {
      		this.$message.error('请选择文件')
      		return false
      	}
        if (this.certificateKeyFile == null && type == 'certificateKeyFile'){
          this.$message.error('请选择文件')
          return false
        }
      	this.loading = true
      	let param = new FormData()
        if (type == 'certificateFile') {
          param.append('file', this.certificateFile.file)
        }else{
          param.append('file', this.certificateKeyFile.file)
        }
      	console.log(param, "上传文件")
      	upload('PaymentFile',param).then(res => {
      		this.loading = false
      		if (res.code == 200) {
            if (type == 'certificateFile') {
              this.addData.certificateFile = res.data.url
            }else{
              this.addData.certificateKeyFile = res.data.url
            }
            this.$message.success('上传成功')
      		} else {
      			this.$message.error(res.msg)
      		}
      	}).catch((err) => {
      		this.loading = false
      		this.$message.error('上传失败，请重试')
      	})
      },
      handleRemoveCertificateFile(file, certificateFileList) {
      	this.certificateFile = null
      },
      handleChangeCertificateFile(file, certificateFileList) {
      	if (certificateFileList.length > 1) {
      		certificateFileList.splice(0, 1);
      	}
      },
      handleRemoveCertificateKeyFile(file, certificateKeyFileList) {
      	this.certificatekeyFile = null
      },
      handleChangeCertificateKeyFile(file, certificateKeyFileList) {
      	if (certificateKeyFileList.length > 1) {
      		certificateKeyFileList.splice(0, 1);
      	}
      },
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
			onShowAdd() {
				this.showAdd = true
			},
			onaddData(formName) {
				let addData = JSON.parse(JSON.stringify(this.addData))
				console.log(addData)
				this.$refs[formName].validate(valid => {
					console.log(valid)
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

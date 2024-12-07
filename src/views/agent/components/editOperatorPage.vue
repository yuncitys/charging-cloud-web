<!--
*编辑运营商
-->
<template>
	<div style="display: inline-block;">
		<el-button type="primary"
			v-if="btnAuthen.permsVerifAuthention(':sys:admin:updateAdminUser')" @click='showDidlaoEditData()' size="mini">编辑
		</el-button>
		<!-- 编辑运营商-->
		<el-dialog :visible.sync="showEdit" title="编辑运营商" @close="showEdit = false" style="width: 100%;"
			:append-to-body="true">
			<el-form ref="editData" :model="editData" label-position="left" label-width="120px"
        style="margin-left:120px;width: 420px;" :rules="rules">
				<el-form-item :label="'登录账号'" prop="adminName">
					<el-input v-model="editData.adminName" placeholder="请输入登录账号" clearable />
				</el-form-item>
				<el-form-item :label="'姓名'" prop="adminFullname">
					<el-input v-model="editData.adminFullname" placeholder="请输入姓名" clearable />
				</el-form-item>
				<el-form-item :label="'手机号'" prop="adminPhone">
					<el-input v-model="editData.adminPhone" placeholder="请输入手机号" clearable />
				</el-form-item>
				<el-form-item :label="'小程序名称'" prop="wxName" v-if="editData.roleId == 3">
					<el-input v-model="editData.wxName" placeholder="请输入小程序名称" clearable />
				</el-form-item>
				<el-form-item :label="'小程序APPID'" prop="wxAppId" v-if="editData.roleId == 3">
					<el-input v-model="editData.wxAppId" placeholder="请输入小程序APPID" clearable />
				</el-form-item>
				<el-form-item :label="'小程序秘钥'" prop="wxSecret" v-if="editData.roleId == 3">
					<el-input v-model="editData.wxSecret" placeholder="请输入小程序秘钥" clearable type="password" />
				</el-form-item>
				<el-form-item :label="'商户号'" prop="wxMchId" v-if="editData.roleId == 3">
					<el-input v-model="editData.wxMchId" placeholder="请输入商户号" clearable />
				</el-form-item>
				<el-form-item :label="'商户秘钥V2'" prop="wxMchKey" v-if="editData.roleId == 3">
					<el-input v-model="editData.wxMchKey" placeholder="请输入商户V2秘钥" clearable type="password" />
				</el-form-item>
        <el-form-item :label="'商户秘钥V3'" prop="wxMchKeyV3" v-if="editData.roleId == 3">
        	<el-input v-model="editData.wxMchKeyV3" placeholder="请输入商户V3秘钥" clearable type="password" />
        </el-form-item>
				<el-form-item :label="'域名'" prop="domainName" v-if="editData.roleId == 3">
					<el-input v-model="editData.domainName" placeholder="请输入域名" clearable />
				</el-form-item>
        <el-form-item :label="'证书序列号'" prop="certSerialNo" v-if="editData.roleId == 3">
        	<el-input v-model="editData.certSerialNo" placeholder="请输入微信证书序列号" clearable />
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
        <el-form-item :label="'开始充电模板推送ID'" prop="templateKscdId" v-if="editData.roleId == 3">
        	<el-input v-model="editData.templateKscdId" placeholder="开始充电模板推送ID" clearable />
        </el-form-item>
        <el-form-item :label="'结束充电模板推送ID'" prop="templateJscdId" v-if="editData.roleId == 3">
        	<el-input v-model="editData.templateJscdId" placeholder="结束充电模板推送ID" clearable />
        </el-form-item>
				<!-- <el-form-item label="小程序图片" prop="wxQrcode" v-if="editData.roleId == 3">
					<el-upload :show-file-list="false" :multiple="false" :http-request="uploadShopSteps"
						:before-upload="beforeUploadShopSteps" :on-remove="handleRemoveShopSteps"
						:on-success="successShopSteps" action="" class="avatar-uploader" accept=".jpg,.jpeg,.png,.gif">
						<img v-if="editData.wxQrcode" :src="editData.wxQrcode" class="avatar">
						<i v-else class="el-icon-plus avatar-uploader-icon" />
					</el-upload>
				</el-form-item> -->
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
		upload
	} from '@/api/upload/file.js'
	export default {
		name: 'agentList1',
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
					adminName: '',
					adminFullname: '',
					adminPhone: '',
					roleId: 3,
					id: '',
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
          }, ],
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
              this.editData.certificateFile = res.data.url
            }else{
              this.editData.certificateKeyFile = res.data.url
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
			showDidlaoEditData() {
				let item = this.row_data
        this.editData.id = item.id
				this.editData.adminName = item.adminName
				this.editData.adminFullname = item.adminFullname
				this.editData.adminPhone = item.adminPhone
				this.editData.roleId = item.roleId
        this.editData.domainName = item.domainName || ''
				this.editData.wxAppId = item.wxAppId || ''
				this.editData.wxSecret = item.wxSecret || ''
				this.editData.wxName = item.wxName || ''
				this.editData.wxMchId = item.wxMchId || ''
				this.editData.wxMchKey = item.wxMchKey || ''
				this.editData.wxQrcode = item.wxQrcode || ''
				this.editData.templateKscdId = item.templateKscdId || ''
				this.editData.templateJscdId = item.templateJscdId || ''
        this.editData.wxMchKeyV3 = item.wxMchKeyV3 || ''
        this.editData.certSerialNo = item.certSerialNo || ''
        this.editData.certificateFile = item.certificateFile || ''
        this.editData.certificateKeyFile = item.certificateKeyFile || ''
				this.showEdit = true
				console.log(this.editData)
			},
			onEditData(formName) {
				let editData = JSON.parse(JSON.stringify(this.editData))
				console.log(editData, "this.editData")
				this.$refs[formName].validate(valid => {
					console.log(valid, "1111")
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
		},
		created() {

		},
	}
</script>

<style>

</style>

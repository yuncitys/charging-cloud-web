<template>
	<div style="display: inline-block;">
        <el-button type="primary" @click="showDidlaoEditData()" style="margin-left: 10px;"
        	size="mini" v-if="btnAuthen.permsVerifAuthention(':sys:updateApp:editUpdateApp')">编辑
        </el-button>
		<!-- 编辑文件-->
		<el-dialog :visible.sync="showEdit" title="编辑文件" @close="showEdit = false" :append-to-body="true">
			<el-form ref="editData" :model="editData" label-position="left" label-width="120px"
				style="width: 600px; margin-left:50px;">
				<el-form-item :label="'文件名'">
					<el-upload class="upload-demo" ref="upload" :on-remove="handleRemove" :file-list="fileList"
						:http-request="upload" action='' :on-change="handleChange">
						<el-button slot="trigger" size="small" type="primary">选取bin文件</el-button>
						<el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload('edit')"
							:loading="btn1Loading">开始上传
						</el-button>
					</el-upload>
				</el-form-item>
				<el-form-item :label="'文件名'" prop="fileName">
					<el-input v-model="editData.fileName" placeholder="文件名" clearable disabled />
				</el-form-item>
				<el-form-item :label="'升级文件路径'" prop="upfileUrl">
					<el-input v-model="editData.upfileUrl" placeholder="升级文件路径" clearable disabled />
				</el-form-item>
				<el-form-item :label="'文件大小'" prop="fileSize">
					<el-input v-model="editData.fileSize" placeholder="文件大小" clearable disabled />
				</el-form-item>
				<el-form-item :label="'MD5值'" prop="md5Value">
					<el-input v-model="editData.md5Value" placeholder="MD5值" clearable disabled />
				</el-form-item>
				<el-form-item :label="'备注信息'" prop="remark">
					<el-input v-model="editData.remark" placeholder="请输入备注信息" clearable />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onEditData('editData')" :loading="Loading">确定</el-button>
					<el-button @click="showEdit = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>

	</div>
</template>

<script>
	import {
		getList,
		uploadfile,
		addUpdateApp,
		editUpdateApp,
		findDeviceCode,
		sendOtaDevice,
		delOtaDevice
	} from '@/api/device/upgrade.js'
	import {
		parseTime
	} from '@/utils/index'
	export default {
		name: 'upgrade1',
		props:{
			row_data:{
				type:Object
			}
		},
		components: {

		},
		data() {
			return {
				showEdit: false,
				editData: {
					id: '',
					fileName: '',
					upfileUrl: '',
					md5Value: '',
					fileSize: '',
					remark: ''
				},
				rules: {
					remark: [{
						required: true,
						message: '请输入备注信息',
						trigger: 'blur'
					}],
				},
				Loading: false,
				fileList: [],
				files: null,
				btn1Loading: false,
			}
		},
		methods: {
			//选择文件
			upload(files) {
				console.log(files)
				this.files = files
			},
			//上传服务器
			submitUpload(type) {
				if (this.files == null) {
					this.$message.error('请选择bin文件')
					return false
				}
				this.btn1Loading = true
				let param = new FormData()
				param.append('file', this.files.file)
				console.log(this.files.file, param, "11111")
				uploadfile(param).then(res => {
					this.btn1Loading = false
					if (res.code == 200) {
						let fileInfo = res.data
						if (type == 'add') {
							this.addData.fileName = fileInfo.name
							this.addData.upfileUrl = this.Global.APIURl + fileInfo.url
							this.addData.md5Value = fileInfo.MD5
							this.addData.fileSize = fileInfo.length
						} else {
							this.editData.fileName = fileInfo.name
							this.editData.upfileUrl = this.Global.APIURl + fileInfo.url
							this.editData.md5Value = fileInfo.MD5
							this.editData.fileSize = fileInfo.length
						}
					} else {
						this.$message.error(res.msg)
					}
				}).catch((err) => {
					this.btn1Loading = false
					this.$message.error('上传失败，请重试')
				})
			},
			handleRemove(file, fileList) {
				this.files = null
			},
			handleChange(file, fileList) {
				if (fileList.length > 1) {
					fileList.splice(0, 1);
				}
			},
			showDidlaoEditData() {
				let item=this.row_data
				this.showEdit = true
				this.editData.fileName = item.fileName
				this.editData.upfileUrl = item.upfileUrl
				this.editData.md5Value = item.md5Value
				this.editData.fileSize = item.fileSize
				this.editData.remark = item.remark
				this.editData.id = item.id
				this.fileList = []
			},
			onEditData(formName) {
				if (this.editData.fileName == '' || this.editData.fileName == null || this.editData.fileName ==
					undefined) {
					this.$message.error('请上传bin文件')
					return false
				}
				editUpdateApp(this.editData).then(res => {
					this.Loading = false
					if (res.code == 200) {
						this.showEdit = false
						this.resetForm(formName)
						this.$message.success(res.msg)
						this.$emit('getLists')
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
		},
		created() {

		},
	}
</script>

<style scoped="scoped">

</style>

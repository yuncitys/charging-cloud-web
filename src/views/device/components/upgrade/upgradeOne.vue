<template>
	<div style="display: inline-block;">
		<el-button type="primary" @click="onOneUpDate()" style="margin-left: 10px;"
			size="mini">指定单个设备升级
		</el-button>
		<el-dialog :visible.sync="showOneUpte" title="指定单个设备升级" @close="showOneUpte = false">
			<el-form ref="upDateData" :model="upDateData" label-position="left" label-width="120px"
				style="width: 600px; margin-left:50px;">
				<el-form-item :label="'搜索设备'" prop="deviceCode">
					<div style="display: flex;width: 100%;">
						<div style="width: 80%;">
							<el-input v-model="deviceCode" placeholder="请输入设备号" clearable @keyup.enter.native="onfindDeviceCode" @clear="clearDeviceCode()"/>
						</div>
						<div style="width: 20%;display: flex;justify-content:flex-end;">
							<div>
								<el-button type="primary" @click="onfindDeviceCode">搜索</el-button>
							</div>
						</div>
					</div>
				</el-form-item>
				<el-form-item :label="'选择设备'" style="width: 100%;">
					<el-select v-model="upDateData.deviceCode" style="width: 100%;" class="filter-item"
						placeholder="请先搜索设备" clearable>
						<el-option v-for="item in deviceList" :key="item.deviceCode" :label="item.deviceCode"
							:value="item.deviceCode" />
					</el-select>
				</el-form-item>
				<el-form-item :label="'文件名'" prop="fileName">
					<el-input v-model="upDateData.fileName" placeholder="文件名" clearable disabled />
				</el-form-item>
				<el-form-item :label="'升级文件路径'" prop="upfileUrl">
					<el-input v-model="upDateData.upfileUrl" placeholder="升级文件路径" clearable disabled />
				</el-form-item>
				<el-form-item :label="'文件大小'" prop="fileSize">
					<el-input v-model="upDateData.fileSize" placeholder="文件大小" clearable disabled />
				</el-form-item>
				<el-form-item :label="'MD5值'" prop="md5Value">
					<el-input v-model="upDateData.md5Value" placeholder="MD5值" clearable disabled />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onsendOtaDevice('upDateData')" :loading="Loading">确定
					</el-button>
					<el-button @click="showOneUpte = false">取消</el-button>
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
	export default {
		props:{
			row_data:{
				type:Object,
			}
		},
		data(){
			return {
				showOneUpte: false,
				upDateData: {
					fileName: '',
					upfileUrl: '',
					md5Value: '',
					fileSize: '',
					deviceCode: '',
				},
				deviceCode: '',
				deviceList: [],
				Loading:false,
			}
		},
		methods: {
			//显示单个升级弹窗
			onOneUpDate() {
				let row=this.row_data
				console.log(row)
				this.showOneUpte = true
				this.upDateData.fileName = row.fileName
				this.upDateData.upfileUrl = row.upfileUrl
				this.upDateData.md5Value = row.md5Value
				this.upDateData.fileSize = row.fileSize
				this.deviceCode = ''
				this.onfindDeviceCode()
			},
			//清除设备列表搜索条件
			clearDeviceCode(){
				this.deviceCode=''
				this.onfindDeviceCode()
			},
			//设备列表
			onfindDeviceCode() {
				let data = {
					deviceCode: this.deviceCode
				}
				findDeviceCode(data).then(res => {
					if (res.code == 200) {
						this.deviceList = res.data
					}
				})
			},
			//单个设备升级
			onsendOtaDevice() {
				if (this.upDateData.deviceCode == '') {
					this.$message.error('请选择设备')
					return false
				}
				let data = {
					url: this.upDateData.upfileUrl,
					md5: this.upDateData.md5Value,
					len: this.upDateData.fileSize,
					type: 1,
					deviceCode: this.upDateData.deviceCode
				}
				console.log(data)
				sendOtaDevice(data).then(res => {
					if (res.code == 200) {
						this.$message.success(res.msg)
						this.showOneUpte = false
					}
				})
			},
		},
	}
</script>

<style>
	
</style>

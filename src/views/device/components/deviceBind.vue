<template>
	<div v-if="btnAuthen.permsVerifAuthention(':device:qr:binding')">
		<div style="display: inline-block;">
			<el-button type="primary" @click='onShowDialog' size="mini">
				绑定二维码
			</el-button>
			<el-dialog :visible.sync="showDialog" title="绑定二维码" @close="showDialog=false" :append-to-body="true">
				<el-form ref="bindingData" :model="bindingData" :rules="bindingRules" label-position="left" label-width="100px"
					style="width: 600px; margin-left:50px;">
					<h2 class="deviceCode">设备号{{deviceCode}}</h2>
					<el-form-item :label="'二维码编号'" prop="qrCode">
						<div style="display: flex;">
							<div>
								<el-input v-model="bindingData.qrCode" clearable placeholder="请输入二维码编号" />
							</div>
							<div style="margin-left: 20px;">
								<el-button type="primary" @click='onBindingQRCode'>二维码绑定
								</el-button>
							</div>
						</div>
					</el-form-item>
					<el-form-item :label="'选择类型'" prop="port">
						<el-select v-model="bindingData.port" placeholder="请选择绑定类型" style="width: 70%;">
							<el-option v-for="item in bindingPort" :key="item.value" :label="item.label" :value="item.value"
								:disabled="item.disabled">
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item :label="'上传二维码'">
						<el-upload class="upload-demo" drag action="" :show-file-list="false" :http-request="resolveQR"
							multiple>
							<i class="el-icon-upload"></i>
							<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
							<div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过5M</div>
						</el-upload>
					</el-form-item>
				</el-form>
			</el-dialog>
		</div>
	</div>
</template>

<script>
	import {
		bindingQRCode,
		listGuns
	} from '@/api/device/deviceList.js'
	export default {
		props: {
			deviceId: {
				type: Number,
			},
			deviceCode: {
				type: String,
			}
		},
		data() {
			return {
				showDialog: false,
				bindingData: {
          deviceCode: '',
          qrCode: '',
          port: '',
          status: 1
        },
        bindingRules: {
        	port: [{
        		required: true,
        		message: '请选择绑定类型',
        		trigger: 'blur',
        	}],
        	qrCode: [{
        		required: true,
        		message: '请输入二维码编号',
        		trigger: 'blur',
        	}],
        	deviceCode: [{
        		required: true,
        		message: '请输入设备编号',
        		trigger: 'blur',
        	}]
        },
        bindingPort: [{
          value: 0,
          label: '主机二维码'
        }]
			}
		},
		methods: {
			onShowDialog() {
				this.showDialog = true
				this.bindingData.port = ''
        this.getBindingPort()
			},
			onBindingQRCode() {
				this.setbindingQRCode()
			},
			resolveQR(event) {
				const result = this.$common.getQrUrl(event.file)
				result.then(res => {
					if (res.data) {
						let utl = res.data
						let params = this.$common.parseQueryString(utl)
						let qrCode = params.qrcode
            this.bindingData.qrCode = qrCode
						this.setbindingQRCode()
					} else {
						this.$message.error('识别二维码失败, 请重新上传')
					}
				}).catch(() => {
					this.$message.error('识别二维码失败, 请重新上传')
				})
			},
			setbindingQRCode() {
        this.bindingData.deviceCode = this.deviceCode
				if (!this.bindingData.qrCode) {
					this.$message.error('二维码编号不能为空')
					return false
				}
        if (this.bindingData.port === ''){
          this.$message.error('绑定类型不能为空')
          return false
        }
        if (this.bindingData.deviceCode === ''){
          this.$message.error('设备号不能为空')
          return false
        }
				bindingQRCode(this.bindingData).then(res => {
					if (res.code == 200) {
						this.$message.success(res.msg)
						this.showDialog = false
					} else {
						this.$message.error(res.msg)
					}
				})
			},
      getBindingPort() {
        const params = {}
        if (this.deviceId) {
          params.deviceId = this.deviceId
        }
        if (this.deviceCode) {
          params.deviceCode = this.deviceCode
        }
        listGuns(params).then(res => {
          if (res.code == 200) {
            const gunNumbers = (res.data || [])
              .map(g => Number(g.gunNumber))
              .filter(n => n > 0)
              .sort((a, b) => a - b)
            const ports = gunNumbers.map(n => ({
              value: n,
              label: n + '号插座'
            }))
            this.bindingPort = [{
              value: 0,
              label: '主机二维码'
            }, ...ports]
          } else {
            this.$message.error(res.msg)
          }
        })
      }
		}
	}
</script>

<style>
	.deviceCode {
		text-align: center;
		margin-bottom: 30px;
	}
</style>

<template>
	<div>
		<div style="display: inline-block;">
			<el-button type="primary" @click='onShowDialog' size="mini">绑定二维码
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
    findDeviceInfoById
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
        bindingPort:[
          {
            value:0,
            label:'主机二维码'
          },
          {
            value:1,
            label:'1号插座'
          },
          {
            value:2,
            label:'2号插座'
          },
          {
            value:3,
            label:'3号插座'
          },
          {
            value:4,
            label:'4号插座'
          },
          {
            value:5,
            label:'5号插座'
          },
          {
            value:6,
            label:'6号插座'
          },
          {
            value:7,
            label:'7号插座'
          },
          {
            value:8,
            label:'8号插座'
          },
          {
            value:9,
            label:'9号插座'
          },
          {
            value:10,
            label:'10号插座'
          },
          {
            value:11,
            label:'11号插座'
          },
          {
            value:12,
            label:'12号插座'
          }
        ]
			}
		},
		methods: {
			//显示弹窗
			onShowDialog() {
				this.showDialog = true
        this.getBindingPort()
			},
			//点击绑定按钮
			onBindingQRCode() {
				this.setbindingQRCode()
			},
			//上传图片解析
			resolveQR(event) {
				const result = this.$common.getQrUrl(event.file)
				result.then(res => {
					if (res.data) {
						let utl = res.data
						console.log(utl)
						let params = this.$common.parseQueryString(utl)
						let qrCode = params.qrcode
            this.bindingData.qrCode = qrCode
						this.setbindingQRCode()
					} else {
						this.$message.error('识别二维码失败, 请重新上传')
					}
				}).catch(err => {
					this.$message.error('识别二维码失败, 请重新上传')
				})
			},
			//调用接口绑定
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
      //查询可绑定的端口
      getBindingPort(){
        console.log(this.deviceId)
        console.log(this.deviceCode)
        let data = {
          deviceId:this.deviceId
        }
        findDeviceInfoById(data).then(res => {
          	if (res.code == 200) {
              let device = res.data
              console.log(device)
              if (device.portCount <= this.bindingPort.length + 1) {
                this.bindingPort = this.bindingPort.slice(0,device.portCount + 1);
              } else{
                var len = device.portCount - this.bindingPort.length;
                console.log(len)
                //let newPort = []
                var value12 = this.bindingPort[12].value
                console.log(value12)
                for(var i= value12 + 1;i<device.portCount;i++){
                  var value = i+1
                  console.log(value)
                  let port = {
                    value:value,
                    label:value + '号插座',
                  }
                  this.bindingPort.push(port)
                  //newPort.push(port)
                }
                //console.log(newPort)
                //this.bindingPort.push(newPort)
              }
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

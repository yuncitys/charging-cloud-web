<template>
	<div style="display: inline-block;">
		<el-dialog :visible.sync="showDialog" title="批量设置设备参数" @close="showDialog = false" :append-to-body="true">
			<el-form ref="formData" :model="formData" :rules="deviceRules" label-position="left" label-width="120px"
				style="width: 600px; margin-left:50px;">
				<el-form-item :label="'设备号'" prop="deviceCodes">
					<el-input v-model="formData.deviceCodes" clearable placeholder="设备号" disabled>
					</el-input>
				</el-form-item>
				<el-form-item label="收费类型：" prop="chargeType">
					<el-radio-group v-model="formData.chargeType">
						<!-- <el-radio :label="0">按时间收费</el-radio> -->
						<!-- <el-radio :label="1">按电量收费</el-radio> -->
						<el-radio :label="1">收费</el-radio>
						<el-radio :label="2">免费</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="心跳时间：" prop="heartbeatTime">
					<el-input placeholder="设备上报心跳间隔时间(单位秒,默认60秒)" v-model="formData.heartbeatTime" type="number">
						<template slot="append">单位秒</template>
					</el-input>
				</el-form-item>
				<el-form-item label="等待时间：" prop="waitTime">
					<el-input placeholder="充电启动未插充电器判断时间(单位秒,默认30秒)" v-model="formData.waitTime" type="number">
						<template slot="append">单位秒</template>
					</el-input>
				</el-form-item>
				<el-form-item :label="'总功率上限'" prop="totalPowerUpper">
					<el-input v-model="formData.totalPowerUpper" clearable placeholder="限制设备输出总功率（单位瓦，默认6000瓦）"
						type="number">
						<template slot="append">单位瓦</template>
					</el-input>
				</el-form-item>
				<el-form-item :label="'单路功率上限'" prop="powerUpper">
					<el-input v-model="formData.powerUpper" clearable placeholder="限制设备单个端口的最大功率（单位瓦，默认800瓦）"
						type="number">
						<template slot="append">单位瓦</template>
					</el-input>
				</el-form-item>
				<el-form-item :label="'单路功率下限'" prop="powerLower">
					<el-input v-model="formData.powerLower" clearable placeholder="充电完成判断（单位瓦，默认8瓦）" type="number">
						<template slot="append">单位瓦</template>
					</el-input>
				</el-form-item>
				<el-form-item :label="'大功率端口上限'" prop="highPowerUpper">
					<el-input v-model="formData.highPowerUpper" clearable placeholder="大功率端口上限（单位瓦）" type="number">
						<template slot="append">单位瓦</template>
					</el-input>
				</el-form-item>
				<el-form-item :label="'大功率端口下限'" prop="highPowerLower">
					<el-input v-model="formData.highPowerLower" clearable placeholder="大功率端口下限（单位瓦）" type="number">
						<template slot="append">单位瓦</template>
					</el-input>
				</el-form-item>
				<el-form-item label="低温温度：" prop="lowTemperature">
					<el-input placeholder="低温禁用(单位摄氏度，默认20，范围0-25)" v-model="formData.lowTemperature" type="number">
						<template slot="append">单位摄氏度</template>
					</el-input>
				</el-form-item>
				<el-form-item label="告警温度：" prop="warningTemperature">
					<el-input placeholder="正常可用温度区间(默认60+50,范围 60+45~60+52，设备可以使用)"
						v-model="formData.warningTemperature" type="number">
						<template slot="append">单位摄氏度</template>
					</el-input>
				</el-form-item>
				<el-form-item label="高温温度：" prop="highTemperature">
					<el-input placeholder="温度过高禁用(默认60+55,范围 60+53~60+60，设备不允许使用)" v-model="formData.highTemperature"
						type="number">
						<template slot="append">单位摄氏度</template>
					</el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="formConfirm('formData')">确定</el-button>
					<el-button @click="showDialog = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		batchSetPower,
	} from '@/api/device/deviceList.js'
	export default {
		data() {
			return {
				showDialog: false,
				formData: {
					deviceCodes: '',
					chargeType: 0,
					heartbeatTime: '30',
					waitTime: '30',
					totalPowerUpper: '10000',
					powerUpper: '600',
					powerLower: '5',
					highPowerUpper: '3500',
					highPowerLower: '10',
					lowTemperature: '-20',
					warningTemperature: '55',
					highTemperature: '70'
				},
				deviceRules: {
					chargeType: [{
						required: true,
						message: '请选择收费类型',
						trigger: 'blur'
					}],
					heartbeatTime: [{
						required: true,
						message: '请输入心跳时间',
						trigger: 'blur'
					}],
					waitTime: [{
						required: true,
						message: '请输入等待时间',
						trigger: 'blur'
					}],
					totalPowerUpper: [{
						required: true,
						message: '请输入总功率上限',
						trigger: 'blur'
					}],
					powerUpper: [{
						required: true,
						message: '请输入单路功率上限',
						trigger: 'blur'
					}],
					powerLower: [{
						required: true,
						message: '请输入单路功率下限',
						trigger: 'blur'
					}],
					highPowerUpper: [{
						required: true,
						message: '请输入大功率端口上限',
						trigger: 'blur'
					}],
					highPowerLower: [{
						required: true,
						message: '请输入大功率端口下限',
						trigger: 'blur'
					}],
					lowTemperature: [{
						required: true,
						message: '请输入低温温度',
						trigger: 'blur'
					}],
					warningTemperature: [{
						required: true,
						message: '请输入告警温度',
						trigger: 'blur'
					}],
					highTemperature: [{
						required: true,
						message: '请输入高温温度',
						trigger: 'blur'
					}],
				},
			}
		},
		methods: {
			onShowDialog(deviceCodes) {
				if (!deviceCodes) {
					this.$message.error("请选择要设置功率的设备")
					return false
				}
				this.showDialog = true
				this.formData.deviceCodes = deviceCodes
			},
			formConfirm(formName) {
				console.log(this.formData)
				this.formData.lowTemperature = Math.abs(this.formData.lowTemperature)
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						batchSetPower(this.formData).then(res => {
							if (res.code == 200) {
								this.showDialog = false
								this.resetForm(formName)
								this.$message.success(res.msg)
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
		}
	}
</script>

<style>

</style>
<template>
	<div style="display: inline-block;">
		<el-button size="mini" type="primary" v-if="btnAuthen.permsVerifAuthention(':device:deviceType:updateDeviceType')"
			@click="onShowDialog">编辑</el-button>
		<!-- 编辑 -->
		<el-dialog :visible.sync="showDialog" title="编辑设备类型" @close="showDialog = false" :append-to-body="true">
			<el-form ref="formData" :model="formData" label-position="left" label-width="150px"
				style="width: 600px; margin-left:50px;" :rules="rules">
				<el-form-item :label="'设备类型ID'" prop="deviceTypeId">
					<el-input v-model="formData.deviceTypeId" disabled clearable />
				</el-form-item>
				<el-form-item :label="'产品名称'" prop="ruleId">
					<el-radio-group v-model="formData.ruleId" @change="onchangeEleetricOut($event)">
						<el-radio v-for="item in deviceRuleOptions" :key="'rule-'+item.value" :label="item.value">{{ item.label }}</el-radio>
					</el-radio-group>
				</el-form-item>
        <el-form-item :label="'电流输出'" prop="electricOut">
        	<el-select v-model="formData.electricOut" placeholder="请选择电流输出类型" style="width: 100%;">
        		<el-option v-for="item in electricOutList" :key="item.value" :label="item.label" :value="item.value"
        			:disabled="item.disabled">
        		</el-option>
        	</el-select>
        </el-form-item>
				<el-form-item :label="'设备类型名称'" prop="deviceTypeName">
					<el-input v-model="formData.deviceTypeName" clearable />
				</el-form-item>
				<el-form-item :label="'端口数'" prop="portCount">
					<el-input type="number" v-model="formData.portCount" disabled />
					<div class="form-tip">创建后不可修改</div>
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
		findDeviceTypeList,
		saveDeviceType,
		deleteDeviceType,
		updateDeviceType,
		addDevice
	} from '@/api/device/deviceList.js'
	export default {
		name: 'deviceList1',
		props: {
			row_data: {
				type: Object
			}
		},
		data() {
			let checkNum = (rule, value, callback) => {
				if (!(/(^[1-9]\d*$)/.test(value))) {
					callback(new Error('请输入正整数'))
					return false;
				} else {
					callback()
				}
			}
			return {
				showDialog: false,
				formData: {
					deviceTypeName: '',
					portCount: '',
					deviceTypeId: '',
          electricOut:'',
					ruleId: ''
				},
				rules: {
					deviceTypeName: [{
						required: true,
						message: '请输入设备类型名称',
						trigger: 'blur'
					}],
					portCount: [{
						required: true,
						message: '请输入端口数',
						trigger: 'blur'
					}, {
						validator: checkNum,
						trigger: 'blur'
					}],
          ruleId: [{
          	required: true,
          	message: '请选择产品系列',
          	trigger: ['blur', 'change']
          }],
          electricOut: [{
          	required: true,
          	message: '请选择电流输出类型',
          	trigger: ['blur', 'change']
          }],
				},
				deviceRuleOptions: [],
				electricOutList: []
			}
		},
		mounted() {

		},
		methods: {
			onShowDialog() {
				this.formData.deviceTypeName = this.row_data.deviceTypeName
				this.formData.portCount = this.row_data.portCount
				this.formData.deviceTypeId = this.row_data.deviceTypeId
				this.formData.ruleId = this.row_data.ruleId
        this.formData.electricOut = this.row_data.electricOut
				this.$dict.getElectricOutOptionsForRule(this.formData.ruleId).then(list => {
					this.electricOutList = list || []
				})
				this.showDialog = true
			},
			formConfirm(formName) {
				this.$refs[formName].validate(valid => {
					if (valid) {
						updateDeviceType(this.formData).then(res => {
							if (res.code == 200) {
								this.showDialog = false
								this.$message.success(res.msg)
								this.resetForm(formName)
								this.$emit('getLists')
							} else {
								this.$message.error(res.msg)
							}
						})
					}
				})
			},
			//清除表单
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
      //更改电流输出
      onchangeEleetricOut(ruleId){
        console.log(ruleId)
        this.formData.electricOut = ''
        this.$dict.getElectricOutOptionsForRule(ruleId).then(list => {
          this.electricOutList = list || []
        })
      }
		},
		created() {
			this.$dict.getDeviceRuleOptions().then(list => { this.deviceRuleOptions = list || [] })
		},
	}
</script>

<style scoped="scoped">
	.portText {
		font-weight: bold;
		color: #000000;
		margin-top: 20px;
	}

	.form-tip {
		font-size: 12px;
		color: #909399;
		line-height: 1.5;
		margin-top: 4px;
	}
</style>

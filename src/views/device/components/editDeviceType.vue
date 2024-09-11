<template>
	<div style="display: inline-block;">
		<el-button type="primary" @click="onShowDevice"
			v-if="btnAuthen.permsVerifAuthention(':device:deviceList:oneEdit')" size="mini">编辑设备
		</el-button>
		<el-dialog :visible.sync="showDevice" title="编辑设备" @close="showDevice = false" :append-to-body="true">
			<el-form ref="formData" :model="formData" :rules="deviceRules" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;">
				<el-form-item :label="'设备号'" prop="deviceCode">
					<el-input v-model="formData.deviceCode" clearable placeholder="请输入设备号" disabled />
				</el-form-item>
				<el-form-item :label="'归属系列'" prop="ruleId">
					<el-radio-group v-model="formData.ruleId" @change="ruleIdChange($event)">
						<el-radio :label="1">单车</el-radio>
						<el-radio :label="2">汽车</el-radio>
					</el-radio-group>
				</el-form-item>
        <el-form-item :label="'电流输出'" prop="electricOut">
        	<el-select v-model="formData.electricOut" placeholder="请选择电流输出类型" style="width: 100%;" @change="currElectricOutChange">
        		<el-option v-for="item in electricOutList" :key="item.value" :label="item.label" :value="item.value"
        			:disabled="item.disabled">
        		</el-option>
        	</el-select>
        </el-form-item>
				<el-form-item :label="'设备类型'" prop="deviceTypeId">
					<el-select v-model="formData.deviceTypeId" style="margin-right: 20px ;width: 100%;"
						class="filter-item" placeholder="请选择设备类型" clearable>
						<el-option v-for="item in tags" :key="item.deviceTypeId" :label="item.deviceTypeName" :value="item.deviceTypeId">
              <!--:disabled="showDeviceType"-->
            </el-option>
					</el-select>
				</el-form-item>
        <el-form-item label="收费类型" prop="deviceChagePattern" v-if="formData.ruleId === 1">
        	<el-radio-group v-model="formData.deviceChagePattern" @change="changeChagePattern">
        		<el-radio :label="0">时间</el-radio>
        		<el-radio :label="1">电量</el-radio>
        		<el-radio :label="2">功率</el-radio>
        	</el-radio-group>
        </el-form-item>
        <el-form-item :label="'收费方案'" prop="devicePriceId">
        	<el-select v-model="formData.devicePriceId" class="filter-item" placeholder="请选择收费方案"
        		clearable style="width: 100%">
        		<el-option v-for="item in priceTypeList" :key="item.id" :label="item.feeName"
        			:value="item.id" />
        	</el-select>
        </el-form-item>
        <el-form-item :label="'总功率/W'" prop="deviceTotalPower">
        	<el-input v-model="formData.deviceTotalPower" clearable placeholder="请输入设备总功率" />
        </el-form-item>
				<el-form-item>
					<el-button type="primary" @click="confirm('formData')">确定</el-button>
					<el-button @click="showDevice = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
		findDeviceType,
		updateDevice,
		findDeviceInfoById,
    findDevicePriceByPriceType
	} from '@/api/device/deviceList.js'
	export default {
		props: {
			row_data: {
				type: Object,
				default: function() {
					return null
				}
			}
		},
		data() {
      let checkNum = (rule, value, callback) => {
      	if (!value) {
      		return new Error('必填信息')
      	} else {
      		let regx = /(^[1-9]\d*$)/;
      		if (!regx.test(value)) {
      			callback(new Error('请输入正整数'))
      		} else {
      			callback()
      		}
      	}
      }
			return {
				showDevice: false,
        showDeviceType: true,
				formData: {
					id: '',
					deviceCode: '',
          deviceTotalPower: '',
          electricOut: '',
					deviceTypeId: '',
          deviceChagePattern: '',
          devicePriceId: '',
					ruleId: ''
				},
        priceTypeList: [],
        electricOutName: '',
				deviceRules: {
					deviceCode: [{
						required: true,
						message: '请输入设备号',
						trigger: 'blur'
					}],
					deviceTypeId: [{
						required: true,
						message: '请选择设备类型',
						trigger: 'change'
					}],
          ruleId: [{
          	required: true,
          	message: '请选择归属系列',
          	trigger: 'change'
          }],
          electricOut: [{
          	required: true,
          	message: '请选择电流输出类型',
          	trigger: 'blur'
          }],
          devicePriceId: [{
          	required: true,
          	message: '请选择计费方案',
          	trigger: 'blur'
          }],
          deviceChagePattern: [{
          	required: true,
          	message: '请选择计费类型',
          	trigger: 'blur'
          }],
          deviceTotalPower: [{
          	required: true,
          	message: '请输入设备总功率',
          	trigger: 'blur'
          }, {
          	validator: checkNum,
          	trigger: 'blur'
          }],
				},
				tags: [],
        electricOutList:[
          {
            value:0,
            label:'交流充电桩'
          },
          {
            value:1,
            label:'直流充电桩'
          }
        ]
			}
		},
		methods: {
			onShowDevice() {
        console.log(this.row_data)
				this.showDevice = true
				this.formData.deviceCode = this.row_data.deviceCode
				this.formData.id = this.row_data.id
				this.formData.ruleId = this.row_data.ruleId ?? 1
				this.formData.deviceTypeId = this.row_data.deviceTypeId ? Number(this.row_data.deviceTypeId) : ''
        this.formData.electricOut = this.row_data.electricOut !== '' ? Number(this.row_data.electricOut) :''
        this.formData.deviceChagePattern = this.row_data.priceType !== '' ? Number(this.row_data.priceType) :''
        this.formData.devicePriceId = this.row_data.devicePriceId !== '' ? Number(this.row_data.devicePriceId) :''
        this.formData.deviceTotalPower = this.row_data.deviceTotalPower ? Number(this.row_data.deviceTotalPower) : ''
				this.initElectricOutList(this.formData.ruleId)
			},
      //选择收费类型
      changeChagePattern(e) {
      	console.log(e)
      	this.formData.deviceChagePattern = e
        this.formData.devicePriceId = ''
      	this.getDevicePriceByPriceType()
      },
      //获取方案列表
      getDevicePriceByPriceType() {
      	let ruleId = this.formData.ruleId
      	let deviceChagePattern = this.formData.deviceChagePattern
      	if (parseInt(deviceChagePattern) == 3) {
      		deviceChagePattern = 2
      	}
      	if (this.formData.ruleId === 2) {
      		deviceChagePattern = 1
      	}
      	let data = {
      		priceType: deviceChagePattern,
      		ruleId: ruleId
      	}
      	findDevicePriceByPriceType(data).then(res => {
      		if (res.code == 200) {
      			this.priceTypeList = res.data || []
      		}
      	})
      },
      ruleIdChange(ruleId){
        this.formData.deviceTypeId = '',
        this.formData.electricOut = '',
        this.initElectricOutList(ruleId)
      },
			initElectricOutList(ruleId) {
        this.electricOutList = []
			  if(ruleId === 1){
			    this.electricOutList =
			    [
			      {
			        value: 0,
			        label: '交流充电桩'
			      }
			    ];
			  }else if(ruleId === 2){
			    this.electricOutList =
			    [
			      {
			        value: 0,
			        label: '交流充电桩'
			      },
			      {
			        value: 1,
			        label: '直流充电桩'
			      },
			    ];
			  }
				this.getDeviceTypeList()
        this.getDevicePriceByPriceType()
			},
			getDeviceTypeList() {
				let ruleId = this.formData.ruleId
				let electricOut = this.formData.electricOut
				let data = {
					ruleId,
				  electricOut
				}
				findDeviceType(data).then(res => {
					if (res.code == 200) {
						this.tags = res.data || []
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			confirm(formName) {
				console.log(this.formData)
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						updateDevice(this.formData).then(res => {
							if (res.code == 200) {
								this.showDevice = false
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
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
      //监听修改事件
      currElectricOutChange(val){
        console.log(val)
        this.showDeviceType = false
        this.formData.deviceTypeId = ''
        this.getDeviceTypeList()
      }
		},
		created() {
		},
		mounted() {
		},
	}
</script>

<style lang="scss">

</style>

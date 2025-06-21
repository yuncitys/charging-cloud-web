<template>
  <div>
    <!-- <el-button style="margin: 15px 0;" type="primary" @click="openDialog">
      {{ isEdit? '编辑':'新增' }} 
    </el-button> -->
    <el-dialog :title="title" :visible.sync="dialogVisible" @close="dialogVisible = false" :append-to-body="true" :destroy-on-close="true" width="50%">
      <div style="width: 100%; height:100px;">
        <el-steps :active="currentStep" align-center>
          <el-step title="机构信息"></el-step>
          <el-step title="推送配置"></el-step>
        </el-steps>
      </div>
      <el-form v-if="currentStep === 1" ref="form" :model="form" :rules="rules" label-width="100px" label-position="left" style="width: 600px; margin-left:80px;">
        <el-form-item label="机构名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入机构名称(不可重复)" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入公司名称" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="信用代码" prop="socialCreditCode">
          <el-input v-model="form.socialCreditCode" placeholder="请输入统一社会信用代码" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="机构管理员" prop="manageName">
          <el-input v-model="form.manageName" placeholder="请输入机构管理员" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="contactInfo">
          <el-input v-model="form.contactInfo" placeholder="请输入联系方式" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="机构类型" prop="orgType">
          <el-radio-group v-model="form.orgType" :disabled = "isDetail">
            <el-radio :label="3">流量平台</el-radio>
            <el-radio :label="4">监管平台</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <el-form v-if="currentStep === 2" ref="form" :model="interconnectionOrganizationConf" :rules="rules" :inline="true" label-width="auto" style="width: auto; margin-left:60px;">
        <el-row>
          <el-col :span="12">
            <el-form-item label="接口URL" prop="apiUrl">
              <el-input v-model="interconnectionOrganizationConf.apiUrl" placeholder="请输入接口URL" :disabled = "isDetail"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="启充金额" prop="startChargingMoney">
              <el-input v-model="interconnectionOrganizationConf.startChargingMoney" placeholder="请输入启充金额(两位小数)" type = "number" :disabled = "isDetail">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="停充金额" prop="stopChargedMoney">
              <el-input v-model="interconnectionOrganizationConf.stopChargedMoney" placeholder="请输入停充金额(两位小数)" type = "number" :disabled = "isDetail">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="对账选择" prop="checkBillType">
              <el-radio-group v-model="interconnectionOrganizationConf.checkBillType" :disabled = "isDetail">
                <el-radio :label="0">线下手动</el-radio>
                <el-radio :label="1">线上推送</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格推送" prop="pushPriceType">
              <el-radio-group v-model="interconnectionOrganizationConf.pushPriceType" :disabled = "isDetail">
                <el-radio :label="0">标准价</el-radio>
                <el-radio :label="1">优惠价</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="电量小数位" prop="electricDecimal">
              <el-radio-group v-model="interconnectionOrganizationConf.electricDecimal" :disabled = "isDetail">
                <el-radio :label="2">两位</el-radio>
                <el-radio :label="3">三位</el-radio>
                <el-radio :label="4">四位</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备状态" prop="pushDeviceState">
              <el-radio-group v-model="interconnectionOrganizationConf.pushDeviceState" :disabled = "isDetail">
                <el-radio :label="false">不推送</el-radio>
                <el-radio :label="true">变位推送</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="启动充电推送" prop="pushStartCharge">
              <el-radio-group v-model="interconnectionOrganizationConf.pushStartCharge" :disabled = "isDetail">
                <el-radio :label="false">不推送</el-radio>
                <el-radio :label="true">推送</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束充电推送" prop="pushStopCharge">
              <el-radio-group v-model="interconnectionOrganizationConf.pushStopCharge" :disabled = "isDetail">
                <el-radio :label="false">不推送</el-radio>
                <el-radio :label="true">推送</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="实时数据" prop="pushRealTimeData">
              <el-radio-group v-model="interconnectionOrganizationConf.pushRealTimeData" :disabled = "isDetail">
                <el-radio :label="false">不推送</el-radio>
                <el-radio :label="true">推送</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="充电订单信息" prop="pushOrderInfo">
              <el-radio-group v-model="interconnectionOrganizationConf.pushOrderInfo" :disabled = "isDetail">
                <el-radio :label="false">不推送</el-radio>
                <el-radio :label="true">推送</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="currentStep > 1" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep < 2" type="primary" @click="nextStep('form')">下一步</el-button>
        <el-button v-if="currentStep === 2 && !isDetail" type="primary" @click="saveOrUpdate('form')">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>
  
<script>
  import {
    addOrganize,
		updateOrganize,
    getOrganizationConfig
	} from '@/api/organization/organization.js'
  import { title } from '@/settings';
  export default {
    props:{
        row_data:{
            type:Object
        }
	  },
    data() {
      return {
        dialogVisible: false,
        currentStep: 1,
        isEdit: false,
        isDetail: false,
        title: '新增',
        rules: {
					name: [{
						required: true,
						message: '请输入互联机构名称',
						trigger: 'blur'
					}],
					companyName: [{
						required: true,
						message: '请输入公司名称',
						trigger: 'blur'
					}],
          socialCreditCode: [{
						required: true,
						message: '请输入统一社会信用代码',
						trigger: 'blur'
					}],
          manageName: [{
						required: true,
						message: '请输入管理员名称',
						trigger: 'blur'
					}],
          contactInfo: [{
						required: true,
						message: '请输入联系方式',
						trigger: 'blur'
					}],
          startChargingMoney: [{
						required: true,
						message: '请输入开始充电金额',
						trigger: 'blur'
					}],
          stopChargedMoney: [{
						required: true,
						message: '请输入停止充电金额',
						trigger: 'blur'
					}],
          orgType: [{
						required: true,
						message: '请选择机构类型',
						trigger: 'blur'
					}],
          apiUrl: [{
						required: true,
						message: '请输入接口地址',
						trigger: 'blur'
					}],
          checkBillType: [{
						required: true,
						message: '请选择对象类型',
						trigger: 'blur'
					}],
          pushPriceType: [{
						required: true,
						message: '请选择价格推送类型',
						trigger: 'blur'
					}],
          pushDeviceState: [{
						required: true,
						message: '请选择设备数据推送',
						trigger: 'blur'
					}],
          electricDecimal: [{
						required: true,
						message: '请选择电量小数位',
						trigger: 'blur'
					}],
          pushStartCharge: [{
						required: true,
						message: '请选择开始充电推送',
						trigger: 'blur'
					}],
          pushStopCharge: [{
						required: true,
						message: '请选择结束充电推送',
						trigger: 'blur'
					}],
          pushRealTimeData: [{
						required: true,
						message: '请选择实时数据推送',
						trigger: 'blur'
					}],
          pushOrderInfo: [{
						required: true,
						message: '请选择订单推送',
						trigger: 'blur'
					}],
        },
        form: {
          id: '',
          parentId: 0,
          mainOrgId: 0,
          name: '',
          companyName: '',
          socialCreditCode: '',
          manageName: '',
          contactInfo: '',
          orgType: 4,
          orgMold: 1
        },
        interconnectionOrganizationConf: {
          apiUrl: '',
          startChargingMoney: '',
          stopChargedMoney: '',
          checkBillType: 0,
          electricDecimal: 3,
          pushPriceType: 0,
          pushDeviceState: true,
          pushStartCharge: true,
          pushStopCharge: true,
          pushRealTimeData: true,
          pushOrderInfo: true
        }
      };
    },
    methods: {
      openDialog(formData,isDetail) {
        this.dialogVisible = true;
        if(formData == null){
          this.isEdit = false
          this.isDetail = false
          this.title = '新增'
          this.currentStep = 1
          this.form = {
            id: '',
            parentId: 0,
            mainOrgId: 0,
            name: '',
            companyName: '',
            socialCreditCode: '',
            manageName: '',
            contactInfo: '',
            orgType: 4,
            orgMold: 1
          }
          this.interconnectionOrganizationConf =  {
            apiUrl: '',
            startChargingMoney: '',
            stopChargedMoney: '',
            checkBillType: 0,
            electricDecimal: 3,
            pushPriceType: 0,
            pushDeviceState: true,
            pushStartCharge: true,
            pushStopCharge: true,
            pushRealTimeData: true,
            pushOrderInfo: true
          }
        } else if (!isDetail) {
          this.isEdit = true
          this.title = '编辑'
          this.isDetail = false
          this.form = JSON.parse(JSON.stringify(formData));
          this.getOrganizationConfig(formData.id)
        } else {
          this.title = '详情'
          this.isDetail = true
          this.isEdit = false
          this.form = formData
          this.getOrganizationConfig(formData.id)
        }
      },
      nextStep(formName) {
        this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						if (this.currentStep < 2) this.currentStep++;
					} else {
						console.log("不通过")
						return false
					}
				})
      },
      prevStep() {
        if (this.currentStep > 1) this.currentStep--;
      },
      saveOrUpdate(formName){
        let isValid = false;
        this.$refs[formName].validate(valid => {
					isValid = valid
				})
        let data = this.form
        data.interconnectionOrganizationConf = this.interconnectionOrganizationConf
        console.log("表单数据:",data)
        if(this.isEdit){
          if (data.id == '' || data.id == null || data.id == undefined){
            this.$message.error('机构ID不能为空')
            return false
          }
          if (isValid) this.update(data)
        }else{
          if (isValid) this.save(data)
        }
      },
      save(data) {
        addOrganize(data).then(res => {
        	if (res.code == 200) {
            this.dialogVisible = false;
            this.currentStep = 1,
            this.resetForm('form')
            this.$emit('getOrganizeList')
            this.$message.success(res.msg)
        	} else {
            this.dialogVisible = true;
        		this.$message.error(res.msg)
        	}
        })
      },
      update(data) {
        updateOrganize(data).then(res => {
        	if (res.code == 200) {
            this.dialogVisible = false;
        		this.$message.success(res.msg)
            this.$emit('getOrganizeList')
        	} else {
            this.dialogVisible = true;
        		this.$message.error(res.msg)
        	}
        })
      },
      getOrganizationConfig(organizationId) {
        getOrganizationConfig(organizationId).then(res => {
        	if (res.code == 200) {
            this.interconnectionOrganizationConf = res.data
        	} else {
        		this.$message.error(res.msg)
        	}
        })
      },
      resetForm(formName) {
				this.$refs[formName].resetFields();
			},
    }
  };
</script>
  
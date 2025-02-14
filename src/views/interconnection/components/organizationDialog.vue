<template>
  <div>
    <!-- <el-button style="margin: 15px 0;" type="primary" @click="openDialog">
      {{ isEdit? '编辑':'新增' }} 
    </el-button> -->
    <el-dialog :title="isEdit ? '编辑' : '新增'" :visible.sync="dialogVisible" width="50%">
      <div style="width: 100%; height:100px;">
        <el-steps :active="currentStep" align-center>
          <el-step title="机构信息"></el-step>
          <el-step title="推送配置"></el-step>
        </el-steps>
      </div>

      <div v-if="currentStep === 1">
        <el-form :model="form" label-width="100px" label-position="left" style="width: 600px; margin-left:80px;">
          <el-form-item label="机构名称" required>
            <el-input v-model="form.organizationName" placeholder="请输入机构名称"></el-input>
          </el-form-item>
          <el-form-item label="公司名称" required>
            <el-input v-model="form.companyName" placeholder="请输入公司名称"></el-input>
          </el-form-item>
          <el-form-item label="信用代码" required>
            <el-input v-model="form.socialCreditCode" placeholder="请输入统一社会信用代码"></el-input>
          </el-form-item>
          <el-form-item label="机构管理员" required>
            <el-input v-model="form.administratorName" placeholder="请输入机构管理员"></el-input>
          </el-form-item>
          <el-form-item label="联系方式" required>
            <el-input v-model="form.administratorPhone" placeholder="请输入联系方式"></el-input>
          </el-form-item>
          <el-form-item label="启充金额" required>
            <el-input v-model="form.startChargingMoney" placeholder="请输入启充金额(两位小数)">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="停充金额" required>
            <el-input v-model="form.stopChargedMoney" placeholder="请输入停充金额(两位小数)">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="机构类型" required>
            <el-radio-group v-model="form.organizationType">
              <el-radio :label="0">流量平台</el-radio>
              <el-radio :label="1">监管平台</el-radio>
					  </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      
      <div v-if="currentStep === 2">
        <el-form :model="form" label-width="120px" label-position="left"  style="width: 600px; margin-left:80px;">
          <el-form-item label="接口URL" required>
            <el-input v-model="form.apiUrl" placeholder="请输入接口URL"></el-input>
          </el-form-item>
          <el-form-item label="对账选择" required>
            <el-radio-group v-model="form.checkBillType">
              <el-radio :label="0">线下手动</el-radio>
              <el-radio :label="1">线上推送</el-radio>
					  </el-radio-group>
          </el-form-item>
          <el-form-item label="价格推送" required>
            <el-radio-group v-model="form.pushPriceType">
              <el-radio :label="0">标准价</el-radio>
              <el-radio :label="1">优惠价</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="电量小数" required>
            <el-radio-group v-model="form.electricDecimal">
              <el-radio :label="2">两位</el-radio>
              <el-radio :label="3">三位</el-radio>
              <el-radio :label="4">四位</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="设备状态" required>
            <el-radio-group v-model="form.pushDeviceState">
              <el-radio :label="0">不推送</el-radio>
              <el-radio :label="1">变位推送</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="启动充电推送" required>
            <el-radio-group v-model="form.pushStartCharge">
              <el-radio :label="0">不推送</el-radio>
              <el-radio :label="1">推送</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="结束充电推送" required>
            <el-radio-group v-model="form.pushStopCharge">
              <el-radio :label="0">不推送</el-radio>
              <el-radio :label="1">推送</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="实时数据" required>
            <el-radio-group v-model="form.pushRealTimeData">
              <el-radio :label="0">不推送</el-radio>
              <el-radio :label="1">推送</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="充电订单信息" required>
            <el-radio-group v-model="form.pushOrderInfo">
              <el-radio :label="0">不推送</el-radio>
              <el-radio :label="1">推送</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="currentStep > 1" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep < 2" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="currentStep === 2" type="primary" @click="saveOrUpdate">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>
  
<script>
  import {
    addOrganize,
		updateOrganize
	} from '@/api/interconnection/organization.js'
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
        form: {}
      };
    },
    methods: {
      openDialog(formData) {
        this.dialogVisible = true;
        if(formData == null){
          this.isEdit = false
          this.form = {
            id: '',
            organizationName: '',
            companyName: '',
            socialCreditCode: '',
            administratorName: '',
            administratorPhone: '',
            startChargingMoney: '',
            stopChargedMoney: '',
            organizationType: 1,
            apiUrl: '',
            checkBillType: 0,
            electricDecimal: 3,
            pushPriceType: 0,
            pushDeviceState: 1,
            pushStartCharge: 1,
            pushStopCharge: 1,
            pushRealTimeData: 1,
            pushOrderInfo: 1
          }
        }else{
          this.isEdit = true
          this.form = formData
        }
      },
      nextStep() {
        if (this.currentStep < 2) this.currentStep++;
      },
      prevStep() {
        if (this.currentStep > 1) this.currentStep--;
      },
      saveOrUpdate(){
        if(this.isEdit){
          let data = this.form
          if (data.id == '' || data.id == null || data.id == undefined){
            this.$message.error('机构ID不能为空')
            return false
          }
          this.update()
        }else{
          this.save()
        }
      },
      save() {
        let data = this.form
        console.log('提交表单:', data);
        if (data.organizationName == ''){
          this.$message.error('请输入机构名称')
          return false
        }
        if (data.organizationType == ''){
          this.$message.error('请选择机构类型')
          return false
        }
        if (data.socialCreditCode == ''){
          this.$message.error('请输入统一社会信用代码')
          return false
        }
        if (data.administratorName == ''){
          this.$message.error('请输入机构管理员')
          return false
        }
        if (data.administratorPhone == ''){
          this.$message.error('请输入管理员联系方式')
          return false
        }
        addOrganize(data).then(res => {
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
      update() {
        let data = this.form
        console.log('提交表单:', data);
        if (data.organizationName == ''){
          this.$message.error('请输入机构名称')
          return false
        }
        if (data.organizationType == ''){
          this.$message.error('请选择机构类型')
          return false
        }
        if (data.socialCreditCode == ''){
          this.$message.error('请输入统一社会信用代码')
          return false
        }
        if (data.administratorName == ''){
          this.$message.error('请输入机构管理员')
          return false
        }
        if (data.administratorPhone == ''){
          this.$message.error('请输入管理员联系方式')
          return false
        }
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
      }
    }
  };
</script>
  
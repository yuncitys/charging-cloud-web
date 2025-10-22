<template>
  <div>
    <!-- <el-button style="margin: 15px 0;" type="primary" @click="openDialog">
      {{ isEdit? '编辑':'新增' }} 
    </el-button> -->
    <el-dialog :title="title" :visible.sync="dialogVisible" @close="dialogVisible = false" :append-to-body="true" :destroy-on-close="true" width="50%">
      <div style="width: 100%; height:100px;">
        <el-steps :active="currentStep" align-center>
          <el-step title="商户信息"></el-step>
          <el-step title="密钥信息"></el-step>
        </el-steps>
      </div>
      <el-form v-if="currentStep === 1" ref="form" :model="form" :rules="rules" label-width="120px" label-position="left" style="width: 600px; margin-left:80px;">
        <el-form-item label="商户名称" prop="name">
          <el-input v-model="form.name" placeholder="中文,英文,数字(长度1-30字数),不可重复" :disabled = "isDetail"></el-input>
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
      </el-form>
      <el-form v-if="currentStep === 2" ref="form" :model="form" :rules="rules" label-width="120px" label-position="left" style="width: 600px; margin-left:80px;">
        <el-form-item label="接口URL" prop="interconnectionUrl">
          <el-input v-model="form.interconnectionUrl" placeholder="请输入接口URL" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="商户密钥" prop="secretKey">
          <el-input v-model="form.secretKey" placeholder="请输入商户密钥" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="签名密钥" prop="signKey">
          <el-input v-model="form.signKey" placeholder="请输入签名密钥" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="初始化向量" prop="initializationVector">
          <el-input v-model="form.initializationVector" placeholder="请输入初始化向量" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="消息密钥" prop="dataEncryptionKey">
          <el-input v-model="form.dataEncryptionKey" placeholder="请输入消息密钥" :disabled = "isDetail"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="currentStep > 1" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep < 2" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="currentStep === 2 && !isDetail" type="primary" @click="saveOrUpdate">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>
  
<script>
  import {
    addMerchant,
		updateMerchant
	} from '@/api/interconnection/merchant.js'
  import { title } from '@/settings';
  export default {
    props:{
        row_data:{
            type:Object
        }
	  },
    data() {
      let checkPhone = (rule, value, callback) => {
        if (!(/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(value))) {
          callback(new Error('手机号码格式有误，请重填'))
          return false;
        } else {
          callback()
        }
      };
      return {
        dialogVisible: false,
        rules: {
					name: [{
						required: true,
						message: '请输入商户名称',
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
					}, {
						validator: checkPhone,
						trigger: 'blur'
					}],
          interconnectionUrl: [{
						required: true,
						message: '请输入接口地址',
						trigger: 'blur'
					}],
          secretKey: [{
						required: true,
						message: '请输入商户密钥',
						trigger: 'blur'
					}],
          signKey: [{
						required: true,
						message: '请输入签名密码',
						trigger: 'blur'
					}],
          initializationVector: [{
						required: true,
						message: '请输入初始化向量',
						trigger: 'blur'
					}],
          dataEncryptionKey: [{
						required: true,
						message: '请输入消息密钥',
						trigger: 'blur'
					}],
        },
        currentStep: 1,
        isEdit: false,
        isDetail: false,
        title: '新增',
        form: {
          id: '',
          name: '',
          companyName: '',
          socialCreditCode: '',
          manageName: '',
          contactInfo: '',
          interconnectionUrl: '',
          secretKey: '',
          signKey: '',
          initializationVector: '',
          dataEncryptionKey: ''
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
            name: '',
            companyName: '',
            socialCreditCode: '',
            manageName: '',
            contactInfo: '',
            interconnectionUrl: '',
            secretKey: '',
            signKey: '',
            initializationVector: '',
            dataEncryptionKey: ''
          }
        } else if (!isDetail) {
          this.isEdit = true
          this.title = '编辑'
          this.isDetail = false
          this.form = JSON.parse(JSON.stringify(formData));
        } else {
          this.title = '详情'
          this.isDetail = true
          this.isEdit = false
          this.form = formData
        }
      },
      nextStep() {
        this.$refs['form'].validate(valid => {
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
      saveOrUpdate(){
        let isValid = false;
        this.$refs['form'].validate(valid => {
					isValid = valid
				})
        let data = this.form
        console.log("表单数据:",data)
        if(this.isEdit){
          if (data.id == '' || data.id == null || data.id == undefined){
            this.$message.error('运营商ID不能为空')
            return false
          }
          if (isValid) this.update(data)
        }else{
          if (isValid) this.save(data)
        }
      },
      save(data) {
        addMerchant(data).then(res => {
        	if (res.code == 200) {
            this.dialogVisible = false;
            this.currentStep = 1,
            this.$refs['form'].resetFields();
            this.$emit('getMerchantList')
            this.$message.success(res.msg)
        	} else {
            this.dialogVisible = true;
        		this.$message.error(res.msg)
        	}
        })
      },
      update(data) {
        updateMerchant(data).then(res => {
        	if (res.code == 200) {
            this.dialogVisible = false;
        		this.$message.success(res.msg)
            this.$emit('getMerchantList')
        	} else {
            this.dialogVisible = true;
        		this.$message.error(res.msg)
        	}
        })
      }
    }
  };
</script>
  
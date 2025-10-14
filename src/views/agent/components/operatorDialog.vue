<template>
  <div>
    <!-- <el-button style="margin: 15px 0;" type="primary" @click="openDialog">
      {{ isEdit? '编辑':'新增' }} 
    </el-button> -->
    <el-dialog :title="title" :visible.sync="dialogVisible" @close="dialogVisible = false" :append-to-body="true" :destroy-on-close="true" width="50%">
      <div style="width: 100%; height:100px;" v-show="visibleStep">
        <el-steps :active="currentStep" align-center>
          <el-step title="主体信息"></el-step>
          <el-step title="账号信息"></el-step>
        </el-steps>
      </div>
      <el-form ref="form" v-show="currentStep === 1" :model="form" :rules="rules" label-width="100px" label-position="left" style="width: 600px; margin-left:80px;">
        <el-form-item label="主体名称" prop="name">
          <el-input v-model="form.name" placeholder="中文,英文,数字(长度1-30字数),不可重复" :disabled = "isDetail" maxlength="30"></el-input>
        </el-form-item>
        <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入公司名称" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="信用代码" prop="socialCreditCode">
          <el-input v-model="form.socialCreditCode" placeholder="请输入统一社会信用代码" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="管理员" prop="manageName">
          <el-input v-model="form.manageName" placeholder="请输入租户管理员" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="contactInfo">
          <el-input v-model="form.contactInfo" placeholder="请输入联系方式" :disabled = "isDetail"></el-input>
        </el-form-item>
      </el-form>
      <el-form ref="accountData" v-show="currentStep === 2 && visibleStep" :model="accountData" :rules="accountRules" label-width="100px" label-position="left" style="width: 600px; margin-left:80px;">
				<el-form-item :label="'登录账号'" prop="adminName">
					<el-input v-model="accountData.adminName" placeholder="请输入登录账号" clearable />
				</el-form-item>
				<el-form-item :label="'姓名'" prop="adminFullname">
					<el-input v-model="accountData.adminFullname" placeholder="请输入姓名" clearable />
				</el-form-item>
				<el-form-item :label="'手机号'" prop="adminPhone">
					<el-input v-model="accountData.adminPhone" placeholder="请输入手机号" clearable />
				</el-form-item>
				<el-form-item :label="'角色'" prop="roleId" style="width: 100%;">
					<el-select v-model="accountData.roleId" class="filter-item" placeholder="请选择角色" clearable
						@keyup.enter.native="handleFilter" style="width: 100%;">
						<el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id" />
					</el-select>
				</el-form-item>
			</el-form>
      <!-- <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="!isDetail" type="primary" @click="saveOrUpdate">保存</el-button>
      </span> -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="currentStep > 1" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep < 2 && visibleStep" @click="nextStep">下一步</el-button>
        <el-button v-if="isSave" type="primary" @click="saveOrUpdate">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>
  
<script>
  import {
    addOperator,
		updateOperator
	} from '@/api/operator/operator.js'
  import {
  	findRoleAllList as getRoleList,
  } from '@/api/permission/role.js'
  import {
		addAdminUser
	} from '@/api/agent/agentList.js'
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
      let checkNameLength = (rule, value, callback) => {
        if (value.length > 30) {
          callback(new Error('中文,英文,数字(长度1-30字数),不可重复'))
          return false;
        } else {
          callback()
        }
      }
      return {
        dialogVisible: false,
        visibleStep: true,
        rules: {
					name: [{
						required: true,
						message: '请输入商户名称',
						trigger: 'blur'
					}, {
						validator: checkNameLength,
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
					}]
        },
        currentStep: 1,
        isDetail: false,
        isSave: false,
        title: '新增',
        form: {
          operatorId: '',
          name: '',
          companyName: '',
          socialCreditCode: '',
          manageName: '',
          contactInfo: '',
        },
        accountData: {
					adminName: '',
					adminFullname: '',
					adminPhone: '',
					roleId: '',
				},
				accountRules: {
					adminName: [{
						required: true,
						message: '请输入登录账号',
						trigger: 'blur'
					}],
					adminFullname: [{
						required: true,
						message: '请输入姓名',
						trigger: 'blur'
					}],
					adminPhone: [{
						required: true,
						message: '请输入手机号',
						trigger: 'blur'
					}, {
						validator: checkPhone,
						trigger: 'blur'
					}],
					roleId: [{
						required: true,
						message: '请选择角色',
						trigger: 'blur'
					}],
				},
        roleList: []
      };
    },
    methods: {
      openDialog(formData,isDetail) {
        this.dialogVisible = true;
        this.findRoleAllList()
        if(formData == null){
          this.isDetail = false
          this.visibleStep = true
          this.isSave = true
          this.title = '新增'
          this.currentStep = 1
          this.form = {
            operatorId: '',
            name: '',
            companyName: '',
            socialCreditCode: '',
            manageName: '',
            contactInfo: '',
          }
          this.accountData = {
            tenantId: '',
            adminName: '',
            adminFullname: '',
            adminPhone: '',
            roleId: '',
				  }
        } else if (!isDetail) {
          this.title = '编辑'
          this.currentStep = 1
          this.isDetail = false
          this.visibleStep = false
          this.isSave = true
          this.form = JSON.parse(JSON.stringify(formData));
        } else {
          this.title = '详情'
          this.currentStep = 1
          this.isDetail = true
          this.visibleStep = false
          this.isSave = false
          this.form = formData
        }
      },
      findRoleAllList() {
				getRoleList().then(res => {
					if (res.code == 200) {
						this.roleList = res.data
					}
				})
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
        if(data.operatorId){
          if (data.operatorId == '' || data.operatorId == null || data.operatorId == undefined){
            this.$message.error('运营商ID不能为空')
            return false
          }
          if( isValid ) this.update(data)
        }else{
          if( isValid ) this.save(data)
        }
      },
      save(data) {
        addOperator(data).then(res => {
        	if (res.code == 200) {
            let accountData = this.accountData
            accountData.tenantId = res.data.operatorId
            addAdminUser(accountData).then(res => {
              if (res.code == 200) {
                this.dialogVisible = false;
                this.$refs['form'].resetFields();
                this.$refs['accountData'].resetFields();
                this.$emit('getLists')
                this.$message.success(res.msg)
              } else {
                this.$message.error(res.msg)
              }
						})
        	} else {
            this.dialogVisible = true;
        		this.$message.error(res.msg)
        	}
        })
      },
      update(data) {
        updateOperator(data).then(res => {
        	if (res.code == 200) {
            this.dialogVisible = false;
        		this.$message.success(res.msg)
            this.$emit('getLists')
        	} else {
            this.dialogVisible = true;
        		this.$message.error(res.msg)
        	}
        })
      }
    }
  };
</script>

<style lang="scss" scoped>
>>> .el-form {
  .el-form-item {
    display: flex;
    width: 100%;
    padding-right: 10px;

    .el-form-item__label-wrap {
      margin-left: 0;
    }

    .el-date-editor,
    .el-select,
    .el-form-item__content {
      width: 100%;
      flex: 1;
    }
  }
}
</style>
  
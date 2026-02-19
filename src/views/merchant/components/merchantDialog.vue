<template>
  <div>
    <!-- <el-button style="margin: 15px 0;" type="primary" @click="openDialog">
      {{ isEdit? '编辑':'新增' }} 
    </el-button> -->
    <el-dialog :title="title" :visible.sync="dialogVisible" @close="dialogVisible = false" :append-to-body="true" :destroy-on-close="true" width="50%">
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
        <el-form-item label="开票类型：" prop="invoiceType">
					<el-radio-group v-model="form.invoiceType" :disabled = "isDetail">
            <el-radio :label="0">不开票</el-radio>
						<el-radio :label="1">普票</el-radio>
						<el-radio :label="2">专票</el-radio>
            <el-radio :label="3">普票和专票</el-radio>
					</el-radio-group>
				</el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" type="textarea" :disabled = "isDetail"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="!isDetail" type="primary" @click="saveOrUpdate">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>
  
<script>
  import {
    addMerchant,
		updateMerchant
	} from '@/api/merchant/merchant.js'
  export default {
    props:{
        row_data:{
            type:Object
        }
	  },
    data() {
      let checkPhone = (rule, value, callback) => {
        if (!(/^(?:1[3-9]\d{9}|0\d{2,3}[-#]?\d{7,8}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})$/.test(value))) {
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
      };
      let checkSocialCreditCodeLength = (rule, value, callback) => {
        if (value.length < 18) {
          callback(new Error('英文,数字(长度不能低于18位字数),不可重复'))
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
					}, {
						validator: checkSocialCreditCodeLength,
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
          invoiceType: [{
						required: true,
						message: '请选择开票类型',
						trigger: 'blur'
					}],
        },
        currentStep: 1,
        isDetail: false,
        isSave: false,
        title: '新增',
        form: {
          id: '',
          typq: 1,
          name: '',
          companyName: '',
          socialCreditCode: '',
          manageName: '',
          contactInfo: '',
          invoiceType: '',
          remark: ''
        },
      };
    },
    methods: {
      openDialog(formData,isDetail) {
        this.dialogVisible = true;
        if(formData == null){
          this.isDetail = false
          this.visibleStep = true
          this.isSave = true
          this.title = '新增'
          this.currentStep = 1
          this.form = {
            id: '',
            type: 1,
            name: '',
            companyName: '',
            socialCreditCode: '',
            manageName: '',
            contactInfo: '',
            invoiceType: '',
            remark: ''
          }
        } else if (!isDetail) {
          this.title = '编辑'
          this.currentStep = 1
          this.isDetail = false
          this.visibleStep = false
          this.isSave = false
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
      saveOrUpdate(){
        let isValid = false;
        this.$refs['form'].validate(valid => {
					isValid = valid
				})
        let data = this.form
        console.log("表单数据:",data)
        if(data.id){
          if (data.id == '' || data.id == null || data.id == undefined){
            this.$message.error('ID不能为空')
            return false
          }
          if( isValid ) this.update(data)
        }else{
          if( isValid ) this.save(data)
        }
      },
      save(data) {
        addMerchant(data).then(res => {
        	if (res.code == 200) {
            this.dialogVisible = false;
            this.$refs['form'].resetFields();
            this.$emit('getLists')
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
  
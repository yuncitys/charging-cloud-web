<template>
  <div>
    <el-dialog :title="title" :visible.sync="dialogVisible" @close="dialogVisible = false" :append-to-body="true" :destroy-on-close="true" width="50%">
      <div style="width: 100%; height:100px;">
        <el-steps :active="currentStep" align-center>
          <el-step title="互联客户密钥"></el-step>
          <el-step title="运营商户密钥"></el-step>
        </el-steps>
      </div>

      <el-form v-if="currentStep === 1" ref="form" :model="form" :rules="rules" label-width="120px" label-position="left" style="width: 600px; margin-left:80px;">
        <el-form-item label="互联机构" prop="organizationId">
          <el-select style="width: 100%;" class="filter-item" v-model="form.organizationId" filterable clearable placeholder="请选择互联机构" :disabled = "isDetail">
              <el-option
                  v-for="item in organizeList"
                  :key='item.id'
                  :label="item.name"
                  :value="item.id + ''">
              </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="机构密钥" prop="organizationSecret">
          <el-input v-model="form.organizationSecret" placeholder="请输入机构密钥" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="签名密钥" prop="organizationSigSecret">
          <el-input v-model="form.organizationSigSecret" placeholder="请输入签名密钥" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="初始化向量" prop="organizationDataSecretIv">
          <el-input v-model="form.organizationDataSecretIv" placeholder="请输入初始化向量" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="消息密钥" prop="organizationDataSecret">
          <el-input v-model="form.organizationDataSecret" placeholder="请输入消息密钥" :disabled = "isDetail"></el-input>
        </el-form-item>
      </el-form>
      <el-form v-if="currentStep === 2" ref="form" :model="form" :rules="rules" label-width="120px" label-position="left" style="width: 600px; margin-left:80px;">
        <el-form-item label="运营商户" prop="operatorId">
            <el-select style="width: 100%;" class="filter-item" v-model="form.operatorId" filterable clearable placeholder="请选择运营商户" :disabled = "isDetail">
                <el-option
                    v-for="item in operatorList"
                    :key="item.operatorId"
                    :label="item.name"
                    :value="item.operatorId + ''">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="商户密钥" prop="operatorSecret">
          <el-input v-model="form.operatorSecret" placeholder="请输入推送方密钥" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="签名密钥" prop="operatorSigSecret">
          <el-input v-model="form.operatorSigSecret" placeholder="请输入签名密钥" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="初始化向量" prop="operatorDataSecretIv">
          <el-input v-model="form.operatorDataSecretIv" placeholder="请输入初始化向量" :disabled = "isDetail"></el-input>
        </el-form-item>
        <el-form-item label="消息密钥" prop="operatorDataSecret">
          <el-input v-model="form.operatorDataSecret" placeholder="请输入消息密钥" :disabled = "isDetail"></el-input>
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
      getOrganize,
      addOrganizeSecretKey,
      updateOrganizeSecretKey
    } from '@/api/organization/organization.js'
    import {
      getOperatorList
    } from '@/api/operator/operator.js'
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
                rules: {
                  operatorId: [{
                    required: true,
                    message: '请选择运营商户',
                    trigger: 'blur'
                  }],
                  organizationId: [{
                    required: true,
                    message: '请选择互联机构',
                    trigger: 'blur'
                  }],
                  // organizationIdentify: [{
                  //   required: true,
                  //   message: '请输入统一社会信用代码',
                  //   trigger: 'blur'
                  // }],
                  organizationSecret: [{
                    required: true,
                    message: '请输入机构密钥',
                    trigger: 'blur'
                  }],
                  organizationDataSecret: [{
                    required: true,
                    message: '请输入机构消息密钥',
                    trigger: 'blur'
                  }],
                  organizationDataSecretIv: [{
                    required: true,
                    message: '请输入机构初始化向量',
                    trigger: 'blur'
                  }],
                  organizationSigSecret: [{
                    required: true,
                    message: '请输入机构签名密钥',
                    trigger: 'blur'
                  }],
                  // operatorIdentify: [{
                  //   required: true,
                  //   message: '请输入统一社会信用代码',
                  //   trigger: 'blur'
                  // }],
                  operatorSecret: [{
                    required: true,
                    message: '请输入商户密钥',
                    trigger: 'blur'
                  }],
                  operatorDataSecret: [{
                    required: true,
                    message: '请输入商户消息密钥',
                    trigger: 'blur'
                  }],
                  operatorDataSecretIv: [{
                    required: true,
                    message: '请输入商户初始化向量',
                    trigger: 'blur'
                  }],
                  operatorSigSecret: [{
                    required: true,
                    message: '请输入商户签名密钥',
                    trigger: 'blur'
                  }],
                },
                form: {
                  id: '',
                  operatorId: '',
                  organizationId: '',
                  organizationIdentify: '',
                  organizationSecret: '',
                  organizationDataSecret: '',
                  organizationDataSecretIv: '',
                  organizationSigSecret: '',
                  operatorIdentify: '',
                  operatorSecret: '',
                  operatorDataSecret: '',
                  operatorDataSecretIv: '',
                  operatorSigSecret: '',
                },
                title: '新增',
                organizeList: [],
                operatorList: []
            };
        },
      methods: {
        getOperator() {
          getOperatorList().then(res => {
              this.operatorList = res.data
          })
        },
        getOrganize(){
          let data = {orgMold: 2}
          getOrganize(data).then(res => {
              this.organizeList = res.data
          })
        },
        openDialog(formData,isDetail) {
          this.dialogVisible = true;
          this.getOrganize()
          this.getOperator()
          if(formData == null){
            this.isEdit = false
            this.isDetail = false
            this.title = '新增'
            this.currentStep = 1
            this.form = {
              id: '',
              operatorId: '',
              organizationId: '',
              organizationIdentify: '',
              organizationSecret: '',
              organizationDataSecret: '',
              organizationDataSecretIv: '',
              organizationSigSecret: '',
              operatorIdentify: '',
              operatorSecret: '',
              operatorDataSecret: '',
              operatorDataSecretIv: '',
              operatorSigSecret: '',
            }
          } else if(!isDetail){
            this.isEdit = true
            this.title = '编辑'
            this.isDetail = false
            this.form = formData
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
          console.log('提交表单:', data);
          if(this.isEdit){
            if (data.id == '' || data.id == null || data.id == undefined){
                this.$message.error('ID不能为空')
                return false
            }
            if (isValid) this.update(data)
          }else{
            if (isValid) this.save(data)
          }
        },
        save(data) {
          addOrganizeSecretKey(data).then(res => {
              if (res.code == 200) {
                this.dialogVisible = false;
                this.$message.success(res.msg)
                this.$emit('getOrganizeSecretKeyList')
              } else {
                this.dialogVisible = true;
                this.$message.error(res.msg)
              }
          })
        },
        update(data) {
          updateOrganizeSecretKey(data).then(res => {
              if (res.code == 200) {
                this.dialogVisible = false;
                this.$message.success(res.msg)
                this.$emit('getOrganizeSecretKeyList')
              } else {
                this.dialogVisible = true;
                this.$message.error(res.msg)
              }
          })
        }
      }
    };
  </script>
    
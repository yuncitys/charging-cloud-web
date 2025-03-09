<template>
    <div>
      <el-dialog :title="title" :visible.sync="dialogVisible" width="50%">
        <div style="width: 100%; height:100px;">
          <el-steps :active="currentStep" align-center>
            <el-step title="互联客户密钥"></el-step>
            <el-step title="运营商密钥"></el-step>
          </el-steps>
        </div>
  
        <div v-if="currentStep === 1">
          <el-form :model="form" label-width="100px" label-position="left" style="width: 600px; margin-left:80px;">
            <el-form-item label="互联机构" required>
                <el-select style="width: 100%;" class="filter-item" v-model="form.organizationId" filterable clearable placeholder="请选择互联机构" :disabled = "isDetail">
                    <el-option
                        v-for="item in organizeList"
                        :key='item.id'
                        :label="item.organizationName"
                        :value="item.id + ''">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="机构密钥" required>
              <el-input v-model="form.reqOperatorSecret" placeholder="请输入机构密钥" :disabled = "isDetail"></el-input>
            </el-form-item>
            <el-form-item label="签名密钥" required>
              <el-input v-model="form.reqDataSecret" placeholder="请输入签名密钥" :disabled = "isDetail"></el-input>
            </el-form-item>
            <el-form-item label="初始化向量" required>
              <el-input v-model="form.reqDataSecretIv" placeholder="请输入初始化向量" :disabled = "isDetail"></el-input>
            </el-form-item>
            <el-form-item label="消息密钥" required>
              <el-input v-model="form.reqSigSecret" placeholder="请输入消息密钥" :disabled = "isDetail"></el-input>
            </el-form-item>
          </el-form>
        </div>
        
        <div v-if="currentStep === 2">
          <el-form :model="form" label-width="120px" label-position="left"  style="width: 600px; margin-left:80px;">
            <el-form-item label="推送方" required>
                <el-select style="width: 100%;" class="filter-item" v-model="form.operatorId" filterable clearable placeholder="请选择推送方" :disabled = "isDetail">
                    <el-option
                        v-for="item in operatorList"
                        :key="item.id"
                        :label="item.adminFullname"
                        :value="item.id + ''">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="推送方密钥" required>
              <el-input v-model="form.resOperatorSecret" placeholder="请输入机构密钥" :disabled = "isDetail"></el-input>
            </el-form-item>
            <el-form-item label="签名密钥" required>
              <el-input v-model="form.resDataSecret" placeholder="请输入签名密钥" :disabled = "isDetail"></el-input>
            </el-form-item>
            <el-form-item label="初始化向量" required>
              <el-input v-model="form.resDataSecretIv" placeholder="请输入初始化向量" :disabled = "isDetail"></el-input>
            </el-form-item>
            <el-form-item label="消息密钥" required>
              <el-input v-model="form.resSigSecret" placeholder="请输入消息密钥" :disabled = "isDetail"></el-input>
            </el-form-item>
          </el-form>
        </div>
        
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
    } from '@/api/interconnection/organization.js'
    import {
	  getOperator
	} from '@/api/agent/agentList.js'
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
                form: {
                  id: '',
                  operatorId: '',
                  organizationId: '',
                  reqOperatorIdentify: '',
                  reqOperatorSecret: '',
                  reqDataSecret: '',
                  reqDataSecretIv: '',
                  reqSigSecret: '',
                  resOperatorIdentify: '',
                  resOperatorSecret: '',
                  resDataSecret: '',
                  resDataSecretIv: '',
                  resSigSecret: '',
                },
                title: '新增',
                organizeList: [],
                operatorList: []
            };
        },
      methods: {
        getOperator() {
            getOperator().then(res => {
                this.operatorList = res.data
            })
        },
        getOrganize(){
            getOrganize().then(res => {
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
          if (this.currentStep < 2) this.currentStep++;
        },
        prevStep() {
          if (this.currentStep > 1) this.currentStep--;
        },
        saveOrUpdate(){
          let data = this.form
          console.log('提交表单:', data);
          if (data.operatorId == ''){
              this.$message.error('运营商不能为空')
              return false
          }
          if (data.organizationId == ''){
              this.$message.error('机构不能为空')
              return false
          }
          if(this.isEdit){
              if (data.id == '' || data.id == null || data.id == undefined){
                  this.$message.error('ID不能为空')
                  return false
              }
              this.update(data)
          }else{
              this.save(data)
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
    
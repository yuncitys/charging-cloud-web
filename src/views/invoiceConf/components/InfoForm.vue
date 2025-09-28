<template>
  <transition name="el-zoom-in-center">
    <div class="edit-preview-main">
      <div class="common-page-header">
        <el-page-header @back="goBack" :content="isViewFlag ? '查看': dataForm.id ? '编辑' : '新增'"/>
        <div class="options">
          <el-button type="primary" @click="dataFormSubmit()" v-if="!isViewFlag">确 定</el-button>
          <el-button @click="goBack">取 消</el-button>
        </div>
      </div>
      <el-row :gutter="50" class="main" :style="{margin: '0 auto',width: '100%', padding: '30px 0', flex:1, overflowY:'auto'}">
        <el-form ref="elForm" :model="dataForm" :rules="rules" size="small" label-width="120px" label-position="right">
          <el-col :span="18" style="height: 100%;">
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item label="企业税号" prop="taxNumber">
                  <el-input v-model="dataForm.taxNumber" placeholder="请输入企业税号" maxlength="50" clearable :style='{"width":"100%"}' :disabled="true"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="用户名" prop="name">
                  <el-input v-model="dataForm.name" placeholder="请输入用户名" maxlength="100" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="开票账户" prop="account">
                  <el-input v-model="dataForm.account" placeholder="请输入开票账户" maxlength="50" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="密码" prop="password">
                  <el-input type="password" v-model="dataForm.password" placeholder="请输入密码" maxlength="30" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话" prop="telephoneNumber">
                  <el-input v-model="dataForm.telephoneNumber" placeholder="请输入联系电话" oninput="value=value.replace(/[^\d]/g,'')" maxlength="11" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="地区编码" prop="regionCode">
                  <el-input v-model="dataForm.regionCode" placeholder="请输入地区编码" maxlength="30" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <!-- <el-col :span="12">
                <el-form-item label="身份类型">
                  <el-select v-model="dataForm.roleClass" placeholder="请选择身份类型" :style='{"width":"100%"}' @change="changeClass" :disabled="isViewFlag">
                    <el-option v-for="item in roleClassList"
                               :key="item.enCode"
                               :label="item.fullName"
                               :value="item.enCode"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col> -->
              <el-col :span="12">
                <el-form-item label="开票身份" prop="roleType" >
                  <el-select v-model="dataForm.roleType" placeholder="请选择身份" :style='{"width":"100%"}' :disabled="isViewFlag">
                    <el-option v-for="item in roleTypeList"
                               :key="item.enCode"
                               :label="item.fullName"
                               :value="item.enCode"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="线路标识" prop="channelFlag" >
                  <el-select v-model="dataForm.channelFlag" placeholder="请选择线路标识" :style='{"width":"100%"}' :disabled="isViewFlag">
                    <el-option v-for="item in channelFlagList"
                               :key="item.enCode"
                               :label="item.fullName"
                               :value="item.enCode"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="有效标识" prop="status">
                  <el-switch v-model="dataForm.status" active-value="0" inactive-value="1" :disabled="isViewFlag"></el-switch>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-form>
      </el-row>
    </div>
  </transition>
</template>

<script>
import { save, update } from '@/api/invoiceConf/loginConf'
export default {
  name: 'Form',
  props: {
  },
  data() {
    return {
      dataForm: {
        id:null,
        name:'',
        taxNumber:'',
        account:'',
        password:'',
        telephoneNumber:'',
        regionCode:'',
        roleType:'',
        roleClass:'3',
        channelFlag:'3',
        status:'1'
      },
      roleTypeList:[],
      roleClassList:[
        { 'fullName': '旺企数电', 'enCode': '3' }, 
        { 'fullName': '票通', 'enCode': '4' }
      ],
      channelFlagList:[
        { 'fullName': '线路一', 'enCode': '1' }, 
        { 'fullName': '线路二', 'enCode': '2' }, 
        { 'fullName': '线路三', 'enCode': '3' }
      ],
      isViewFlag: false,

      rules: {
        name:[
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
        taxNumber:[
          { required: true, message: '请输入企业税号', trigger: 'blur' },
        ],
        account:[
          { required: true, message: '请输入开票账户', trigger: 'blur' },
        ],
        password:[
          { required: true, message: '请输入密码', trigger: 'blur' },
        ],
        telephoneNumber:[
          { required: true, message: '请输入联系电话', trigger: 'blur' },
        ],
        regionCode:[
          { required: true, message: '请输入地区编码', trigger: 'blur' },
        ],
        roleType:[
          { required: true, message: '请选择身份', trigger: 'blur' },
        ]
      },
      query:null
    }
  },
  created() {
    
  },
  methods: {
    changeClass(){
      if(this.dataForm.roleClass == '3'){
        this.getWqRoleList();
      }else if(this.dataForm.roleClass == '4'){
        this.getPtRoleList();
      }
      this.dataForm.roleType = '';
    },
    getPtRoleList(){
      this.roleTypeList = [
        { 'fullName': '法定代表人', 'enCode': '01' }, 
        { 'fullName': '财务负责人', 'enCode': '02' },
        { 'fullName': '办税员', 'enCode': '03' }, 
        { 'fullName': '涉税服务人员', 'enCode': '04' }, 
        { 'fullName': '管理员', 'enCode': '05' }, 
        { 'fullName': '领票人', 'enCode': '07' }, 
        { 'fullName': '开票员', 'enCode': '09' }, 
        { 'fullName': '其他人员', 'enCode': '99' },
      ]
    },
    getWqRoleList(){
      this.roleTypeList = [
        { 'fullName': '法定代表人', 'enCode': '2' }, 
        { 'fullName': '财务负责人', 'enCode': '1' },
        { 'fullName': '办税员', 'enCode': '3' }, 
        { 'fullName': '购票员', 'enCode': '4' }, 
        { 'fullName': '普通管理员', 'enCode': '5' }, 
        { 'fullName': '社保经办人', 'enCode': '8' }, 
        { 'fullName': '开票员', 'enCode': '7' }, 
        { 'fullName': '销售人员', 'enCode': '10' },
      ]
    },
    goBack() {
      this.isViewFlag = false
      this.$parent.search();
      this.$parent.isAdd = true
    },
    initInfo(data,query) {
      this.query = query;
      this.reset();
      if (data) {
        this.dataForm ={
          id:data.id,
          name:data.name,
          taxNumber:data.taxNumber,
          account:data.account,
          password:data.password,
          telephoneNumber:data.telephoneNumber,
          regionCode:data.regionCode,
          roleType:data.roleType,
          roleClass:data.roleClass,
          channelFlag:data.channelFlag,
          status:data.status
        }
      }else{
        this.getPtRoleList();
      }
    },
    viewDetail(data){
      if (data) {
        this.isViewFlag = true;
        this.dataForm ={
          id:data.id,
          name:data.name,
          taxNumber:data.taxNumber,
          account:data.account,
          password:data.password,
          telephoneNumber:data.telephoneNumber,
          regionCode:data.regionCode,
          roleType:data.roleType,
          roleClass:data.roleClass,
          channelFlag:data.channelFlag,
          status:data.status
        }
      }
    },
    reset(){
      this.isViewFlag = false;
      console.log("this.query",this.query)
      this.dataForm = {
        id:null,
        name:'',
        taxNumber:this.query.taxNumber,
        account:'',
        password:'',
        telephoneNumber:'',
        regionCode:'',
        roleType:'',
        roleClass:this.query.type,
        channelFlag:'3',
        status:'1'
      }
      this.changeClass();
    },
    dataFormSubmit() {
      this.$refs.elForm.validate(valid => {
        if (valid) {
          if(this.dataForm.id){
            update(this.dataForm).then(res => {
              if (res.code === 200) {
                this.$message.success(res.msg)
                setTimeout(() => {
                  this.goBack()
                  this.$parent.search();
                }, 1000)
              }else{
                this.$message.error(res.msg);
              }
            })
          }else{
            save(this.dataForm).then(res => {
              if (res.code === 200) {
                this.$message.success(res.msg)
                setTimeout(() => {
                  this.goBack()
                  this.$parent.search();
                }, 1000)
              }else{
                this.$message.error(res.msg);
              }
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-preview-main {
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  height: calc(100vh - 100px);
  background: rgba(255, 255, 255, 1);
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.common-page-header {
  padding: 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid #dcdfe6;

  .options {
    flex-shrink: 0;
    margin-left: auto;
  }

  .el-page-header {
    .el-page-header__left {
      flex-shrink: 0;
    }

    .el-page-header__content {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.common-page-main {
  padding: 30px;
  height: 100%;

  .common-title {
    border-bottom: 1px solid #dcdfe6;
    overflow: hidden;

    h3 {
      font-size: 14px;
      line-height: 32px;
      float: left;
      padding: 0;
      margin: 0;
    }
  }
}

.table-actions {
  cursor: pointer;
  text-align: center;
  border: 1px dashed rgba(0, 0, 255, 0.51);

  &:active {
    border: 1px dashed rgba(0, 0, 255, 1);
  }
}
.activity-img{
  position: relative;
  width: 150px;
  height: 150px;
  .del-icon{
    position: absolute;
    right: -12px;
    top: -12px;
    width: 24px;
    height: 24px;
    background-color: #fff;
    border-radius: 12px;
    cursor: pointer;
  }
  .el-icon-error{
    font-size: 24px;
    color:#ff0000 ;
    
  }
}
.avatar-uploader {
  >>> .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: #409EFF;
    }
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 150px;
    height: 150px;
    line-height: 150px;
    text-align: center;
  }
}
</style>

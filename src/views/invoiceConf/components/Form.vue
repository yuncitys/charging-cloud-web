<template>
  <transition name="el-zoom-in-center">
    <div class="edit-preview-main">
      <div class="common-page-header">
        <el-page-header @back="goBack" :content="dataForm.id ? '编辑' : isViewFlag ? '查看': '新增'"/>
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
                <el-form-item label="运营商户" prop="tenantId">
                  <el-select v-model="dataForm.tenantId" placeholder="请选择商户" :style='{"width":"100%"}' :disabled="isViewFlag">
                    <el-option
                      v-for="item in merchantList"
                      :key="item.operatorId"
                      :label="item.name"
                      :value="item.operatorId + ''">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业抬头" prop="name">
                  <el-input v-model="dataForm.name" placeholder="请输入企业抬头" maxlength="100" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业税号" prop="taxNumber">
                  <el-input v-model="dataForm.taxNumber" placeholder="请输入企业税号" maxlength="50" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业代码" prop="enterpriseCode">
                  <el-input v-model="dataForm.enterpriseCode" placeholder="请输入企业代码" maxlength="50" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="发票渠道" prop="type">
                  <el-select v-model="dataForm.type" placeholder="请选择发票渠道" :style='{"width":"100%"}' :disabled="isViewFlag">
                    <el-option v-for="item in typeList"
                               :key="item.enCode"
                               :label="item.fullName"
                               :value="item.enCode"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="开票人" prop="drawer">
                  <el-input v-model="dataForm.drawer" placeholder="请输入开票人" maxlength="50" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="开户银行" prop="back">
                  <el-input v-model="dataForm.back" placeholder="请输入开户银行" maxlength="50" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="银行账户" prop="backAccount">
                  <el-input v-model="dataForm.backAccount" placeholder="请输入银行账户" maxlength="50" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="税率" prop="taxRate">
                  <el-input v-model="dataForm.taxRate" oninput="value=value.replace(/[^\d]/g,'')" maxlength="3" placeholder="请输入税率" clearable :style='{"width":"100%"}' :disabled="isViewFlag">
                    <template slot="append">%</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话" prop="telephoneNumber">
                  <el-input v-model="dataForm.telephoneNumber" placeholder="请输入联系电话" oninput="value=value.replace(/[^\d]/g,'')" maxlength="11" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="企业地址" prop="address">
                  <!-- <el-input v-model="dataForm.address" placeholder="请输入企业地址" maxlength="50" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input> -->
                  <el-input type="textarea" rows="3" v-model="dataForm.address" placeholder="请输入企业地址" style="width: 100%;"></el-input>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="平台简称" prop="platformAlias">
                  <el-input v-model="dataForm.platformAlias" placeholder="请输入平台简称" maxlength="11" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="平台编码" prop="platformCode">
                  <el-input v-model="dataForm.platformCode" placeholder="请输入平台编码" maxlength="11" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="第三方平台代码" prop="thirdPlatformCode">
                  <el-input v-model="dataForm.thirdPlatformCode" placeholder="请输入第三方平台代码" maxlength="50" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="机器编码" prop="machineCoding">
                  <el-input v-model="dataForm.machineCoding" placeholder="请输入机器编码" maxlength="50" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="开票终端" prop="billingTerminal">
                  <el-input v-model="dataForm.billingTerminal" placeholder="请输入开票终端" maxlength="50" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="开票回调" prop="callbackUrl">
                  <el-input v-model="dataForm.callbackUrl" placeholder="请输入开票回调" maxlength="50" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="服务域名" prop="url">
                  <el-input v-model="dataForm.url" placeholder="请输入服务域名" maxlength="50" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="复核人" prop="checker">
                  <el-input v-model="dataForm.checker" placeholder="请输入复核人" maxlength="50" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="收款人" prop="payee">
                  <el-input v-model="dataForm.payee" placeholder="请输入收款人" maxlength="50" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="密钥" prop="password">
                  <el-input v-model="dataForm.password" placeholder="请输入密钥" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="公钥" prop="secret">
                  <el-input v-model="dataForm.secret" placeholder="请输入公钥" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="私钥" prop="pirKey">
                  <el-input v-model="dataForm.pirKey" placeholder="请输入私钥" clearable :style='{"width":"100%"}' :disabled="isViewFlag"></el-input>
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
import { save, update, get as getInfo } from '@/api/invoiceConf/invoiceConf'
import { getOperator } from '@/api/operator/operator.js'
export default {
  name: 'Form',
  props: {
  },
  data() {
    return {
      dataForm: {
        id:null,
        address:'',
        drawer:'',
        tenantId:'',
        name:'',
        taxNumber:'',
        taxRate:'',
        back:'',
        backAccount:'',
        billingTerminal:'',
        callbackUrl:'',
        checker:'',
        enterpriseCode:'',
        machineCoding:'',
        password:'',
        payee:'',
        pirKey:'',
        platformAlias:'',
        platformCode:'',
        secret:'',
        telephoneNumber:'',
        thirdPlatformCode:'',
        type:'',
        url:''
      },
      isViewFlag: false,
      typeList:[
        {fullName:'旺起数电',enCode:'3'},
        {fullName:'票通',enCode:'4'}
      ],
      merchantList:[
        {fullName:'默认商户',enCode:'0'}
      ],
      rules: {
        name:[
          { required: true, message: '请输入企业抬头', trigger: 'blur' },
        ],
        taxNumber:[
          { required: true, message: '请输入企业税号', trigger: 'blur' },
        ],
        tenantId:[
          { required: true, message: '请输入商户', trigger: 'blur' },
        ],
        type:[
          { required: true, message: '请输入发票类型', trigger: 'blur' },
        ],
        taxRate:[
          { required: true, message: '请输入税率', trigger: 'blur' },
        ],
        telephoneNumber:[
          { required: true, message: '请输入联系电话', trigger: 'blur' },
        ],
        address:[
          { required: true, message: '请选输入企业地址', trigger: 'blur' },
        ],
        back:[
          { required: true, message: '请输入开户银行', trigger: 'blur' },
        ],
        backAccount:[
          { required: true, message: '请输入银行账户', trigger: 'blur' },
        ],
        drawer:[
          { required: true, message: '请输入开票人', trigger: 'blur' },
        ],
        enterpriseCode:[
          { required: true, message: '请输入企业代码', trigger: 'blur' },
        ]
      }
    }
  },
  created() {
    this.getOperator()
  },
  methods: {
    goBack() {
      this.isViewFlag = false
      this.$parent.isAdd = true
    },
    getOperator() {
      getOperator().then(res => {
        this.merchantList = res.data
      })
    },
    initInfo(id) {
      this.reset();
      if(id){
        console.log("initInfo:",id)
        this.getDetail(id);
      }
    },
    getDetail(id){
      getInfo(id).then(res => {
        if(res.code == 200){
          this.dataForm = {
            id:res.data.id,
            address:res.data.address,
            drawer:res.data.drawer,
            tenantId:res.data.tenantId,
            name:res.data.name,
            taxNumber:res.data.taxNumber,
            taxRate:res.data.taxRate,
            back:res.data.back,
            backAccount:res.data.backAccount,
            billingTerminal:res.data.billingTerminal,
            callbackUrl:res.data.callbackUrl,
            checker:res.data.checker,
            enterpriseCode:res.data.enterpriseCode,
            machineCoding:res.data.machineCoding,
            password:res.data.password,
            payee:res.data.payee,
            pirKey:res.data.pirKey,
            platformAlias:res.data.platformAlias,
            platformCode:res.data.platformCode,
            secret:res.data.secret,
            telephoneNumber:res.data.telephoneNumber,
            thirdPlatformCode:res.data.thirdPlatformCode,
            type:res.data.type+'',
            url:res.data.url
          }
        }
      })
    },
    viewDetail(id){
      this.reset();
      if (id) {
        console.log("viewDetail:",id)
        this.isViewFlag = true;
        this.getDetail(id);
      }
    },
    reset(){
      this.isViewFlag = false;
      this.dataForm = {
        id:null,
        address:'',
        drawer:'',
        tenantId:'',
        name:'',
        taxNumber:'',
        taxRate:'',
        back:'',
        backAccount:'',
        billingTerminal:'',
        callbackUrl:'',
        checker:'',
        enterpriseCode:'',
        machineCoding:'',
        password:'',
        payee:'',
        pirKey:'',
        platformAlias:'',
        platformCode:'',
        secret:'',
        telephoneNumber:'',
        thirdPlatformCode:'',
        type:'',
        url:''
      }
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
  top: 15px;
  right: 15px;
  bottom: 0px;
  left: 15px;
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

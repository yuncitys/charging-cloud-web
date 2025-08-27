<template>
  <el-dialog :title="param.title" :visible.sync="propVisible" :before-close="close">
    <el-form class="dialog-form" ref="form" :model="form" :rules="channelRule" :inline="true" label-width="auto">
      <el-row>
        <el-col :span="12">
          <el-form-item label="渠道名称" prop="channelName">
            <el-select v-model="form.channelName" clearable placeholder="支付方式">
              <el-option v-for="(item,index) in channelList" 
                :key="index" 
                :label="item.name" 
                :value="item.name"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="服务提供商" prop="serviceProviderId">
            <el-select v-model="form.serviceProviderId" clearable placeholder="请选择服务提供商">
              <el-option v-for="(item,index) in serviceProviderList" 
                :key="index" 
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="渠道账户" prop="channelAccount">
            <el-input v-model="form.channelAccount" clearable placeholder="请输入渠道账户"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="渠道密码" prop="channelPassword">
            <el-input show-password v-model="form.channelPassword" clearable placeholder="请输入渠道账户"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="账户负责人" prop="adminPeople">
            <el-input v-model="form.adminPeople" placeholder="账户负责人" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="box-config" v-if="form.channelName">
        <el-divider><i class="el-icon-setting"></i>{{ form.channelName }}渠道配置</el-divider>
        <div class="wxConfig" v-if="form.channelName === '微信'">
          <el-row>
            <el-col :span="12">
              <el-form-item label="小程序id">
                <el-input v-model="wxConfig.appletAccount.id" clearable placeholder="小程序id"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="小程序secret">
                <el-input v-model="wxConfig.appletAccount.secret" clearable placeholder="小程序secret"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="公众号id">
                <el-input v-model="wxConfig.officialAccount.id" clearable placeholder="公众号APPID"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="公众号secret">
                <el-input v-model="wxConfig.officialAccount.secret" clearable placeholder="公众号secret"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="应用APPID">
                <el-input v-model="wxConfig.appId" clearable placeholder="应用APPID"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="签名方式">
                <el-input v-model="wxConfig.signType" clearable placeholder="签名方式"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="商户号">
                <el-input v-model="wxConfig.mchId" clearable placeholder="商户号"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="API密钥">
                <el-input v-model="wxConfig.key" clearable placeholder="API密钥"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="API版本">
                <el-input v-model="wxConfig.apiVersion" clearable placeholder="API版本"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="API V3秘钥">
                <el-input v-model="wxConfig.apiV3Key" clearable placeholder="API V3秘钥"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="证书序列号">
                <el-input v-model="wxConfig.serialNo" clearable placeholder="序列号"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="回调域名">
                <el-input v-model="wxConfig.callbackDomain" clearable placeholder="回调域名"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
          <el-col :span="12">
            <!-- <el-form-item label="API证书文件">
                <el-upload class="upload-demo" ref="uploadCertificateFile" :on-remove="handleRemoveCertificateFile" :file-list="certificateFileList"
                  :http-request="uploadCertificateFile" action='' :on-change="handleChangeCertificateFile">
                  <el-button slot="trigger" size="small" type="text" >选取.p12文件</el-button>
                </el-upload>
            </el-form-item> -->
            <el-form-item label="API证书文件">
              <el-input v-model="wxConfig.cert" clearable placeholder=".p12文件"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- <el-form-item label="API私钥文件">
              <el-upload class="upload-demo" ref="uploadCertificateKeyFile" :on-remove="handleRemoveCertificateKeyFile" :file-list="certificateKeyFileList"
                :http-request="uploadCertificateKeyFile" action='' :on-change="handleChangeCertificateKeyFile">
                <el-button slot="trigger" size="small" type="text">选取.pem文件</el-button>
              </el-upload>
            </el-form-item> -->
            <el-form-item label="API私钥文件">
              <el-input v-model="wxConfig.pemCert" clearable placeholder=".pem文件"></el-input>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="8">
            <el-button size="small" type="primary" @click="submitUpload()" :loading="loading">
              上传文件
            </el-button>
          </el-col> -->
        </el-row>
        </div>
        <div class="aliConfig" v-else-if="form.channelName === '支付宝'">
          <el-row>
            <el-col :span="12">
              <el-form-item label="公众号id">
                <el-input v-model="aliConfig.officialAccount.id" clearable placeholder="公众号APPID"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="公众号secret">
                <el-input v-model="aliConfig.officialAccount.secret" clearable placeholder="公众号secret"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="应用APPID">
                <el-input v-model="aliConfig.appId" clearable placeholder="应用APPID"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="pid">
                <el-input v-model="aliConfig.pid" clearable placeholder="pid"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="私钥">
                <el-input v-model="aliConfig.privateKey" clearable placeholder="私钥"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="alipayPublicKey">
                <el-input v-model="aliConfig.alipayPublicKey" clearable placeholder="公钥"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="签名方式">
                <el-input v-model="aliConfig.signType" clearable placeholder="签名方式"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="回调域名">
                <el-input v-model="aliConfig.callbackDomain" clearable placeholder="回调域名"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>

import { getInfo, update, save } from '@/api/channelConfigInfo'
import { upload } from '@/api/upload/file.js'

export default {
  name: 'channelConfigInfo',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    param: {
      type: Object,
      default: () => {
      }
    }
  },
  computed: {
    propVisible: {
      get() {
        return this.visible
      },
      set() {
      }
    }
  },
  data() {
    return {
      options: [],
      form: {
        'adminPeople': '',
        'channelAccount': '',
        'channelCode': '',
        'channelName': '',
        'channelPassword': '',
        'configStr': '',
        'serviceProviderId': ''
      },
      wxConfig: {
        'officialAccount': { 'id': '', 'secret': '' },
        'appletAccount': { 'id': '', 'secret': '' },
        'appId': '',
        'mchId': '',
        'key': '',
        'signType': '',
        'apiVersion': null,
        'apiV3Key': '',
        'serialNo': '',
        'cert': null,
        'pemCert': '',
        'callbackDomain': ''
      },
      aliConfig: {
        'officialAccount': { 'id': '', 'secret': '' },
        'sandbox': null,
        'pid': '',
        'appId': '',
        'privateKey': '',
        'alipayPublicKey': '',
        'signType': '',
        'useCert': null,
        'appPublicCert': null,
        'alipayPublicCert': null,
        'alipayRootCert': null,
        'callbackDomain': ''
      },
      channelList: [
        { name: '微信', code: 'wxpay' },
        { name: '支付宝', code: 'alipay' }
      ],
      serviceProviderList: [
        { name: '微信', code: 'wxpay' },
        { name: '支付宝', code: 'alipay' }
      ],
      channelRule: {
        channelName: [
          { required: true, message: '请选择支付方式', trigger: 'blur' }
        ],
        serviceProviderId: [
          { required: true, message: '请选择渠道商', trigger: 'blur' }
        ],
        channelAccount: [
          { required: true, message: '请输入渠道账户', trigger: 'blur' }
        ],
        channelPassword: [
          { required: true, message: '请输入渠道密码', trigger: 'blur' }
        ],
        adminPeople: [
          { required: true, message: '请输入账户负责人', trigger: 'blur' }
        ]
      },
      loading: false,
      fileList: [{
        name: 'certificateFile',
        file: null,
      },{
        name: 'certificateKeyFile',
        file: null
      }],
      certificateFileList: [],
      certificateKeyFileList: [],
    }
  },
  created() {
    this.init()
    console.log("param:",this.param)
    if (this.param.id) {
      getInfo(this.param.id).then(res => {
        this.form = res.data
        if (this.form.channelName === '微信') {
          this.wxConfig = JSON.parse(this.form.configStr)
        } else if (this.form.channelName === '支付宝') {
          this.aliConfig = JSON.parse(this.form.configStr)
        }
      })
    }
  },
  methods: {
    //选择文件
    uploadCertificateFile(files) {
      console.log(files)
      this.fileList[0].file = files
    },
    //选择文件
    uploadCertificateKeyFile(files) {
      console.log(files)
      this.fileList[1].file = files
    },
    //上传服务器
    submitUpload() {
      if (this.fileList[0].file == null) {
        this.$message.error('请选择.p12文件')
        return false
      }
      if (this.fileList[1].file == null){
        this.$message.error('请选择.pem文件')
        return false
      }
      this.loading = true
      for (let i = 0; i < this.fileList.length; i++) {
        let param = new FormData()
        param.append('file', this.fileList[i].file.file)
        console.log(param, "上传文件")
        upload('PaymentFile',param).then(res => {
          this.loading = false
          if (res.code == 200) {
            if (this.fileList[i].name == 'certificateFile') {
              this.wxConfig.cert = res.data.url
            }else{
              this.wxConfig.pemCert = res.data.url
            }
            this.$message.success('上传成功')
          } else {
            this.$message.error(res.msg)
          }
        }).catch((err) => {
          this.loading = false
          this.$message.error('上传失败，请重试')
        })
      }
    },
    handleRemoveCertificateFile(file, certificateFileList) {
      this.fileList[0].file = null
    },
    handleChangeCertificateFile(file, certificateFileList) {
      if (certificateFileList.length > 1) {
        certificateFileList.splice(0, 1);
      }
    },
    handleRemoveCertificateKeyFile(file, certificateKeyFileList) {
      this.fileList[1].file = null
    },
    handleChangeCertificateKeyFile(file, certificateKeyFileList) {
      if (certificateKeyFileList.length > 1) {
        certificateKeyFileList.splice(0, 1);
      }
    },
    async init() {
      
    },
    close() {
      this.$emit('update:visible', false)
    },
    confirm() {
      this.$refs.form.validate(valid => {
        if (this.form.channelName === '微信') {
          this.form.channelCode = 'wxpay'
          this.form.configStr = JSON.stringify(this.wxConfig)
        } else if (this.form.channelName === '支付宝') {
          this.form.channelCode = 'alipay'
          this.form.configStr = JSON.stringify(this.aliConfig)
        }
        if (valid) {
          if (this.param.id) {
            update(this.param.id, this.form).then(response => {
              this.$message.success(response.msg)
              this.$emit('search')
              this.close()
            })
          } else {
            save(this.form).then(response => {
              this.$message.success(response.msg)
              this.$emit('search')
              this.close()
            })
          }
        }
      })
    }
  }
}
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

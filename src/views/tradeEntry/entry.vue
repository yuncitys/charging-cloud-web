<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ isEdit ? '修改商户进件' : '新增商户进件' }}</span>
      </div>
      <el-steps :active="active" finish-status="success" align-center style="margin-bottom: 40px;">
        <el-step title="基础信息 & 商户主体" />
        <el-step title="经营地址 & 法人信息" />
        <el-step title="结算账户" />
      </el-steps>

      <el-form ref="form" :model="form" :rules="rules" label-width="160px" size="medium">
        <!-- Step 1: Basic & Subject Info -->
        <div v-show="active === 0">
          <el-divider content-position="left">基础信息</el-divider>
          <el-row>
            <el-col :span="12">
              <el-form-item label="渠道代码" prop="serviceProviderId">
                <el-select v-model="form.serviceProviderId" placeholder="请选择渠道代码" style="width: 100%">
                  <el-option label="台州银行 (tzbank)" value="tzbank" />
                  <el-option label="微信支付 (wxpay)" value="wxpay" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="管理员姓名" prop="managerName">
                <el-input v-model="form.managerName" placeholder="请输入管理员姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="管理员手机号" prop="managerMobile">
                <el-input v-model="form.managerMobile" placeholder="请输入管理员手机号" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">商户主体信息</el-divider>
          <div class="ocr-upload-container">
            <el-upload
              class="ocr-uploader"
              drag
              action=""
              :show-file-list="false"
              :http-request="(params) => handleUpload(params, '04')"
              accept=".jpg,.jpeg,.png"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将营业执照拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过5MB</div>
            </el-upload>
            <div class="ocr-tip-text">
              <i class="el-icon-info"></i> 上传营业执照可自动识别并填充下方信息
            </div>
          </div>
          <el-row>
            <!-- <el-col :span="12">
              <el-form-item label="业务方交易商户编号" prop="busTradeMerNo">
                <el-input v-model="form.busTradeMerNo" placeholder="请输入业务方交易商户编号" />
              </el-form-item>
            </el-col> -->
            <el-col :span="12">
              <el-form-item label="商户类型" prop="merType">
                <el-select v-model="form.merType" placeholder="请选择商户类型" style="width: 100%" :disabled="isEdit">
                  <el-option label="交易商户" value="0" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="交易商户类型" prop="tradeMerType">
                <el-select v-model="form.tradeMerType" placeholder="请选择交易商户类型" style="width: 100%" :disabled="isEdit" @change="handleTradeMerTypeChange">
                  <el-option label="个体工商户" value="0" />
                  <el-option label="企业" value="1" />
                  <el-option label="小微商户(自然人)" value="2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件类型" prop="merCertType">
                <el-select v-model="form.merCertType" placeholder="请选择证件类型" style="width: 100%" :disabled="isEdit">
                  <el-option label="营业执照" value="11" />
                  <el-option label="身份证" value="22" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商户名称" prop="merName">
                <el-input v-model="form.merName" placeholder="请输入商户名称" :disabled="isEdit" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件号码" prop="merCertNo">
                <el-input v-model="form.merCertNo" placeholder="请输入统一社会信用代码/证件号" :disabled="isEdit" />
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12">
              <el-form-item label="营业执照批次号" prop="corLicenseBatchNo">
                <el-input v-model="form.corLicenseBatchNo" placeholder="请输入营业执照批次号" />
              </el-form-item>
            </el-col> -->
            <el-col :span="12">
              <el-form-item label="商户简称" prop="shortName">
                <el-input v-model="form.shortName" placeholder="请输入商户简称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="注册资金(万元)" prop="corCapital">
                <el-input-number v-model="form.corCapital" :precision="2" :step="0.1" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件生效日期" prop="corIdEffectDate">
                <el-date-picker v-model="form.corIdEffectDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件到期日期" prop="corIdExaDate">
                <el-date-picker v-model="form.corIdExaDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- Step 2: Address & Legal Person -->
        <div v-show="active === 1">
          <el-divider content-position="left">经营地址信息</el-divider>
          <el-row>
            <el-col :span="8">
              <el-form-item label="省" prop="merProvinceId">
                <el-select v-model="form.merProvinceId" placeholder="请选择省" @change="handleProvinceChange" style="width: 100%">
                  <el-option
                    v-for="item in provinceList"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="市" prop="merRegionId">
                <el-select v-model="form.merRegionId" placeholder="请选择市" @change="handleCityChange" style="width: 100%">
                  <el-option
                    v-for="item in cityList"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="区" prop="merCountyId">
                <el-select v-model="form.merCountyId" placeholder="请选择区" style="width: 100%">
                  <el-option
                    v-for="item in areaList"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="详细地址" prop="merAddress">
                <el-input v-model="form.merAddress" placeholder="请输入详细地址" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="经营类目" prop="busKindCode">
                <el-cascader
                  v-model="form.busKindCode"
                  :options="busKindOptions"
                  :props="{ label: 'label', value: 'code', emitPath: false }"
                  placeholder="请选择经营类目"
                  style="width: 100%"
                  filterable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="客户电话" prop="serverPhone">
                <el-input v-model="form.serverPhone" placeholder="请输入客户电话" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">法人/经营者信息</el-divider>
          <div class="ocr-upload-container">
            <el-row :gutter="40">
              <el-col :span="12">
                <el-upload
                  class="ocr-uploader"
                  drag
                  action=""
                  :show-file-list="false"
                  :http-request="(params) => handleUpload(params, '01')"
                  accept=".jpg,.jpeg,.png"
                >
                  <i class="el-icon-upload"></i>
                  <div class="el-upload__text">将身份证<strong style="color: #409EFF">正面</strong>拖到此处，或<em>点击上传</em></div>
                </el-upload>
                <div class="ocr-tip-text">
                  <i class="el-icon-info"></i> 识别身份证正面
                </div>
              </el-col>
              <el-col :span="12">
                <el-upload
                  class="ocr-uploader"
                  drag
                  action=""
                  :show-file-list="false"
                  :http-request="(params) => handleUpload(params, '02')"
                  accept=".jpg,.jpeg,.png"
                >
                  <i class="el-icon-upload"></i>
                  <div class="el-upload__text">将身份证<strong style="color: #409EFF">反面</strong>拖到此处，或<em>点击上传</em></div>
                </el-upload>
                <div class="ocr-tip-text">
                  <i class="el-icon-info"></i> 识别身份证反面
                </div>
              </el-col>
            </el-row>
          </div>
          <el-row>
            <el-col :span="24">
              <el-form-item label="法人姓名" prop="corLegName">
                <el-input v-model="form.corLegName" placeholder="请输入法人代表或个人经营者名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件类型" prop="corLegIdType">
                <el-select v-model="form.corLegIdType" placeholder="请选择证件类型" style="width: 100%">
                  <el-option label="身份证" value="11" />
                  <el-option label="军人或武警证件号" value="12" />
                  <el-option label="港澳台通行证" value="13" />
                  <el-option label="护照" value="14" />
                  <el-option label="户口本" value="15" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件号码" prop="corLegIdNo">
                <el-input v-model="form.corLegIdNo" placeholder="请输入证件号码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件生效日期" prop="corLegIdEffectDate">
                <el-date-picker v-model="form.corLegIdEffectDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件到期日期" prop="corLegIdExaDate">
                <el-date-picker v-model="form.corLegIdExaDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width: 100%" />
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12">
              <el-form-item label="证件正面照批次号" prop="corLegIdFaceImgBatchNo">
                <el-input v-model="form.corLegIdFaceImgBatchNo" placeholder="请输入批次号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件背面照批次号" prop="corLegIdBackImgBatchNo">
                <el-input v-model="form.corLegIdBackImgBatchNo" placeholder="请输入批次号" />
              </el-form-item>
            </el-col> -->
            <el-col :span="8">
              <el-form-item label="省" prop="corLegProvince">
                <el-select v-model="form.corLegProvince" placeholder="请选择省" @change="handleLegProvinceChange" style="width: 100%">
                  <el-option
                    v-for="item in provinceList"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="市" prop="corLegCity">
                <el-select v-model="form.corLegCity" placeholder="请选择市" @change="handleLegCityChange" style="width: 100%">
                  <el-option
                    v-for="item in legCityList"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="区" prop="corLegCountyId">
                <el-select v-model="form.corLegCountyId" placeholder="请选择区" style="width: 100%">
                  <el-option
                    v-for="item in legAreaList"
                    :key="item.id"
                    :label="item.fullName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="详细地址" prop="corLegAddress">
                <el-input v-model="form.corLegAddress" placeholder="请输入法人详细地址" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- Step 3: Settlement & Attachments -->
        <div v-show="active === 2">
          <el-divider content-position="left">结算账户信息</el-divider>
          <el-row>
            <el-col :span="12">
              <el-form-item label="结算账户类型" prop="settBankAccType">
                <el-select v-model="form.settBankAccType" placeholder="请选择" style="width: 100%">
                  <el-option label="借记账户" value="0010" />
                  <el-option label="对公账户" value="0030" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="账户名称" prop="settBankAccName">
                <el-input v-model="form.settBankAccName" placeholder="需与证件名称一致" />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.settBankAccType === '0030'">
              <el-form-item label="开户行名称" prop="settBankBranchName">
                <el-select
                  v-model="form.settBankBranchName"
                  placeholder="请输入开户行名称"
                  filterable
                  clearable
                  @change="handleBankChange"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in bankList"
                    :key="item.bank_code"
                    :label="item.bank_name"
                    :value="item.bank_name"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.settBankAccType === '0030'">
              <el-form-item label="开户行行号" prop="settBankBranchId">
                <el-input v-model="form.settBankBranchId" placeholder="12位联行号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="银行账号" prop="settBankAccNo">
                <el-input v-model="form.settBankAccNo" placeholder="结算银行卡号" />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.settBankAccType === '0010'">
              <el-form-item label="持卡人身份证号" prop="identityNo">
                <el-input v-model="form.identityNo" placeholder="结算卡持卡人身份证" />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.settBankAccType === '0010'">
              <el-form-item label="银行预留手机号" prop="mobileNo">
                <el-input v-model="form.mobileNo" placeholder="用于短信验证" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div style="margin-top: 40px; text-align: center;">
          <el-button @click="cancel">取消</el-button>
          <el-button v-if="active > 0" @click="prev">上一步</el-button>
          <el-button v-if="active < 2" type="primary" @click="next">下一步</el-button>
          <el-button v-if="active === 2" type="primary" :loading="loading" @click="submit">提交</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { addTradeEntry, updateTradeEntry, getTradeEntry, imgInfoDiscern } from '@/api/pay/tradeEntry'
import { getAreaSelector } from '@/api/area/index'
import dictData from '@/utils/dictData'

export default {
  name: 'TradeEntryForm',
  data() {
    return {
      active: 0,
      loading: false,
      isEdit: false,
      provinceList: [],
      cityList: [],
      areaList: [],
      legCityList: [],
      legAreaList: [],
      busKindOptions: [],
      bankList: [],
      form: {
        id: undefined,
        // Basic
        tenantId: '',
        serviceProviderId: 'tzbank',
        apiVersion: '',
        managerName: '',
        managerMobile: '',
        // Subject
        busTradeMerNo: '',
        merType: '0',
        tradeMerType: '',
        merCertType: '',
        merName: '',
        merCertNo: '',
        corLicenseBatchNo: '',
        shortName: '',
        corCapital: 0,
        corIdEffectDate: '',
        corIdExaDate: '',
        // Address
        merProvinceId: '',
        merRegionId: '',
        merCountyId: '',
        merAddress: '',
        busKindCode: '',
        serverPhone: '',
        // Legal Person
        corLegName: '',
        corLegIdType: '',
        corLegIdNo: '',
        corLegIdFaceImgBatchNo: '',
        corLegIdBackImgBatchNo: '',
        corLegIdEffectDate: '',
        corLegIdExaDate: '',
        corLegProvince: '',
        corLegCity: '',
        corLegCountyId: '',
        corLegAddress: '',
        // Settlement
        settBankAccType: '',
        settBankAccName: '',
        settBankBranchId: '',
        settBankBranchName: '',
        settBankAccNo: '',
        identityNo: '',
        mobileNo: '',
        // Attachments
        attchList: []
      },
      rules: {
        tenantId: [{ required: true, message: '请输入租户标识', trigger: 'blur' }],
        serviceProviderId: [{ required: true, message: '请输入渠道代码', trigger: 'blur' }],
        busTradeMerNo: [{ required: true, message: '请输入业务方交易商户编号', trigger: 'blur' }],
        merType: [{ required: true, message: '请选择商户类型', trigger: 'change' }],
        tradeMerType: [{ required: true, message: '请选择交易商户类型', trigger: 'change' }],
        merName: [{ required: true, message: '请输入商户名称', trigger: 'blur' }],
        merCertNo: [{ required: true, message: '请输入证件号码', trigger: 'blur' }],
        managerMobile: [{ required: true, message: '请输入管理员手机号', trigger: 'blur' }],
        settBankAccType: [{ required: true, message: '请选择结算账户类型', trigger: 'change' }],
        settBankAccName: [{ required: true, message: '请输入账户名称', trigger: 'blur' }],
        settBankAccNo: [{ required: true, message: '请输入银行账号', trigger: 'blur' }]
      }
    }
  },
  watch: {
    'form.settBankAccType'(val) {
      if (val === '0030') {
        this.rules.settBankBranchName = [{ required: true, message: '请选择开户行名称', trigger: 'change' }]
        this.rules.settBankBranchId = [{ required: true, message: '请输入开户行行号', trigger: 'blur' }]
        this.$delete(this.rules, 'identityNo')
        this.$delete(this.rules, 'mobileNo')
        this.form.identityNo = ''
        this.form.mobileNo = ''
      } else if (val === '0010') {
        this.rules.identityNo = [{ required: true, message: '请输入持卡人身份证号', trigger: 'blur' }]
        this.rules.mobileNo = [{ required: true, message: '请输入银行预留手机号', trigger: 'blur' }]
        this.$delete(this.rules, 'settBankBranchName')
        this.$delete(this.rules, 'settBankBranchId')
      } else {
        this.$delete(this.rules, 'settBankBranchName')
        this.$delete(this.rules, 'settBankBranchId')
        this.$delete(this.rules, 'identityNo')
        this.$delete(this.rules, 'mobileNo')
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    }
  },
  created() {
    this.busKindOptions = dictData.getBusKindData()
    this.bankList = dictData.getBankNo()
    this.getProvinceList()
    const id = this.$route.params.id
    if (id) {
      this.isEdit = true
      this.form.id = id
      this.fetchData(id)
    }
  },
  methods: {
    getProvinceList() {
      getAreaSelector('-1').then(res => {
        this.provinceList = res.data
      })
    },
    handleProvinceChange(val) {
      this.form.merRegionId = ''
      this.form.merCountyId = ''
      this.cityList = []
      this.areaList = []
      getAreaSelector(val).then(res => {
        this.cityList = res.data
      })
    },
    handleCityChange(val) {
      this.form.merCountyId = ''
      this.areaList = []
      getAreaSelector(val).then(res => {
        this.areaList = res.data
      })
    },
    handleLegProvinceChange(val) {
      this.form.corLegCity = ''
      this.form.corLegCountyId = ''
      this.legCityList = []
      this.legAreaList = []
      getAreaSelector(val).then(res => {
        this.legCityList = res.data
      })
    },
    handleLegCityChange(val) {
      this.form.corLegCountyId = ''
      this.legAreaList = []
      getAreaSelector(val).then(res => {
        this.legAreaList = res.data
      })
    },
    handleBankChange(val) {
      if (!val) {
        this.form.settBankBranchId = ''
        return
      }
      const bank = this.bankList.find(item => item.bank_name === val)
      if (bank) {
        this.form.settBankBranchId = bank.bank_code
      }
    },
    handleUpload(params, type) {
      const file = params.file
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isLt5M) {
        this.$message.error('上传文件大小不能超过 5MB!')
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('imageType', type)

      const loading = this.$loading({
        lock: true,
        text: '正在识别中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      imgInfoDiscern(formData).then(response => {
        loading.close()
        const data = response.data || response // Adjust based on actual response structure
        if (data) {
          this.$message.success('识别成功')
          this.fillFormData(data, type)
        } else {
          this.$message.warning('未能识别到有效信息')
        }
      }).catch(err => {
        loading.close()
        console.error('识别失败', err)
        this.$message.error('识别失败，请稍后重试')
      })
    },
    fillFormData(data, type) {
      // 04: 营业执照
      if (type === '04') {
        if (data.fileBatchId) this.form.corLicenseBatchNo = data.fileBatchId
        if (data.bsnCreditCode) this.form.merCertNo = data.bsnCreditCode
        if (data.corporationName) this.form.merName = data.corporationName
        if (data.legalClientName) this.form.corLegName = data.legalClientName
        if (data.employerAdd) this.form.merAddress = data.employerAdd
        if (data.licenceDateEnd) {
          // 尝试格式化日期，假设返回格式可能多样，这里做简单处理或者直接赋值如果格式匹配
          // 假设返回 yyyy年MM月dd日 或 yyyy-MM-dd
          let dateStr = data.licenceDateEnd.replace(/年|月/g, '-').replace(/日/g, '')
          // 如果是 "长期"，可能需要特殊处理，这里暂且保留原值或者设为特定值
          if (dateStr.includes('长期')) {
             // Handle long term if needed, maybe leave empty or set a far future date
             // this.form.corIdExaDate = '9999-12-31'
          } else {
             this.form.corIdExaDate = dateStr
          }
        }
        if (data.regCapitalS) {
          // 提取数字，单位默认为万元
          const num = parseFloat(data.regCapitalS)
          if (!isNaN(num)) {
            this.form.corCapital = num
          }
        }
      }
      // 01: 身份证正面
      else if (type === '01') {
        if (data.fileBatchId) this.form.corLegIdFaceImgBatchNo = data.fileBatchId
        if (data.clientName) this.form.corLegName = data.clientName
        if (data.globalId) this.form.corLegIdNo = data.globalId
        if (data.address) this.form.corLegAddress = data.address
        // 身份证正面通常不包含有效期，只有出生日期 birthDate
      }
      // 02: 身份证反面
      else if (type === '02') {
        if (data.fileBatchId) this.form.corLegIdBackImgBatchNo = data.fileBatchId
        if (data.exDate) {
          // 身份证有效期通常是 "yyyy.MM.dd-yyyy.MM.dd" 或 "yyyy.MM.dd-长期"
          // 这里假设返回的是结束日期
          let dateStr = data.exDate.replace(/\./g, '-')
          if (dateStr.includes('长期')) {
             // Handle long term
          } else {
             // 如果是范围，取后半部分
             if (dateStr.includes('-')) {
               const parts = dateStr.split('-')
               if (parts.length > 1) {
                 dateStr = parts[1]
               }
             }
             this.form.corLegIdExaDate = dateStr
             // 同时也可以尝试提取开始日期赋值给 corLegIdEffectDate
             if (data.exDate.includes('-')) {
                const parts = data.exDate.split('-')
                if (parts.length > 0) {
                   this.form.corLegIdEffectDate = parts[0].replace(/\./g, '-')
                }
             }
          }
        }
      }
    },
    fetchData(id) {
      getTradeEntry(id).then(response => {
        this.form = response.data
        if (this.form.merProvinceId) {
          getAreaSelector(this.form.merProvinceId).then(res => {
            this.cityList = res.data.list
          })
        }
        if (this.form.merRegionId) {
          getAreaSelector(this.form.merRegionId).then(res => {
            this.areaList = res.data.list
          })
        }
        if (this.form.corLegProvince) {
          getAreaSelector(this.form.corLegProvince).then(res => {
            this.legCityList = res.data
          })
        }
        if (this.form.corLegCity) {
          getAreaSelector(this.form.corLegCity).then(res => {
            this.legAreaList = res.data
          })
        }
      }).catch(err => {
        console.error(err)
      })
    },
    handleTradeMerTypeChange(val) {
      if (val === '2') {
        this.form.merCertType = '22'
      } else {
        this.form.merCertType = '11'
      }
    },
    next() {
      if (this.active++ > 2) this.active = 0
    },
    prev() {
      if (this.active-- < 0) this.active = 0
    },
    cancel() {
      this.$confirm('确认取消操作？表单内容将清空。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.form.resetFields()
        this.$router.push('/tradeEntry/list')
      }).catch(() => {})
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          const request = this.isEdit ? updateTradeEntry : addTradeEntry
          request(this.form).then(() => {
            this.$message({
              message: this.isEdit ? '修改成功' : '新增成功',
              type: 'success'
            })
            this.loading = false
            this.$router.push('/tradeEntry/list')
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.ocr-upload-container {
  text-align: center;
  margin: 20px 0;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.ocr-uploader >>> .el-upload-dragger {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

.ocr-uploader >>> .el-upload {
  width: 100%;
  display: block;
}

.ocr-tip-text {
  margin-top: 10px;
  color: #909399;
  font-size: 13px;
}
</style>

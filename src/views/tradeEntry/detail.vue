<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>商户进件详情</span>
        <div style="float: right;">
          <el-tag :type="form.status | statusTypeFilter" style="margin-right: 10px;">{{ form.status | statusFilter }}</el-tag>
          <el-button type="primary" size="mini" :loading="statusLoading" @click="handleQueryStatus">查询状态</el-button>
        </div>
      </div>

      <div v-if="form.auditMessage" style="margin-bottom: 20px;">
        <el-alert
          title="审核失败原因"
          type="error"
          :description="form.auditMessage"
          show-icon
          :closable="false"
        />
      </div>

      <el-form ref="form" :model="form" label-width="160px" size="medium" disabled>
        <!-- Step 1: Basic & Subject Info -->
        <div>
          <el-divider content-position="left">基础信息</el-divider>
          <el-row>
            <el-col :span="12">
              <el-form-item label="租户标识">
                <el-input v-model="form.tenantId" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="渠道代码">
                <el-input v-model="form.serviceProviderId" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="接口版本号">
                <el-input v-model="form.apiVersion" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="管理员姓名">
                <el-input v-model="form.managerName" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="管理员手机号">
                <el-input v-model="form.managerMobile" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">商户主体信息</el-divider>
          <el-row>
            <el-col :span="12">
              <el-form-item label="业务方交易商户编号">
                <el-input v-model="form.busTradeMerNo" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商户类型">
                <el-select v-model="form.merType" style="width: 100%">
                  <el-option label="交易商户" value="0" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="交易商户类型">
                <el-select v-model="form.tradeMerType" style="width: 100%">
                  <el-option label="个体工商户" value="0" />
                  <el-option label="企业" value="1" />
                  <el-option label="小微商户(自然人)" value="2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件类型">
                <el-select v-model="form.merCertType" style="width: 100%">
                  <el-option label="营业执照" value="11" />
                  <el-option label="身份证" value="22" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商户名称">
                <el-input v-model="form.merName" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件号码">
                <el-input v-model="form.merCertNo" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="营业执照批次号">
                <el-input v-model="form.corLicenseBatchNo" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商户简称">
                <el-input v-model="form.shortName" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="注册资金(万元)">
                <el-input v-model="form.corCapital" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件生效日期">
                <el-input v-model="form.corIdEffectDate" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件到期日期">
                <el-input v-model="form.corIdExaDate" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="营业执照">
                <el-image
                  style="width: 200px; height: 120px"
                  :src="form.corLicenseImg"
                  :preview-src-list="[form.corLicenseImg]"
                  fit="contain"
                >
                  <div slot="error" class="image-slot">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </el-image>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- Step 2: Address & Legal Person -->
        <div>
          <el-divider content-position="left">经营地址信息</el-divider>
          <el-row>
            <el-col :span="8">
              <el-form-item label="省">
                <el-select v-model="form.merProvinceId" style="width: 100%">
                  <el-option v-for="item in provinceList" :key="item.id" :label="item.fullName" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="市">
                <el-select v-model="form.merRegionId" style="width: 100%">
                  <el-option v-for="item in cityList" :key="item.id" :label="item.fullName" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="区">
                <el-select v-model="form.merCountyId" style="width: 100%">
                  <el-option v-for="item in areaList" :key="item.id" :label="item.fullName" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="详细地址">
                <el-input v-model="form.merAddress" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="经营类目">
                <el-cascader
                  v-model="form.busKindCode"
                  :options="busKindOptions"
                  :props="{ label: 'label', value: 'code', emitPath: false }"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="客户电话">
                <el-input v-model="form.serverPhone" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">法人/经营者信息</el-divider>
          <el-row>
            <el-col :span="12">
              <el-form-item label="法人姓名">
                <el-input v-model="form.corLegName" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件类型">
                <el-select v-model="form.corLegIdType" style="width: 100%">
                  <el-option label="身份证" value="11" />
                  <el-option label="军人或武警证件号" value="12" />
                  <el-option label="港澳台通行证" value="13" />
                  <el-option label="护照" value="14" />
                  <el-option label="户口本" value="15" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件号码">
                <el-input v-model="form.corLegIdNo" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件生效日期">
                <el-input v-model="form.corLegIdEffectDate" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件到期日期">
                <el-input v-model="form.corLegIdExaDate" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件正面照批次号">
                <el-input v-model="form.corLegIdFaceImgBatchNo" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件背面照批次号">
                <el-input v-model="form.corLegIdBackImgBatchNo" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="证件照片">
                <div style="display: flex;">
                  <div style="margin-right: 20px; text-align: center;">
                    <el-image
                      style="width: 200px; height: 120px"
                      :src="form.corLegIdFaceImg"
                      :preview-src-list="[form.corLegIdFaceImg]"
                      fit="contain"
                    >
                      <div slot="error" class="image-slot">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                    </el-image>
                    <div>人像面</div>
                  </div>
                  <div style="text-align: center;">
                    <el-image
                      style="width: 200px; height: 120px"
                      :src="form.corLegIdBackImg"
                      :preview-src-list="[form.corLegIdBackImg]"
                      fit="contain"
                    >
                      <div slot="error" class="image-slot">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                    </el-image>
                    <div>国徽面</div>
                  </div>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="法人省">
                <el-select v-model="form.corLegProvince" style="width: 100%">
                  <el-option v-for="item in provinceList" :key="item.id" :label="item.fullName" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="法人市">
                <el-select v-model="form.corLegCity" style="width: 100%">
                  <el-option v-for="item in legCityList" :key="item.id" :label="item.fullName" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="法人区">
                <el-select v-model="form.corLegCountyId" style="width: 100%">
                  <el-option v-for="item in legAreaList" :key="item.id" :label="item.fullName" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="法人详细地址">
                <el-input v-model="form.corLegAddress" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- Step 3: Settlement & Attachments -->
        <div>
          <el-divider content-position="left">结算账户信息</el-divider>
          <el-row>
            <el-col :span="12">
              <el-form-item label="结算账户类型">
                <el-select v-model="form.settBankAccType" style="width: 100%">
                  <el-option label="借记账户" value="0010" />
                  <el-option label="对公账户" value="0030" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="账户名称">
                <el-input v-model="form.settBankAccName" />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.settBankAccType === '0030'">
              <el-form-item label="开户行名称">
                <el-input v-model="form.settBankBranchName" />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.settBankAccType === '0030'">
              <el-form-item label="开户行行号">
                <el-input v-model="form.settBankBranchId" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="银行账号">
                <el-input v-model="form.settBankAccNo" />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.settBankAccType === '0010'">
              <el-form-item label="持卡人身份证号">
                <el-input v-model="form.identityNo" />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.settBankAccType === '0010'">
              <el-form-item label="银行预留手机号">
                <el-input v-model="form.mobileNo" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <div style="margin-top: 40px; text-align: center;">
        <el-button @click="handleBack">返回</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getTradeEntry, getAreaSelector, queryTradeEntryStatus } from '@/api/pay/tradeEntry'
import dictData from '@/utils/dictData'

export default {
  name: 'TradeEntryDetail',
  filters: {
    statusFilter(status) {
      const statusMap = {
        10: '入网中',
        20: '认证中',
        21: '待签署协议',
        30: '正常',
        40: '冻结',
        50: '注销',
        60: '入网失败'
      }
      return statusMap[status] || status
    },
    statusTypeFilter(status) {
      const statusMap = {
        10: 'info',
        20: 'warning',
        21: 'warning',
        30: 'success',
        40: 'danger',
        50: 'info',
        60: 'danger'
      }
      return statusMap[status] || ''
    }
  },
  data() {
    return {
      statusLoading: false,
      provinceList: [],
      cityList: [],
      areaList: [],
      legCityList: [],
      legAreaList: [],
      busKindOptions: [],
      form: {
        id: undefined,
        // Basic
        tenantId: '',
        serviceProviderId: '',
        apiVersion: '',
        managerName: '',
        managerMobile: '',
        // Subject
        busTradeMerNo: '',
        merType: '',
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
        status: undefined
      }
    }
  },
  created() {
    this.busKindOptions = dictData.getBusKindData()
    this.getProvinceList()
    const id = this.$route.params.id
    if (id) {
      this.form.id = id
      this.fetchData(id)
    }
  },
  methods: {
    getProvinceList() {
      getAreaSelector('-1').then(res => {
        this.provinceList = res.data.list
      })
    },
    fetchData(id) {
      getTradeEntry(id).then(response => {
        this.form = response.data
        // 加载地址数据用于回显
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
            this.legCityList = res.data.list
          })
        }
        if (this.form.corLegCity) {
          getAreaSelector(this.form.corLegCity).then(res => {
            this.legAreaList = res.data.list
          })
        }
      }).catch(err => {
        console.error(err)
        // Mock data
        this.form = {
          id: id,
          tenantId: 'T001',
          serviceProviderId: 'tzbank',
          apiVersion: 'v1.0',
          managerName: '张三',
          managerMobile: '13800138000',
          busTradeMerNo: 'M001',
          merType: '0',
          tradeMerType: '2',
          merCertType: '22',
          merName: '测试商户1',
          merCertNo: '330106199001011234',
          corLicenseBatchNo: 'L001',
          corLicenseImg: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
          shortName: '测试商户',
          corCapital: 100,
          corIdEffectDate: '2020-01-01',
          corIdExaDate: '2030-01-01',
          merProvinceId: '330000',
          merRegionId: '330100',
          merCountyId: '330106',
          merAddress: '西湖区某某路88号',
          busKindCode: '100145',
          serverPhone: '0571-88888888',
          corLegName: '张三',
          corLegIdType: '11',
          corLegIdNo: '330106199001011234',
          corLegIdFaceImgBatchNo: 'IMG001',
          corLegIdFaceImg: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg',
          corLegIdBackImgBatchNo: 'IMG002',
          corLegIdBackImg: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg',
          corLegIdEffectDate: '2010-01-01',
          corLegIdExaDate: '2030-01-01',
          corLegProvince: '330000',
          corLegCity: '330100',
          corLegCountyId: '330106',
          corLegAddress: '西湖区某某路88号',
          settBankAccType: '0010',
          settBankAccName: '张三',
          settBankBranchId: '',
          settBankBranchName: '',
          settBankAccNo: '6222021202020202020',
          identityNo: '330106199001011234',
          mobileNo: '13800138000',
          status: 60,
          auditMessage: '证件信息不清晰，请重新上传'
        }
      })
    },
    handleQueryStatus() {
      this.statusLoading = true
      queryTradeEntryStatus(this.form.id).then(response => {
        this.statusLoading = false
        this.$message.success('状态查询成功')
        // 刷新数据
        this.fetchData(this.form.id)
      }).catch(() => {
        this.statusLoading = false
      })
    },
    handleBack() {
      this.$router.go(-1)
    }
  }
}
</script>

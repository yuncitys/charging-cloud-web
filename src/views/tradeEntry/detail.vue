<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>商户进件详情</span>
        <div style="float: right;">
          <el-tag :type="form.status | statusTypeFilter" style="margin-right: 10px;">{{ form.status | statusFilter }}</el-tag>
          <el-button
            v-if="btnAuthen.permsVerifAuthention(':payment:tradeMerchant:submit')"
            type="warning"
            size="mini"
            :disabled="!canResubmit"
            style="margin-right: 10px;"
            @click="handleResubmit"
          >
            重新提交
          </el-button>
          <el-button
            v-if="btnAuthen.permsVerifAuthention(':payment:tradeMerchant:query')"
            type="primary"
            size="mini"
            :loading="statusLoading"
            @click="handleQueryStatus"
          >
            查询状态
          </el-button>
        </div>
      </div>

      <div v-if="form.auditRemark" style="margin-bottom: 20px;">
        <el-alert
          title="审核失败原因"
          type="error"
          :description="form.auditRemark"
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
              <el-form-item label="渠道代码">
                <el-input v-model="form.serviceProviderId" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="运营商户">
                <el-input :value="merchantName" />
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
              <el-form-item label="商户编号">
                <el-input v-model="form.merchantNo" />
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
            <el-col :span="24">
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
            <el-col v-if="form.settBankAccType === '0030'" :span="12">
              <el-form-item label="开户行名称">
                <el-input v-model="form.settBankBranchName" />
              </el-form-item>
            </el-col>
            <el-col v-if="form.settBankAccType === '0030'" :span="12">
              <el-form-item label="开户行行号">
                <el-input v-model="form.settBankBranchId" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="银行账号">
                <el-input v-model="form.settBankAccNo" />
              </el-form-item>
            </el-col>
            <el-col v-if="form.settBankAccType === '0010'" :span="12">
              <el-form-item label="持卡人身份证号">
                <el-input v-model="form.identityNo" />
              </el-form-item>
            </el-col>
            <el-col v-if="form.settBankAccType === '0010'" :span="12">
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
import { getTradeEntryDetail, getAreaSelector, queryTradeEntryStatus } from '@/api/pay/tradeEntry'
import { getMerchant } from '@/api/merchant/merchant'
import dictData from '@/utils/dictData'

export default {
  name: 'TradeEntryDetail',
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: '待提交',
        10: '入网中',
        20: '认证中',
        21: '待签署协议',
        30: '正常',
        31: '修改中',
        32: '修改失败',
        40: '冻结',
        50: '注销',
        60: '入网失败'
      }
      return statusMap[status] || status
    },
    statusTypeFilter(status) {
      const statusMap = {
        0: 'info',
        10: 'info',
        20: 'warning',
        21: 'warning',
        30: 'success',
        31: 'info',
        32: 'danger',
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
      merchantList: [],
      form: {
        id: undefined,
        // Basic
        tenantId: '',
        merchantId: '',
        serviceProviderId: '',
        apiVersion: '',
        managerName: '',
        managerMobile: '',
        // Subject
        merchantNo: '',
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
  computed: {
    merchantName() {
      const id = this.form && this.form.merchantId
      if (id === null || id === undefined || id === '') return '-'
      const item = (this.merchantList || []).find(m => String(m.id) === String(id))
      return (item && item.name) || String(id)
    },
    canResubmit() {
      const val = Number(this.form.status)
      return [0, 32, 60].includes(val)
    }
  },
  created() {
    this.busKindOptions = dictData.getBusKindData()
    this.getProvinceList()
    this.getMerchantList()
    const id = this.$route.params.id
    if (id) {
      this.form.id = id
      this.fetchData(id)
    }
  },
  methods: {
    getMerchantList() {
      getMerchant().then(res => {
        if (res && res.code === 200) {
          this.merchantList = res.data || []
        } else {
          this.merchantList = []
        }
      }).catch(() => {
        this.merchantList = []
      })
    },
    mapAttachments(attchList) {
      if (!Array.isArray(attchList)) return
      attchList.forEach(a => {
        const url = a.fileUrl || a.url || a.path || ''
        const ft = (a.fileType != null ? String(a.fileType) : '').padStart(2, '0')
        if (!url) return
        if (ft === '04') {
          this.$set(this.form, 'corLicenseImg', url)
        } else if (ft === '01') {
          this.$set(this.form, 'corLegIdFaceImg', url)
        } else if (ft === '02') {
          this.$set(this.form, 'corLegIdBackImg', url)
        }
      })
    },
    getProvinceList() {
      getAreaSelector('-1').then(res => {
        this.provinceList = res.data
      })
    },
    fetchData(id) {
      // 优先调用聚合详情接口，返回 tradeEntry 和 attchList
      getTradeEntryDetail(id).then(response => {
        const data = response.data || {}
        this.form = data.tradeEntry || data
        this.$set(this.form, 'attchList', Array.isArray(data.attchList) ? data.attchList : [])
        this.mapAttachments(this.form.attchList)
        // 加载地址数据用于回显
        if (this.form.merProvinceId) {
          getAreaSelector(this.form.merProvinceId).then(res => {
            this.cityList = res.data
          })
        }
        if (this.form.merRegionId) {
          getAreaSelector(this.form.merRegionId).then(res => {
            this.areaList = res.data
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
        this.$message.error('获取失败')
      })
    },
    handleQueryStatus() {
      this.statusLoading = true
      queryTradeEntryStatus(this.form.id).then(response => {
        this.statusLoading = false
        if (response && response.code === 200) {
          this.$message.success('状态查询成功')
          // 刷新数据
          this.fetchData(this.form.id)
        } else {
          this.$message.error('状态查询失败')
        }
      }).catch(() => {
        this.statusLoading = false
      })
    },
    handleResubmit() {
      try {
        const payload = { ...this.form }
        delete payload.id
        sessionStorage.setItem('tradeEntryPrefill', JSON.stringify(payload))
      } catch (e) {
        void e
      }
      const query = { prefill: '1' }
      this.$router.push({ path: '/tradeEntry/add', query })
    },
    handleBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>商户进件详情</span>
        <div style="float: right;">
          <el-button size="mini" type="primary" @click="$router.back()">返回</el-button>
        </div>
      </div>

      <div v-loading="loading" element-loading-text="拼命加载中......">
        <div class="detail-view">
          <el-divider content-position="left">平台商户信息</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">商户名称</div>
                <div class="kv__value">{{ formatValue(merchantInfo.name) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">公司名称</div>
                <div class="kv__value">{{ formatValue(merchantInfo.companyName) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">社会统一信用代码</div>
                <div class="kv__value">{{ formatValue(merchantInfo.socialCreditCode) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">归属地区</div>
                <div class="kv__value">{{ formatValue(merchantInfo.provinceName) }}{{ formatValue(merchantInfo.regionName) }}{{ formatValue(merchantInfo.countyName) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">商户管理员</div>
                <div class="kv__value">{{ formatValue(merchantInfo.manageName) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">联系方式</div>
                <div class="kv__value">{{ formatValue(merchantInfo.contactInfo) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">角色类型</div>
                <div class="kv__value">{{ formatRoleType(merchantInfo.roleType) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">开票种类</div>
                <div class="kv__value">{{ formatInvoiceType(merchantInfo.invoiceType) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">备注</div>
                <div class="kv__value">{{ formatValue(merchantInfo.remark) }}</div>
              </div>
            </el-col>
            <el-col :span="24">
              <div class="kv">
                <div class="kv__label">营业执照</div>
                <div class="kv__value" style="display:flex; align-items:center;">
                  <el-image 
                    v-if="merchantInfo.businessLicence" 
                    :src="merchantInfo.businessLicence" 
                    :preview-src-list="[merchantInfo.businessLicence]"
                    style="width: 80px; height: 80px; border-radius: 4px;" 
                    fit="contain">
                  </el-image>
                  <span v-else>-</span>
                </div>
              </div>
            </el-col>
            <!-- <el-col :span="12">
              <div class="kv">
                <div class="kv__label">创建用户</div>
                <div class="kv__value">{{ formatValue(merchantInfo.createUser) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">更新用户</div>
                <div class="kv__value">{{ formatValue(merchantInfo.updateUser) }}</div>
              </div>
            </el-col> -->
            <!-- <el-col :span="12">
              <div class="kv">
                <div class="kv__label">创建时间</div>
                <div class="kv__value">{{ formatTime(merchantInfo.createTime) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">更新时间</div>
                <div class="kv__value">{{ formatTime(merchantInfo.updateTime) }}</div>
              </div>
            </el-col> -->
          </el-row>

          <el-divider content-position="left">进件信息</el-divider>
          <div v-if="!loading && !detail" style="text-align: center; color: #909399; padding: 40px 0;">
            <i class="el-icon-document" style="font-size: 40px; margin-bottom: 10px;"></i>
            <div>暂无进件资料</div>
          </div>
          <el-row v-else-if="detail" :gutter="20">
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">商户号</div>
                <div class="kv__value">{{ formatValue(detail.merchantNo) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">进件商户名称</div>
                <div class="kv__value">{{ formatValue(detail.merchantName) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">业务方交易商户编号</div>
                <div class="kv__value">{{ formatValue(detail.busTradeMerNo) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">结算账户类型</div>
                <div class="kv__value">{{ formatSettBankAccType(detail.settBankAccType) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">结算账户名称</div>
                <div class="kv__value">{{ formatValue(detail.settBankAccName) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">开户行行号</div>
                <div class="kv__value">{{ formatValue(detail.settBankBranchId) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">开户行全称</div>
                <div class="kv__value">{{ formatValue(detail.settBankBranchName) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">银行账号</div>
                <div class="kv__value">{{ formatValue(detail.settBankAccNo) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">入驻状态</div>
                <div class="kv__value">{{ formatStatus(detail.status) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="kv">
                <div class="kv__label">审核状态</div>
                <div class="kv__value">{{ formatAuditStatus(detail.auditStatus) }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { detailTradeEntryByMerchantId } from '@/api/pay/tradeEntry'
import { parseTime } from '@/utils/index'

export default {
  name: 'MerchantDetail',
  data() {
    return {
      loading: false,
      merchantId: '',
      detail: null,
      merchantInfo: {}
    }
  },
  watch: {
    '$route.query.merchantId': {
      handler() {
        this.init()
      },
      immediate: true
    }
  },
  methods: {
    init() {
      this.merchantId = (this.$route.query && this.$route.query.merchantId) || ''
      this.merchantInfo = {}
      try {
        const cached = sessionStorage.getItem('merchantTradeEntryMerchantInfo')
        if (cached) {
          const data = JSON.parse(cached)
          if (data && (data.id === this.merchantId || String(data.id) === String(this.merchantId))) {
            this.merchantInfo = data
          }
        }
      } catch (e) {}
      if (!this.merchantId) {
        this.detail = null
        return
      }
      this.fetchDetail()
    },
    fetchDetail() {
      this.loading = true
      detailTradeEntryByMerchantId({ merchantId: this.merchantId }).then(res => {
        if (res && res.code == 200) {
          this.detail = res.data || null
        } else {
          this.detail = null
          this.$message.error((res && res.msg) || '查询进件资料失败')
        }
      }).catch(() => {
        this.detail = null
        this.$message.error('查询进件资料失败')
      }).finally(() => {
        this.loading = false
      })
    },
    formatValue(val) {
      if (val === null || val === undefined || val === '') return ''
      return String(val)
    },
    formatRoleType(val) {
      if (!val) return '-'
      const map = {
        'OPERATOR': '运营商',
        'INVESTOR': '投资人',
        'LANDLORD': '场地方',
        'SETTLE': '分账主体'
      }
      let roles = []
      if (typeof val === 'string') {
        roles = val.split(',')
      } else if (Array.isArray(val)) {
        roles = val
      }
      return roles.map(r => map[r.trim()] || r).join('，') || '-'
    },
    formatTime(val) {
      if (val === null || val === undefined || val === '') return '-'
      try {
        return parseTime(val) || this.formatValue(val)
      } catch (e) {
        return this.formatValue(val)
      }
    },
    formatInvoiceType(val) {
      const n = Number(val)
      const map = {
        0: '不开票',
        1: '普票',
        2: '专票',
        3: '普票和专票'
      }
      return map[n] || this.formatValue(val)
    },
    formatSettBankAccType(val) {
      if (val === '0010' || val === 10 || val === '10') return '借记账户'
      if (val === '0030' || val === 30 || val === '30') return '对公账户'
      return this.formatValue(val)
    },
    formatStatus(val) {
      const n = Number(val)
      const map = {
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
      return map[n] || this.formatValue(val)
    },
    formatAuditStatus(val) {
      const n = Number(val)
      const map = {
        10: '待审核',
        20: '审核拒绝',
        30: '审核通过'
      }
      return map[n] || this.formatValue(val)
    }
  }
}
</script>

<style scoped>
.detail-view {
  padding: 6px 2px 14px;
}

.kv {
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px 12px;
  margin-bottom: 12px;
  min-height: 66px;
}

.kv__label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}

.kv__value {
  font-size: 14px;
  color: #303133;
  word-break: break-all;
  line-height: 20px;
}
</style>

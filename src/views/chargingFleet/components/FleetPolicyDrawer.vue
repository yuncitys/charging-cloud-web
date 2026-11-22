<template>
  <el-drawer
    :title="drawerTitle"
    :visible="visible"
    size="760px"
    direction="rtl"
    :wrapper-closable="false"
    append-to-body
    @close="handleClose"
  >
    <div class="policy-body">
      <el-tabs v-model="activeTab">
        <!-- 策略配置 -->
        <el-tab-pane label="策略配置" name="config">
          <el-form ref="formRef" :model="form" label-width="128px" size="small">
            <el-form-item label="启用策略">
              <el-switch v-model="form.enabled" :active-value="1" :inactive-value="0" />
              <span class="hint">关闭后仅受机构站点白名单限制</span>
            </el-form-item>

            <el-form-item label="允许司机自费">
              <el-switch v-model="form.allowPrivateCharge" :active-value="1" :inactive-value="0" />
              <span class="hint">关闭后该车队司机只能用企业钱包且受下列策略约束</span>
            </el-form-item>

            <el-form-item label="生效区间">
              <el-date-picker
                v-model="effectiveRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                class="control-full"
                clearable
              />
              <span class="hint">留空表示长期有效</span>
            </el-form-item>

            <el-form-item label="站点范围">
              <el-radio-group v-model="form.stationScopeType" @change="onScopeChange">
                <el-radio :label="null">继承机构</el-radio>
                <el-radio :label="2">按电站</el-radio>
                <el-radio :label="1">按商户</el-radio>
              </el-radio-group>
              <div v-if="form.stationScopeType" class="station-tree">
                <el-input v-model="stationKeyword" placeholder="输入关键字过滤" clearable size="small" class="station-tree__search" />
                <el-tree
                  ref="stationTree"
                  :data="stationTreeData"
                  node-key="key"
                  show-checkbox
                  default-expand-all
                  :filter-node-method="filterStationNode"
                  :props="{ label: 'label', children: 'children' }"
                  class="station-tree__inner"
                />
                <div class="hint">
                  只展示机构已授权的{{ form.stationScopeType === 1 ? '商户（勾选商户即整个商户下站点可用）' : '站点' }}，越权配置会被后端拒绝
                </div>
              </div>
            </el-form-item>

            <el-form-item label="可用时段">
              <div v-for="(range, index) in form.timeRanges" :key="'tr' + index" class="time-range">
                <el-time-picker v-model="range.start" format="HH:mm" value-format="HH:mm" placeholder="开始" size="small" class="time-range__picker" />
                <span class="time-range__sep">~</span>
                <el-time-picker v-model="range.end" format="HH:mm" value-format="HH:mm" placeholder="结束" size="small" class="time-range__picker" />
                <el-button type="text" class="time-range__del" @click="form.timeRanges.splice(index, 1)">删除</el-button>
              </div>
              <el-button size="mini" type="primary" plain icon="el-icon-plus" @click="addTimeRange">新增时段</el-button>
              <div class="hint">留空表示不限时段；开始晚于结束视为跨天（如 22:00~06:00）</div>
            </el-form-item>

            <el-form-item label="单次限额">
              <div class="limit-row">
                <el-input-number v-model="form.singleLimitMoney" :min="0" :precision="2" :controls="false" placeholder="金额不限" class="limit-row__input" />
                <span class="unit unit--money">元</span>
                <el-input-number v-model="form.singleLimitPower" :min="0" :precision="2" :controls="false" placeholder="电量不限" class="limit-row__input" />
                <span class="unit unit--power">kWh</span>
              </div>
            </el-form-item>

            <el-form-item label="日限额">
              <div class="limit-row">
                <el-input-number v-model="form.dayLimitMoney" :min="0" :precision="2" :controls="false" placeholder="金额不限" class="limit-row__input" />
                <span class="unit unit--money">元</span>
                <el-input-number v-model="form.dayLimitPower" :min="0" :precision="2" :controls="false" placeholder="电量不限" class="limit-row__input" />
                <span class="unit unit--power">kWh</span>
              </div>
            </el-form-item>

            <el-form-item label="月限额">
              <div class="limit-row">
                <el-input-number v-model="form.monthLimitMoney" :min="0" :precision="2" :controls="false" placeholder="金额不限" class="limit-row__input" />
                <span class="unit unit--money">元</span>
                <el-input-number v-model="form.monthLimitPower" :min="0" :precision="2" :controls="false" placeholder="电量不限" class="limit-row__input" />
                <span class="unit unit--power">kWh</span>
              </div>
              <div class="hint hint--block">
                <i class="el-icon-info" /> 限额留空或填 <strong>0</strong> 表示不限额；金额按实付（优惠后）统计，电量按订单充电量统计；
                日/月累计按订单开始时间归集，每日 00:10 会用订单明细校准。
              </div>
            </el-form-item>

            <el-form-item label="策略模板">
              <div class="limit-row">
                <el-select v-model="copyFromFleetId" placeholder="从同机构其它车队复制" clearable filterable class="limit-row__select">
                  <el-option v-for="f in siblingFleets" :key="f.id" :label="f.name" :value="f.id" />
                </el-select>
                <el-button size="small" type="primary" plain :disabled="!copyFromFleetId" @click="handleCopy">复制</el-button>
              </div>
              <div class="hint hint--block">复制后默认不启用，确认无误再开启</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 用量 -->
        <el-tab-pane label="用量" name="usage">
          <div class="usage-card">
            <div class="usage-item">
              <div class="usage-item__title">今日金额</div>
              <el-progress :percentage="percent(usage.todayMoney, usage.dayLimitMoney)" :format="() => moneyText(usage.todayMoney, usage.dayLimitMoney)" />
            </div>
            <div class="usage-item">
              <div class="usage-item__title">今日电量</div>
              <el-progress :percentage="percent(usage.todayPower, usage.dayLimitPower)" :format="() => powerText(usage.todayPower, usage.dayLimitPower)" />
            </div>
            <div class="usage-item">
              <div class="usage-item__title">本月金额</div>
              <el-progress :percentage="percent(usage.monthMoney, usage.monthLimitMoney)" :format="() => moneyText(usage.monthMoney, usage.monthLimitMoney)" />
            </div>
            <div class="usage-item">
              <div class="usage-item__title">本月电量</div>
              <el-progress :percentage="percent(usage.monthPower, usage.monthLimitPower)" :format="() => powerText(usage.monthPower, usage.monthLimitPower)" />
            </div>
            <div class="hint">用量由实时累计得出，日终 Job 会用订单明细校准；无单时可点刷新。</div>
          </div>
        </el-tab-pane>

        <!-- 命中日志 -->
        <el-tab-pane label="命中日志" name="hit">
          <div class="hit-toolbar">
            <el-select v-model="hitQuery.hitType" placeholder="类型" clearable size="small" style="width: 140px;" @change="loadHitLog">
              <el-option v-for="opt in hitTypes" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <el-input v-model="hitQuery.orderCode" placeholder="订单号" clearable size="small" style="width: 200px;" />
            <el-button size="small" type="primary" @click="loadHitLog">查询</el-button>
          </div>
          <el-table v-loading="hitLoading" :data="hitList" size="mini" border max-height="360">
            <el-table-column prop="createTime" label="时间" width="160" />
            <el-table-column prop="hitType" label="类型" width="90">
              <template slot-scope="scope">{{ hitTypeText(scope.row.hitType) }}</template>
            </el-table-column>
            <el-table-column prop="userAccount" label="司机" width="120" />
            <el-table-column prop="orderCode" label="订单号" min-width="180" show-overflow-tooltip />
            <el-table-column prop="reason" label="原因" min-width="220" show-overflow-tooltip />
          </el-table>
          <div class="hit-pager">
            <el-pagination
              :current-page="hitQuery.page"
              :page-size="hitQuery.limit"
              :total="hitTotal"
              layout="total, prev, pager, next"
              background
              @current-change="onHitPageChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="policy-footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button size="small" icon="el-icon-refresh" @click="loadAll">刷新</el-button>
      <el-button size="small" type="primary" :loading="saving" @click="handleSave">保存</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { getChargeStationTreeByMerchant } from '@/api/netWorkDot/netWorkDotList'
import { getChargingCustomerDetail } from '@/api/chargingCustomer/index'
import { getFleetOptions } from '@/api/enterpriseFleet/fleet'
import {
  copyFleetPolicy,
  getFleetPolicy,
  getFleetPolicyHitPage,
  saveFleetPolicy
} from '@/api/enterpriseFleet/policy'

const HIT_TYPES = [
  { label: '站点不匹配', value: 'STATION' },
  { label: '时段外', value: 'TIME' },
  { label: '单次限额', value: 'SINGLE' },
  { label: '日限额', value: 'DAY' },
  { label: '月限额', value: 'MONTH' },
  { label: '限额停充', value: 'STOP' }
]

export default {
  name: 'FleetPolicyDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    fleet: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      activeTab: 'config',
      saving: false,
      loading: false,
      form: this.defaultForm(),
      effectiveRange: [],
      stationKeyword: '',
      stationTreeData: [],
      allowedStationIds: [],
      orgScopeType: 2,
      siblingFleets: [],
      copyFromFleetId: null,
      usage: {
        todayMoney: 0,
        todayPower: 0,
        monthMoney: 0,
        monthPower: 0,
        dayLimitMoney: null,
        dayLimitPower: null,
        monthLimitMoney: null,
        monthLimitPower: null
      },
      hitTypes: HIT_TYPES,
      hitQuery: { page: 1, limit: 20, fleetId: null, hitType: '', orderCode: '' },
      hitList: [],
      hitTotal: 0,
      hitLoading: false
    }
  },
  computed: {
    drawerTitle() {
      return `车队策略：${this.fleet.name || '-'}`
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.activeTab = 'config'
        this.loadAll()
      }
    },
    stationKeyword(val) {
      this.$nextTick(() => {
        const tree = this.$refs.stationTree
        if (tree) tree.filter(String(val || '').trim())
      })
    }
  },
  methods: {
    defaultForm() {
      return {
        fleetId: null,
        enabled: 0,
        allowPrivateCharge: 1,
        stationScopeType: null,
        singleLimitMoney: null,
        singleLimitPower: null,
        dayLimitMoney: null,
        dayLimitPower: null,
        monthLimitMoney: null,
        monthLimitPower: null,
        timeRanges: []
      }
    },
    loadAll() {
      if (!this.fleet || !this.fleet.id) return
      this.loading = true
      Promise.all([this.loadPolicy(), this.loadStations(), this.loadAllowedStations(), this.loadSiblings()])
        .then(() => { this.loading = false })
        .catch(() => { this.loading = false })
      this.hitQuery.fleetId = this.fleet.id
      this.loadHitLog()
    },
    loadPolicy() {
      return getFleetPolicy(this.fleet.id).then(res => {
        if (res.code !== 200) {
          this.$message.error(res.msg || '策略加载失败')
          return
        }
        const data = res.data || {}
        this.form = {
          fleetId: this.fleet.id,
          enabled: data.enabled == null ? 0 : data.enabled,
          allowPrivateCharge: data.allowPrivateCharge == null ? 1 : data.allowPrivateCharge,
          stationScopeType: data.stationScopeType == null ? null : data.stationScopeType,
          singleLimitMoney: data.singleLimitMoney,
          singleLimitPower: data.singleLimitPower,
          dayLimitMoney: data.dayLimitMoney,
          dayLimitPower: data.dayLimitPower,
          monthLimitMoney: data.monthLimitMoney,
          monthLimitPower: data.monthLimitPower,
          timeRanges: (data.timeRanges || []).map(r => ({ start: r.start, end: r.end }))
        }
        this.effectiveRange = data.effectiveFrom && data.effectiveTo ? [data.effectiveFrom, data.effectiveTo] : []
        this.usage = {
          todayMoney: data.todayMoney || 0,
          todayPower: data.todayPower || 0,
          monthMoney: data.monthMoney || 0,
          monthPower: data.monthPower || 0,
          dayLimitMoney: data.dayLimitMoney,
          dayLimitPower: data.dayLimitPower,
          monthLimitMoney: data.monthLimitMoney,
          monthLimitPower: data.monthLimitPower
        }
        this.$nextTick(() => this.applyStationChecked())
      })
    },
    loadStations() {
      return Promise.resolve()
    },
    loadAllowedStations() {
      const orgId = this.fleet.orgId
      if (!orgId) return Promise.resolve()
      return getChargingCustomerDetail(orgId).then(res => {
        this.stationTreeData = []
        if (res.code === 200) {
          const detail = res.data || {}
          this.orgScopeType = detail.stationScopeType == null ? 2 : detail.stationScopeType
          this.allowedStationIds = detail.dataId || []
        }
        // 机构可用站点就绪后重建站点树并按当前范围回显勾选
        return this.$nextTick().then(() => {
          if (this.form.stationScopeType) {
            return this.applyStationChecked()
          }
          return null
        })
      }).catch(() => { this.stationTreeData = [] })
    },
    loadSiblings() {
      const orgId = this.fleet.orgId
      if (!orgId) return Promise.resolve()
      return getFleetOptions(orgId).then(res => {
        if (res.code === 200) {
          this.siblingFleets = (res.data || []).filter(f => f.id !== this.fleet.id)
        }
      }).catch(() => {})
    },
    loadStationTree() {
      if (!this.allowedStationIds.length) return Promise.resolve()
      return getChargeStationTreeByMerchant().then(res => {
        if (res.code !== 200) return
        const allowed = new Set((this.allowedStationIds || []).map(String))
        // 机构按商户授权时：直接展示机构授权商户，其下站点全部可用；
        // 机构按电站授权时：只展示被授权站点（商户由站点反推）
        const orgByMerchant = Number(this.orgScopeType) === 1
        const merchants = []
        ;(res.data || []).forEach(merchant => {
          const merchantKey = String(merchant.id)
          const allStations = (merchant.chargingStationInfoVoList || []).map(st => ({
            key: String(st.id), label: st.networkName, stationId: st.id
          }))
          if (orgByMerchant) {
            if (!allowed.has(merchantKey)) return
            if (!allStations.length) return
            merchants.push({ key: 'merchant-' + merchant.id, label: merchant.name, merchantId: merchant.id, children: allStations })
          } else {
            const stations = allStations.filter(st => allowed.has(String(st.stationId)))
            if (!stations.length) return
            merchants.push({ key: 'merchant-' + merchant.id, label: merchant.name, merchantId: merchant.id, children: stations })
          }
        })
        this.stationTreeData = merchants
      }).catch(() => {})
    },
    applyStationChecked() {
      if (!this.form.stationScopeType) return
      this.loadStationTree().then(() => {
        const tree = this.$refs.stationTree
        if (!tree) return
        const ids = this.form.stationIds || []
        const keys = this.form.stationScopeType === 1 ? ids.map(id => 'merchant-' + id) : ids.map(String)
        tree.setCheckedKeys(keys)
      })
    },
    onScopeChange() {
      this.$nextTick(() => this.applyStationChecked())
    },
    addTimeRange() {
      this.form.timeRanges.push({ start: '08:00', end: '20:00' })
    },
    collectStationIds() {
      const tree = this.$refs.stationTree
      if (!tree || !this.form.stationScopeType) return []
      const checked = tree.getCheckedNodes().filter(n => n.stationId != null || n.merchantId != null)
      if (this.form.stationScopeType === 1) {
        const ids = new Set()
        checked.forEach(n => {
          if (n.merchantId != null) ids.add(n.merchantId)
        })
        return Array.from(ids)
      }
      const allowed = new Set((this.allowedStationIds || []).map(String))
      const orgByMerchant = Number(this.orgScopeType) === 1
      return checked
        .filter(n => n.stationId != null)
        .map(n => n.stationId)
        .filter(id => orgByMerchant || allowed.has(String(id)))
    },
    handleSave() {
      if (this.form.stationScopeType && !this.allowedStationIds.length) {
        this.$message.warning('机构未配置可用站点，无法设置车队站点范围')
        return
      }
      const payload = Object.assign({}, this.form, {
        stationIds: this.collectStationIds(),
        timeRanges: (this.form.timeRanges || []).filter(r => r.start && r.end),
        effectiveFrom: this.effectiveRange && this.effectiveRange[0] ? this.effectiveRange[0] : null,
        effectiveTo: this.effectiveRange && this.effectiveRange[1] ? this.effectiveRange[1] : null
      })
      this.saving = true
      saveFleetPolicy(payload).then(res => {
        this.saving = false
        if (res.code === 200) {
          this.$message.success(res.msg || '保存成功')
          this.$emit('saved')
          this.loadPolicy()
        } else {
          this.$message.error(res.msg || '保存失败')
        }
      }).catch(() => { this.saving = false })
    },
    handleCopy() {
      if (!this.copyFromFleetId) return
      copyFleetPolicy(this.copyFromFleetId, this.fleet.id).then(res => {
        if (res.code === 200) {
          this.$message.success('已复制，默认未启用')
          this.loadPolicy()
        } else {
          this.$message.error(res.msg || '复制失败')
        }
      })
    },
    loadHitLog() {
      if (!this.fleet || !this.fleet.id) return
      this.hitLoading = true
      getFleetPolicyHitPage(this.hitQuery).then(res => {
        this.hitLoading = false
        if (res.code === 200) {
          this.hitList = res.data || []
          this.hitTotal = res.count || 0
        }
      }).catch(() => { this.hitLoading = false })
    },
    onHitPageChange(page) {
      this.hitQuery.page = page
      this.loadHitLog()
    },
    filterStationNode(value, data) {
      if (!value) return true
      return String(data.label || '').indexOf(value) > -1
    },
    hitTypeText(type) {
      const hit = HIT_TYPES.find(t => t.value === type)
      return hit ? hit.label : (type || '-')
    },
    percent(used, limit) {
      if (!limit || Number(limit) <= 0) return 0
      const p = (Number(used || 0) / Number(limit)) * 100
      return Math.max(0, Math.min(100, Math.round(p)))
    },
    moneyText(used, limit) {
      return limit ? `￥${used || 0} / ￥${limit}` : `￥${used || 0}（不限）`
    },
    powerText(used, limit) {
      return limit ? `${used || 0} / ${limit} kWh` : `${used || 0} kWh（不限）`
    },
    handleClose() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
.policy-body {
  padding: 0 20px 80px;
}
.hint {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
.control-full {
  width: 100%;
}
.limit-row {
  display: grid;
  grid-template-columns: 180px 36px 180px 52px;
  align-items: center;
  gap: 8px 10px;
}
.limit-row__input {
  width: 180px;
}
.unit--money {
  width: 36px;
}
.unit--power {
  width: 52px;
}
.limit-row__select {
  flex: 1;
}
.station-tree {
  margin-top: 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 8px;
  background: #fafafa;
  width: 100%;
}
.station-tree__search {
  width: 100%;
}
.station-tree__inner {
  max-height: 220px;
  overflow: auto;
  margin-top: 8px;
}
.time-range {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.time-range__picker {
  width: 120px;
  flex: none;
}
.time-range__sep {
  color: #909399;
}
.time-range__del {
  color: #f56c6c;
}
.unit {
  color: #909399;
  font-size: 12px;
}
.usage-card {
  padding: 8px 0;
}
.usage-item {
  margin-bottom: 18px;
}
.usage-item__title {
  font-size: 13px;
  color: #303133;
  margin-bottom: 6px;
}
.hit-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.hit-pager {
  margin-top: 10px;
  text-align: right;
}
.policy-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
  background: #fff;
  text-align: right;
}
/* 抽屉内控件宽度统一，避免长短不齐 */
.policy-body >>> .el-form-item {
  margin-bottom: 16px;
}
.policy-body >>> .el-select,
.policy-body >>> .el-date-editor.el-input,
.policy-body >>> .el-date-editor--datetimerange {
  width: 100%;
}
.policy-body >>> .el-form-item__content > .el-select,
.policy-body >>> .el-form-item__content > .el-input,
.policy-body >>> .el-form-item__content > .el-date-editor {
  max-width: 100%;
}
.hint--block {
  display: block;
  margin: 6px 0 0;
  line-height: 18px;
}
/* 时段选择器固定宽度（放在样式末尾，覆盖抽屉内通用 100% 规则） */
.policy-body >>> .el-date-editor.time-range__picker {
  width: 120px;
}
</style>

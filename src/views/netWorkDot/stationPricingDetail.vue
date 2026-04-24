<template>
  <div class="app-container station-pricing-detail">
    <div class="detail-header">
      <el-button type="text" icon="el-icon-arrow-left" @click="goBack">返回</el-button>
      <span class="detail-title">{{ pageTitle }}</span>
    </div>

    <el-card v-loading="currentLoading" class="detail-card" shadow="never">
      <div slot="header" class="card-header">
        <span>当前计费策略</span>
      </div>
      <template v-if="currentError">
        <el-alert :title="currentError" type="warning" :closable="false" show-icon />
      </template>
      <template v-else-if="currentVo && currentVo.pricing">
        <div class="detail-kv-grid">
          <div class="detail-kv-item">
            <div class="detail-kv-item__label">方案名称</div>
            <div class="detail-kv-item__value">{{ currentVo.pricing.feeName || '—' }}</div>
          </div>
          <!-- <div class="detail-kv-item">
            <div class="detail-kv-item__label">更新人</div>
            <div class="detail-kv-item__value">{{ currentVo.pricing.updateUser || '—' }}</div>
          </div> -->
          <div class="detail-kv-item">
            <div class="detail-kv-item__label">更新时间</div>
            <div class="detail-kv-item__value">{{ currentVo.pricing.updateTime | formatDate }}</div>
          </div>
        </div>
        <el-table
          :data="currentPriceRows"
          border
          size="small"
          style="width: 100%; margin-top: 16px;"
          empty-text="暂无时段明细"
        >
          <el-table-column type="index" label="序号" width="50" align="center" />
          <el-table-column label="开始时段" align="center" width="110">
            <template slot-scope="scope">{{ formatHm(scope.row.beginTime) }}</template>
          </el-table-column>
          <el-table-column label="结束时段" align="center" width="110">
            <template slot-scope="scope">{{ formatHm(scope.row.endTime) }}</template>
          </el-table-column>
          <el-table-column label="时段类型" align="center" width="100">
            <template slot-scope="scope">{{ flagLabelFromContent(scope.row.flag) }}</template>
          </el-table-column>
          <el-table-column label="电费(元/度)" align="center">
            <template slot-scope="scope">{{ scope.row.electricityPrice }}</template>
          </el-table-column>
          <el-table-column label="服务费(元/度)" align="center">
            <template slot-scope="scope">{{ scope.row.serviceChargePrice }}</template>
          </el-table-column>
        </el-table>
      </template>
      <div v-else class="current-pricing-empty">
        <i class="el-icon-document" />
        <p>该站点尚未配置计费策略</p>
      </div>
    </el-card>

    <el-card v-loading="historyLoading" class="detail-card" shadow="never">
      <div slot="header" class="card-header">
        <span>历史计费策略</span>
        <span class="card-sub">（编辑保存前自动归档）</span>
      </div>
      <el-table :data="historyList" border size="small" empty-text="暂无历史记录">
        <el-table-column type="index" label="序号" width="50" align="center" />
        <el-table-column prop="createTime" label="归档时间" width="170" align="center">
          <template slot-scope="scope">{{ scope.row.createTime | formatDate }}</template>
        </el-table-column>
        <el-table-column prop="createUser" label="操作人" width="120" align="center" show-overflow-tooltip />
        <el-table-column label="策略类型" width="120" align="center">
          <template slot-scope="scope">{{ formatHistoryPriceType(scope.row.priceType) }}</template>
        </el-table-column>
        <el-table-column label="有效" width="80" align="center">
          <template slot-scope="scope">{{ scope.row.validFlag === '1' ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column prop="historyId" label="历史ID" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="openSnapshot(scope.row)">查看快照</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      title="历史快照明细"
      :visible.sync="snapshotVisible"
      width="800px"
      append-to-body
      @closed="onSnapshotClosed"
    >
      <div v-loading="snapshotLoading">
        <div v-if="snapshotStrategy" class="detail-kv-grid">
          <div class="detail-kv-item">
            <div class="detail-kv-item__label">归档时间</div>
            <div class="detail-kv-item__value">{{ snapshotStrategy.createTime | formatDate }}</div>
          </div>
          <div class="detail-kv-item">
            <div class="detail-kv-item__label">操作人</div>
            <div class="detail-kv-item__value">{{ snapshotStrategy.createUser || '—' }}</div>
          </div>
          <div class="detail-kv-item">
            <div class="detail-kv-item__label">策略类型</div>
            <div class="detail-kv-item__value">{{ formatHistoryPriceType(snapshotStrategy.priceType) }}</div>
          </div>
          <div class="detail-kv-item">
            <div class="detail-kv-item__label">历史ID</div>
            <div class="detail-kv-item__value">{{ snapshotStrategy.historyId }}</div>
          </div>
        </div>
        <el-table
          :data="snapshotPrices"
          border
          size="small"
          style="width: 100%; margin-top: 12px;"
          empty-text="无明细"
        >
          <el-table-column type="index" label="序号" width="50" align="center" />
          <el-table-column label="时段类型" width="90" align="center">
            <template slot-scope="scope">{{ periodTypeLabel(scope.row.periodType) }}</template>
          </el-table-column>
          <el-table-column label="开始" align="center" width="100">
            <template slot-scope="scope">{{ formatHm(scope.row.beginTime) }}</template>
          </el-table-column>
          <el-table-column label="结束" align="center" width="100">
            <template slot-scope="scope">{{ formatHm(scope.row.endTime) }}</template>
          </el-table-column>
          <el-table-column label="尖峰平谷" align="center" width="100">
            <template slot-scope="scope">{{ flagLabelFromHistory(scope.row.flag) }}</template>
          </el-table-column>
          <el-table-column label="电费(元/度)" align="center">
            <template slot-scope="scope">{{ scope.row.electricityPrice }}</template>
          </el-table-column>
          <el-table-column label="服务费(元/度)" align="center">
            <template slot-scope="scope">{{ scope.row.serviceChargePrice }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getStationCarPricingDetail,
  getStationChargePriceHistoryList,
  getStationChargePriceHistoryDetail
} from '@/api/netWorkDot/stationPricingRule.js'
import { parseTime } from '@/utils/index'

export default {
  name: 'StationPricingDetail',
  filters: {
    formatDate(time) {
      if (!time) return ''
      return parseTime(time)
    }
  },
  data() {
    return {
      stationId: null,
      stationName: '',
      currentLoading: false,
      currentError: '',
      currentVo: null,
      historyLoading: false,
      historyList: [],
      snapshotVisible: false,
      snapshotLoading: false,
      snapshotStrategy: null,
      snapshotPrices: []
    }
  },
  computed: {
    pageTitle() {
      const n = this.stationName || '站点'
      return `${n} — 电价详情`
    },
    currentPriceRows() {
      const p = this.currentVo && this.currentVo.pricing
      if (!p || !Array.isArray(p.priceContents)) return []
      return p.priceContents
    }
  },
  created() {
    const q = this.$route.query || {}
    this.stationId = q.stationId != null && q.stationId !== '' ? Number(q.stationId) : null
    this.stationName = q.stationName || ''
    if (!this.stationId || Number.isNaN(this.stationId)) {
      this.$message.error('缺少站点ID')
      this.goBack()
      return
    }
    this.loadCurrent()
    this.loadHistory()
  },
  methods: {
    goBack() {
      this.$router.push({ path: '/netWorkDot/stationPricingList' })
    },
    loadCurrent() {
      this.currentLoading = true
      this.currentError = ''
      getStationCarPricingDetail({ stationId: this.stationId })
        .then(res => {
          if (res && res.code === 200) {
            this.currentVo = res.data || null
          } else {
            this.currentError = (res && res.msg) || '加载当前方案失败'
          }
        })
        .catch(() => {
          this.currentError = '加载当前方案失败'
        })
        .finally(() => {
          this.currentLoading = false
        })
    },
    loadHistory() {
      this.historyLoading = true
      getStationChargePriceHistoryList({ stationId: this.stationId })
        .then(res => {
          if (res && res.code === 200) {
            this.historyList = Array.isArray(res.data) ? res.data : []
          } else {
            this.$message.error((res && res.msg) || '加载历史失败')
            this.historyList = []
          }
        })
        .catch(() => {
          this.$message.error('加载历史失败')
          this.historyList = []
        })
        .finally(() => {
          this.historyLoading = false
        })
    },
    openSnapshot(row) {
      const historyId = row && row.historyId
      if (!historyId) {
        this.$message.error('缺少历史ID')
        return
      }
      this.snapshotVisible = true
      this.snapshotLoading = true
      this.snapshotStrategy = null
      this.snapshotPrices = []
      getStationChargePriceHistoryDetail({ historyId })
        .then(res => {
          if (res && res.code === 200 && res.data) {
            this.snapshotStrategy = res.data.strategy || null
            this.snapshotPrices = Array.isArray(res.data.prices) ? res.data.prices : []
          } else {
            this.$message.error((res && res.msg) || '加载快照失败')
            this.snapshotVisible = false
          }
        })
        .catch(() => {
          this.$message.error('加载快照失败')
          this.snapshotVisible = false
        })
        .finally(() => {
          this.snapshotLoading = false
        })
    },
    onSnapshotClosed() {
      this.snapshotStrategy = null
      this.snapshotPrices = []
    },
    formatHm(val) {
      if (val == null || val === '') return '—'
      const s = String(val).replace(/\D/g, '')
      if (!s) return String(val)
      const p = s.padStart(4, '0')
      return `${p.slice(0, 2)}:${p.slice(2)}`
    },
    flagLabelFromContent(flag) {
      const m = { 0: '尖', 1: '峰', 2: '平', 3: '谷' }
      return m[flag] != null ? m[flag] : '—'
    },
    flagLabelFromHistory(flag) {
      const m = { 1: '尖', 2: '峰', 3: '平', 4: '谷' }
      return m[flag] != null ? m[flag] : '—'
    },
    formatHistoryPriceType(t) {
      if (t === '1') return '48费率'
      if (t === '0') return '尖峰平谷'
      return t != null && t !== '' ? String(t) : '—'
    },
    periodTypeLabel(t) {
      if (t === '2') return '时间'
      if (t === '1') return '时段'
      return t != null && t !== '' ? String(t) : '—'
    }
  }
}
</script>

<style scoped>
.station-pricing-detail {
  padding-bottom: 24px;
}
.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.detail-title {
  margin-left: 8px;
  font-size: 16px;
  font-weight: 600;
}
.detail-card {
  margin-bottom: 16px;
}
.card-header {
  font-weight: 600;
}
.card-sub {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}
.detail-kv-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 10px 12px;
}
.detail-kv-item {
  display: flex;
  min-height: 32px;
  border: 1px solid #ebeef5;
}
.detail-kv-item__label {
  width: 92px;
  padding: 8px 10px;
  color: #606266;
  background: #fafafa;
  border-right: 1px solid #ebeef5;
  box-sizing: border-box;
}
.detail-kv-item__value {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  color: #303133;
  word-break: break-all;
}
.current-pricing-empty {
  padding: 40px 16px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
.current-pricing-empty .el-icon-document {
  display: block;
  margin: 0 auto 12px;
  font-size: 48px;
  color: #c0c4cc;
}
.current-pricing-empty p {
  margin: 0;
}
</style>

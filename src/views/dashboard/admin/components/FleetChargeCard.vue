<template>
  <el-row v-if="visible" class="fleet-card" :gutter="16">
    <el-col :span="24">
      <div class="fleet-card__header">
        <div class="fleet-card__title">车队充电</div>
        <div class="fleet-card__actions">
          <el-radio-group v-model="range" size="mini" @change="loadData">
            <el-radio-button label="today">今日</el-radio-button>
            <el-radio-button label="week">近 7 天</el-radio-button>
            <el-radio-button label="month">近 30 天</el-radio-button>
          </el-radio-group>
          <el-button size="mini" plain icon="el-icon-d-arrow-right" @click="toFleet">车队管理</el-button>
        </div>
      </div>

      <el-row :gutter="16" class="fleet-card__metrics">
        <el-col :xs="12" :sm="8" :md="4">
          <div class="metric">
            <div class="metric__label">命中次数</div>
            <div class="metric__value">{{ overview.totalHits || 0 }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="metric">
            <div class="metric__label">拒绝下单</div>
            <div class="metric__value">{{ overview.rejectCount || 0 }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="metric">
            <div class="metric__label">拒绝率</div>
            <div class="metric__value metric__value--warn">{{ overview.rejectRate || 0 }}%</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="metric">
            <div class="metric__label">自动停充</div>
            <div class="metric__value metric__value--danger">{{ overview.stopCount || 0 }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="metric">
            <div class="metric__label">涉及车队</div>
            <div class="metric__value">{{ overview.fleetCount || 0 }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="metric">
            <div class="metric__label">涉及司机</div>
            <div class="metric__value">{{ overview.driverCount || 0 }}</div>
          </div>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="topFleets" size="mini" border>
        <el-table-column prop="fleetName" label="车队" min-width="160">
          <template slot-scope="scope">{{ scope.row.fleetName || '未编队' }}</template>
        </el-table-column>
        <el-table-column prop="orgName" label="所属机构" min-width="180" show-overflow-tooltip />
        <el-table-column prop="hits" label="命中" width="80" align="center" />
        <el-table-column prop="rejectCount" label="拒绝下单" width="100" align="center" />
        <el-table-column prop="stopCount" label="自动停充" width="100" align="center" />
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="toFleet(scope.row)">查看策略</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!loading && topFleets.length === 0" class="fleet-card__empty">所选区间内暂无车队限额命中记录</div>
    </el-col>
  </el-row>
</template>

<script>
import { getFleetMonitorOverview } from '@/api/enterpriseFleet/stat'

function dayStr(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default {
  name: 'FleetChargeCard',
  data() {
    return {
      range: 'week',
      loading: false,
      overview: {},
      topFleets: [],
      visible: false
    }
  },
  created() {
    this.visible = !!(this.btnAuthen && this.btnAuthen.permsVerifAuthention(':charging:customer:fleet:stat'))
    if (this.visible) this.loadData()
  },
  methods: {
    loadData() {
      const offset = this.range === 'today' ? 0 : this.range === 'week' ? -6 : -29
      this.loading = true
      getFleetMonitorOverview({ startDate: dayStr(offset), endDate: dayStr(0) }).then(res => {
        this.loading = false
        if (res.code === 200) {
          const data = res.data || {}
          this.overview = data.overview || {}
          this.topFleets = data.topFleets || []
        } else {
          this.visible = false
        }
      }).catch(() => { this.loading = false })
    },
    toFleet(row) {
      const query = row && row.fleetId ? { fleetId: row.fleetId } : {}
      this.$router.push({ path: '/chargingFleet/index', query })
    }
  }
}
</script>

<style scoped>
.fleet-card {
  margin-bottom: 24px;
}
.fleet-card .el-col {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-sizing: border-box;
}
.fleet-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.fleet-card__title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.fleet-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.fleet-card__metrics {
  margin-bottom: 12px;
}
.metric {
  padding: 8px 12px;
  background: #f7f9fc;
  border-radius: 8px;
}
.metric__label {
  font-size: 12px;
  color: #909399;
}
.metric__value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  line-height: 28px;
}
.metric__value--warn {
  color: #e6a23c;
}
.metric__value--danger {
  color: #f56c6c;
}
.fleet-card__empty {
  text-align: center;
  color: #909399;
  font-size: 12px;
  padding: 12px 0;
}
</style>

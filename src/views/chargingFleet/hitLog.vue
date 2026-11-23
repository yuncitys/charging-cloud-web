<template>
  <div class="app-container fleet-hitlog-page">
    <div class="filter-container">
      <div class="search-row">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          style="width: 260px;"
          :clearable="false"
          @change="search"
        />
        <el-select v-model="query.fleetId" placeholder="全部车队" clearable filterable style="width: 190px;" @change="search">
          <el-option v-for="f in fleetOptions" :key="f.id" :label="f.name" :value="f.id" />
        </el-select>
        <el-select v-model="query.scene" placeholder="全部场景" clearable style="width: 150px;" @change="search">
          <el-option value="START_CHECK" label="下单拒绝" />
          <el-option value="AUTO_STOP" label="自动停充" />
        </el-select>
        <el-select v-model="query.hitType" placeholder="全部类型" clearable style="width: 140px;" @change="search">
          <el-option value="STATION" label="站点不在范围" />
          <el-option value="TIME" label="非允许时段" />
          <el-option value="SINGLE" label="单次限额" />
          <el-option value="DAY" label="日限额" />
          <el-option value="MONTH" label="月限额" />
        </el-select>
        <el-input v-model="query.userAccount" placeholder="司机账号" clearable style="width: 160px;" @keyup.enter.native="search" />
        <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
        <el-button plain @click="resetQuery">重置</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="list" fit highlight-current-row style="width: 100%">
      <el-table-column prop="createTime" label="命中时间" width="170" />
      <el-table-column label="车队" width="150">
        <template slot-scope="scope">{{ scope.row.fleetName || '未编队' }}</template>
      </el-table-column>
      <el-table-column prop="orgName" label="所属机构" min-width="160" show-overflow-tooltip />
      <el-table-column prop="userAccount" label="司机账号" width="140" />
      <el-table-column label="场景" width="110" align="center">
        <template slot-scope="scope">
          <el-tag size="mini" :type="scope.row.scene === 'AUTO_STOP' ? 'danger' : 'warning'">
            {{ scope.row.scene === 'AUTO_STOP' ? '自动停充' : (scope.row.scene === 'START_CHECK' ? '下单拒绝' : '-') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="命中类型" width="130" align="center">
        <template slot-scope="scope">{{ hitTypeText(scope.row.hitType) }}</template>
      </el-table-column>
      <el-table-column prop="reason" label="命中原因" min-width="240" show-overflow-tooltip />
      <el-table-column prop="orderCode" label="订单号" width="200" show-overflow-tooltip />
      <el-table-column prop="deviceCode" label="设备" width="160" show-overflow-tooltip />
      <el-table-column prop="devicePort" label="枪口" width="70" align="center" />
    </el-table>

    <div class="pagination-container">
      <el-pagination
        :current-page="query.page"
        :page-size="query.limit"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        background
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { getFleetPage } from '@/api/enterpriseFleet/fleet'
import { getFleetPolicyHitPage } from '@/api/enterpriseFleet/policy'

function dayStr(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default {
  // eslint-disable-next-line vue/name-property-casing, vue/component-definition-name-casing -- 与路由 name 保持一致
  name: 'chargingFleetHitLog',
  data() {
    return {
      dateRange: [dayStr(-6), dayStr(0)],
      query: { page: 1, limit: 20, fleetId: null, scene: null, hitType: null, userAccount: '' },
      list: [],
      total: 0,
      loading: false,
      fleetOptions: []
    }
  },
  created() {
    this.loadOptions()
    this.loadList()
  },
  methods: {
    loadOptions() {
      getFleetPage({ page: 1, limit: 200 }).then(res => {
        if (res.code === 200) this.fleetOptions = res.data || []
      }).catch(() => {})
    },
    loadList() {
      this.loading = true
      const range = this.dateRange || []
      const params = Object.assign({}, this.query, {
        startDate: range[0],
        endDate: range[1]
      })
      getFleetPolicyHitPage(params).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data || []
          this.total = res.count || 0
        } else {
          this.$message.error(res.msg || '查询失败')
        }
      }).catch(() => { this.loading = false })
    },
    search() {
      this.query.page = 1
      this.loadList()
    },
    resetQuery() {
      this.dateRange = [dayStr(-6), dayStr(0)]
      this.query = { page: 1, limit: this.query.limit, fleetId: null, scene: null, hitType: null, userAccount: '' }
      this.loadList()
    },
    handleSizeChange(val) {
      this.query.limit = val
      this.loadList()
    },
    handleCurrentChange(val) {
      this.query.page = val
      this.loadList()
    },
    hitTypeText(type) {
      return {
        STATION: '站点不在范围',
        TIME: '非允许时段',
        SINGLE: '单次限额',
        DAY: '日限额',
        MONTH: '月限额'
      }[type] || (type || '-')
    }
  }
}
</script>

<style scoped>
.fleet-hitlog-page .search-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.pagination-container {
  margin-top: 10px;
  text-align: right;
}
</style>

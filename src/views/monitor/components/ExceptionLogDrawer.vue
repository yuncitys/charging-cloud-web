<template>
  <el-drawer
    title="异常明细"
    :visible.sync="visible"
    direction="rtl"
    size="720px"
    append-to-body
    custom-class="exception-log-drawer-wrap"
    @closed="onClosed"
  >
    <div class="exception-log-drawer">
      <el-tabs v-model="activeType" class="exception-log-drawer__tabs" @tab-click="onTabClick">
        <el-tab-pane label="故障明细" name="fault" />
        <el-tab-pane label="离线明细" name="offline" />
      </el-tabs>

      <div class="exception-log-drawer__hint">
        <span>展示当前电站{{ activeTypeLabel }}，按上报时间倒序排列。</span>
        <el-link type="primary" :underline="false" @click="refresh">刷新</el-link>
      </div>

      <el-table
        v-loading="loading"
        :data="list"
        size="small"
        height="100%"
        class="exception-log-drawer__table"
      >
        <el-table-column prop="gunName" label="枪名称" min-width="110" show-overflow-tooltip>
          <template slot-scope="scope">{{ disp(scope.row.gunName) }}</template>
        </el-table-column>
        <el-table-column prop="gunCode" label="枪编号" min-width="130" show-overflow-tooltip>
          <template slot-scope="scope">{{ disp(scope.row.gunCode) }}</template>
        </el-table-column>
        <el-table-column prop="typeLabel" label="类型" width="80" align="center">
          <template slot-scope="scope">{{ disp(scope.row.typeLabel) }}</template>
        </el-table-column>
        <el-table-column prop="networkName" label="所属电站" min-width="150" show-overflow-tooltip>
          <template slot-scope="scope">{{ disp(scope.row.networkName) }}</template>
        </el-table-column>
        <el-table-column prop="reason" :label="reasonLabel" min-width="150" show-overflow-tooltip>
          <template slot-scope="scope">{{ disp(scope.row.reason) }}</template>
        </el-table-column>
        <el-table-column prop="alarmCode" :label="codeLabel" min-width="130" show-overflow-tooltip>
          <template slot-scope="scope">{{ disp(scope.row.alarmCode) }}</template>
        </el-table-column>
      </el-table>

      <div class="exception-log-drawer__pager">
        <el-pagination
          layout="total, prev, pager, next"
          :current-page="page"
          :page-size="limit"
          :total="total"
          @current-change="onPageChange"
        />
      </div>

      <div class="exception-log-drawer__footer">
        <el-button size="small" @click="visible = false">关闭</el-button>
        <el-button size="small" type="primary" :loading="exporting" @click="exportList">导出列表</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import { getStationExceptionLogs, exportStationExceptionLogs } from '@/api/monitor/stationMonitor'

export default {
  name: 'ExceptionLogDrawer',
  data() {
    return {
      visible: false,
      stationId: '',
      activeType: 'fault',
      list: [],
      page: 1,
      limit: 10,
      total: 0,
      loading: false,
      exporting: false
    }
  },
  computed: {
    activeTypeLabel() {
      return this.activeType === 'offline' ? '离线明细' : '故障明细'
    },
    reasonLabel() {
      return this.activeType === 'offline' ? '离线原因' : '故障名称'
    },
    codeLabel() {
      return this.activeType === 'offline' ? '告警码' : '故障码'
    }
  },
  methods: {
    open(stationId, type) {
      this.stationId = stationId || ''
      this.activeType = type === 'offline' ? 'offline' : 'fault'
      this.page = 1
      this.list = []
      this.total = 0
      this.visible = true
      this.load()
    },
    disp(v) {
      if (v == null || v === '') return '-'
      return v
    },
    onTabClick() {
      this.page = 1
      this.load()
    },
    onPageChange(page) {
      this.page = page
      this.load()
    },
    onClosed() {
      this.list = []
      this.total = 0
      this.exporting = false
    },
    refresh() {
      this.page = 1
      this.load()
    },
    load() {
      if (!this.stationId) return
      this.loading = true
      getStationExceptionLogs(this.stationId, {
        type: this.activeType,
        page: this.page,
        limit: this.limit
      }).then(res => {
        this.loading = false
        if (res && Number(res.code) === 200) {
          this.list = Array.isArray(res.data) ? res.data : []
          this.total = res.count != null ? Number(res.count) : this.list.length
          return
        }
        this.$message.error((res && res.msg) || '异常明细加载失败')
      }).catch(() => {
        this.loading = false
      })
    },
    exportList() {
      if (!this.stationId || this.exporting) return
      this.exporting = true
      exportStationExceptionLogs(this.stationId, {
        type: this.activeType
      }).then(res => {
        this.exporting = false
        if (res && Number(res.code) === 200) {
          this.$message.success((res && res.msg) || '导出任务已创建，请到下载中心查看进度')
          return
        }
        this.$message.error((res && res.msg) || '导出失败，请重试')
      }).catch(() => {
        this.exporting = false
      })
    }
  }
}
</script>

<style scoped>
.exception-log-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 20px 16px;
  box-sizing: border-box;
}

.exception-log-drawer__tabs {
  flex: 0 0 auto;
}

.exception-log-drawer__hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 8px 12px;
  color: #909399;
  font-size: 13px;
  background: #f5f7fa;
  border-radius: 4px;
}

.exception-log-drawer__table {
  flex: 1;
  min-height: 240px;
}

.exception-log-drawer__pager {
  flex: 0 0 auto;
  margin-top: 12px;
  text-align: right;
}

.exception-log-drawer__footer {
  flex: 0 0 auto;
  margin-top: 16px;
  text-align: right;
}
</style>

<style>
.exception-log-drawer-wrap .el-drawer__body {
  padding: 0;
  overflow: hidden;
  height: calc(100% - 55px);
}
</style>

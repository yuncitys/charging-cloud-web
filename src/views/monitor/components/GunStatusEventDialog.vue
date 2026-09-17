<template>
  <el-drawer
    title="状态日志"
    :visible.sync="visible"
    direction="rtl"
    size="560px"
    append-to-body
    custom-class="gun-status-event-drawer"
    @closed="onClosed"
  >
    <div class="event-drawer">
      <div class="event-drawer__sub">{{ deviceCode || '-' }} · 枪 {{ formatGun(connector) }}</div>
      <div class="event-drawer__toolbar">
        <span class="event-drawer__label">选择日期:</span>
        <el-select v-model="queryMode" class="event-drawer__mode" size="small" @change="onModeChange">
          <el-option label="按日查询" value="day" />
          <el-option label="按月查询" value="month" />
        </el-select>
        <el-date-picker
          v-if="queryMode === 'day'"
          v-model="eventDate"
          type="date"
          size="small"
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
          :clearable="false"
          :picker-options="pickerOptions"
          @change="onRangeChange"
        />
        <el-date-picker
          v-else
          v-model="eventMonth"
          type="month"
          size="small"
          placeholder="选择月份"
          value-format="yyyy-MM"
          :clearable="false"
          :picker-options="pickerOptions"
          @change="onRangeChange"
        />
      </div>
      <el-table
        v-loading="loading"
        :data="list"
        size="small"
        height="100%"
        class="event-drawer__table"
      >
        <el-table-column prop="eventTime" label="上报时间" width="180" align="center">
          <template slot-scope="scope">{{ formatTime(scope.row.eventTime) }}</template>
        </el-table-column>
        <el-table-column prop="message" label="状态信息" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">{{ disp(scope.row.message) }}</template>
        </el-table-column>
      </el-table>
      <div class="event-drawer__pager">
        <el-pagination
          layout="prev, pager, next"
          :current-page="page"
          :page-size="limit"
          :total="total"
          @current-change="onPageChange"
        />
      </div>
    </div>
  </el-drawer>
</template>

<script>
import { getGunStatusEvents } from '@/api/monitor/stationMonitor'
import { parseTime } from '@/utils/index'

export default {
  name: 'GunStatusEventDialog',
  data() {
    return {
      visible: false,
      deviceCode: '',
      connector: null,
      queryMode: 'day',
      eventDate: '',
      eventMonth: '',
      list: [],
      page: 1,
      limit: 10,
      total: 0,
      loading: false,
      pickerOptions: {
        disabledDate(date) {
          return date.getTime() > Date.now()
        }
      }
    }
  },
  methods: {
    open(deviceCode, connector) {
      this.deviceCode = deviceCode || ''
      this.connector = connector
      this.queryMode = 'day'
      this.eventDate = this.todayStr()
      this.eventMonth = this.monthStr()
      this.page = 1
      this.list = []
      this.total = 0
      this.visible = true
      this.loadEvents()
    },
    todayStr() {
      return parseTime(new Date(), '{y}-{m}-{d}') || ''
    },
    monthStr() {
      return parseTime(new Date(), '{y}-{m}') || ''
    },
    disp(v) {
      if (v == null || v === '') return '-'
      return v
    },
    formatGun(n) {
      if (n == null || n === '') return '-'
      const num = Number(n)
      if (isNaN(num)) return String(n)
      return num < 10 ? '0' + num : String(num)
    },
    formatTime(v) {
      const text = parseTime(v)
      return text || '-'
    },
    onModeChange() {
      this.page = 1
      if (this.queryMode === 'day' && !this.eventDate) {
        this.eventDate = this.todayStr()
      }
      if (this.queryMode === 'month' && !this.eventMonth) {
        this.eventMonth = this.monthStr()
      }
      this.loadEvents()
    },
    onRangeChange() {
      this.page = 1
      this.loadEvents()
    },
    onPageChange(page) {
      this.page = page
      this.loadEvents()
    },
    onClosed() {
      this.list = []
      this.total = 0
    },
    loadEvents() {
      if (!this.deviceCode || this.connector == null) return
      const params = {
        page: this.page,
        limit: this.limit
      }
      if (this.queryMode === 'month') {
        if (!this.eventMonth) return
        params.eventMonth = this.eventMonth
      } else {
        if (!this.eventDate) return
        params.eventDate = this.eventDate
      }
      this.loading = true
      getGunStatusEvents(this.deviceCode, this.connector, params).then(res => {
        this.loading = false
        if (res && Number(res.code) === 200) {
          this.list = Array.isArray(res.data) ? res.data : []
          this.total = res.count != null ? Number(res.count) : this.list.length
          return
        }
        this.$message.error((res && res.msg) || '状态日志加载失败')
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.event-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 20px 16px;
  box-sizing: border-box;
}

.event-drawer__sub {
  margin-bottom: 12px;
  color: #909399;
  font-size: 13px;
}

.event-drawer__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.event-drawer__label {
  color: #606266;
  font-size: 13px;
}

.event-drawer__mode {
  width: 120px;
}

.event-drawer__table {
  flex: 1;
  min-height: 240px;
}

.event-drawer__pager {
  margin-top: 12px;
  text-align: right;
}
</style>

<style>
.gun-status-event-drawer .el-drawer__body {
  padding: 0;
  overflow: hidden;
  height: calc(100% - 55px);
}
</style>

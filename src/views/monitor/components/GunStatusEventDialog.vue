<template>
  <el-dialog
    title="状态日志"
    :visible.sync="visible"
    width="720px"
    append-to-body
    @closed="onClosed"
  >
    <div class="event-dialog__sub">{{ deviceCode || '-' }} · 枪 {{ formatGun(connector) }}</div>
    <div class="event-dialog__toolbar">
      <el-date-picker
        v-model="eventDate"
        type="date"
        placeholder="选择日期"
        value-format="yyyy-MM-dd"
        :clearable="false"
        :picker-options="pickerOptions"
        @change="onDateChange"
      />
    </div>
    <el-table
      v-loading="loading"
      :data="list"
      size="small"
      border
      stripe
      height="360"
    >
      <el-table-column prop="eventTime" label="上报时间" width="200" align="center">
        <template slot-scope="scope">{{ formatTime(scope.row.eventTime) }}</template>
      </el-table-column>
      <el-table-column prop="message" label="状态信息" min-width="280" show-overflow-tooltip>
        <template slot-scope="scope">{{ disp(scope.row.message) }}</template>
      </el-table-column>
    </el-table>
    <div class="event-dialog__pager">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :current-page="page"
        :page-size="limit"
        :total="total"
        @current-change="onPageChange"
      />
    </div>
  </el-dialog>
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
      eventDate: '',
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
      this.eventDate = this.todayStr()
      this.page = 1
      this.list = []
      this.total = 0
      this.visible = true
      this.loadEvents()
    },
    todayStr() {
      return parseTime(new Date(), '{y}-{m}-{d}') || ''
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
    onDateChange() {
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
      if (!this.deviceCode || this.connector == null || !this.eventDate) return
      this.loading = true
      getGunStatusEvents(this.deviceCode, this.connector, {
        eventDate: this.eventDate,
        page: this.page,
        limit: this.limit
      }).then(res => {
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
.event-dialog__sub {
  margin-bottom: 12px;
  color: #909399;
  font-size: 13px;
}

.event-dialog__toolbar {
  margin-bottom: 12px;
}

.event-dialog__pager {
  margin-top: 12px;
  text-align: right;
}
</style>

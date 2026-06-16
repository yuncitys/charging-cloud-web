<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visibleSync"
    size="720px"
    custom-class="activity-record-drawer"
    @open="onOpen"
  >
    <div v-if="activity" class="drawer-summary">
      <div class="drawer-summary__name">{{ activity.activityName }}</div>
      <div class="drawer-summary__meta">
        <el-tag size="mini" type="success">{{ typeLabel }}</el-tag>
        <span>{{ activity.activityId }}</span>
      </div>
    </div>

    <el-tabs v-model="activeTab" @tab-click="handleTabChange">
      <el-tab-pane label="领取记录" name="receive">
        <el-input
          v-model="receiveQuery.userAccount"
          placeholder="用户账号"
          clearable
          size="small"
          style="width: 200px; margin-bottom: 12px;"
          @keyup.enter.native="loadReceive"
          @clear="loadReceive"
        />
        <el-button type="primary" size="small" icon="el-icon-search" @click="loadReceive">查询</el-button>
        <el-table v-loading="receiveLoading" :data="receiveList" border size="small" style="margin-top: 12px;">
          <el-table-column type="index" width="50" label="#" align="center" />
          <el-table-column prop="userAccount" label="用户账号" align="center" min-width="120" />
          <el-table-column prop="userGroupName" label="用户分组" align="center" min-width="120" show-overflow-tooltip />
          <el-table-column prop="receiveTime" label="领取时间" align="center" width="160">
            <template slot-scope="scope">{{ scope.row.receiveTime | formatDate }}</template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="receiveTotal > 0"
          small
          layout="total, prev, pager, next"
          :total="receiveTotal"
          :page-size="receiveQuery.limit"
          :current-page.sync="receiveQuery.page"
          style="margin-top: 12px; text-align: right;"
          @current-change="loadReceive"
        />
        <el-empty v-if="!receiveLoading && !receiveList.length" description="暂无领取记录" />
      </el-tab-pane>

      <el-tab-pane label="使用记录" name="use">
        <el-input
          v-model="useQuery.orderId"
          placeholder="订单号"
          clearable
          size="small"
          style="width: 200px; margin-bottom: 12px;"
          @keyup.enter.native="loadUse"
          @clear="loadUse"
        />
        <el-button type="primary" size="small" icon="el-icon-search" @click="loadUse">查询</el-button>
        <el-table v-loading="useLoading" :data="useList" border size="small" style="margin-top: 12px;">
          <el-table-column type="index" width="50" label="#" align="center" />
          <el-table-column prop="userCardCouponId" label="用户卡券" align="center" min-width="140" show-overflow-tooltip />
          <el-table-column prop="orderId" label="订单号" align="center" min-width="140" show-overflow-tooltip />
          <el-table-column prop="discountAmount" label="抵扣金额" align="center" width="90" />
          <el-table-column prop="confirmStatus" label="状态" align="center" width="80">
            <template slot-scope="scope">
              <el-tag size="mini" :type="scope.row.confirmStatus === '1' ? 'success' : 'info'">
                {{ scope.row.confirmStatus === '1' ? '已确认' : scope.row.confirmStatus === '2' ? '已回滚' : '待确认' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="useTime" label="使用时间" align="center" width="160">
            <template slot-scope="scope">{{ scope.row.useTime | formatDate }}</template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="useTotal > 0"
          small
          layout="total, prev, pager, next"
          :total="useTotal"
          :page-size="useQuery.limit"
          :current-page.sync="useQuery.page"
          style="margin-top: 12px; text-align: right;"
          @current-change="loadUse"
        />
        <el-empty v-if="!useLoading && !useList.length" description="暂无使用记录（订单用券上线后会有数据）" />
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script>
import { receiveRecordPage, useRecordPage } from '@/api/marketing/marketing'
import { getActivityTypeMeta } from '../constants/activityTypes'
import { parseTime } from '@/utils/index'

export default {
  name: 'ActivityRecordDrawer',
  filters: {
    formatDate(time) {
      if (!time) return ''
      return parseTime(time)
    }
  },
  props: {
    visible: { type: Boolean, default: false },
    activity: { type: Object, default: null },
    defaultTab: { type: String, default: 'receive' }
  },
  data() {
    return {
      activeTab: 'receive',
      receiveLoading: false,
      useLoading: false,
      receiveList: [],
      useList: [],
      receiveTotal: 0,
      useTotal: 0,
      receiveQuery: { page: 1, limit: 10, userAccount: '' },
      useQuery: { page: 1, limit: 10, orderId: '' }
    }
  },
  computed: {
    visibleSync: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    },
    drawerTitle() {
      return this.activity ? `活动数据 · ${this.activity.activityName}` : '活动数据'
    },
    typeLabel() {
      if (!this.activity) return ''
      const meta = getActivityTypeMeta(this.activity.activityType)
      return meta ? meta.label : this.activity.activityType
    }
  },
  methods: {
    onOpen() {
      this.activeTab = this.defaultTab
      this.receiveQuery = { page: 1, limit: 10, userAccount: '' }
      this.useQuery = { page: 1, limit: 10, orderId: '' }
      this.loadReceive()
      this.loadUse()
    },
    handleTabChange() {
      if (this.activeTab === 'receive') this.loadReceive()
      else this.loadUse()
    },
    loadReceive() {
      if (!this.activity) return
      this.receiveLoading = true
      receiveRecordPage({
        ...this.receiveQuery,
        activityId: this.activity.activityId,
        activityType: this.activity.activityType
      }).then(res => {
        this.receiveLoading = false
        this.receiveList = res.data || []
        this.receiveTotal = res.count || 0
      }).catch(() => { this.receiveLoading = false })
    },
    loadUse() {
      if (!this.activity) return
      this.useLoading = true
      useRecordPage({
        ...this.useQuery,
        activityId: this.activity.activityId
      }).then(res => {
        this.useLoading = false
        this.useList = res.data || []
        this.useTotal = res.count || 0
      }).catch(() => { this.useLoading = false })
    }
  }
}
</script>

<style scoped>
.drawer-summary {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}
.drawer-summary__name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}
.drawer-summary__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #909399;
}
</style>

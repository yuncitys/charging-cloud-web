<template>
  <div class="app-container admin-message-list">
    <div class="admin-message-list__toolbar">
      <el-tabs v-model="activeTab" class="admin-message-list__tabs" @tab-click="handleTab">
        <el-tab-pane v-for="tab in tabs" :key="tab.name" :name="tab.name" :label="tab.label" />
      </el-tabs>
      <el-button size="mini" icon="el-icon-finished" :loading="readingAll" :disabled="!unreadCount" @click="readAll">全部已读</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="拼命加载中......"
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="状态" width="90" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.readFlag" size="mini" type="info">已读</el-tag>
          <el-tag v-else size="mini" type="danger">未读</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip>
        <template slot-scope="scope">
          <span :class="{ 'admin-message-list__unread': !scope.row.readFlag }">{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容" min-width="320" show-overflow-tooltip />
      <el-table-column label="时间" width="170" align="center">
        <template slot-scope="scope">{{ time(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="viewMessage(scope.row)">查看</el-button>
          <el-button v-if="!scope.row.readFlag" size="mini" :loading="isReading(scope.row)" @click="markRead(scope.row)">标为已读</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        :current-page="listQuery.page"
        :page-sizes="[10, 20, 50]"
        :page-size="listQuery.limit"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { getUnreadMessageCount, pageAdminMessages, readAdminMessage, readAllAdminMessages } from '@/api/message/adminMessage'
import { parseTime } from '@/utils/index'
import { adminMessageRoute, ADMIN_MESSAGE_CHANGED } from '@/utils/adminMessageRoute'

const TABS = [
  { name: 'all', label: '全部', readFlag: undefined },
  { name: 'unread', label: '未读', readFlag: 0 },
  { name: 'read', label: '已读', readFlag: 1 }
]

export default {
  name: 'AdminMessageList',
  data() {
    return {
      tabs: TABS,
      activeTab: 'all',
      listLoading: false,
      readingAll: false,
      readingIds: [],
      unreadCount: 0,
      activatedOnce: false,
      listSeq: 0,
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  created() {
    this.getList()
    this.$root.$on(ADMIN_MESSAGE_CHANGED, this.getList)
  },
  activated() {
    if (this.activatedOnce) this.getList()
    this.activatedOnce = true
  },
  beforeDestroy() {
    this.$root.$off(ADMIN_MESSAGE_CHANGED, this.getList)
  },
  methods: {
    getList() {
      const params = { page: this.listQuery.page, limit: this.listQuery.limit }
      const tab = TABS.find(item => item.name === this.activeTab)
      if (tab && tab.readFlag !== undefined) params.readFlag = tab.readFlag
      const seq = ++this.listSeq
      this.listLoading = true
      this.loadUnreadCount()
      return pageAdminMessages(params).then(res => {
        if (seq !== this.listSeq) return
        this.listLoading = false
        if (res && Number(res.code) === 200) {
          this.list = Array.isArray(res.data) ? res.data : []
          this.total = res.count != null ? Number(res.count) : this.list.length
          return
        }
        this.list = []
        this.total = 0
        this.$message.error((res && res.msg) || '消息加载失败')
      }).catch(() => {
        if (seq === this.listSeq) this.listLoading = false
      })
    },
    loadUnreadCount() {
      getUnreadMessageCount().then(res => {
        if (res && Number(res.code) === 200) this.unreadCount = Number(res.data) || 0
      }).catch(() => {})
    },
    handleTab() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(limit) {
      this.listQuery.limit = limit
      this.listQuery.page = 1
      this.getList()
    },
    handleCurrentChange(page) {
      this.listQuery.page = page
      this.getList()
    },
    notifyChanged() {
      // 本页也监听该事件刷新列表，调用方无需再 getList
      this.$root.$emit(ADMIN_MESSAGE_CHANGED)
    },
    viewMessage(row) {
      if (!row) return
      if (!row.readFlag) {
        readAdminMessage(row.id).then(res => {
          if (res && Number(res.code) === 200) {
            row.readFlag = 1
            this.notifyChanged()
          }
        }).catch(() => {})
      }
      const route = adminMessageRoute(row)
      if (route) this.$router.push(route)
    },
    isReading(row) {
      return this.readingIds.indexOf(row.id) !== -1
    },
    markRead(row) {
      if (this.isReading(row)) return
      this.readingIds.push(row.id)
      const done = () => {
        this.readingIds = this.readingIds.filter(id => id !== row.id)
      }
      readAdminMessage(row.id).then(res => {
        done()
        if (res && Number(res.code) === 200) {
          this.notifyChanged()
          return
        }
        this.$message.error((res && res.msg) || '操作失败')
      }).catch(done)
    },
    readAll() {
      this.readingAll = true
      readAllAdminMessages().then(res => {
        this.readingAll = false
        if (res && Number(res.code) === 200) {
          this.$message.success('已全部标为已读')
          this.notifyChanged()
          return
        }
        this.$message.error((res && res.msg) || '操作失败')
      }).catch(() => {
        this.readingAll = false
      })
    },
    time(v) {
      return v ? parseTime(v, '{y}-{m}-{d} {h}:{i}') : ''
    }
  }
}
</script>

<style scoped>
.admin-message-list__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.admin-message-list__tabs {
  flex: 1;
  margin-right: 16px;
}
.admin-message-list__unread {
  color: #303133;
  font-weight: 600;
}
</style>

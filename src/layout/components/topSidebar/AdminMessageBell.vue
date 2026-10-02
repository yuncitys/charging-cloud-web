<template>
  <el-popover
    v-model="visible"
    placement="bottom-end"
    width="360"
    trigger="click"
    popper-class="admin-message-popper"
    @show="loadList"
  >
    <div class="admin-message">
      <div class="admin-message__head">
        <span>消息通知</span>
        <el-button type="text" size="mini" :disabled="!unreadCount" @click="readAll">全部已读</el-button>
      </div>
      <div v-loading="loading" class="admin-message__list">
        <div
          v-for="item in list"
          :key="item.id"
          class="admin-message__item"
          :class="{ 'is-unread': !item.readFlag }"
          @click="openMessage(item)"
        >
          <div class="admin-message__title">{{ item.title }}</div>
          <div class="admin-message__content">{{ item.content }}</div>
          <div class="admin-message__time">{{ time(item.createTime) }}</div>
        </div>
        <div v-if="!loading && !list.length" class="admin-message__empty">暂无消息</div>
      </div>
      <div class="admin-message__foot">
        <el-button type="text" size="mini" @click="viewAll">查看全部</el-button>
      </div>
    </div>
    <div slot="reference" class="admin-message-bell">
      <el-badge :value="unreadCount" :max="99" :hidden="!unreadCount">
        <i class="el-icon-bell toolbar-icon" />
      </el-badge>
    </div>
  </el-popover>
</template>

<script>
import { getUnreadMessageCount, pageAdminMessages, readAdminMessage, readAllAdminMessages } from '@/api/message/adminMessage'
import { parseTime } from '@/utils/index'
import { adminMessageRoute, ADMIN_MESSAGE_CHANGED } from '@/utils/adminMessageRoute'

const POLL_MS = 60 * 1000

export default {
  name: 'AdminMessageBell',
  data() {
    return {
      visible: false,
      loading: false,
      unreadCount: 0,
      list: [],
      timer: null
    }
  },
  mounted() {
    this.refreshCount()
    this.timer = setInterval(this.refreshCount, POLL_MS)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    this.$root.$on(ADMIN_MESSAGE_CHANGED, this.refreshCount)
  },
  beforeDestroy() {
    clearInterval(this.timer)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    this.$root.$off(ADMIN_MESSAGE_CHANGED, this.refreshCount)
  },
  methods: {
    onVisibilityChange() {
      if (!document.hidden) this.refreshCount()
    },
    refreshCount() {
      if (document.hidden) return Promise.resolve()
      return getUnreadMessageCount().then(res => {
        if (res && Number(res.code) === 200) this.unreadCount = Number(res.data) || 0
      }).catch(() => {})
    },
    loadList() {
      this.loading = true
      return pageAdminMessages({ page: 1, limit: 10 }).then(res => {
        this.loading = false
        this.list = res && Number(res.code) === 200 && Array.isArray(res.data) ? res.data : []
      }).catch(() => {
        this.loading = false
      })
    },
    openMessage(item) {
      if (!item) return
      if (!item.readFlag) {
        readAdminMessage(item.id).then(res => {
          if (!res || Number(res.code) !== 200) return
          item.readFlag = 1
          this.notifyChanged()
        }).catch(() => {})
      }
      const route = adminMessageRoute(item)
      if (route) {
        this.visible = false
        this.$router.push(route)
      }
    },
    viewAll() {
      this.visible = false
      this.$router.push('/message/list')
    },
    readAll() {
      readAllAdminMessages().then(res => {
        if (!res || Number(res.code) !== 200) return
        this.list.forEach(item => { item.readFlag = 1 })
        this.notifyChanged()
      }).catch(() => {})
    },
    notifyChanged() {
      this.$root.$emit(ADMIN_MESSAGE_CHANGED)
    },
    time(v) {
      return v ? parseTime(v, '{y}-{m}-{d} {h}:{i}') : ''
    }
  }
}
</script>

<style scoped>
.admin-message-bell {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 4px;
  cursor: pointer;
}
.admin-message-bell >>> .el-badge__content.is-fixed {
  top: 12px;
}
.admin-message__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  color: #303133;
  font-weight: 600;
  border-bottom: 1px solid #ebeef5;
}
.admin-message__list {
  min-height: 80px;
  max-height: 360px;
  overflow-y: auto;
}
.admin-message__item {
  padding: 10px 4px;
  border-bottom: 1px solid #f2f6fc;
  cursor: pointer;
}
.admin-message__item:hover {
  background: #f5f7fa;
}
.admin-message__item.is-unread .admin-message__title::before {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 6px;
  vertical-align: middle;
  background: #f56c6c;
  border-radius: 50%;
  content: '';
}
.admin-message__title {
  color: #303133;
  font-size: 13px;
}
.admin-message__content {
  margin-top: 4px;
  color: #606266;
  font-size: 12px;
  line-height: 1.5;
  word-break: break-all;
}
.admin-message__time {
  margin-top: 4px;
  color: #c0c4cc;
  font-size: 12px;
}
.admin-message__empty {
  padding: 24px 0;
  color: #909399;
  text-align: center;
}
.admin-message__foot {
  padding-top: 4px;
  text-align: center;
  border-top: 1px solid #ebeef5;
}
</style>

<template>
  <div class="ops-agent-chat">
    <!-- minimized dock: reopen any conversation -->
    <div v-show="!panelOpen" class="ops-agent-chat__dock">
      <div
        v-for="item in minimizedList"
        :key="'min-' + item.id"
        class="ops-agent-chat__dock-chip"
        :title="item.title"
        @click="reopenConversation(item.id)"
      >
        <i class="el-icon-chat-dot-round" />
        <span class="ops-agent-chat__dock-title">{{ item.title }}</span>
        <i
          class="el-icon-close ops-agent-chat__dock-close"
          @click.stop="closeConversationWindow(item.id)"
        />
      </div>
      <div
        class="ops-agent-chat__fab"
        title="运维助手"
        @click="openPanel"
      >
        <i class="el-icon-chat-dot-round" />
        <span v-if="conversations.length > 1" class="ops-agent-chat__fab-badge">
          {{ conversations.length }}
        </span>
      </div>
    </div>

    <transition name="ops-agent-chat-slide">
      <div v-show="panelOpen" class="ops-agent-chat__panel">
        <!-- history sidebar -->
        <div :class="['ops-agent-chat__sidebar', { 'is-collapsed': !sidebarOpen }]">
          <div class="ops-agent-chat__sidebar-head">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              class="ops-agent-chat__new-btn"
              @click="createConversation"
            >
              新建
            </el-button>
            <i
              class="el-icon-s-fold ops-agent-chat__icon-btn"
              title="收起列表"
              @click="sidebarOpen = false"
            />
          </div>
          <div class="ops-agent-chat__conv-list">
            <div
              v-for="c in sortedConversations"
              :key="c.id"
              :class="['ops-agent-chat__conv-item', { 'is-active': c.id === activeId }]"
              @click="switchConversation(c.id)"
            >
              <div class="ops-agent-chat__conv-main">
                <input
                  v-if="renamingId === c.id"
                  ref="renameInput"
                  v-model="renameDraft"
                  class="ops-agent-chat__rename-input"
                  @click.stop
                  @keydown.enter.prevent="commitRename(c)"
                  @keydown.esc.prevent="renamingId = null"
                  @blur="commitRename(c)"
                >
                <span v-else class="ops-agent-chat__conv-title" :title="c.title">{{ c.title }}</span>
                <span class="ops-agent-chat__conv-time">{{ formatTime(c.updatedAt) }}</span>
              </div>
              <div class="ops-agent-chat__conv-actions" @click.stop>
                <i class="el-icon-edit ops-agent-chat__mini-icon" title="重命名" @click="startRename(c)" />
                <i class="el-icon-delete ops-agent-chat__mini-icon" title="删除" @click="deleteConversation(c.id)" />
              </div>
            </div>
            <div v-if="!sortedConversations.length" class="ops-agent-chat__empty">暂无会话</div>
          </div>
        </div>

        <div class="ops-agent-chat__main">
          <div class="ops-agent-chat__header">
            <div class="ops-agent-chat__title">
              <i
                v-if="!sidebarOpen"
                class="el-icon-s-unfold ops-agent-chat__icon-btn"
                title="会话列表"
                @click="sidebarOpen = true"
              />
              <span class="ops-agent-chat__title-text">{{ activeConversation.title }}</span>
              <el-tag v-if="activeConversation.mockMode" size="mini" type="warning" effect="plain">Mock</el-tag>
            </div>
            <div class="ops-agent-chat__header-actions">
              <el-tooltip content="新建对话" placement="top">
                <i class="el-icon-plus ops-agent-chat__icon-btn" @click="createConversation" />
              </el-tooltip>
              <el-tooltip content="收起到底部（可继续打开）" placement="top">
                <i class="el-icon-minus ops-agent-chat__icon-btn" @click="minimizePanel" />
              </el-tooltip>
              <el-tooltip content="关闭面板（会话保留在列表）" placement="top">
                <i class="el-icon-close ops-agent-chat__close" @click="panelOpen = false" />
              </el-tooltip>
            </div>
          </div>

          <div ref="messageList" class="ops-agent-chat__messages">
            <message-bubble
              v-for="(msg, index) in activeConversation.messages"
              :key="activeId + '-' + index"
              :message="msg"
            />

            <div v-if="sending" class="ops-agent-chat__typing">
              <span /><span /><span />
            </div>

            <pending-action-card
              v-for="item in activeConversation.pendingActions"
              :key="'pa-' + item.id"
              :action="item"
              @cancel="dismissPending"
              @confirmed="onActionConfirmed"
              @confirm-failed="onActionConfirmFailed"
            />
          </div>

          <div v-if="showShortcuts" class="ops-agent-chat__shortcuts">
            <el-button
              v-for="item in shortcuts"
              :key="item.label"
              size="mini"
              round
              :disabled="sending"
              @click="useShortcut(item)"
            >
              {{ item.label }}
            </el-button>
          </div>

          <div class="ops-agent-chat__footer">
            <el-input
              v-model="inputText"
              type="textarea"
              :rows="2"
              placeholder="描述问题，例如：帮我看看这个订单（Enter 发送）"
              :disabled="sending"
              @keydown.native.enter.exact.prevent="sendMessage"
            />
            <el-button
              type="primary"
              size="small"
              class="ops-agent-chat__send"
              :loading="sending"
              :disabled="!inputText.trim()"
              @click="sendMessage"
            >
              发送
            </el-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { sendChat } from '@/api/opsAgent/chat'
import PendingActionCard from './PendingActionCard.vue'
import MessageBubble from './MessageBubble.vue'
import {
  loadStore,
  saveStore,
  createEmptyConversation,
  titleFromMessage,
  sortConversations,
} from './sessionStore'

const PAGE_CONTEXT_KEYS = ['orderId', 'orderCode', 'stationId', 'deviceCode']

const SHORTCUTS = [
  { label: '查单', text: '查一下订单ORD20240101001' },
  { label: '退款排障', text: '订单ORD20240101001扣了钱没启动，能不能退' },
  { label: '枪离线SOP', text: '枪离线怎么处理' },
  { label: '远程停充', text: '订单ORD20240101001关不掉，帮我停充' }
]

export default {
  name: 'OpsAgentChat',
  components: { PendingActionCard, MessageBubble },
  data() {
    const adminId = this.resolveAdminId()
    const store = loadStore(adminId)
    return {
      panelOpen: false,
      sidebarOpen: true,
      inputText: '',
      sending: false,
      adminId,
      activeId: store.activeId,
      conversations: store.conversations,
      /** conversation ids currently shown as dock chips when panel minimized */
      dockedIds: [],
      renamingId: null,
      renameDraft: '',
      shortcuts: SHORTCUTS
    }
  },
  computed: {
    sortedConversations() {
      return sortConversations(this.conversations)
    },
    activeConversation() {
      const found = this.conversations.find(c => c.id === this.activeId)
      return found || createEmptyConversation({ title: '新对话' })
    },
    minimizedList() {
      return this.dockedIds
        .map(id => this.conversations.find(c => c.id === id))
        .filter(Boolean)
    },
    showShortcuts() {
      const msgs = this.activeConversation.messages || []
      return msgs.length <= 2
    }
  },
  watch: {
    conversations: {
      deep: true,
      handler() {
        this.persist()
      }
    },
    activeId() {
      this.persist()
      this.scrollToBottom()
    }
  },
  methods: {
    resolveAdminId() {
      const adminUser = this.$store && this.$store.getters ? this.$store.getters.adminUser : null
      return adminUser && adminUser.id != null ? adminUser.id : null
    },
    currentAdminId() {
      return this.resolveAdminId()
    },
    persist() {
      saveStore({
        adminId: this.adminId != null ? this.adminId : this.currentAdminId(),
        activeId: this.activeId,
        conversations: this.conversations
      })
    },
    patchActive(mutator) {
      const idx = this.conversations.findIndex(c => c.id === this.activeId)
      if (idx < 0) {
        return
      }
      const next = Object.assign({}, this.conversations[idx])
      mutator(next)
      next.updatedAt = Date.now()
      this.$set(this.conversations, idx, next)
    },
    openPanel() {
      if (!this.conversations.length) {
        this.createConversation()
      }
      this.panelOpen = true
      this.dockedIds = []
      this.scrollToBottom()
    },
    minimizePanel() {
      if (!this.dockedIds.includes(this.activeId)) {
        this.dockedIds = [this.activeId].concat(this.dockedIds).slice(0, 5)
      }
      this.panelOpen = false
    },
    reopenConversation(id) {
      this.switchConversation(id)
      this.panelOpen = true
      this.dockedIds = this.dockedIds.filter(x => x !== id)
      this.scrollToBottom()
    },
    closeConversationWindow(id) {
      this.dockedIds = this.dockedIds.filter(x => x !== id)
    },
    createConversation() {
      const conv = createEmptyConversation()
      this.conversations = [conv].concat(this.conversations)
      this.activeId = conv.id
      this.inputText = ''
      this.panelOpen = true
      this.sidebarOpen = true
      this.scrollToBottom()
    },
    switchConversation(id) {
      if (id === this.activeId) {
        return
      }
      if (this.sending) {
        this.$message && this.$message.warning('请等待当前回复完成再切换')
        return
      }
      this.activeId = id
      this.inputText = ''
      this.scrollToBottom()
    },
    startRename(c) {
      this.renamingId = c.id
      this.renameDraft = c.title
      this.$nextTick(() => {
        const el = this.$refs.renameInput
        const input = Array.isArray(el) ? el[0] : el
        if (input && input.focus) {
          input.focus()
          input.select && input.select()
        }
      })
    },
    commitRename(c) {
      if (this.renamingId !== c.id) {
        return
      }
      const title = (this.renameDraft || '').trim() || c.title
      const idx = this.conversations.findIndex(x => x.id === c.id)
      if (idx >= 0) {
        this.$set(this.conversations, idx, Object.assign({}, this.conversations[idx], {
          title,
          updatedAt: Date.now()
        }))
      }
      this.renamingId = null
    },
    deleteConversation(id) {
      this.$confirm('删除后无法从本机恢复该会话记录，确定删除？', '删除会话', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }).then(() => {
        this.conversations = this.conversations.filter(c => c.id !== id)
        this.dockedIds = this.dockedIds.filter(x => x !== id)
        if (!this.conversations.length) {
          const conv = createEmptyConversation()
          this.conversations = [conv]
          this.activeId = conv.id
        } else if (this.activeId === id) {
          this.activeId = this.sortedConversations[0].id
        }
        this.$message && this.$message.success('已删除')
      }).catch(() => {})
    },
    buildPageContext() {
      const route = this.$route
      const ctx = {}
      PAGE_CONTEXT_KEYS.forEach(key => {
        const fromQuery = route.query[key]
        const fromParams = route.params[key]
        const val = fromQuery != null && fromQuery !== '' ? fromQuery : fromParams
        if (val != null && val !== '') {
          ctx[key] = String(val)
        }
      })
      return Object.keys(ctx).length ? ctx : null
    },
    formatTime(ts) {
      if (!ts) {
        return ''
      }
      const d = new Date(ts)
      const now = new Date()
      const sameDay = d.toDateString() === now.toDateString()
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      if (sameDay) {
        return hh + ':' + mm
      }
      return (d.getMonth() + 1) + '/' + d.getDate()
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messageList
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    },
    useShortcut(item) {
      this.inputText = item.text
      this.sendMessage()
    },
    sendMessage() {
      const text = this.inputText.trim()
      if (!text || this.sending) {
        return
      }
      const convId = this.activeId
      const before = this.conversations.find(c => c.id === convId)
      const sessionId = before && before.sessionId ? before.sessionId : null
      const isFirstUser = !((before && before.messages) || []).some(m => m.role === 'user')

      this.patchActive(c => {
        c.messages = c.messages.concat([{
          role: 'user',
          text,
          toolTrace: null
        }])
        if (isFirstUser || !c.title || c.title === '新对话') {
          c.title = titleFromMessage(text)
        }
      })
      this.inputText = ''
      this.sending = true
      this.scrollToBottom()

      sendChat({
        sessionId,
        message: text,
        pageContext: this.buildPageContext()
      })
        .then(res => {
          // ensure we still patch the same conversation even if user switched UI intent
          const targetId = convId
          const apply = mutator => {
            const idx = this.conversations.findIndex(c => c.id === targetId)
            if (idx < 0) {
              return
            }
            const next = Object.assign({}, this.conversations[idx])
            mutator(next)
            next.updatedAt = Date.now()
            this.$set(this.conversations, idx, next)
          }

          if (res.code !== 200) {
            apply(c => {
              c.messages = c.messages.concat([{
                role: 'assistant',
                text: res.msg || '请求失败，请稍后重试',
                toolTrace: null
              }])
            })
            return
          }
          apply(c => {
            if (res.sessionId) {
              c.sessionId = res.sessionId
            }
            if (typeof res.mockMode === 'boolean') {
              c.mockMode = res.mockMode
            }
            if (res.assistantText) {
              c.messages = c.messages.concat([{
                role: 'assistant',
                text: res.assistantText,
                toolTrace: Array.isArray(res.toolTrace) ? res.toolTrace : null
              }])
            }
            if (Array.isArray(res.pendingActions) && res.pendingActions.length) {
              const existing = c.pendingActions || []
              const merged = existing.slice()
              res.pendingActions.forEach(pa => {
                if (!merged.some(x => x.id === pa.id)) {
                  merged.push(pa)
                }
              })
              c.pendingActions = merged
            }
          })
        })
        .catch(() => {
          const idx = this.conversations.findIndex(c => c.id === convId)
          if (idx >= 0) {
            const next = Object.assign({}, this.conversations[idx])
            next.messages = next.messages.concat([{
              role: 'assistant',
              text: '网络异常，请检查连接后重试',
              toolTrace: null
            }])
            next.updatedAt = Date.now()
            this.$set(this.conversations, idx, next)
          }
        })
        .finally(() => {
          this.sending = false
          this.scrollToBottom()
        })
    },
    dismissPending(id) {
      this.patchActive(c => {
        c.pendingActions = (c.pendingActions || []).filter(p => p.id !== id)
      })
    },
    onActionConfirmed({ action, result }) {
      this.dismissPending(action.id)
      const ok = result && result.code === 200
      const status = result && result.status ? result.status : ''
      this.patchActive(c => {
        c.messages = c.messages.concat([{
          role: 'assistant',
          text: ok
            ? `操作已执行${status ? '（' + status + '）' : ''}`
            : (result && result.error) || (result && result.msg) || '操作失败',
          toolTrace: null
        }])
      })
      this.scrollToBottom()
    },
    onActionConfirmFailed({ action }) {
      this.patchActive(c => {
        c.messages = c.messages.concat([{
          role: 'assistant',
          text: `「${action.summary}」确认失败，请稍后重试`,
          toolTrace: null
        }])
      })
      this.scrollToBottom()
    }
  }
}
</script>

<style lang="scss" scoped>
.ops-agent-chat {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2000;

  &__dock {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  &__dock-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: 200px;
    padding: 6px 10px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
    cursor: pointer;
    font-size: 12px;
    color: #303133;

    &:hover {
      background: #f5f7fa;
    }
  }

  &__dock-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 140px;
  }

  &__dock-close {
    color: #c0c4cc;
    font-size: 12px;

    &:hover {
      color: #f56c6c;
    }
  }

  &__fab {
    position: relative;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #409eff;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.45);

    &:hover {
      background: #66b1ff;
    }
  }

  &__fab-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: 9px;
    background: #f56c6c;
    color: #fff;
    font-size: 11px;
    line-height: 18px;
    text-align: center;
  }

  &__panel {
    width: 560px;
    height: 560px;
    max-height: calc(100vh - 48px);
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.14);
    display: flex;
    overflow: hidden;
  }

  &__sidebar {
    width: 168px;
    flex-shrink: 0;
    border-right: 1px solid #ebeef5;
    background: #fafbfc;
    display: flex;
    flex-direction: column;
    transition: width 0.15s ease;

    &.is-collapsed {
      width: 0;
      border-right: none;
      overflow: hidden;
    }
  }

  &__sidebar-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 8px;
    gap: 4px;
  }

  &__new-btn {
    flex: 1;
  }

  &__conv-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 6px 8px;
  }

  &__conv-item {
    position: relative;
    padding: 8px 8px 8px 10px;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 2px;

    &:hover {
      background: #eef2f7;

      .ops-agent-chat__conv-actions {
        opacity: 1;
      }
    }

    &.is-active {
      background: #ecf5ff;
    }
  }

  &__conv-main {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-right: 28px;
  }

  &__conv-title {
    font-size: 12px;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__conv-time {
    font-size: 10px;
    color: #c0c4cc;
  }

  &__conv-actions {
    position: absolute;
    right: 6px;
    top: 8px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.15s;
  }

  &__mini-icon {
    font-size: 12px;
    color: #909399;
    cursor: pointer;

    &:hover {
      color: #409eff;
    }
  }

  &__rename-input {
    width: 100%;
    border: 1px solid #409eff;
    border-radius: 3px;
    padding: 1px 4px;
    font-size: 12px;
    outline: none;
  }

  &__empty {
    text-align: center;
    color: #c0c4cc;
    font-size: 12px;
    padding: 16px 0;
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid #ebeef5;
    font-weight: 600;
    font-size: 14px;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  &__title-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 180px;
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  &__icon-btn,
  &__close {
    cursor: pointer;
    font-size: 16px;
    color: #909399;

    &:hover {
      color: #606266;
    }
  }

  &__messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px;
    min-height: 0;
  }

  &__typing {
    display: flex;
    gap: 4px;
    padding: 8px 4px;

    span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #c0c4cc;
      animation: ops-agent-bounce 1.2s infinite ease-in-out;

      &:nth-child(2) {
        animation-delay: 0.15s;
      }

      &:nth-child(3) {
        animation-delay: 0.3s;
      }
    }
  }

  &__shortcuts {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 0 12px 8px;
  }

  &__footer {
    padding: 10px 14px 12px;
    border-top: 1px solid #ebeef5;
  }

  &__send {
    margin-top: 8px;
    float: right;
  }
}

@keyframes ops-agent-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.7);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.ops-agent-chat-slide-enter-active,
.ops-agent-chat-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.ops-agent-chat-slide-enter,
.ops-agent-chat-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>

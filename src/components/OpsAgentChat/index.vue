<template>
  <div class="ops-agent-chat">
    <!-- minimized dock -->
    <div v-show="!panelOpen" class="ops-agent-chat__dock">
      <div
        v-for="item in minimizedList"
        :key="'min-' + item.id"
        class="ops-agent-chat__dock-chip"
        :title="item.title"
        @click="reopenConversation(item.id)"
      >
        <i class="el-icon-chat-dot-round" />
        <span class="ops-agent-chat__dock-title">{{ displayTitle(item) }}</span>
        <i
          class="el-icon-close ops-agent-chat__dock-close"
          @click.stop="closeConversationWindow(item.id)"
        />
      </div>
      <div class="ops-agent-chat__fab" title="运维助手" @click="openPanel">
        <i class="el-icon-chat-dot-round" />
        <span v-if="conversations.length > 1" class="ops-agent-chat__fab-badge">
          {{ conversations.length }}
        </span>
      </div>
    </div>

    <transition name="ops-agent-chat-slide">
      <div
        v-show="panelOpen"
        ref="panel"
        class="ops-agent-chat__panel"
        tabindex="0"
        :style="panelStyle"
        @keydown.esc.stop.prevent="panelOpen = false"
      >
        <!-- resize handle (bottom-left; panel is anchored bottom-right) -->
        <div
          class="ops-agent-chat__resize"
          title="拖拽调整大小"
          @mousedown.prevent="startResize"
        />

        <div
          :class="['ops-agent-chat__sidebar', { 'is-collapsed': !sidebarOpen }]"
          :style="sidebarStyle"
        >
          <div class="ops-agent-chat__sidebar-head">
            <el-input
              v-model="searchQuery"
              size="mini"
              clearable
              prefix-icon="el-icon-search"
              placeholder="搜索会话"
              class="ops-agent-chat__search"
            />
            <i
              class="el-icon-s-fold ops-agent-chat__icon-btn"
              title="收起列表"
              @click="toggleSidebar(false)"
            />
          </div>
          <div
            v-show="sidebarOpen"
            class="ops-agent-chat__sidebar-resize"
            title="拖拽调整会话区宽度"
            @mousedown.prevent="startSidebarResize"
          />
          <div class="ops-agent-chat__conv-list">
            <div v-if="sessionsLoading && !conversations.length" class="ops-agent-chat__conv-loading">
              <div
                v-for="n in 4"
                :key="'sk-' + n"
                class="ops-agent-chat__conv-skeleton"
              >
                <div class="ops-agent-chat__skel-line ops-agent-chat__skel-line--title" />
                <div class="ops-agent-chat__skel-line ops-agent-chat__skel-line--meta" />
              </div>
              <div class="ops-agent-chat__conv-loading-tip">
                <i class="el-icon-loading" />
                <span>正在加载会话…</span>
              </div>
            </div>
            <template v-else>
              <div
                v-for="c in filteredConversations"
                :key="c.id"
                :class="['ops-agent-chat__conv-item', { 'is-active': c.id === activeId }]"
                @click="switchConversation(c.id)"
              >
                <div class="ops-agent-chat__conv-title-wrap">
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
                  <span
                    v-else
                    ref="convTitles"
                    :data-cid="c.id"
                    :class="['ops-agent-chat__conv-title', { 'is-overflow': !!titleOverflowMap[c.id] }]"
                    :title="displayTitle(c)"
                  >{{ displayTitle(c) }}</span>
                  <el-dropdown
                    v-if="renamingId !== c.id"
                    trigger="click"
                    placement="bottom-end"
                    class="ops-agent-chat__conv-more"
                    @command="cmd => onConvMenuCommand(cmd, c)"
                  >
                    <button
                      type="button"
                      class="ops-agent-chat__conv-more-btn"
                      title="更多"
                      @click.stop
                    >
                      <i class="el-icon-more" />
                    </button>
                    <el-dropdown-menu slot="dropdown" class="ops-agent-chat-menu">
                      <el-dropdown-item command="rename">重命名</el-dropdown-item>
                      <el-dropdown-item command="delete">
                        <span class="ops-agent-chat-menu__danger">删除</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
                <span
                  class="ops-agent-chat__conv-time"
                  :title="formatAbsoluteDateTime(c.updatedAt)"
                >
                  <span class="ops-agent-chat__conv-rel">{{ formatRelativeTime(c.updatedAt) }}</span>
                  <span class="ops-agent-chat__conv-abs">{{ formatDateYmd(c.updatedAt) }}</span>
                </span>
              </div>
              <div v-if="!filteredConversations.length" class="ops-agent-chat__empty">
                <template v-if="sessionsLoadError">
                  <div>会话加载失败</div>
                  <button type="button" class="ops-agent-chat__empty-retry" @click="syncSessionsFromServer(true)">
                    点击重试
                  </button>
                </template>
                <template v-else>
                  {{ searchQuery.trim() ? '无匹配会话' : '暂无会话' }}
                </template>
              </div>
            </template>
          </div>
        </div>

        <div class="ops-agent-chat__main">
          <div class="ops-agent-chat__header">
            <div class="ops-agent-chat__title">
              <i
                v-if="!sidebarOpen"
                class="el-icon-s-unfold ops-agent-chat__icon-btn"
                title="会话列表"
                @click="toggleSidebar(true)"
              />
              <span class="ops-agent-chat__title-text" :title="displayTitle(activeConversation)">
                {{ displayTitle(activeConversation) }}
              </span>
              <el-tag v-if="activeConversation.mockMode" size="mini" type="warning" effect="plain">Mock</el-tag>
            </div>
            <div class="ops-agent-chat__header-actions">
              <el-tooltip content="新建对话" placement="top">
                <i class="el-icon-plus ops-agent-chat__icon-btn ops-agent-chat__new-btn" @click="createConversation" />
              </el-tooltip>
              <el-dropdown trigger="click" @command="applySizePreset">
                <span class="ops-agent-chat__icon-btn" title="窗口大小">
                  <i class="el-icon-full-screen" />
                </span>
                <el-dropdown-menu slot="dropdown" class="ops-agent-chat-menu">
                  <el-dropdown-item command="compact">紧凑</el-dropdown-item>
                  <el-dropdown-item command="default">标准</el-dropdown-item>
                  <el-dropdown-item command="large">宽松</el-dropdown-item>
                  <el-dropdown-item command="auto" divided>按屏幕自适应</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-tooltip content="收起到底部" placement="top">
                <i class="el-icon-minus ops-agent-chat__icon-btn" @click="minimizePanel" />
              </el-tooltip>
              <el-tooltip content="关闭（Esc）" placement="top">
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
              @cancel="onPendingCancel"
              @confirmed="onActionConfirmed"
              @confirm-failed="onActionConfirmFailed"
            />
          </div>

          <div v-if="showShortcuts" class="ops-agent-chat__shortcuts">
            <div class="ops-agent-chat__shortcuts-label">试试这样问</div>
            <button
              v-for="item in shortcuts"
              :key="item.label"
              type="button"
              class="ops-agent-chat__suggest"
              :disabled="sending"
              @click="useShortcut(item)"
            >
              <span class="ops-agent-chat__suggest-icon" :class="'is-' + item.tone">
                <i :class="item.icon" />
              </span>
              <span class="ops-agent-chat__suggest-body">
                <span class="ops-agent-chat__suggest-title">{{ item.label }}</span>
                <span class="ops-agent-chat__suggest-desc">{{ item.desc }}</span>
              </span>
              <i class="el-icon-arrow-right ops-agent-chat__suggest-arrow" />
            </button>
          </div>

          <div class="ops-agent-chat__footer">
            <div class="ops-agent-chat__composer">
              <textarea
                ref="composer"
                v-model="inputText"
                class="ops-agent-chat__input"
                rows="1"
                :disabled="sending"
                placeholder="输入问题，Enter 发送，Shift+Enter 换行"
                @keydown="onComposerKeydown"
                @input="autoGrowComposer"
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
      </div>
    </transition>
  </div>
</template>

<script>
import {
  sendChat,
  listSessions,
  createSession,
  listSessionMessages,
  renameSession,
  deleteSession
} from '@/api/opsAgent/chat'
import { sendChatStream } from '@/api/opsAgent/chatStream'
import PendingActionCard from './PendingActionCard.vue'
import MessageBubble from './MessageBubble.vue'
import { actionLabel, formatConfirmResult } from './friendlyText'
import {
  createEmptyConversation,
  fromSessionSummary,
  mapServerMessages,
  titleFromMessage,
  displayConversationTitle,
  isDefaultConversationTitle,
  sortConversations,
  loadUiPrefs,
  saveUiPrefs,
  suggestPanelSize,
  loadActiveId,
  saveActiveId,
  loadDockedIds,
  saveDockedIds,
  clearLegacyLocalConversations,
  WELCOME_TEXT
} from './sessionStore'

const PAGE_CONTEXT_KEYS = ['orderId', 'orderCode', 'stationId', 'deviceCode']

const SHORTCUTS = [
  {
    label: '查单',
    desc: '按订单号看状态和金额',
    icon: 'el-icon-search',
    tone: 'blue',
    text: '查一下订单ORD20240101001'
  },
  {
    label: '退款排障',
    desc: '扣款未启动时走确认退款',
    icon: 'el-icon-wallet',
    tone: 'amber',
    text: '订单ORD20240101001扣了钱没启动，能不能退'
  },
  {
    label: '枪离线 SOP',
    desc: '逐步排查枪不在线',
    icon: 'el-icon-document',
    tone: 'green',
    text: '枪离线怎么处理'
  },
  {
    label: '远程停充',
    desc: '订单关不掉时远程停止',
    icon: 'el-icon-switch-button',
    tone: 'red',
    text: '订单ORD20240101001关不掉，帮我停充'
  }
]

const SIZE_PRESETS = {
  compact: { panelWidth: 380, panelHeight: 480 },
  default: { panelWidth: 440, panelHeight: 580 },
  large: { panelWidth: 640, panelHeight: 720 }
}

export default {
  name: 'OpsAgentChat',
  components: { PendingActionCard, MessageBubble },
  data() {
    const adminId = this.resolveAdminId()
    const ui = loadUiPrefs()
    clearLegacyLocalConversations()
    return {
      panelOpen: false,
      sidebarOpen: ui.sidebarOpen,
      sidebarWidth: ui.sidebarWidth,
      panelWidth: ui.panelWidth,
      panelHeight: ui.panelHeight,
      searchQuery: '',
      inputText: '',
      sending: false,
      sessionsLoading: false,
      sessionsLoadError: false,
      messagesLoadingIds: {},
      adminId,
      activeId: loadActiveId(adminId),
      conversations: [],
      dockedIds: loadDockedIds(adminId),
      renamingId: null,
      renameDraft: '',
      shortcuts: SHORTCUTS,
      resizing: false,
      resizeStart: null,
      sidebarResizing: false,
      sidebarResizeStart: null,
      /** bumps every minute so relative times stay fresh while panel is open */
      timeTick: 0,
      timeTickTimer: null,
      /** cid -> whether title overflows current sidebar width */
      titleOverflowMap: {},
      titleMeasureTimer: null
    }
  },
  computed: {
    panelStyle() {
      return {
        width: this.panelWidth + 'px',
        height: this.panelHeight + 'px'
      }
    },
    sidebarStyle() {
      if (!this.sidebarOpen) {
        return {}
      }
      return {
        width: this.sidebarWidth + 'px'
      }
    },
    sortedConversations() {
      // touch timeTick so relative labels recompute
      void this.timeTick
      return sortConversations(this.conversations)
    },
    filteredConversations() {
      const q = (this.searchQuery || '').trim().toLowerCase()
      if (!q) {
        return this.sortedConversations
      }
      return this.sortedConversations.filter(c => {
        const title = (this.displayTitle(c) || '').toLowerCase()
        if (title.includes(q)) {
          return true
        }
        const msgs = c.messages || []
        return msgs.some(m => m && m.text && String(m.text).toLowerCase().includes(q))
      })
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
  mounted() {
    // Prefetch summaries so FAB badge / dock chips survive refresh without opening panel
    this.prefetchSessionSummaries()
  },
  watch: {
    activeId(val) {
      this.persistActive()
      this.scrollToBottom()
      this.focusComposer()
      if (val && this.panelOpen) {
        this.ensureMessagesLoaded(val)
      }
    },
    dockedIds: {
      deep: true,
      handler(val) {
        saveDockedIds(this.adminId != null ? this.adminId : this.currentAdminId(), val)
      }
    },
    panelOpen(val) {
      if (val) {
        this.syncSessionsFromServer()
        this.focusComposer()
        this.startTimeTick()
        this.scheduleMeasureTitles()
      } else {
        this.stopTimeTick()
      }
    },
    sidebarWidth() {
      this.scheduleMeasureTitles()
    },
    sidebarOpen() {
      this.scheduleMeasureTitles()
    },
    filteredConversations() {
      this.scheduleMeasureTitles()
    },
    renamingId() {
      this.scheduleMeasureTitles()
    }
  },
  beforeDestroy() {
    this.stopTimeTick()
    this.unbindResize()
    this.unbindSidebarResize()
    if (this.titleMeasureTimer) {
      clearTimeout(this.titleMeasureTimer)
      this.titleMeasureTimer = null
    }
  },
  methods: {
    scheduleMeasureTitles() {
      if (this.titleMeasureTimer) {
        clearTimeout(this.titleMeasureTimer)
      }
      this.titleMeasureTimer = setTimeout(() => {
        this.titleMeasureTimer = null
        this.measureTitleOverflow()
      }, 40)
    },
    measureTitleOverflow() {
      const els = this.$refs.convTitles
      const list = !els ? [] : Array.isArray(els) ? els : [els]
      const map = {}
      list.forEach(el => {
        if (!el || !el.getAttribute) {
          return
        }
        const id = el.getAttribute('data-cid')
        if (!id) {
          return
        }
        map[id] = el.scrollWidth > el.clientWidth + 1
      })
      this.titleOverflowMap = map
    },
    startTimeTick() {
      this.stopTimeTick()
      this.timeTick += 1
      this.timeTickTimer = setInterval(() => {
        this.timeTick += 1
      }, 60 * 1000)
    },
    stopTimeTick() {
      if (this.timeTickTimer) {
        clearInterval(this.timeTickTimer)
        this.timeTickTimer = null
      }
    },
    resolveAdminId() {
      const adminUser = this.$store && this.$store.getters ? this.$store.getters.adminUser : null
      return adminUser && adminUser.id != null ? adminUser.id : null
    },
    currentAdminId() {
      return this.resolveAdminId()
    },
    persistActive() {
      saveActiveId(this.adminId != null ? this.adminId : this.currentAdminId(), this.activeId)
    },
    prefetchSessionSummaries() {
      return listSessions()
        .then(res => {
          if (!res || res.code !== 200) {
            return
          }
          this.applySessionRows(Array.isArray(res.data) ? res.data : [], {
            createIfEmpty: false,
            loadActiveMessages: false
          })
        })
        .catch(() => {
          /* dock/badge stay empty until user opens panel */
        })
    },
    applySessionRows(rows, options) {
      const opts = options || {}
      const prevById = {}
      this.conversations.forEach(c => {
        if (c && c.id) {
          prevById[c.id] = c
        }
      })
      const next = (rows || []).map(row => {
        const summary = fromSessionSummary(row)
        const prev = prevById[summary.id]
        if (prev && prev.messagesLoaded) {
          summary.messages = prev.messages
          summary.messagesLoaded = true
          summary.pendingActions = prev.pendingActions || []
          summary.mockMode = prev.mockMode
        }
        return summary
      })
      this.conversations = next
      this.dockedIds = (this.dockedIds || []).filter(id => next.some(c => c.id === id))
      if (!next.length) {
        if (opts.createIfEmpty) {
          return this.createConversation()
        }
        return Promise.resolve()
      }
      const preferred = this.activeId && next.some(c => c.id === this.activeId)
        ? this.activeId
        : next[0].id
      if (preferred !== this.activeId) {
        this.activeId = preferred
      }
      if (opts.loadActiveMessages) {
        return this.ensureMessagesLoaded(preferred)
      }
      return Promise.resolve()
    },
    syncSessionsFromServer(force) {
      if (this._sessionsSyncPromise && !force) {
        return this._sessionsSyncPromise
      }
      this.sessionsLoading = true
      this.sessionsLoadError = false
      const syncGen = (this._sessionsSyncGen = (this._sessionsSyncGen || 0) + 1)
      this._sessionsSyncPromise = listSessions()
        .then(res => {
          if (syncGen !== this._sessionsSyncGen) {
            return
          }
          if (!res || res.code !== 200) {
            this.sessionsLoadError = true
            this.$message && this.$message.warning((res && res.msg) || '加载会话列表失败')
            return
          }
          this.sessionsLoadError = false
          return this.applySessionRows(Array.isArray(res.data) ? res.data : [], {
            createIfEmpty: true,
            loadActiveMessages: true
          })
        })
        .catch(() => {
          if (syncGen !== this._sessionsSyncGen) {
            return
          }
          this.sessionsLoadError = true
          this.$message && this.$message.warning('加载会话列表失败，请稍后重试')
        })
        .finally(() => {
          if (syncGen === this._sessionsSyncGen) {
            this.sessionsLoading = false
            this._sessionsSyncPromise = null
            this.scheduleMeasureTitles()
          }
        })
      return this._sessionsSyncPromise
    },
    ensureMessagesLoaded(id) {
      const conv = this.conversations.find(c => c.id === id)
      if (!conv || conv.messagesLoaded || this.messagesLoadingIds[id]) {
        return Promise.resolve()
      }
      this.$set(this.messagesLoadingIds, id, true)
      return listSessionMessages(id)
        .then(res => {
          if (!res || res.code !== 200) {
            return
          }
          const idx = this.conversations.findIndex(c => c.id === id)
          if (idx < 0) {
            return
          }
          const next = Object.assign({}, this.conversations[idx])
          next.messages = mapServerMessages(res.data)
          next.messagesLoaded = true
          // pending cards are ephemeral; reload does not restore open confirms
          next.pendingActions = next.pendingActions || []
          if (isDefaultConversationTitle(next.title)) {
            const derived = this.deriveTitleFromMessages(next.messages)
            if (derived) {
              next.title = derived
              renameSession(id, derived).catch(() => {})
            }
          }
          this.$set(this.conversations, idx, next)
          if (this.activeId === id) {
            this.scrollToBottom()
          }
        })
        .catch(() => {
          this.$message && this.$message.warning('加载会话消息失败')
        })
        .finally(() => {
          this.$delete(this.messagesLoadingIds, id)
        })
    },
    deriveTitleFromMessages(messages) {
      if (!Array.isArray(messages)) {
        return ''
      }
      for (let i = 0; i < messages.length; i++) {
        const m = messages[i]
        if (m && m.role === 'user' && m.text) {
          const t = titleFromMessage(m.text)
          return isDefaultConversationTitle(t) ? '' : t
        }
      }
      return ''
    },
    persistUi() {
      saveUiPrefs({
        panelWidth: this.panelWidth,
        panelHeight: this.panelHeight,
        sidebarOpen: this.sidebarOpen,
        sidebarWidth: this.sidebarWidth
      })
    },
    toggleSidebar(open) {
      this.sidebarOpen = open
      if (open) {
        this.sidebarWidth = this.clampSidebarWidth(this.sidebarWidth)
      }
      this.persistUi()
    },
    clampSidebarWidth(w) {
      const min = 120
      const maxByPanel = Math.max(min, this.panelWidth - 240)
      const max = Math.min(320, maxByPanel)
      return Math.min(max, Math.max(min, Number(w) || min))
    },
    startSidebarResize(e) {
      if (!this.sidebarOpen) {
        return
      }
      this.sidebarResizing = true
      this.sidebarResizeStart = {
        x: e.clientX,
        w: this.sidebarWidth
      }
      document.addEventListener('mousemove', this.onSidebarResizeMove)
      document.addEventListener('mouseup', this.onSidebarResizeEnd)
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'col-resize'
    },
    onSidebarResizeMove(e) {
      if (!this.sidebarResizing || !this.sidebarResizeStart) {
        return
      }
      const dw = e.clientX - this.sidebarResizeStart.x
      this.sidebarWidth = this.clampSidebarWidth(this.sidebarResizeStart.w + dw)
      this.scheduleMeasureTitles()
    },
    onSidebarResizeEnd() {
      this.sidebarResizing = false
      this.sidebarResizeStart = null
      this.unbindSidebarResize()
      this.persistUi()
      this.scheduleMeasureTitles()
    },
    unbindSidebarResize() {
      document.removeEventListener('mousemove', this.onSidebarResizeMove)
      document.removeEventListener('mouseup', this.onSidebarResizeEnd)
      if (!this.resizing) {
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
      }
    },
    applySizePreset(cmd) {
      if (cmd === 'auto') {
        const s = suggestPanelSize()
        this.panelWidth = s.panelWidth
        this.panelHeight = s.panelHeight
      } else {
        const p = SIZE_PRESETS[cmd] || SIZE_PRESETS.default
        this.panelWidth = p.panelWidth
        this.panelHeight = p.panelHeight
      }
      this.clampToViewport()
      this.persistUi()
    },
    clampToViewport() {
      const maxW = Math.max(360, window.innerWidth - 48)
      const maxH = Math.max(400, window.innerHeight - 48)
      this.panelWidth = Math.min(this.panelWidth, maxW)
      this.panelHeight = Math.min(this.panelHeight, maxH)
      this.panelWidth = Math.max(360, this.panelWidth)
      this.panelHeight = Math.max(400, this.panelHeight)
      this.sidebarWidth = this.clampSidebarWidth(this.sidebarWidth)
    },
    startResize(e) {
      this.resizing = true
      this.resizeStart = {
        x: e.clientX,
        y: e.clientY,
        w: this.panelWidth,
        h: this.panelHeight
      }
      document.addEventListener('mousemove', this.onResizeMove)
      document.addEventListener('mouseup', this.onResizeEnd)
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'nwse-resize'
    },
    onResizeMove(e) {
      if (!this.resizing || !this.resizeStart) {
        return
      }
      // anchored bottom-right: drag left-up grows
      const dw = this.resizeStart.x - e.clientX
      const dh = this.resizeStart.y - e.clientY
      this.panelWidth = this.resizeStart.w + dw
      this.panelHeight = this.resizeStart.h + dh
      this.clampToViewport()
    },
    onResizeEnd() {
      this.resizing = false
      this.resizeStart = null
      this.unbindResize()
      this.persistUi()
    },
    unbindResize() {
      document.removeEventListener('mousemove', this.onResizeMove)
      document.removeEventListener('mouseup', this.onResizeEnd)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
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
      // Mark loading before paint so empty list never flashes「暂无会话」
      if (!this.conversations.length) {
        this.sessionsLoading = true
        this.sessionsLoadError = false
      }
      this.clampToViewport()
      this.panelOpen = true
      this.dockedIds = []
      this.scrollToBottom()
      this.focusComposer()
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
      return createSession()
        .then(res => {
          if (!res || res.code !== 200 || !res.data || !res.data.id) {
            this.$message && this.$message.error((res && res.msg) || '新建会话失败')
            return
          }
          const conv = fromSessionSummary(res.data)
          conv.messages = [{
            role: 'assistant',
            text: WELCOME_TEXT,
            toolTrace: null,
            traceOpen: false
          }]
          conv.messagesLoaded = true
          this.conversations = [conv].concat(this.conversations.filter(c => c.id !== conv.id))
          this.activeId = conv.id
          this.inputText = ''
          this.searchQuery = ''
          this.panelOpen = true
          this.sidebarOpen = true
          this.persistUi()
          this.persistActive()
          this.resetComposerHeight()
          this.scrollToBottom()
          this.focusComposer()
        })
        .catch(() => {
          this.$message && this.$message.error('新建会话失败，请稍后重试')
        })
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
      this.resetComposerHeight()
      this.ensureMessagesLoaded(id)
      this.scrollToBottom()
    },
    focusComposer() {
      this.$nextTick(() => {
        const el = this.$refs.composer
        if (el && el.focus) {
          el.focus()
        }
      })
    },
    autoGrowComposer() {
      const el = this.$refs.composer
      if (!el) {
        return
      }
      el.style.height = 'auto'
      const next = Math.min(120, Math.max(36, el.scrollHeight))
      el.style.height = next + 'px'
    },
    resetComposerHeight() {
      this.$nextTick(() => {
        const el = this.$refs.composer
        if (el) {
          el.style.height = '36px'
        }
      })
    },
    onComposerKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    },
    displayTitle(c) {
      return displayConversationTitle(c)
    },
    onConvMenuCommand(cmd, c) {
      if (!c) {
        return
      }
      if (cmd === 'rename') {
        this.startRename(c)
      } else if (cmd === 'delete') {
        this.deleteConversation(c.id)
      }
    },
    startRename(c) {
      this.renamingId = c.id
      this.renameDraft = this.displayTitle(c)
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
      this.renamingId = null
      const idx = this.conversations.findIndex(x => x.id === c.id)
      if (idx >= 0) {
        this.$set(this.conversations, idx, Object.assign({}, this.conversations[idx], {
          title,
          updatedAt: Date.now()
        }))
      }
      renameSession(c.id, title)
        .then(res => {
          if (!res || res.code !== 200) {
            this.$message && this.$message.warning((res && res.msg) || '重命名失败')
            return
          }
          if (res.data && idx >= 0) {
            this.$set(this.conversations, idx, Object.assign({}, this.conversations[idx], {
              title: res.data.title || title,
              updatedAt: Date.now()
            }))
          }
        })
        .catch(() => {
          this.$message && this.$message.warning('重命名失败')
        })
    },
    deleteConversation(id) {
      this.$confirm('删除后各端都无法再打开该会话，确定删除？', '删除会话', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }).then(() => {
        return deleteSession(id).then(res => {
          if (!res || res.code !== 200) {
            this.$message && this.$message.error((res && res.msg) || '删除失败')
            return
          }
          this.conversations = this.conversations.filter(c => c.id !== id)
          this.dockedIds = this.dockedIds.filter(x => x !== id)
          if (!this.conversations.length) {
            return this.createConversation()
          }
          if (this.activeId === id) {
            this.activeId = this.sortedConversations[0].id
            this.ensureMessagesLoaded(this.activeId)
          }
          this.$message && this.$message.success('已删除')
        })
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
    formatRelativeTime(ts) {
      if (!ts) {
        return ''
      }
      void this.timeTick
      const diffMs = Date.now() - Number(ts)
      if (Number.isNaN(diffMs)) {
        return ''
      }
      if (diffMs < 60 * 1000) {
        return '刚刚'
      }
      const mins = Math.floor(diffMs / (60 * 1000))
      if (mins < 60) {
        return mins + '分钟前'
      }
      const hours = Math.floor(mins / 60)
      if (hours < 24) {
        return hours + '小时前'
      }
      const days = Math.floor(hours / 24)
      if (days < 30) {
        return days + '天前'
      }
      const months = Math.floor(days / 30)
      if (months < 12) {
        return months + '个月前'
      }
      return Math.floor(months / 12) + '年前'
    },
    formatDateYmd(ts) {
      if (!ts) {
        return ''
      }
      const d = new Date(ts)
      if (Number.isNaN(d.getTime())) {
        return ''
      }
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return y + '/' + m + '/' + day
    },
    formatAbsoluteDateTime(ts) {
      if (!ts) {
        return ''
      }
      const d = new Date(ts)
      if (Number.isNaN(d.getTime())) {
        return ''
      }
      const ymd = this.formatDateYmd(ts)
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      return ymd + ' ' + hh + ':' + mm
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
      this.$nextTick(() => {
        this.autoGrowComposer()
        this.sendMessage()
      })
    },
    sendMessage() {
      const text = this.inputText.trim()
      if (!text || this.sending) {
        return
      }
      this.sending = true
      this.inputText = ''
      this.resetComposerHeight()
      const ensureReady = (!this.activeId || !this.conversations.some(c => c.id === this.activeId))
        ? this.createConversation()
        : Promise.resolve()

      Promise.resolve(ensureReady).then(() => {
        const convId = this.activeId
        const before = this.conversations.find(c => c.id === convId)
        if (!before || !before.id) {
          this.sending = false
          this.inputText = text
          this.$message && this.$message.error('会话未就绪，请稍后重试')
          return
        }
        const sessionId = before.sessionId || before.id
        const isFirstUser = !((before.messages) || []).some(m => m.role === 'user')

        this.patchActive(c => {
          c.messages = c.messages.concat([{
            role: 'user',
            text,
            toolTrace: null
          }])
          if (isFirstUser || !c.title || c.title === '新对话') {
            c.title = titleFromMessage(text)
          }
          c.messagesLoaded = true
        })
        this.scrollToBottom()

        const payload = {
          sessionId,
          message: text,
          pageContext: this.buildPageContext()
        }
        this.deliverAssistantReply(convId, payload)
          .finally(() => {
            this.sending = false
            this.scrollToBottom()
            this.focusComposer()
          })
      })
    },
    applyConversation(targetId, mutator) {
      const idx = this.conversations.findIndex(c => c.id === targetId)
      if (idx < 0) {
        return
      }
      const next = Object.assign({}, this.conversations[idx])
      mutator(next)
      next.updatedAt = Date.now()
      this.$set(this.conversations, idx, next)
    },
    alignSessionId(targetId, sessionId) {
      if (!sessionId) {
        return targetId
      }
      this.applyConversation(targetId, c => {
        c.sessionId = sessionId
        if (c.id !== sessionId) {
          c.id = sessionId
        }
      })
      if (this.activeId === targetId && targetId !== sessionId) {
        this.activeId = sessionId
      }
      return sessionId
    },
    mergePendingActions(targetId, pendingActions) {
      if (!Array.isArray(pendingActions) || !pendingActions.length) {
        return
      }
      this.applyConversation(targetId, c => {
        const existing = c.pendingActions || []
        const merged = existing.slice()
        pendingActions.forEach(pa => {
          if (!merged.some(x => x.id === pa.id)) {
            merged.push(pa)
          }
        })
        c.pendingActions = merged
      })
    },
    deliverAssistantReply(convId, payload) {
      // Prefer SSE for typing feel; fall back to JSON chat if stream fails
      let liveId = convId
      let gotToken = false
      return sendChatStream(payload, {
        onMeta: meta => {
          if (meta && meta.sessionId) {
            liveId = this.alignSessionId(liveId, meta.sessionId)
          }
        },
        onToken: chunk => {
          if (!chunk) {
            return
          }
          if (!gotToken) {
            gotToken = true
            this.applyConversation(liveId, c => {
              c.messages = c.messages.concat([{
                role: 'assistant',
                text: chunk,
                toolTrace: null,
                streaming: true
              }])
            })
          } else {
            this.applyConversation(liveId, c => {
              const msgs = c.messages.slice()
              const last = msgs[msgs.length - 1]
              if (last && last.role === 'assistant' && last.streaming) {
                msgs[msgs.length - 1] = Object.assign({}, last, {
                  text: (last.text || '') + chunk
                })
                c.messages = msgs
              }
            })
          }
          this.scrollToBottom()
        },
        onPending: list => {
          const arr = Array.isArray(list) ? list : []
          this.mergePendingActions(liveId, arr)
        },
        onTrace: trace => {
          this.applyConversation(liveId, c => {
            const msgs = c.messages.slice()
            const last = msgs[msgs.length - 1]
            if (last && last.role === 'assistant') {
              msgs[msgs.length - 1] = Object.assign({}, last, {
                toolTrace: Array.isArray(trace) ? trace : null,
                streaming: false
              })
              c.messages = msgs
            }
          })
        },
        onDonePayload: done => {
          this.applyConversation(liveId, c => {
            if (done && typeof done.mockMode === 'boolean') {
              c.mockMode = done.mockMode
            }
            if (done && done.sessionId) {
              c.sessionId = done.sessionId
            }
            const msgs = c.messages.slice()
            const last = msgs[msgs.length - 1]
            if (last && last.role === 'assistant' && last.streaming) {
              msgs[msgs.length - 1] = Object.assign({}, last, { streaming: false })
              c.messages = msgs
            }
          })
          if (done && done.sessionId) {
            liveId = this.alignSessionId(liveId, done.sessionId)
          }
        }
      }).catch(() => {
        // Stream unavailable → classic JSON chat
        return sendChat(payload).then(res => {
          if (res.code !== 200) {
            this.applyConversation(liveId, c => {
              c.messages = c.messages.concat([{
                role: 'assistant',
                text: res.msg || '请求失败，请稍后重试',
                toolTrace: null
              }])
            })
            return
          }
          if (res.sessionId) {
            liveId = this.alignSessionId(liveId, res.sessionId)
          }
          this.applyConversation(liveId, c => {
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
          })
          this.mergePendingActions(liveId, res.pendingActions)
        }).catch(() => {
          this.applyConversation(liveId, c => {
            c.messages = c.messages.concat([{
              role: 'assistant',
              text: '网络异常，请检查连接后重试',
              toolTrace: null
            }])
          })
        })
      })
    },
    dismissPending(id) {
      this.patchActive(c => {
        c.pendingActions = (c.pendingActions || []).filter(p => p.id !== id)
      })
    },
    onPendingCancel(action) {
      const id = action && action.id != null ? action.id : action
      this.dismissPending(id)
      const label = actionLabel(typeof action === 'object' ? action : null)
      this.patchActive(c => {
        c.messages = c.messages.concat([{
          role: 'assistant',
          text: '好的，已取消「' + label + '」，没有执行任何操作。',
          toolTrace: null
        }])
      })
      this.scrollToBottom()
    },
    onActionConfirmed({ action, result }) {
      this.dismissPending(action.id)
      this.patchActive(c => {
        c.messages = c.messages.concat([{
          role: 'assistant',
          text: formatConfirmResult(action, result),
          toolTrace: null
        }])
      })
      this.scrollToBottom()
    },
    onActionConfirmFailed({ action }) {
      this.patchActive(c => {
        c.messages = c.messages.concat([{
          role: 'assistant',
          text: '「' + actionLabel(action) + '」确认请求失败，请稍后重试。',
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
    position: relative;
    max-width: calc(100vw - 48px);
    max-height: calc(100vh - 48px);
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 32px rgba(0, 0, 0, 0.16);
    display: flex;
    overflow: hidden;
  }

  &__resize {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 16px;
    height: 16px;
    cursor: nwse-resize;
    z-index: 3;
    background:
      linear-gradient(135deg, transparent 50%, #c0c4cc 50%, #c0c4cc 60%, transparent 60%),
      linear-gradient(135deg, transparent 70%, #c0c4cc 70%, #c0c4cc 80%, transparent 80%);

    &:hover {
      background:
        linear-gradient(135deg, transparent 50%, #909399 50%, #909399 60%, transparent 60%),
        linear-gradient(135deg, transparent 70%, #909399 70%, #909399 80%, transparent 80%);
    }
  }

  &__sidebar {
    position: relative;
    flex-shrink: 0;
    border-right: 1px solid #ebeef5;
    background: #f7f8fa;
    display: flex;
    flex-direction: column;
    min-width: 0;

    &.is-collapsed {
      width: 0 !important;
      border-right: none;
      overflow: hidden;
    }
  }

  &__sidebar-resize {
    position: absolute;
    top: 0;
    right: -3px;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    z-index: 4;
    background: transparent;

    &:hover {
      background: rgba(64, 158, 255, 0.28);
    }
  }

  &__sidebar-head {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 8px 8px;
  }

  &__search {
    flex: 1;
    min-width: 0;
  }

  &__conv-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 6px 8px;
  }

  &__conv-item {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 8px 8px 10px;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 2px;

    &:hover {
      background: #eef2f7;

      .ops-agent-chat__conv-more {
        opacity: 1;
        pointer-events: auto;
      }

      .ops-agent-chat__conv-title {
        -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 calc(100% - 28px), transparent 100%);
        mask-image: linear-gradient(90deg, #000 0%, #000 calc(100% - 28px), transparent 100%);
      }

      .ops-agent-chat__conv-more-btn {
        background: linear-gradient(90deg, rgba(238, 242, 247, 0), #eef2f7 36%);
      }
    }

    &.is-active {
      background: #ecf5ff;

      .ops-agent-chat__conv-more {
        opacity: 1;
        pointer-events: auto;
      }

      .ops-agent-chat__conv-title {
        -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 calc(100% - 28px), transparent 100%);
        mask-image: linear-gradient(90deg, #000 0%, #000 calc(100% - 28px), transparent 100%);
      }

      .ops-agent-chat__conv-more-btn {
        background: linear-gradient(90deg, rgba(236, 245, 255, 0), #ecf5ff 36%);
      }
    }
  }

  &__conv-title-wrap {
    position: relative;
    min-width: 0;
    width: 100%;
  }

  &__conv-title {
    display: block;
    font-size: 12px;
    color: #303133;
    overflow: hidden;
    white-space: nowrap;
    line-height: 1.4;
    /* full text when it fits; fade only when overflowing (or hover/active above) */
    -webkit-mask-image: none;
    mask-image: none;

    &.is-overflow {
      -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 calc(100% - 16px), transparent 100%);
      mask-image: linear-gradient(90deg, #000 0%, #000 calc(100% - 16px), transparent 100%);
    }
  }

  &__conv-time {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: #c0c4cc;
    line-height: 1.3;
  }

  &__conv-rel {
    flex-shrink: 0;
  }

  &__conv-abs {
    color: #d3d4d6;
    white-space: nowrap;
  }

  &__conv-more {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
    line-height: 1;
    z-index: 1;
  }

  &__conv-more-btn {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 28px;
    height: 22px;
    padding: 0 2px 0 14px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: #909399;
    cursor: pointer;
    font-size: 14px;

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
    padding: 16px 8px;
  }

  &__empty-retry {
    margin-top: 8px;
    border: none;
    background: transparent;
    color: #409eff;
    font-size: 12px;
    cursor: pointer;
    padding: 0;

    &:hover {
      text-decoration: underline;
    }
  }

  &__conv-loading {
    padding: 8px 6px 12px;
  }

  &__conv-skeleton {
    padding: 8px 6px;
    margin-bottom: 4px;
  }

  &__skel-line {
    height: 10px;
    border-radius: 4px;
    background: linear-gradient(90deg, #f0f2f5 25%, #e6e8eb 37%, #f0f2f5 63%);
    background-size: 400% 100%;
    animation: ops-agent-skel 1.2s ease infinite;

    &--title {
      width: 72%;
      margin-bottom: 8px;
    }

    &--meta {
      width: 42%;
      height: 8px;
    }
  }

  &__conv-loading-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 12px;
    color: #909399;

    .el-icon-loading {
      font-size: 14px;
      color: #409eff;
    }
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: #fff;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
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
    max-width: 200px;
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  &__icon-btn,
  &__close {
    cursor: pointer;
    font-size: 16px;
    color: #909399;
    line-height: 1;

    &:hover {
      color: #606266;
    }
  }

  &__messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px;
    min-height: 0;
    background: #fafbfc;
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
    flex-direction: column;
    gap: 6px;
    padding: 4px 12px 10px;
  }

  &__shortcuts-label {
    font-size: 12px;
    color: #909399;
    padding: 2px 2px 4px;
  }

  &__suggest {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    text-align: left;
    border: 1px solid #ebeef5;
    background: #fafbfc;
    border-radius: 10px;
    padding: 8px 10px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;

    &:hover:not(:disabled) {
      border-color: #c6e2ff;
      background: #f5f9ff;
      box-shadow: 0 1px 4px rgba(64, 158, 255, 0.1);

      .ops-agent-chat__suggest-arrow {
        color: #409eff;
        transform: translateX(2px);
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__suggest-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;

    &.is-blue {
      background: #ecf5ff;
      color: #409eff;
    }

    &.is-amber {
      background: #fdf6ec;
      color: #e6a23c;
    }

    &.is-green {
      background: #f0f9eb;
      color: #67c23a;
    }

    &.is-red {
      background: #fef0f0;
      color: #f56c6c;
    }
  }

  &__suggest-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__suggest-title {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    line-height: 1.3;
  }

  &__suggest-desc {
    font-size: 11px;
    color: #909399;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__suggest-arrow {
    flex-shrink: 0;
    color: #c0c4cc;
    font-size: 12px;
    transition: color 0.15s, transform 0.15s;
  }

  &__footer {
    padding: 10px 12px 8px;
    border-top: 1px solid #ebeef5;
    background: #fff;
  }

  &__composer {
    display: flex;
    align-items: flex-end;
    gap: 8px;
  }

  &__input {
    flex: 1;
    min-width: 0;
    min-height: 36px;
    max-height: 120px;
    resize: none;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 13px;
    line-height: 1.45;
    color: #303133;
    outline: none;
    font-family: inherit;
    box-sizing: border-box;
    background: #fff;

    &:focus {
      border-color: #409eff;
    }

    &:disabled {
      background: #f5f7fa;
      color: #c0c4cc;
    }
  }

  &__send {
    flex-shrink: 0;
    height: 36px;
    min-width: 56px;
    padding: 0 14px;
    margin: 0;
    border-radius: 8px !important;
    font-size: 13px;
  }

  &__hint {
    margin-top: 4px;
    font-size: 11px;
    color: #c0c4cc;
    line-height: 1.2;
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

@keyframes ops-agent-skel {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>

<!-- dropdown menus are teleported to body; keep compact spacing consistent -->
<style lang="scss">
.ops-agent-chat-menu {
  min-width: 96px !important;
  padding: 4px 0 !important;

  .el-dropdown-menu__item,
  .el-dropdown-item {
    padding: 0 14px !important;
    line-height: 28px !important;
    font-size: 12px !important;
    color: #606266;
  }

  .el-dropdown-menu__item--divided,
  .el-dropdown-item--divided {
    margin-top: 4px !important;

    &::before {
      margin: 0 8px !important;
      height: 0 !important;
      border-top: 1px solid #ebeef5 !important;
    }
  }

  .ops-agent-chat-menu__danger {
    color: #f56c6c;
  }
}
</style>

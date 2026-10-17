<template>
  <div class="ops-agent-chat">
    <div
      v-show="!panelOpen"
      class="ops-agent-chat__fab"
      @click="panelOpen = true"
    >
      <i class="el-icon-chat-dot-round" />
    </div>

    <transition name="ops-agent-chat-slide">
      <div v-show="panelOpen" class="ops-agent-chat__panel">
        <div class="ops-agent-chat__header">
          <span>运维助手</span>
          <i class="el-icon-close ops-agent-chat__close" @click="panelOpen = false" />
        </div>

        <div ref="messageList" class="ops-agent-chat__messages">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['ops-agent-chat__msg', `ops-agent-chat__msg--${msg.role}`]"
          >
            <div class="ops-agent-chat__bubble">{{ msg.text }}</div>
          </div>

          <pending-action-card
            v-for="item in pendingActions"
            :key="'pa-' + item.id"
            :action="item"
            @cancel="dismissPending"
            @confirmed="onActionConfirmed"
            @confirm-failed="onActionConfirmFailed"
          />
        </div>

        <div class="ops-agent-chat__footer">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="2"
            placeholder="描述问题，例如：帮我看看这个订单"
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
    </transition>
  </div>
</template>

<script>
import { sendChat } from '@/api/opsAgent/chat'
import PendingActionCard from './PendingActionCard.vue'

const SESSION_KEY = 'ops_agent_session_id'
const PAGE_CONTEXT_KEYS = ['orderId', 'orderCode', 'stationId', 'deviceCode']

export default {
  name: 'OpsAgentChat',
  components: { PendingActionCard },
  data() {
    return {
      panelOpen: false,
      inputText: '',
      sending: false,
      sessionId: sessionStorage.getItem(SESSION_KEY) || null,
      messages: [],
      pendingActions: []
    }
  },
  methods: {
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
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messageList
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    },
    sendMessage() {
      const text = this.inputText.trim()
      if (!text || this.sending) {
        return
      }
      this.messages.push({ role: 'user', text })
      this.inputText = ''
      this.sending = true
      this.scrollToBottom()

      sendChat({
        sessionId: this.sessionId,
        message: text,
        pageContext: this.buildPageContext()
      })
        .then(res => {
          if (res.code !== 200) {
            this.messages.push({
              role: 'assistant',
              text: res.msg || '请求失败，请稍后重试'
            })
            return
          }
          if (res.sessionId) {
            this.sessionId = res.sessionId
            sessionStorage.setItem(SESSION_KEY, res.sessionId)
          }
          if (res.assistantText) {
            this.messages.push({ role: 'assistant', text: res.assistantText })
          }
          if (Array.isArray(res.pendingActions) && res.pendingActions.length) {
            res.pendingActions.forEach(pa => {
              if (!this.pendingActions.some(x => x.id === pa.id)) {
                this.pendingActions.push(pa)
              }
            })
          }
        })
        .catch(() => {
          this.messages.push({
            role: 'assistant',
            text: '网络异常，请检查连接后重试'
          })
        })
        .finally(() => {
          this.sending = false
          this.scrollToBottom()
        })
    },
    dismissPending(id) {
      this.pendingActions = this.pendingActions.filter(p => p.id !== id)
    },
    onActionConfirmed({ action, result }) {
      this.dismissPending(action.id)
      const ok = result && result.code === 200
      const status = result && result.status ? result.status : ''
      this.messages.push({
        role: 'assistant',
        text: ok
          ? `操作已执行${status ? '（' + status + '）' : ''}`
          : (result && result.error) || (result && result.msg) || '操作失败'
      })
      this.scrollToBottom()
    },
    onActionConfirmFailed({ action }) {
      this.messages.push({
        role: 'assistant',
        text: `「${action.summary}」确认失败，请稍后重试`
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

  &__fab {
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

  &__panel {
    width: 360px;
    max-height: 520px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    font-weight: 600;
    font-size: 14px;
  }

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
    padding: 12px 16px;
    min-height: 200px;
    max-height: 360px;
  }

  &__msg {
    margin-bottom: 10px;
    display: flex;

    &--user {
      justify-content: flex-end;

      .ops-agent-chat__bubble {
        background: #409eff;
        color: #fff;
      }
    }

    &--assistant {
      justify-content: flex-start;

      .ops-agent-chat__bubble {
        background: #f4f4f5;
        color: #303133;
      }
    }
  }

  &__bubble {
    max-width: 85%;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__footer {
    padding: 12px 16px;
    border-top: 1px solid #ebeef5;
  }

  &__send {
    margin-top: 8px;
    float: right;
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

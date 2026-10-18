/**
 * Local multi-conversation store for Ops Agent floating chat.
 * Backend sessionId is kept per conversation so reopen continues the same thread.
 */

const STORE_KEY = 'ops_agent_conversations_v2'
const UI_KEY = 'ops_agent_ui_prefs_v1'
const LEGACY_SESSION_KEY = 'ops_agent_session_id'

const DEFAULT_UI = {
  panelWidth: 420,
  panelHeight: 560,
  sidebarOpen: true
}

export const WELCOME_TEXT =
  '我是运维助手。可以查单、排障退款、查 SOP、建议远程停充（高风险需确认）。\n点下方快捷场景，或直接粘贴订单号。'

function uid() {
  return 'c_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
}

export function createEmptyConversation(partial) {
  const now = Date.now()
  return Object.assign(
    {
      id: uid(),
      sessionId: null,
      title: '新对话',
      updatedAt: now,
      createdAt: now,
      messages: [
        {
          role: 'assistant',
          text: WELCOME_TEXT,
          toolTrace: null,
          traceOpen: false
        }
      ],
      pendingActions: [],
      mockMode: true
    },
    partial || {}
  )
}

function readRaw() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) {
      return null
    }
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

function writeRaw(payload) {
  localStorage.setItem(STORE_KEY, JSON.stringify(payload))
}

/**
 * Load store for current admin. Migrates legacy single-session key once.
 */
export function loadStore(adminId) {
  const data = readRaw()
  if (data && Array.isArray(data.conversations)) {
    if (data.adminId != null && adminId != null && data.adminId !== adminId) {
      return resetForAdmin(adminId)
    }
    if (!data.conversations.length) {
      const conv = createEmptyConversation()
      return {
        adminId,
        activeId: conv.id,
        conversations: [conv]
      }
    }
    return {
      adminId: data.adminId != null ? data.adminId : adminId,
      activeId: data.activeId || data.conversations[0].id,
      conversations: data.conversations
    }
  }

  // migrate legacy single session
  let legacySessionId = null
  try {
    const legacy = sessionStorage.getItem(LEGACY_SESSION_KEY)
    if (legacy) {
      const parsed = JSON.parse(legacy)
      legacySessionId = parsed && parsed.sessionId ? parsed.sessionId : legacy
      sessionStorage.removeItem(LEGACY_SESSION_KEY)
    }
  } catch (e) {
    /* ignore */
  }

  const conv = createEmptyConversation({
    sessionId: legacySessionId,
    title: legacySessionId ? '上次会话' : '新对话'
  })
  const store = {
    adminId,
    activeId: conv.id,
    conversations: [conv]
  }
  saveStore(store)
  return store
}

export function saveStore(store) {
  writeRaw({
    adminId: store.adminId,
    activeId: store.activeId,
    conversations: store.conversations
  })
}

function resetForAdmin(adminId) {
  const conv = createEmptyConversation()
  const store = {
    adminId,
    activeId: conv.id,
    conversations: [conv]
  }
  saveStore(store)
  return store
}

export function titleFromMessage(text) {
  if (!text) {
    return '新对话'
  }
  const t = String(text).replace(/\s+/g, ' ').trim()
  if (t.length <= 18) {
    return t
  }
  return t.slice(0, 18) + '…'
}

export function sortConversations(list) {
  return list.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

/** Prefer a readable size that fits the viewport; caller may override with saved prefs. */
export function suggestPanelSize() {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900
  const width = Math.min(520, Math.max(360, Math.round(vw * 0.36)))
  const height = Math.min(680, Math.max(420, Math.round(vh * 0.72)))
  return { panelWidth: width, panelHeight: height }
}

export function loadUiPrefs() {
  try {
    const raw = localStorage.getItem(UI_KEY)
    if (!raw) {
      return Object.assign({}, DEFAULT_UI, suggestPanelSize())
    }
    const parsed = JSON.parse(raw)
    const suggested = suggestPanelSize()
    return {
      panelWidth: clamp(parsed.panelWidth || suggested.panelWidth, 360, 900),
      panelHeight: clamp(parsed.panelHeight || suggested.panelHeight, 400, 900),
      sidebarOpen: parsed.sidebarOpen !== false
    }
  } catch (e) {
    return Object.assign({}, DEFAULT_UI, suggestPanelSize())
  }
}

export function saveUiPrefs(prefs) {
  localStorage.setItem(UI_KEY, JSON.stringify({
    panelWidth: prefs.panelWidth,
    panelHeight: prefs.panelHeight,
    sidebarOpen: prefs.sidebarOpen !== false
  }))
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, Number(n) || min))
}

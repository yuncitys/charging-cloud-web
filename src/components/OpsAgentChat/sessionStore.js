/**
 * Ops Agent chat helpers.
 * Conversations are server-owned; localStorage only keeps UI prefs + last activeId.
 */

const UI_KEY = 'ops_agent_ui_prefs_v1'
const ACTIVE_KEY = 'ops_agent_active_session_v1'
/** Legacy multi-conversation blob — cleared on sync so it cannot override server. */
const LEGACY_STORE_KEY = 'ops_agent_conversations_v2'
const LEGACY_SESSION_KEY = 'ops_agent_session_id'

const DEFAULT_UI = {
  panelWidth: 420,
  panelHeight: 560,
  sidebarOpen: true,
  sidebarWidth: 176
}

export const WELCOME_TEXT =
  '我是运维助手。可以查单、排障退款、查 SOP、建议远程停充（高风险需确认）。\n点下方快捷场景，或直接粘贴订单号。'

export function createEmptyConversation(partial) {
  const now = Date.now()
  const id = partial && partial.id ? partial.id : null
  return Object.assign(
    {
      id,
      sessionId: id,
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
      mockMode: true,
      messagesLoaded: false
    },
    partial || {},
    {
      // keep id / sessionId aligned when server id is known
      id: (partial && (partial.id || partial.sessionId)) || id,
      sessionId: (partial && (partial.sessionId || partial.id)) || id
    }
  )
}

export function fromSessionSummary(row) {
  const id = row && row.id != null ? String(row.id) : null
  const updatedAt = toMillis(row && (row.updateTime || row.updatedAt))
  const createdAt = toMillis(row && (row.createTime || row.createdAt)) || updatedAt
  return createEmptyConversation({
    id,
    sessionId: id,
    title: (row && row.title) || '新对话',
    updatedAt: updatedAt || Date.now(),
    createdAt: createdAt || Date.now(),
    messages: [],
    messagesLoaded: false,
    pendingActions: []
  })
}

export function mapServerMessages(rows) {
  if (!Array.isArray(rows) || !rows.length) {
    return [
      {
        role: 'assistant',
        text: WELCOME_TEXT,
        toolTrace: null,
        traceOpen: false
      }
    ]
  }
  return rows.map(row => {
    const toolTrace = parseToolTrace(row && row.toolTraceJson)
    return {
      role: row.role === 'user' ? 'user' : 'assistant',
      text: row.content != null ? String(row.content) : '',
      toolTrace,
      traceOpen: false,
      createdAt: toMillis(row.createTime)
    }
  })
}

function parseToolTrace(raw) {
  if (!raw) {
    return null
  }
  if (Array.isArray(raw)) {
    return raw
  }
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(parsed) ? parsed : null
  } catch (e) {
    return null
  }
}

function toMillis(v) {
  if (v == null || v === '') {
    return 0
  }
  if (typeof v === 'number') {
    return v
  }
  const t = new Date(v).getTime()
  return Number.isNaN(t) ? 0 : t
}

/**
 * Build a conversation title from the first user message.
 * Do NOT append ellipsis — the sidebar fades visually when width is insufficient.
 */
export function titleFromMessage(text) {
  if (!text) {
    return '新对话'
  }
  const t = String(text).replace(/\s+/g, ' ').trim()
  if (!t) {
    return '新对话'
  }
  return t.length > 120 ? t.slice(0, 120) : t
}

/**
 * Prefer persisted server title. Only fall back to first user message when title is
 * still the default (legacy rows / not yet saved) so the sidebar does not "jump"
 * after opening a conversation.
 */
export function displayConversationTitle(conv) {
  if (!conv) {
    return '新对话'
  }
  const stored = normalizeStoredTitle(conv.title)
  if (stored) {
    return stored
  }
  const msgs = conv.messages || []
  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i]
    if (m && m.role === 'user' && m.text) {
      return titleFromMessage(m.text)
    }
  }
  return '新对话'
}

export function isDefaultConversationTitle(title) {
  if (title == null || !String(title).trim()) {
    return true
  }
  const t = String(title).trim()
  return t === '新对话' || t === 'ops chat'
}

function normalizeStoredTitle(title) {
  if (isDefaultConversationTitle(title)) {
    return ''
  }
  return String(title).trim()
}

export function sortConversations(list) {
  return list.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

export function loadActiveId(adminId) {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    if (adminId != null && parsed.adminId != null && parsed.adminId !== adminId) {
      return null
    }
    return parsed.activeId || null
  } catch (e) {
    return null
  }
}

export function saveActiveId(adminId, activeId) {
  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify({ adminId, activeId }))
  } catch (e) {
    /* ignore */
  }
}

/** Drop legacy local conversation blobs so they cannot fight the server. */
export function clearLegacyLocalConversations() {
  try {
    localStorage.removeItem(LEGACY_STORE_KEY)
    sessionStorage.removeItem(LEGACY_SESSION_KEY)
  } catch (e) {
    /* ignore */
  }
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
      sidebarOpen: parsed.sidebarOpen !== false,
      sidebarWidth: clamp(parsed.sidebarWidth != null ? parsed.sidebarWidth : DEFAULT_UI.sidebarWidth, 120, 320)
    }
  } catch (e) {
    return Object.assign({}, DEFAULT_UI, suggestPanelSize())
  }
}

export function saveUiPrefs(prefs) {
  localStorage.setItem(UI_KEY, JSON.stringify({
    panelWidth: prefs.panelWidth,
    panelHeight: prefs.panelHeight,
    sidebarOpen: prefs.sidebarOpen !== false,
    sidebarWidth: clamp(prefs.sidebarWidth != null ? prefs.sidebarWidth : DEFAULT_UI.sidebarWidth, 120, 320)
  }))
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, Number(n) || min))
}

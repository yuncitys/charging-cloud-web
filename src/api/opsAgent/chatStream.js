import { getToken } from '@/utils/auth'
import { agentStreamUrl } from './paths'

/**
 * POST SSE chat stream. Falls back to caller if unsupported.
 * Events: meta | token | pending | trace | done
 *
 * Returns a Promise with `.abort()` to cancel the fetch (AbortController).
 */
export function sendChatStream(data, handlers) {
  const h = handlers || {}
  const url = agentStreamUrl()
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream'
  }
  const token = getToken && getToken()
  if (token) {
    headers.Authorization = token
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null

  const promise = fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data || {}),
    credentials: 'include',
    signal: controller ? controller.signal : undefined
  }).then(async res => {
    if (!res.ok) {
      const err = new Error('stream http ' + res.status)
      err.status = res.status
      throw err
    }
    if (!res.body || !res.body.getReader) {
      throw new Error('stream unsupported')
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let eventName = 'message'
    let dataLines = []

    const flush = () => {
      if (!dataLines.length) {
        eventName = 'message'
        return
      }
      const raw = dataLines.join('\n')
      dataLines = []
      const name = eventName || 'message'
      eventName = 'message'
      dispatch(name, raw, h)
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split(/\r?\n/)
      buffer = parts.pop() || ''
      for (let i = 0; i < parts.length; i++) {
        const line = parts[i]
        if (line === '') {
          flush()
          continue
        }
        if (line.indexOf('event:') === 0) {
          eventName = line.slice(6).trim()
        } else if (line.indexOf('data:') === 0) {
          dataLines.push(line.slice(5).replace(/^ /, ''))
        }
      }
    }
    flush()
    if (typeof h.onDone === 'function') {
      h.onDone({})
    }
  })

  promise.abort = () => {
    if (controller) {
      controller.abort()
    }
  }

  return promise
}

function dispatch(name, raw, h) {
  let parsed = raw
  if (raw && (raw.charAt(0) === '{' || raw.charAt(0) === '[')) {
    try {
      parsed = JSON.parse(raw)
    } catch (e) {
      parsed = raw
    }
  }
  if (name === 'meta' && typeof h.onMeta === 'function') {
    h.onMeta(parsed)
  } else if (name === 'token' && typeof h.onToken === 'function') {
    let text = raw || ''
    if (raw && raw.charAt(0) === '"') {
      try {
        text = JSON.parse(raw)
      } catch (e) {
        text = raw
      }
    } else if (typeof parsed === 'string') {
      text = parsed
    }
    h.onToken(text)
  } else if (name === 'pending' && typeof h.onPending === 'function') {
    h.onPending(parsed)
  } else if (name === 'trace' && typeof h.onTrace === 'function') {
    h.onTrace(parsed)
  } else if (name === 'done' && typeof h.onDonePayload === 'function') {
    h.onDonePayload(parsed)
  }
}

/** Shared Ops Agent API path helpers. */

export const AGENT_API_PREFIX = '/api/agent'

export function agentPath(suffix) {
  const s = suffix == null ? '' : String(suffix)
  if (!s) {
    return AGENT_API_PREFIX
  }
  return AGENT_API_PREFIX + (s.charAt(0) === '/' ? s : '/' + s)
}

export function agentStreamUrl() {
  const base = process.env.VUE_APP_BASE_API || ''
  return (base.replace(/\/$/, '') || '') + agentPath('/chat/stream')
}

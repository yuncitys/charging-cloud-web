/**
 * Pretty-print JSON for agent tool traces / bubble content.
 * Recursively parses string fields that themselves contain JSON.
 */

const MAX_DEPTH = 6
const MAX_STRING = 8000

export function tryParseJson(value) {
  if (typeof value !== 'string') {
    return { ok: false, value }
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return { ok: false, value }
  }
  const first = trimmed.charAt(0)
  if (first !== '{' && first !== '[') {
    return { ok: false, value }
  }
  try {
    return { ok: true, value: JSON.parse(trimmed) }
  } catch (e) {
    return { ok: false, value }
  }
}

function deepen(node, depth) {
  if (depth > MAX_DEPTH || node == null) {
    return node
  }
  if (typeof node === 'string') {
    if (node.length > MAX_STRING) {
      return node.slice(0, MAX_STRING) + '…'
    }
    const parsed = tryParseJson(node)
    if (parsed.ok) {
      return deepen(parsed.value, depth + 1)
    }
    return node
  }
  if (Array.isArray(node)) {
    return node.map(item => deepen(item, depth + 1))
  }
  if (typeof node === 'object') {
    const out = {}
    Object.keys(node).forEach(key => {
      out[key] = deepen(node[key], depth + 1)
    })
    return out
  }
  return node
}

export function normalizeForDisplay(input) {
  if (input == null) {
    return null
  }
  if (typeof input === 'string') {
    const parsed = tryParseJson(input)
    if (parsed.ok) {
      return deepen(parsed.value, 0)
    }
    return input
  }
  return deepen(input, 0)
}

export function prettyJson(input) {
  const normalized = normalizeForDisplay(input)
  if (normalized == null) {
    return ''
  }
  if (typeof normalized === 'string') {
    return normalized
  }
  try {
    return JSON.stringify(normalized, null, 2)
  } catch (e) {
    return String(normalized)
  }
}

/**
 * Split assistant text into plain / json segments for mixed rendering.
 */
export function splitTextAndJson(text) {
  if (!text || typeof text !== 'string') {
    return [{ type: 'text', value: text || '' }]
  }
  const segments = []
  const re = /(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\])/g
  let last = 0
  let match
  while ((match = re.exec(text)) !== null) {
    const candidate = match[0]
    const parsed = tryParseJson(candidate)
    if (!parsed.ok || candidate.length < 20) {
      continue
    }
    if (match.index > last) {
      segments.push({ type: 'text', value: text.slice(last, match.index) })
    }
    segments.push({ type: 'json', value: parsed.value })
    last = match.index + candidate.length
  }
  if (last < text.length) {
    segments.push({ type: 'text', value: text.slice(last) })
  }
  if (!segments.length) {
    return [{ type: 'text', value: text }]
  }
  return segments
}

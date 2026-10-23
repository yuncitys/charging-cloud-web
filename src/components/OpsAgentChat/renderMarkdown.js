/**
 * Markdown → safe HTML for agent bubbles via marked@4 (GFM) + DOMPurify.
 * Use marked 4.x: Vue CLI 4 / webpack 4 cannot parse marked 9 class-fields in node_modules.
 */
import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false
})

const PURIFY_OPTS = {
  USE_PROFILES: { html: true },
  ALLOWED_TAGS: [
    'p', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'strong', 'em', 'b', 'i', 'u', 'del', 's',
    'code', 'pre', 'blockquote',
    'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'span', 'div'
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class', 'align', 'colspan', 'rowspan']
}

export function renderMarkdown(src) {
  if (!src) {
    return ''
  }
  let html
  try {
    html = marked.parse(String(src))
  } catch (e) {
    return escapeHtml(String(src)).replace(/\n/g, '<br>')
  }
  if (typeof html !== 'string') {
    html = String(html || '')
  }
  html = html.replace(
    /<a\s+([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/gi,
    '<a href="$2" target="_blank" rel="noopener noreferrer">'
  )
  return DOMPurify.sanitize(html, PURIFY_OPTS)
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

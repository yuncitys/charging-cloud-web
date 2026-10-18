/**
 * Lightweight Markdown → safe HTML for agent bubbles (no extra npm dep).
 * Supports: headings, bold/italic, inline code, fenced code, lists, links, paragraphs.
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inlineFormat(text) {
  let s = escapeHtml(text)
  // code first
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>')
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  // links [text](url) — only http(s)
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  return s
}

export function renderMarkdown(src) {
  if (!src) {
    return ''
  }
  const lines = String(src).replace(/\r\n/g, '\n').split('\n')
  const html = []
  let i = 0
  let inUl = false
  let inOl = false

  const closeLists = () => {
    if (inUl) {
      html.push('</ul>')
      inUl = false
    }
    if (inOl) {
      html.push('</ol>')
      inOl = false
    }
  }

  while (i < lines.length) {
    const line = lines[i]

    // fenced code
    if (line.trim().startsWith('```')) {
      closeLists()
      i++
      const buf = []
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        buf.push(escapeHtml(lines[i]))
        i++
      }
      if (i < lines.length) {
        i++
      }
      html.push('<pre class="md-pre"><code>' + buf.join('\n') + '</code></pre>')
      continue
    }

    const h = /^(#{1,3})\s+(.+)$/.exec(line)
    if (h) {
      closeLists()
      const level = h[1].length
      html.push('<h' + level + ' class="md-h">' + inlineFormat(h[2]) + '</h' + level + '>')
      i++
      continue
    }

    const ul = /^\s*[-*]\s+(.+)$/.exec(line)
    if (ul) {
      if (inOl) {
        html.push('</ol>')
        inOl = false
      }
      if (!inUl) {
        html.push('<ul class="md-ul">')
        inUl = true
      }
      html.push('<li>' + inlineFormat(ul[1]) + '</li>')
      i++
      continue
    }

    const ol = /^\s*(\d+)\.\s+(.+)$/.exec(line)
    if (ol) {
      if (inUl) {
        html.push('</ul>')
        inUl = false
      }
      if (!inOl) {
        html.push('<ol class="md-ol">')
        inOl = true
      }
      html.push('<li>' + inlineFormat(ol[2]) + '</li>')
      i++
      continue
    }

    if (!line.trim()) {
      closeLists()
      i++
      continue
    }

    closeLists()
    html.push('<p class="md-p">' + inlineFormat(line) + '</p>')
    i++
  }
  closeLists()
  return html.join('')
}

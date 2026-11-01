<template>
  <div class="json-block">
    <div class="json-block__bar">
      <span class="json-block__label">{{ label || 'JSON' }}</span>
      <div class="json-block__actions">
        <span class="json-block__action" @click="collapsed = !collapsed">
          {{ collapsed ? '展开' : '收起' }}
        </span>
        <span class="json-block__action" @click="copy">复制</span>
      </div>
    </div>
    <pre v-show="!collapsed" class="json-block__pre" v-html="highlighted" />
  </div>
</template>

<script>
import { prettyJson } from './jsonPretty'

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Lightweight syntax highlight for pretty JSON. */
function highlightJson(text) {
  const escaped = escapeHtml(text)
  return escaped.replace(
    /("(?:\\.|[^"\\])*")\s*:|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|("(?:\\.|[^"\\])*")/g,
    (match, key, bool, num, str) => {
      if (key) {
        return `<span class="jk">${key}</span>:`
      }
      if (bool) {
        return `<span class="jb">${bool}</span>`
      }
      if (num) {
        return `<span class="jn">${num}</span>`
      }
      if (str) {
        return `<span class="js">${str}</span>`
      }
      return match
    }
  )
}

export default {
  name: 'JsonBlock',
  props: {
    value: {
      type: [Object, Array, String, Number, Boolean],
      default: null
    },
    label: {
      type: String,
      default: ''
    },
    defaultCollapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      collapsed: this.defaultCollapsed
    }
  },
  computed: {
    pretty() {
      return prettyJson(this.value)
    },
    highlighted() {
      return highlightJson(this.pretty)
    }
  },
  methods: {
    copy() {
      const text = this.pretty
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message && this.$message.success('已复制')
        }).catch(() => {
          this.fallbackCopy(text)
        })
      } else {
        this.fallbackCopy(text)
      }
    },
    fallbackCopy(text) {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        this.$message && this.$message.success('已复制')
      } catch (e) {
        /* ignore */
      }
      document.body.removeChild(ta)
    }
  }
}
</script>

<style lang="scss" scoped>
.json-block {
  margin-top: 6px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  background: #1e1e2e;
  color: #cdd6f4;

  &__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    background: #313244;
    font-size: 11px;
  }

  &__label {
    color: #a6adc8;
  }

  &__actions {
    display: flex;
    gap: 10px;
  }

  &__action {
    color: #89b4fa;
    cursor: pointer;
    user-select: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__pre {
    margin: 0;
    padding: 8px 10px;
    max-height: 220px;
    overflow: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    line-height: 1.45;
    white-space: pre;
    word-break: normal;
  }
}

.json-block ::v-deep .jk {
  color: #89b4fa;
}

.json-block ::v-deep .js {
  color: #a6e3a1;
}

.json-block ::v-deep .jn {
  color: #fab387;
}

.json-block ::v-deep .jb {
  color: #cba6f7;
}
</style>

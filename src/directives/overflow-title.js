/**
 * v-overflow-title
 *
 * 目标：
 * 1) 仅当文本发生省略（scrollWidth > clientWidth）时，悬停才显示完整内容气泡
 * 2) 气泡文本可选中复制（替代浏览器默认 title 的不可控样式/交互）
 * 3) 支持窗口滚动/缩放后的气泡重定位
 *
 * 使用方式：
 *   <span class="ellipsis" v-overflow-title>{{ text }}</span>
 *
 * 注意：
 * - 指令目标元素需要具备单行省略样式（nowrap + overflow hidden + text-overflow ellipsis）
 * - 若元素本身不省略，则不会显示气泡
 */
function isOverflow(el) {
  if (!el) return false
  return el.scrollWidth > el.clientWidth
}

// 创建自定义浮层（深色气泡），用于展示完整文本并支持复制
function createPopover(text) {
  const pop = document.createElement('div')
  pop.textContent = text
  Object.assign(pop.style, {
    position: 'fixed',
    zIndex: '3000',
    maxWidth: '520px',
    padding: '8px 12px',
    borderRadius: '4px',
    background: 'rgba(48, 49, 51, 0.95)',
    color: '#fff',
    fontSize: '14px',
    lineHeight: '22px',
    boxSizing: 'border-box',
    wordBreak: 'break-all',
    userSelect: 'text',
    cursor: 'text',
    boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.2)'
  })
  return pop
}

// 销毁浮层及隐藏定时器，避免残留 DOM/定时器
function hidePopover(el) {
  if (!el || !el.__overflowPopover__) return
  if (el.__overflowPopoverHideTimer__) {
    clearTimeout(el.__overflowPopoverHideTimer__)
    el.__overflowPopoverHideTimer__ = null
  }
  document.body.removeChild(el.__overflowPopover__)
  el.__overflowPopover__ = null
}

// 计算浮层位置：优先显示在元素上方，空间不足时改为下方
function placePopover(el) {
  if (!el || !el.__overflowPopover__) return
  const pop = el.__overflowPopover__
  const rect = el.getBoundingClientRect()
  const popRect = pop.getBoundingClientRect()
  let left = rect.left + (rect.width - popRect.width) / 2
  if (left < 8) left = 8
  const maxLeft = window.innerWidth - popRect.width - 8
  if (left > maxLeft) left = maxLeft
  let top = rect.top - popRect.height - 8
  if (top < 8) top = rect.bottom + 8
  pop.style.left = left + 'px'
  pop.style.top = top + 'px'
}

// 显示浮层入口：仅在“有文本且确实溢出”时生效
function showPopover(el) {
  if (!el) return
  const text = (el.innerText || '').trim()
  if (!text || !isOverflow(el)) {
    hidePopover(el)
    return
  }
  if (!el.__overflowPopover__) {
    const pop = createPopover(text)
    // 鼠标移入浮层时取消延迟隐藏，便于用户选中/复制文本
    pop.addEventListener('mouseenter', () => {
      if (el.__overflowPopoverHideTimer__) {
        clearTimeout(el.__overflowPopoverHideTimer__)
        el.__overflowPopoverHideTimer__ = null
      }
    })
    // 移出浮层即关闭
    pop.addEventListener('mouseleave', () => {
      hidePopover(el)
    })
    document.body.appendChild(pop)
    el.__overflowPopover__ = pop
  } else {
    el.__overflowPopover__.textContent = text
  }
  placePopover(el)
}

export default {
  inserted(el) {
    // 进入元素：实时检查溢出并显示
    const onEnter = () => showPopover(el)
    // 离开元素：延迟隐藏，给鼠标“移入浮层”留过渡时间
    const onLeave = () => {
      el.__overflowPopoverHideTimer__ = setTimeout(() => hidePopover(el), 120)
    }
    // 窗口变化：如果浮层存在则重算位置，避免错位
    const onWindow = () => {
      if (el.__overflowPopover__) placePopover(el)
    }

    el.__overflowEnter__ = onEnter
    el.__overflowLeave__ = onLeave
    el.__overflowWindow__ = onWindow

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', onWindow)
    window.addEventListener('scroll', onWindow, true)
  },
  componentUpdated(el) {
    // 列表数据刷新后，如果当前浮层还在，重新计算是否仍需展示
    if (el && el.__overflowPopover__) showPopover(el)
  },
  unbind(el) {
    // 解绑：移除事件并销毁浮层，防止内存泄漏
    if (!el) return
    if (el.__overflowEnter__) el.removeEventListener('mouseenter', el.__overflowEnter__)
    if (el.__overflowLeave__) el.removeEventListener('mouseleave', el.__overflowLeave__)
    if (el.__overflowWindow__) {
      window.removeEventListener('resize', el.__overflowWindow__)
      window.removeEventListener('scroll', el.__overflowWindow__, true)
    }
    hidePopover(el)
    delete el.__overflowEnter__
    delete el.__overflowLeave__
    delete el.__overflowWindow__
  }
}


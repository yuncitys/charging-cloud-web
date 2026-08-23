/**
 * 左侧菜单布局 - 递归菜单项（支持多级目录/页面，过滤按钮）
 */
import { getNavChildren, getLeafHref } from '@/utils/menuNav'

export default {
  name: 'SidebarOnlyItem',
  props: {
    item: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    }
  },
  render(h) {
    const item = this.item
    const navChildren = getNavChildren(item)
    const hasChildren = navChildren.length > 0
    const leafHref = getLeafHref(item)

    if (hasChildren) {
      // 目录：icon 与 title 必须是 title 插槽的直接子节点（i + span）
      // 若包在外层 span 内，el-menu--collapse 会把 title 下 span 宽高置 0，图标一并消失
      const titleNodes = [
        item.icon ? h('i', { slot: 'title', class: item.icon + ' sidebar-only-icon' }) : null,
        h('span', { slot: 'title', class: 'sidebar-only-title-text' }, item.title)
      ]

      const childNodes = navChildren.map(child =>
        h('SidebarOnlyItem', {
          props: { item: child, depth: this.depth + 1 },
          key: String(child.id || child.href || child.title)
        })
      )

      return h(
        'el-submenu',
        { props: { index: 'sidebar-sub-' + String(item.id || item.title) } },
        [...titleNodes, ...childNodes]
      )
    }

    const index = leafHref || (item.href && !String(item.href).startsWith(':') ? item.href : null)
    if (!index) {
      return h('span', { style: 'display:none' })
    }

    return h(
      'el-menu-item',
      { props: { index } },
      [
        h('div', { class: 'sidebar-only-item-inner' }, [
          item.icon ? h('i', { class: item.icon + ' sidebar-only-icon' }) : null,
          h('span', { class: 'sidebar-only-item-text' }, item.title)
        ])
      ]
    )
  }
}

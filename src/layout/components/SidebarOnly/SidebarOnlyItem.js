/**
 * 左侧菜单布局 - 递归菜单项组件（render 函数版）
 *
 * 只渲染两个层级：
 *   depth=0  顶级分组（el-submenu），展示其有 href 的子节点
 *   depth=1  菜单页面（el-menu-item），不再往下递归
 *   depth>=2 第三层起全是按钮/权限，直接忽略
 */

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

    // depth >= 1 时不再展开子节点（第三层起是按钮/权限）
    const menuChildren = this.depth < 1
      ? (item.children || []).filter(c => c.href)
      : []
    const hasChildren = menuChildren.length > 0

    if (hasChildren) {
      // ---- 有子菜单：渲染为可展开的 el-submenu ----
      const titleVnode = h(
        'span',
        { slot: 'title', class: 'sidebar-only-submenu-title' },
        [
          item.icon ? h('i', { class: item.icon + ' sidebar-only-icon' }) : null,
          h('span', { class: 'sidebar-only-title-text' }, item.title)
        ]
      )

      const childNodes = menuChildren.map(child =>
        h('SidebarOnlyItem', {
          props: { item: child, depth: this.depth + 1 },
          key: String(child.id || child.title)
        })
      )

      return h(
        'el-submenu',
        { props: { index: 'sidebar-sub-' + String(item.id || item.title) } },
        [titleVnode, ...childNodes]
      )
    }

    // ---- 无子菜单：渲染为叶节点 el-menu-item ----
    const index = item.href || null
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

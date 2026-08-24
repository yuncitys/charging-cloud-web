import { MENU_TYPE } from '@/views/permission/constants/menuType'

export function isButtonMenu(menu) {
  return menu && Number(menu.menuType) === MENU_TYPE.BUTTON
}

export function isNavNode(menu) {
  if (!menu || isButtonMenu(menu)) {
    return false
  }
  if (Number(menu.menuType) === MENU_TYPE.MENU && menu.href) {
    return true
  }
  if (Number(menu.menuType) === MENU_TYPE.DIRECTORY) {
    return getNavChildren(menu).length > 0 || !!menu.href
  }
  if (menu.menuType == null) {
    return !!menu.href || getNavChildren(menu).length > 0
  }
  return false
}

export function getNavChildren(menu) {
  if (!menu || !Array.isArray(menu.children)) {
    return []
  }
  return menu.children.filter(child => isNavNode(child))
}

export function getLeafHref(menu) {
  if (!menu) {
    return null
  }
  if (Number(menu.menuType) === MENU_TYPE.MENU && menu.href) {
    return menu.href
  }
  if (menu.menuType == null && menu.href && !String(menu.href).startsWith(':')) {
    return menu.href
  }
  return null
}

export function findFirstLeafHref(menu) {
  if (!menu) {
    return null
  }
  const selfHref = getLeafHref(menu)
  if (selfHref) {
    return selfHref
  }
  const children = getNavChildren(menu)
  for (let i = 0; i < children.length; i++) {
    const href = findFirstLeafHref(children[i])
    if (href) {
      return href
    }
  }
  return null
}

export function matchMenuPath(menu, path) {
  if (!menu) {
    return false
  }
  const target = normalizeHref(path)
  if (menu.href && normalizeHref(menu.href) === target) {
    return true
  }
  const children = menu.children || []
  return children.some(child => matchMenuPath(child, path))
}

export function findTopMenuByPath(menus, path) {
  if (!Array.isArray(menus)) {
    return null
  }
  return menus.find(menu => matchMenuPath(menu, path)) || null
}

function normalizeHref(href) {
  if (!href) {
    return ''
  }
  const value = String(href).trim()
  if (!value) {
    return ''
  }
  if (value.startsWith('/')) {
    return value.replace(/\/+$/, '') || '/'
  }
  return '/' + value.replace(/\/+$/, '')
}

/**
 * 在菜单树中按页面 href 查找祖先链（含自身），供面包屑使用（方案 C 核心）。
 *
 * 解决的问题：db_menu 可有任意深度目录，路由只有 URL 前缀 + 页面两级；
 *             侧栏已用 menuList，面包屑也需同一棵树才能显示「计费策略」等中间级。
 *
 * @param {Array} menus  menuList / 授权导航树
 * @param {string} href  当前页或 authFollow 父页的完整 path，如 /charge/timeCharge
 * @returns {Array|null} 从一级目录到目标页面的节点数组，未命中返回 null
 */
export function findMenuTrailByHref(menus, href, trail = []) {
  if (!Array.isArray(menus) || !href) {
    return null
  }
  const target = normalizeHref(href)
  for (let i = 0; i < menus.length; i++) {
    const node = menus[i]
    if (!node) {
      continue
    }
    const next = trail.concat(node)
    if (node.href && normalizeHref(node.href) === target) {
      return next
    }
    const found = findMenuTrailByHref(node.children, href, next)
    if (found) {
      return found
    }
  }
  return null
}

/**
 * 收集可搜索的菜单页面（HeaderSearch 与侧栏同一棵树）。
 * 只收录有 href 的页面；title 为从一级到当前页的名称数组。
 */
export function collectMenuSearchItems(menus, prefixTitle = [], items = []) {
  if (!Array.isArray(menus)) {
    return items
  }
  menus.forEach(node => {
    if (!isNavNode(node)) {
      return
    }
    const titles = prefixTitle.concat(node.title || '')
    const href = getLeafHref(node)
    if (href) {
      items.push({
        path: normalizeHref(href),
        title: titles
      })
    }
    collectMenuSearchItems(getNavChildren(node), titles, items)
  })
  return items
}

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
  if (menu.href && menu.href === path) {
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

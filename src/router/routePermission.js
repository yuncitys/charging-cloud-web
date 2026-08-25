import pathToRegexp from 'path-to-regexp'
import { MENU_TYPE } from '@/views/permission/constants/menuType'

const PUBLIC_PATHS = new Set(['/dashboard', '/404', '/401', '/permission/setPwd'])
const patternCache = new Map()

/** 按钮权限 → 独立 hidden 路由（无菜单 href，靠按钮授权访问） */
const BUTTON_GATED_PATHS = {
  ':web:largeScreen:openWatch': '/largeScreen'
}

export function normalizePath(path) {
  if (!path) {
    return ''
  }
  const value = String(path).trim()
  if (!value) {
    return ''
  }
  if (value.startsWith('/')) {
    return value.replace(/\/+$/, '') || '/'
  }
  return '/' + value.replace(/\/+$/, '')
}

export function resolveRoutePath(parentPath, routePath) {
  if (!routePath) {
    return normalizePath(parentPath)
  }
  if (String(routePath).startsWith('/')) {
    return normalizePath(routePath)
  }
  const base = normalizePath(parentPath)
  if (base === '/') {
    return normalizePath('/' + routePath)
  }
  return normalizePath(base + '/' + routePath)
}

export function collectAllowedHrefs(authorizationList) {
  const hrefs = new Set(PUBLIC_PATHS)
  if (!Array.isArray(authorizationList)) {
    return hrefs
  }
  authorizationList.forEach(item => {
    if (!item) {
      return
    }
    const menuType = item.menuType == null ? MENU_TYPE.MENU : Number(item.menuType)
    if (menuType === MENU_TYPE.MENU && item.href) {
      hrefs.add(normalizePath(item.href))
      return
    }
    if (menuType === MENU_TYPE.BUTTON && item.perms) {
      const perm = String(item.perms).trim()
      const gatedPath = BUTTON_GATED_PATHS[perm]
      if (gatedPath) {
        hrefs.add(normalizePath(gatedPath))
      }
    }
  })
  return hrefs
}

/**
 * hidden 路由是否可访问。
 * meta.authFollow：详情/编辑页无菜单 href 时，跟随父列表页的 href 授权；
 * 同一字段也供 Breadcrumb 拼父级菜单链（见 components/Breadcrumb）。
 */
function isHiddenRouteAllowed(route, fullPath, allowedHrefs, moduleHasAccess) {
  if (route.meta && route.meta.authFollow) {
    return allowedHrefs.has(normalizePath(route.meta.authFollow))
  }
  return moduleHasAccess
}

function filterLayoutChildren(children, allowedHrefs, parentPath) {
  const resolvedChildren = (children || []).map(child => ({
    route: child,
    fullPath: resolveRoutePath(parentPath, child.path)
  }))

  const moduleHasAccess = resolvedChildren.some(({ route, fullPath }) => {
    return !route.hidden && allowedHrefs.has(fullPath)
  })

  const filtered = []
  resolvedChildren.forEach(({ route, fullPath }) => {
    if (route.children && route.children.length) {
      const nested = filterRoutesByHref(route.children, allowedHrefs, fullPath)
      if (nested.length) {
        filtered.push(Object.assign({}, route, { children: nested }))
      }
      return
    }
    if (route.hidden) {
      if (isHiddenRouteAllowed(route, fullPath, allowedHrefs, moduleHasAccess)) {
        filtered.push(route)
      }
      return
    }
    if (allowedHrefs.has(fullPath)) {
      filtered.push(route)
    }
  })
  return filtered
}

export function filterRoutesByHref(routes, allowedHrefs, parentPath = '') {
  if (!Array.isArray(routes)) {
    return []
  }

  const result = []
  routes.forEach(route => {
    const fullPath = resolveRoutePath(parentPath, route.path)

    if (route.children && route.children.length) {
      const children = filterLayoutChildren(route.children, allowedHrefs, fullPath)
      if (children.length) {
        result.push(Object.assign({}, route, { children }))
      }
      return
    }

    if (route.hidden) {
      if (isHiddenRouteAllowed(route, fullPath, allowedHrefs, false)) {
        result.push(route)
      }
      return
    }

    if (allowedHrefs.has(fullPath)) {
      result.push(route)
    }
  })

  return result
}

export function collectRoutePaths(routes, parentPath = '', paths = new Set()) {
  if (!Array.isArray(routes)) {
    return paths
  }
  routes.forEach(route => {
    if (!route || !route.path || route.path === '*') {
      return
    }
    const fullPath = resolveRoutePath(parentPath, route.path)
    paths.add(fullPath)
    if (route.children && route.children.length) {
      collectRoutePaths(route.children, fullPath, paths)
    }
  })
  return paths
}

export function buildAccessiblePaths(authorizationList, filteredRoutes) {
  const hrefs = collectAllowedHrefs(authorizationList)
  collectRoutePaths(filteredRoutes).forEach(path => hrefs.add(path))
  return hrefs
}

function getPatternRegexp(pattern) {
  const key = normalizePath(pattern)
  if (!key || (!key.includes(':') && !key.includes('*'))) {
    return null
  }
  if (patternCache.has(key)) {
    return patternCache.get(key)
  }
  try {
    const re = pathToRegexp(key, [], { end: true })
    patternCache.set(key, re)
    return re
  } catch (e) {
    patternCache.set(key, null)
    return null
  }
}

/**
 * 当前 path 是否在可访问集合中。
 * 支持动态路由：集合里是 /netWorkDot/setting/:id，实际访问 /netWorkDot/setting/123 也应放行。
 */
export function isPathAllowed(path, allowedHrefs) {
  const normalized = normalizePath(path)
  if (PUBLIC_PATHS.has(normalized)) {
    return true
  }
  if (!allowedHrefs || !allowedHrefs.size) {
    return true
  }
  if (allowedHrefs.has(normalized)) {
    return true
  }
  for (const pattern of allowedHrefs) {
    const re = getPatternRegexp(pattern)
    if (re && re.test(normalized)) {
      return true
    }
  }
  return false
}

/**
 * 路由导航是否放行：先按实际 path，再按 matched 记录上的模式 path（如 /xxx/:id）。
 */
export function isRouteAllowed(route, allowedHrefs) {
  if (!route) {
    return false
  }
  if (isPathAllowed(route.path, allowedHrefs)) {
    return true
  }
  const matched = route.matched || []
  for (let i = matched.length - 1; i >= 0; i--) {
    const recordPath = matched[i] && matched[i].path
    if (recordPath && allowedHrefs && allowedHrefs.has(normalizePath(recordPath))) {
      return true
    }
  }
  return false
}

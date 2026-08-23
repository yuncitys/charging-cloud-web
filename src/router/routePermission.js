import { MENU_TYPE } from '@/views/permission/constants/menuType'

const PUBLIC_PATHS = new Set(['/dashboard'])

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
    if (!item || !item.href) {
      return
    }
    const menuType = item.menuType == null ? MENU_TYPE.MENU : Number(item.menuType)
    if (menuType === MENU_TYPE.MENU) {
      hrefs.add(normalizePath(item.href))
    }
  })
  return hrefs
}

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

export function isPathAllowed(path, allowedHrefs) {
  const normalized = normalizePath(path)
  if (PUBLIC_PATHS.has(normalized)) {
    return true
  }
  if (!allowedHrefs || !allowedHrefs.size) {
    return true
  }
  return allowedHrefs.has(normalized)
}

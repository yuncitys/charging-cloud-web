import Layout from '@/layout'

/**
 * 方案 B：扁平页面表 → Layout 路由树。
 *
 * 解决的问题：菜单按业务分组，URL 仍按历史前缀；页面只需登记完整 path + component，
 *             不必猜测挂在哪个 Layout 下。跨前缀页面（如财务菜单的 /charge/stationSplitConfig）
 *             写在业务模块文件里，运行时仍按 URL 第一段包进对应 Layout。
 *
 * 不改变：href、路由 name（keep-alive）、hidden、authFollow。
 */

/** 历史 Layout name，避免 router.push({ name }) / keep-alive 受影响 */
const LAYOUT_NAMES = {
  configAdmin: 'ConfigAdmin',
  tradeEntry: 'TradeEntry',
  permission: 'Permission',
  interconnection: 'organization',
  iotCard: 'iotcard'
}

/**
 * 历史 redirect 与「首个可见子页」不一致，保持原样以免改跳转。
 * 未列出的分组使用第一个非 hidden 页面的完整 path。
 */
const LAYOUT_REDIRECTS = {
  log: '/log',
  platform: '/platformConfig/platformConfig',
  payment: '/billPaymentInfo',
  interconnection: '/organizationList'
}

function splitFullPath(fullPath) {
  const normalized = String(fullPath || '').trim()
  const segs = normalized.replace(/^\//, '').split('/')
  const root = segs[0]
  const childPath = segs.slice(1).join('/')
  return { root, childPath }
}

export function buildLayoutRoutes(pages) {
  const groups = new Map()
  ;(pages || []).forEach(page => {
    if (!page || !page.path) {
      return
    }
    const { root } = splitFullPath(page.path)
    if (!root) {
      return
    }
    if (!groups.has(root)) {
      groups.set(root, [])
    }
    groups.get(root).push(page)
  })

  const routes = []
  groups.forEach((list, root) => {
    const children = list.map(page => {
      const { childPath } = splitFullPath(page.path)
      const next = Object.assign({}, page, { path: childPath })
      return next
    })
    const firstVisible = list.find(page => !page.hidden)
    routes.push({
      path: '/' + root,
      component: Layout,
      redirect: LAYOUT_REDIRECTS[root] || (firstVisible && firstVisible.path) || ('/' + root),
      alwaysShow: true,
      name: LAYOUT_NAMES[root] || root,
      meta: {
        title: (firstVisible && firstVisible.meta && firstVisible.meta.title) || root
      },
      children
    })
  })
  return routes
}

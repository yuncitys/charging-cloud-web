import router from './router'
import store from './store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isPathAllowed, normalizePath } from '@/router/routePermission'

NProgress.configure({
	showSpinner: false
})

const whiteList = ['/login', '/auth-redirect', '/404', '/401']

router.beforeEach(async(to, from, next) => {
	NProgress.start()
	document.title = '智慧充电管理平台'

	const hasToken = getToken()

	if (!hasToken) {
		if (whiteList.indexOf(to.path) !== -1) {
			next()
		} else {
			next(`/login?redirect=${to.path}`)
			NProgress.done()
		}
		return
	}

	if (to.path === '/login') {
		next({ path: '/' })
		NProgress.done()
		return
	}

	try {
		if (!store.getters.routesLoaded) {
			await store.dispatch('permission/generateRoutes')
			next({ ...to, replace: true })
			return
		}

		const normalizedPath = normalizePath(to.path)
		if (normalizedPath === '/404' || normalizedPath === '/401') {
			next()
			return
		}

		// 无匹配路由 → 404（兜底；正常应由 catchAllRoute 重定向）
		if (!to.matched || to.matched.length === 0) {
			next('/404')
			NProgress.done()
			return
		}

		const allowedHrefs = new Set(store.getters.allowedHrefs || [])
		if (isPathAllowed(to.path, allowedHrefs)) {
			store.dispatch('permission/generateRoutes')
			next()
		} else {
			next('/401')
			NProgress.done()
		}
	} catch (error) {
		next('/login')
		NProgress.done()
	}
})

router.afterEach(() => {
	NProgress.done()
})

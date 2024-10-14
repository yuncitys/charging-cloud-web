import router from './router'
import store from './store'
import {
	Message
} from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import {
	getToken
} from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({
	showSpinner: false
}) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async (to, from, next) => {

	NProgress.start()

	document.title = '智慧充电管理平台'

	const hasToken = getToken()

	if (hasToken) {
		// console.log(to.path)
		if (to.path === '/login') {
			next({
				path: '/'
			})
			NProgress.done()
		} else {
			next()
			store.dispatch('permission/generateRoutes')
		}
	} else {
		/* has no token*/

		if (whiteList.indexOf(to.path) !== -1) {
			// in the free login whitelist, go directly
			next()
		} else {
			// other pages that do not have permission to access are redirected to the login page.
			next(`/login?redirect=${to.path}`)
			NProgress.done()
		}
	}
	// const hasToken = 'admin-token'
	// const role = 'admin'
	// if (hasToken) {
	// 	next()
	// 	store.dispatch('permission/generateRoutes', role)
	// }
})

router.afterEach(() => {
	NProgress.done()
})

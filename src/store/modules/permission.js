import {
  asyncRoutes,
  constantRoutes
} from '@/router'
import router, { resetRouter } from '@/router'
import {
  getRouter
} from '@/api/user'
import {
  disassembleArr
} from '@/utils'
import {
  collectAllowedHrefs,
  filterRoutesByHref,
  buildAccessiblePaths
} from '@/router/routePermission'

const state = {
  meunList: [],
  leftMeunList: [],
  rightMoreMeunList: [],
  topOffsetWidth: [],
  authentionList: [],
  allowedHrefs: [],
  adminUser: [],
  addRoutes: [],
  routes: [],
  logoData: {},
  routesLoaded: false
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  },
  setMeunList(state, meunList) {
    state.meunList = meunList
  },
  setLeftMeunList(state, leftMeunList) {
    state.leftMeunList = leftMeunList
  },
  setRightMoreMeunList(state, rightMoreMeunList) {
    state.rightMoreMeunList = rightMoreMeunList
  },
  setTopOffsetWidth(state, topOffsetWidth) {
    state.topOffsetWidth = topOffsetWidth
  },
  setAuthentionList(state, authentionList) {
    state.authentionList = authentionList
  },
  setAllowedHrefs(state, allowedHrefs) {
    state.allowedHrefs = allowedHrefs
  },
  setAdminUser(state, adminUser) {
    state.adminUser = adminUser
  },
  setLogoData(state, logoData) {
    state.logoData = logoData
  },
  setRoutesLoaded(state, loaded) {
    state.routesLoaded = loaded
  },
  RESET_PERMISSION(state) {
    state.meunList = []
    state.leftMeunList = []
    state.rightMoreMeunList = []
    state.authentionList = []
    state.allowedHrefs = []
    state.adminUser = []
    state.addRoutes = []
    state.routes = []
    state.logoData = {}
    state.routesLoaded = false
  }
}

const actions = {
  generateRoutes({ commit, state }) {
    return new Promise(resolve => {
      getRouter().then(res => {
        if (res.code != 200) {
          resolve([])
          return
        }

        const meunList = res.data.menuList
        const authentionList = res.data.authorizationList
        const adminUser = res.data.adminUser
        const logoData = res.data.sysConfig
        const arr = disassembleArr(meunList, state.topOffsetWidth)

        commit('setMeunList', addRouterInfo(arr[0]))
        commit('setRightMoreMeunList', addRouterInfo(arr[1]))
        commit('setAuthentionList', authentionList)
        commit('setAdminUser', adminUser)
        commit('setLogoData', logoData)

        const allowedSet = collectAllowedHrefs(authentionList)

        let accessedRoutes = []
        if (!state.routesLoaded) {
          resetRouter()
          accessedRoutes = filterRoutesByHref(asyncRoutes, allowedSet)
          const accessiblePaths = buildAccessiblePaths(authentionList, accessedRoutes)
          router.addRoutes(accessedRoutes)
          commit('SET_ROUTES', accessedRoutes)
          commit('setAllowedHrefs', Array.from(accessiblePaths))
          commit('setRoutesLoaded', true)
        } else {
          accessedRoutes = state.addRoutes
          commit('setAllowedHrefs', Array.from(buildAccessiblePaths(authentionList, accessedRoutes)))
        }

        resolve(accessedRoutes)
      }).catch(() => {
        resolve([])
      })
    })
  },

  splitMenuByWidth({ state, commit }, offsetWidth) {
    const allMenus = [...(state.meunList || []), ...(state.rightMoreMeunList || [])]
    if (!allMenus.length) return
    const arr = disassembleArr(allMenus, offsetWidth)
    commit('setMeunList', addRouterInfo(arr[0]))
    commit('setRightMoreMeunList', addRouterInfo(arr[1]))
  },

  resetPermission({ commit }) {
    commit('RESET_PERMISSION')
    resetRouter()
  }
}

function addRouterInfo(arr) {
  return JSON.parse(JSON.stringify(arr || []))
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

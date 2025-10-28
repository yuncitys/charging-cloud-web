import {
  asyncRoutes,
  constantRoutes
} from '@/router'
import {
  getRouter
} from '@/api/user'
import {
  disassembleArr
} from '@/utils'
/* Layout */
// import Layout from '../../views/layout/Layout.vue'
import Layout from '@/layout'
import store from '@/store'


/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.indexOf(role) >= 0)
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const accessedRouters = constantRoutes.filter(route => {
    console.log()
    // if (route.component === 'Layout') {
    //   route.component = Layout
    // } else if (typeof route.component === 'string' || route.component instanceof String) {
    //   var str = route.component
    //  console.log(str,"123465")
    //   route.component = () => import(`@/views/${str}`)
    // }
    // if (hasPermission(roles, route)) {
    //   if (route.children && route.children.length) {
    //     route.children = filterAsyncRouter(route.children, roles)
    //   }
    //   return true
    // }
    return false
  })
  return accessedRouters
}

const state = {
  meunList: [],
  leftMeunList: [],
  rightMoreMeunList: [],
  topOffsetWidth: [],
  authentionList: [],
  adminUser: [],
  addRoutes: [],
  routes: [],
  logoData: {}
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
  setAdminUser(state, adminUser) {
    state.adminUser = adminUser
  },
  setLogoData(state, logoData) {
    state.logoData = logoData
  }
}

const actions = {
  generateRoutes({
    commit
  }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      getRouter().then(res => {
        if (res.code == 200) {
          let meunList = res.data.menuList
          let authentionList = res.data.authorizationList
          let adminUser = res.data.adminUser
          let logoData = res.data.sysConfig;

          let arr = disassembleArr(meunList, state.topOffsetWidth);
          console.log("arr:",arr)

          commit('setMeunList', addRouterInfo(arr[0]))
          commit('setRightMoreMeunList', arr[1])
          commit('setAuthentionList', authentionList)
          commit('setAdminUser', adminUser)
          commit('setLogoData', logoData)
        } else {

        }
      })
    })
  },
}

// 添加指定路由页面后期删除
function addRouterInfo(arr) {
 let list = JSON.parse(JSON.stringify(arr))
  // if (list.length > 2) {
  //   list[2].children.push({
  //     children: [],
  //     grade: 2,
  //     href: "/business/businessStatisticsOther",
  //     icon: "el-icon-s-check",
  //     id: 447,
  //     parentId: list[2].id,
  //     perms: ":business:businessStatisticsOther",
  //     sorting: 76,
  //     title: "其它报表"
  //   })
  // }else{
  //   return []
  // }
  return list;
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

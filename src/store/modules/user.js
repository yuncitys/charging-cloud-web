import {
  login,
  logout,
  getInfo
} from '@/api/user'
import {
  getToken,
  setTokenByExpires,
  setToken,
  removeToken
} from '@/utils/auth'
import router, {
  resetRouter
} from '@/router'
import {
  MessageBox,
  Message
} from 'element-ui'
const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {

  // 用户名登录
  login({
    commit
  }, userInfo) {
    const {
      username,
      password,
      rememberMe,
      grant_type
    } = userInfo
    console.log(userInfo)
    return new Promise((resolve, reject) => {
      login(userInfo).then(response => {
        const {
          data,
        } = response
        let res = response
        console.log(response)
        if (response.code == 200) {
          commit('SET_TOKEN', data.token)
          if (userInfo.rememberMe) {
            setTokenByExpires(data.token, 7)
          } else {
            setToken(data.token)
          }
          resolve()
        } else {
          Message({
            message: response.msg,
            type: 'error',
            duration: 5 * 1000
          })
        }
      })
    })
  },


  // 注销登录：清除token，remove token
  resetToken({
    commit
  }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  },


  // remove token
  resetToken({
    commit
  }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },


  // dynamically modify permissions
  async changeRoles({
    commit,
    dispatch
  }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const {
      roles
    } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, {
      root: true
    })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, {
      root: true
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

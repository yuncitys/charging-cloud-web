import {
  login
} from '@/api/user'
import {
  getToken,
  setToken,
  setTokenByExpires,
  removeToken
} from '@/utils/auth'
import {
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
    return new Promise((resolve, reject) => {
      login(userInfo).then(response => {
        const {
          data
        } = response
        if (response.code === 200) {
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
          reject(new Error(response.msg))
        }
      }).catch(reject)
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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

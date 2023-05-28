import { defineStore } from 'pinia'
import {login} from 'src/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: 0,
    isLogin: false,
  }),

  getters: {
    getUser (state) {
      return state.user
    },
    getIsLogin (state) {
      return state.isLogin
    }
  },

  actions: {
    setUser (user) {
      this.user = user
    },
    clearUser() {
      this.user = null
    },
    async loginUser(userData) {
       const responseData = await login({
        email: userData.email,
        sub: userData.sub,
        name: userData.name,
        given_name: userData.given_name,
        family_name: userData.family_name,
       })
      this.user = responseData
      return responseData

    }
  }
})

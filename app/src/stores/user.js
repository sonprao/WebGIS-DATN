import { defineStore } from 'pinia'

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
    }
  }
})

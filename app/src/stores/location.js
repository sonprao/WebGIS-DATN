import { defineStore } from 'pinia'

export const useLocationStore = defineStore('location', {
  state: () => ({
    location: {},
    isLocated: false,
  }),
  persist: true,

  getters: {
    getLocation (state) {
      return state.location
    },
    getIsLocated (state) {
      return state.isLocated
    }
  },

  actions: {
    setLocation (location) {
      this.location = location
    },
    clearLocation() {
      this.location = {}
      this.isLocated = false
    },
    async locateUser(userData) {
      try {
        const responseData = await locate(userData)
        this.location = responseData
        this.isLocated = true
        return responseData
      } catch (e){
        this.location = {}
        this.isLogin = false
        return e
      }

    },
  }
})

import { defineStore } from 'pinia'
import _isFunction from 'lodash/isFunction'
export const useMapStore = defineStore('map', {
  state: () => ({
    location: {},
  }),

  getters: {
    getLocation (state) {
      return state.location;
    },
  },

  actions: {
    setLocation({ location, resolve }) {
      this.location = location;
      if (_isFunction(resolve)) resolve()
    },
  }
})

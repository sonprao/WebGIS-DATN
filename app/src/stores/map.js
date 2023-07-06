import { defineStore } from 'pinia'
import _isFunction from 'lodash/isFunction'
export const useMapStore = defineStore('map', {
  state: () => ({
    location: {},
    projections: {},
  }),

  getters: {
    getLocation (state) {
      return state.location;
    },
     getProjections (state) {
      return state.projections;
    },
  },

  actions: {
    setLocation({ location, resolve }) {
      this.location = location;
      if (_isFunction(resolve)) resolve()
    },
    setProjection({ projection, resolve }) {
      Object.assign(this.projections, {...this.projections, ...projection})
      if (_isFunction(resolve)) resolve()
    },
  }
})

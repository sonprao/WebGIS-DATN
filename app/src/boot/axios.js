
import { boot } from 'quasar/wrappers'
import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({ baseURL: 'http://localhost:3000/api/' })
export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
  
  app.config.globalProperties.$axios.interceptors.request.use(config => {
    if (config.method === 'post') {
      const csrfToken = Cookies.get('csrftoken')
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken
      }
    }
    return config
  }, error => {
    return Promise.reject(error)
  });
  // app.config.globalProperties.$axios.interceptors.request.use(config => {
  //   const accessToken = localStorage.getItem('access_token');
  //   if (accessToken) {
  //     config.headers.Authorization = `Bearer ${accessToken}`;
  //   }
  //   return config;
  // }, error => {
  //   return Promise.reject(error);
  // });
})

export { axios, api }
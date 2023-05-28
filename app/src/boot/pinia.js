import { createPinia, PiniaVuePlugin } from 'pinia'

export default ({ app }) => {
  const pinia = createPinia()
  app.use(pinia)
  app.use(PiniaVuePlugin)
}
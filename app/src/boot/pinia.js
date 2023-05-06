import { createPinia, PiniaVuePlugin } from 'pinia'

export default ({ app }) => {
  app.use(PiniaVuePlugin)
}
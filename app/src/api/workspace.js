import { api } from 'boot/axios';
import { i18n } from "boot/i18n.js";
import {
  Notify,
  Dialog,
} from "quasar"
const $t = i18n.global.t;

export const getWorkspace = async (params) => {
  try {
    const response = await api.get(`workspaces`, params)
    return response.data
  } catch (e) {
    Notify.create({
      type: "negative",
      message:  e?.message || $t('Error!'),
    })
    return null
  }
}

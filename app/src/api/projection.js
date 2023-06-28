import { api } from 'boot/axios';
import { i18n } from "boot/i18n.js";
import {
  Notify
} from "quasar"
const $t = i18n.global.t;


export const getProjection = async (params) => {
  const response = await api.get(`projections/${params.name}`, params)
  return response.data
}

export const getAllProjection = async (params) => {
  const response = await api.get(`projections`, params)
  return response.data
}

export const updateProjection = async (params) => {
  try {
    const response = await api.put(`projections/${params.id}`, params)
    Notify.create({
      message:  $t('Success'),
      color: 'primary',
      icon: 'check_circle'
    })
    return response.data
  } catch (e) {
    Notify.create({
      message:  e?.message || $t('Error!'),
      color: 'red',
      icon: 'error_outline'
    })
    return null
  }
}


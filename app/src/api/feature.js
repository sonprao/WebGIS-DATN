import { api } from 'boot/axios';
import { i18n } from "boot/i18n.js";
import {
  Notify
} from "quasar"
const $t = i18n.global.t;


export const getFeaturesByLayer = async (query) => {
  const queryURL = new URLSearchParams()
  Object.entries(query).forEach((i) => {
    queryURL.append(i[0], i[1])  
  })
  const response = await api.get(`mapLayers/${query.layerId}/features`, {
    params: queryURL
  })
  return response.data
}

export const getFeature = async (params) => {
  const response = await api.get(`features/${params.name}`, params)
  return response.data
}

export const updateFeature = async (params) => {
  try {
    const response = await api.put(`features/${params.id}`, params)
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


import { api } from 'boot/axios';

export const post = async (params) => {
  const response = await api.post('mapLayers', params)
  return response
} 

export const get = async (params) => {
  const response = await api.get('mapLayers', params)
  return response
}

export const deleteMapLayer = async (params) => {
  const response = await api.update('mapLayers', params)
  return response
}
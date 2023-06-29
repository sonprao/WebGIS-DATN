import { api } from 'boot/axios';

export const createLayer = async (params) => {
  const response = await api.post('mapLayers', params)
  return response
} 

export const getLayer = async (params) => {
  const response = await api.get('mapLayers', params)
  return response
}

export const updateLayer = async (params) => {
  const response = await api.put(`mapLayers/${params.id}`, params)
  return response.data
}

export const getLayerByLocation = async (params) => {
  const queryURL = new URLSearchParams()
  Object.entries(params).forEach((i) => {
    queryURL.append(i[0], i[1])  
  })
  const response = await api.get(`mapLayers/getbyLocation/${params.locationId}`, {
    params: queryURL
  })
  return response.data
}

export const deleteMapLayer = async (params) => {
  const response = await api.update('mapLayers', params)
  return response
}
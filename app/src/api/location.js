import { api } from 'boot/axios';

export const post = async (params) => {
  const response = await api.post(`locations/${params.id}`, params)
  return response
}

export const updateLocation = async (params) => {
  const response = await api.put(`locations/${params.id}`, params)
  return response.data
}

export const get = async (params) => {
  const response = await api.get('locations', params)
  return response
}

export const getAllLocation = async (params) => {
  const response = await api.get('locations', params)
  return response.data
}

export const deleteMapLayer = async (params) => {
  const response = await api.delete('locations', params)
  return response
}
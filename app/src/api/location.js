import { api } from 'boot/axios';

export const post = async (params) => {
  const response = await api.post('locations', params)
  return response
} 

export const get = async (params) => {
  const response = await api.get('locations', params)
  return response
}

export const deleteMapLayer = async (params) => {
  const response = await api.delete('locations', params)
  return response
}
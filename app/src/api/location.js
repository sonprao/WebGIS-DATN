import { api } from 'boot/axios';

export const post = async (params) => {
  const response = await api.post(`locations/${params.id}`, params)
  return response
}

export const updateLocation = async (params) => {
  const response = await api.put(`locations/${params.id}`, params)
  return response.data
}

export const getLocation = async (params) => {
  const response = await api.get(`locations/${params.id}`, params)
  return response.data
}

export const getAllLocation = async (query) => {
  const queryURL = new URLSearchParams()
  Object.entries(query).forEach((i) => {
    queryURL.append(i[0], i[1])  
  })
  const response = await api.get('locations', {
    params: queryURL
  })
  return response.data
}

export const deleteMapLayer = async (params) => {
  const response = await api.delete('locations', params)
  return response
}
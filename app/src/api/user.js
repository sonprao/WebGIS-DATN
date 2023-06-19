import { api } from 'boot/axios';

export const login = async (params) => {
  const response = await api.post('login', params)
  return response.data
}

export const loginGoogle = async (params) => {
  const response = await api.post('login-google', params)
  return response.data
}

export const update = async (params) => {
  const response = await api.update('users', params)
  return response.data
}


export const find = async (params) => {
  const response = await api.get('users', params);
  return response
}

export const getAll = async (params) => {
  const response = await api.get('users', params);
  return response.data
}

export const deleteUser = async (params) => {
  const response = await api.delete('users', params);
  return response
}


export const activateUser = async (params) => {
  const response = await api.put(`users/${params.id}`, params);
  return response.data
}
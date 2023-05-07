import { api } from 'boot/axios';

export const login = async (params) => {
  const response = await api.post('users', params)
  return response
} 
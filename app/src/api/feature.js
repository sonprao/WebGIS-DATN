import { api } from 'boot/axios';

export const getFeature = async (params) => {
  const response = await api.get(`features/${params.name}`, params)
  return response.data
}


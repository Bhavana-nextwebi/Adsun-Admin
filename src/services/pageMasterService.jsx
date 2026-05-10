import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'accept': '*/*',
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

export const createPageMaster = async (payload) => {
return await axiosInstance.post('access/page-master', payload, { headers });
};

export const fetchPageMasters = async () => {
  const response = await axiosInstance.get('access/page-master', { headers });
  return response.data.result;
};

export const fetchPageMasterById = async (id) => {
  const response = await axiosInstance.get(`/access/page-master/${id}`, { headers });
  return response.data.result;
};

export const updatePageMaster = async (payload) => {
  return await axiosInstance.put('/access/page-master', payload, { headers });
};

export const deletePageMaster = async (id) => {
  return await axiosInstance.delete(`access/page-master/${id}`, { headers });
};


import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'accept': '*/*',
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

export const createRole = async (roleName) => {
  return await axiosInstance.post('access/role', { roleName }, { headers });
};

export const fetchRoles = async () => {
    const response = await axiosInstance.get('access/role', { headers });
    return response.data.result; 
};

export const fetchRoleById = async (id) => {
    const response = await axiosInstance.get(`access/role/${id}`, { headers });
    return response.data.result; 
};

export const updateRole = async (roleData) => {
    const response = await axiosInstance.put('access/role', roleData, { headers });
    return response.data; 
};

export const deleteRole = async (roleId) => {
    const response = await axiosInstance.delete(`access/role/${roleId}`, { headers });
    return response.data;
};

import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'accept': '*/*',
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
}; 

export const addAppUser = async (ownerData) => {
  const formData = new FormData();
    formData.append('FirstName', ownerData.FirstName);
      formData.append('LastName', ownerData.LastName);
    formData.append('EmailId', ownerData.EmailId);
    formData.append('MobileNo', ownerData.MobileNo);
    formData.append('Password', ownerData.Password);

    if (ownerData.proFileImage) {
      formData.append('ProfileImage', ownerData.proFileImage); 
    }
    const response = await axiosInstance.post('User/create', formData, {  headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${Cookies.get('accessToken')}`,
    }, });
    return response.data;
};

export const getAppUsers = async () => {
  return await axiosInstance.get('User/GetallAppUsers', { headers });
};

export const deleteAppUser = async (userid) => {
  return await axiosInstance.delete(`User/delete/${userid}`, { headers });
};


export const updateAppUser = async (payload) => {
  return await axiosInstance.put('User/update', payload, {  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  }, });
};


export const fetchAppUserById = async (Id) => {
  const response = await axiosInstance.get(`User/GetAppUser/${Id}`, { headers });
    return response.data.result;
};



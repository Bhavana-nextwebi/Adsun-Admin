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
  formData.append('City', ownerData.city ?? '');
  formData.append('District', ownerData.district ?? '');
  formData.append('State', ownerData.state ?? '');

  if (ownerData.proFileImage) {
    formData.append('ProfileImage', ownerData.proFileImage);
  }
  const response = await axiosInstance.post('User/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${Cookies.get('accessToken')}`,
    },
  });
  return response.data;
};

export const getAppUsers = async () => {
  return await axiosInstance.get('User/GetallAppUsers', { headers });
};

export const deleteAppUser = async (userid) => {
  return await axiosInstance.delete(`User/delete/${userid}`, { headers });
};

export const updateAppUser = async (payload) => {
  const formData = new FormData();
  formData.append('Id', payload.Id);
  formData.append('FirstName', payload.FirstName);
  formData.append('LastName', payload.LastName);
  formData.append('EmailId', payload.EmailId);
  formData.append('MobileNo', payload.MobileNo);
  formData.append('City', payload.city ?? '');
  formData.append('District', payload.district ?? '');
  formData.append('State', payload.state ?? '');

  if (payload.proFileImage) {
    formData.append('ProfileImage', payload.proFileImage);
  }

  return await axiosInstance.put('User/update', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${Cookies.get('accessToken')}`,
    },
  });
};

export const fetchAppUserById = async (Id) => {
  const response = await axiosInstance.get(`User/GetAppUser/${Id}`, { headers });
  return response.data.result;
};

export const ChangePassword = async (payload) => {
  return await axiosInstance.put('User/change-password', payload);
};
export const blockUnblockAppUser = async ({ userGuid, status }) => {
  return await axiosInstance.put(
    "/User/block-unblock-user",
    null, // no body — this endpoint wants query params
    {
      headers,
      params: { userGuid, status }, // <-- must be in the 3rd arg (config)
    }
  );
};

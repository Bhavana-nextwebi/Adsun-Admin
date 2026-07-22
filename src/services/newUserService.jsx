import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'accept': '*/*',
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
}; 

export const addUser = async (ownerData) => {
  const formData = new FormData();
    formData.append('UserName', ownerData.UserName);
    formData.append('UserId', ownerData.UserId);
    formData.append('UserRole', ownerData.UserRole);
    formData.append('EmailId', ownerData.EmailId);
    formData.append('ContactNo', ownerData.ContactNo);
    formData.append('Password', ownerData.owner_password);

    if (ownerData.profileImage) {
      formData.append('ProfileImage', ownerData.profileImage); 
    }
    const response = await axiosInstance.post('access/add-user', formData, {  headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${Cookies.get('accessToken')}`,
    }, });
    return response.data;
};

// userService.js
export const getUsers = async ({ pageSize = 10, pageNo = 1, sParam = "", fromDate = "", toDate = "" } = {}) => {
  const params = {
    pageSize,
    pageNo,
    sParam,
    fromDate,
    toDate,
  };
  return await axiosInstance.post('access/users', params, { headers });
};

export const deleteUser = async (userid) => {
  return await axiosInstance.delete(`access/delete-user/${userid}`, { headers });
};


export const updateUser = async (payload) => {
  return await axiosInstance.put('access/update-user', payload, {  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  }, });
};


export const fetchUserById = async (userid) => {
  const response = await axiosInstance.get(`access/user/${userid}`, { headers });
    return response.data.result;
};


export const changePassword = async (data) => {
 return await axiosInstance.put('access/change-password',data, {headers});
}

export const createPassword = async (data) => {
  return await axiosInstance.put('access/create-password',data, {headers});
  }

export const fetchUserProfile = async () => {
  return await axiosInstance.get('access/my-profile', {headers});
  };


export const updateProfilePage = async (payload) => {
  return await axiosInstance.put('access/my-profile', payload, {  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  }, });
  };
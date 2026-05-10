import axiosInstance from '../Interceptors/axiosInstance';
import Cookies from 'js-cookie';

const headers = {
  'accept': '*/*',
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

export const fetchManageAccessData = async (roleId) => {
        const response = await axiosInstance.get(`access/page-access/${roleId}`, { headers });
        return response.data.result; 
};

export const updatePageAccess = async (accessData) => {
  const isValidAccessData = (data) => {
          return (
              typeof data.roleId === 'number' &&
              typeof data.pageId === 'number' &&
              typeof data.pageGroupId === 'number' &&
              typeof data.addAccess === 'boolean' &&
              typeof data.editAccess === 'boolean' &&
              typeof data.deleteAccess === 'boolean' &&
              typeof data.viewAccess === 'boolean' &&
              typeof data.downloadAccess === 'boolean'
          );
      };

      if (!isValidAccessData(accessData)) {
          console.error('Invalid access data:', accessData);
          throw new Error('Access data validation failed');
      }

      const response = await axiosInstance.post(
          'access/page-access',
          accessData,
          { headers }
      );

      return response.data;
};


export const getMenus = async () => {
   const response = await axiosInstance.get('access/menus', { headers });
    return response; 
};
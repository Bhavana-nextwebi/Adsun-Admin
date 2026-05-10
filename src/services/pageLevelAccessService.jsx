import axiosInstance from '../Interceptors/axiosInstance';
import Cookies from 'js-cookie';

const headers = {
  'accept': '*/*',
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

export const fetchPageLevelAccess = async (pageUrl) => {
    try {
        const formData = {
            "pageUrl":pageUrl
        }
        const response = await axiosInstance.post(`access/page-access-by-url/`,formData, { headers });
        return response.data.result; 
    } catch (error) {
        console.error('Error fetching access data:', error.response ? error.response.data : error.message);
        throw error; 
    }
};

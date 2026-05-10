import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized, logging out ...');
      Cookies.remove('accessToken');
      // Cookies.remove('refreshToken');
      
      if (window.location.pathname !== '/auth/signin') {
        window.location.assign('/auth/signin');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

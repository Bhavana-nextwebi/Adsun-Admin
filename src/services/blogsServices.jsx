import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

export const addBlog = async (formData) => {
const response = await axiosInstance.post('blogs/add', formData, { headers: {
  'Content-Type': 'multipart/form-data',
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
},});
return response.data;} 


// export const getBlogs = async () => {
//     return await axiosInstance.get('blogs/all', { headers });
// };


export const deleteBlog = async (blogId) => {
    return await axiosInstance.delete(`blogs/${blogId}`, { headers });
};

export const updateBlog = async (payload) => {
  return await axiosInstance.put('/blogs/update', payload, {  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  }, });
};


export const updateBlogStatus = async (blogId, propStatus) => {
    return await axiosInstance.put(`blogs/status?blogId=${blogId}&blogStatus=${propStatus}`, { headers });
  };


export const fetchBlogData = async (blogId) => {
    const response = await axiosInstance.get(`blogs/${blogId}`, { headers });
    return response.data.result;
};

export const updateBlogFeaturedStatus = async (flatId, flatStatus) => {
    return await axiosInstance.put(`blogs/featured?blogId=${flatId}&featureStatus=${flatStatus}`, { headers });
  };

export const paginationBlogs = async (formData) => {
    return await axiosInstance.post('blogs/all/filter', formData, {headers});
  }
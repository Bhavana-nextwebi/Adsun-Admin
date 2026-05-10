import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};
export const addCategory = async (formData) => {
  return await axiosInstance.post(
    'category/add',
    {
      categoryName: formData.categoryName
      
    },
    { headers }
  );
};



export const updateCategory = async (payload) => {
  return await axiosInstance.put("/category/update", payload, { headers });
};




// export const addCategory = async (formData) => {
// const response = await axiosInstance.post('category/add', formData, { headers: {
//   'Content-Type': 'application/json',
//   'Authorization': `Bearer ${Cookies.get('accessToken')}`,
// },});
// return response.data;} 


// export const getBlogs = async () => {
//     return await axiosInstance.get('blogs/all', { headers });
// };


export const deleteCategory = async (Id) => {
    return await axiosInstance.delete(`category/delete/${Id}`, { headers });
};

// export const updateCategory = async (payload) => {
//   return await axiosInstance.put('/category/update', payload, {  headers: {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${Cookies.get('accessToken')}`,
//   }, });
// };


export const fetchCategoryDataById = async (CategoryId) => {
    const response = await axiosInstance.get(`category/GetCategory/${CategoryId}`, { headers });
    return response.data.result;
};

export const fetchAllCategories = async (formData) => {
    return await axiosInstance.get('category/GetallCategories', formData, {headers});
  }
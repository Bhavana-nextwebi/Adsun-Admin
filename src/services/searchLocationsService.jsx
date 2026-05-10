import axiosInstance from '../Interceptors/axiosInstance.jsx';



export const getAllCategories = async () => {
  const response = await axiosInstance.get('category/Getallcategories');
  return response.data;
};

export const getAllUserLocations = async () => {
  const response = await axiosInstance.get('/all-user-locations/all-user-locations');
  return response.data;
};

export const searchPlaces = async (payload) => {
  const response = await axiosInstance.post('/google-search/search-places', payload);
  return response.data;
};
import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const headers = {
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
  'Content-Type': 'application/json',
};

export const getAllSearchResults = async (
  fromDate,
  toDate
) => {

 const response = await axiosInstance.post(
  "/all-search-location-results/get-all",
  {
    fromDate,
    toDate,
  }
);

  return response.data;
};

export const deleteSearchResult = async (id) => {
  const response = await axiosInstance.delete(`/all-search-location-results/delete/${id}`);
  return response.data;
};
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
// ADD THESE TWO FUNCTIONS TO YOUR searchLocationsService.js

// Fetch saved searches for a user
export const getSavedSearchByUserGuid = async (userGuid) => {
  const response = await axiosInstance.get(
    `/all-search-location-results/get-saved-search-by-userguid/${userGuid}`
  );
  return response.data;
};

// Fetch place results for a specific search
export const getSearchResultsBySearchId = async (searchId) => {
  const response = await axiosInstance.get(
    `/all-search-location-results/get-search-by-searchid/${searchId}`
  );
  return response.data;
};
export const getAllSavedSearches = async () => {
  const response = await axiosInstance.get(
    "/all-search-location-results/get-all-saved-search"
  );
  return response.data;
};
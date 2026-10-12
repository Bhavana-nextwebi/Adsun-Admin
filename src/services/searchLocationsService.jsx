import axiosInstance from '../Interceptors/axiosInstance.jsx';



export const getAllCategories = async () => {
  const response = await axiosInstance.get('category/Getallcategories');
  return response.data;
};

export const getAllUserLocations = async (filters = {}) => {
  const payload = {
    pageNumber: filters.pageNumber ?? 1,
    pageSize: filters.pageSize ?? 10,
    fromDate: filters.fromDate || null,
    toDate: filters.toDate || null,
    sParam: filters.sParam || "",
    userGuid: filters.userGuid || "",
    state: filters.state || "",
    city: filters.city || "",
    area: filters.area || "",
    status: filters.status || "",
  };

  const response = await axiosInstance.post('/all-user-locations/all-user-locations', payload);
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
export const getAllSavedSearches = async (filters = {}) => {
  const payload = {
    pageNumber: filters.pageNumber ?? 1,
    pageSize: filters.pageSize ?? 10,
    fromDate: filters.fromDate || null,
    toDate: filters.toDate || null,
    sParam: filters.sParam || "",
    category: filters.category || "",
    userGuid: filters.userGuid || "",
    state: filters.state || "",
    city: filters.city || "",
    area: filters.area || "",
  };

  const response = await axiosInstance.post(
    "/all-search-location-results/get-all-saved-search",
    payload
  );
  return response.data;
};
export const getRemainingCredits = async () => {
  const response = await axiosInstance.get(
    "/google-search/credits-remaining-search"
  );

  return response.data;
};
export const SearchCreditDetails=async()=>{
  const response=await axiosInstance.get(
    "/google-search/credits-remaining-search"
  );
  return response.data;
}
export const getAreasByCategory = async (category) => {
  const res = await axiosInstance.get("/campaigns/category-wise-area", {
    params: { category },
  });
  return res.data; // { result, isSuccess, message, responseCode }
};

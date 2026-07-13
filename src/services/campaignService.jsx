import axiosInstance from '../Interceptors/axiosInstance.jsx';

export const createSendCampaign = async (payload) => {
  const response = await axiosInstance.post(
    '/sms-whatsapp-campaign/create-send',
    payload
  );
  return response.data;
};

 
// export const fetchBusinessesByCategoryArea = async ({ category, area }) => {
//   const response = await axiosInstance.get(
//     "/sms-whatsapp-campaign/GetBusinesses-phone-number",
//     { params: { category, area } }
//   );
//   return response.data; // { result: [...], isSuccess, message, responseCode }
// };

export const fetchBusinessesByCategoryArea= async ({ category, area }) => {
  const response = await axiosInstance.get(
    "/sms-whatsapp-campaign/GetBusinesses-phone-number1",
    { params: { category, area } }
  );
  return response.data; // { result: [...], isSuccess, message, responseCode }
};

export const getAllCampaigns = async (sendStatus = "") => {
  const response = await axiosInstance.get(
    `/campaigns/GetAllCampaigns?sendStatus=${sendStatus}`
  );

  return response.data;
};
export const getCampaignDetailsById = async (id) => {
  const response = await axiosInstance.get(`/campaigns/GetCampaignDetailsById/${id}`); // adjust endpoint to match your API
  return response.data;
};
// services/searchLocationsService.js
export const getAreasByCategory = async (category) => {
  const res = await axiosInstance.get("/api/v1/campaigns/category-wise-area", {
    params: { category },
  });
  return res.data; // { result, isSuccess, message, responseCode }
};


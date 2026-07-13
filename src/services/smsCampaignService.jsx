import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const BASE_URL = 'sms-whatsapp-campaign';

const getAuthHeader = () => ({
  Authorization: `Bearer ${Cookies.get('accessToken')}`,
});

// POST /api/v1/sms-whatsapp-campaign/SendSms
// Forwards the full documented request shape — campaignName, mobileNumbers,
// message, templateId, peid, headerId, scheduleDate and isScheduled — so
// scheduled campaigns actually carry their send time to the backend.
export const sendSmsCampaign = async ({
  campaignName,
  mobileNumbers,
  message,
  templateId,
  peid,
  headerId,
  scheduleDate,
  isScheduled,
}) => {
  return await axiosInstance.post(
    `${BASE_URL}/SendSms`,
    {
      campaignName,
      mobileNumbers,
      message,
      templateId,
      scheduleDate,
      isScheduled,
    },
    { headers: getAuthHeader() }
  );
};



export const getAllSmsCampaigns = async (sendStatus = "") => {
  const response = await axiosInstance.get(
    `/campaigns/GetAllSmsCampaignLogs?sendStatus=${sendStatus}`
  );

  return response.data;
};
export const getSmsCampaignDetailsById = async (id) => {
  const response = await axiosInstance.get(`/campaigns/GetSmsCampaignDetailsById?id=${id}`);
  console.log("SMS Campaign Details:", response.data);
  return response.data;
};
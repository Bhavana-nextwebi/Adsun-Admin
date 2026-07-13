import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const BASE_URL = 'sms-templates';

const getAuthHeader = () => ({
  Authorization: `Bearer ${Cookies.get('accessToken')}`,
});



// SMS templates are plain fields — no attachments/multipart involved,
// so a straightforward JSON payload is sent (unlike the WhatsApp
// FormData builder).
const buildPayload = (payload) => ({
  templateName: payload.templateName ?? '',
  templateId: payload.templateId ?? '',
  templateMessage: payload.templateMessage ?? '',
  templateType: payload.templateType ?? '',
});

export const addSmsTemplate = async (payload) => {
  return await axiosInstance.post(
    `${BASE_URL}/CreateSmsTemplate`,
    buildPayload(payload),
    { headers: getAuthHeader() }
  );
};

export const updateSmsTemplate = async (payload) => {
  return await axiosInstance.put(
    `${BASE_URL}/UpdateSmsTemplate`,
    { id: payload.id, ...buildPayload(payload) },
    { headers: getAuthHeader() }
  );
};

// Delete takes `id` as a query param per the API spec (not a path param).
export const deleteSmsTemplate = async (id) => {
  return await axiosInstance.delete(`${BASE_URL}/DeleteSmsTemplate`, {
    params: { id },
    headers: getAuthHeader()
  });
};

export const fetchSmsTemplateById = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/GetSmsTemplateById/${id}`, {
    headers: getAuthHeader()
  });
  return response.data.result;
};

export const fetchAllSmsTemplates = async (formData) => {
  return await axiosInstance.get(`${BASE_URL}/GetAllSmsTemplates`, {
    params: formData,
    headers: getAuthHeader()
  });
};
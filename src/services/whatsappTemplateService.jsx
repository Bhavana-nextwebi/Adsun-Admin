import axiosInstance from '../Interceptors/axiosInstance.jsx';
import Cookies from 'js-cookie';

const BASE_URL = 'whatsapp-templates';

// Only set Authorization here — NEVER manually set Content-Type for
// multipart/form-data requests. Axios/the browser must generate it
// itself (including the required boundary=... parameter), or the
// server can't parse the multipart body and throws a 500.
const getAuthHeader = () => ({
  Authorization: `Bearer ${Cookies.get('accessToken')}`,
});

const buildFormData = (payload) => {
  const fd = new FormData();

  fd.append('TemplateId', payload.templateId ?? '');
  fd.append('TemplateName', payload.templateName ?? '');
  fd.append('LanguageCode', payload.languageCode ?? '');
  fd.append('Category', payload.category ?? '');
  fd.append('HeaderType', payload.headerType ?? '');
  fd.append('Message', payload.message ?? '');
  fd.append('Footer', payload.footer ?? '');

  if (payload.imageFile) {
    fd.append('image', payload.imageFile);
  } else {
    fd.append('HeaderValue', payload.headerValue ?? '');
  }

  if (Array.isArray(payload.buttons)) {
    payload.buttons.forEach((btn, i) => {
      fd.append(`Buttons[${i}].type`, btn.type ?? '');
      fd.append(`Buttons[${i}].placeholder`, btn.placeholder ?? '');
      fd.append(`Buttons[${i}].text`, btn.text ?? '');
    });
  }

  if (payload.id !== undefined && payload.id !== null) {
    fd.append('Id', payload.id);
  }

  return fd;
};

export const addWhatsappTemplate = async (payload) => {
  return await axiosInstance.post(
    `${BASE_URL}/Create`,
    buildFormData(payload),
    { headers: getAuthHeader() }
  );
};

export const updateWhatsappTemplate = async (payload) => {
  return await axiosInstance.put(
    `${BASE_URL}/Update`,
    buildFormData(payload),
    { headers: getAuthHeader() }
  );
};

export const deleteWhatsappTemplate = async (Id) => {
  return await axiosInstance.delete(`${BASE_URL}/Delete/${Id}`, {
    headers: getAuthHeader()
  });
};

export const fetchWhatsappTemplateById = async (Id) => {
  const response = await axiosInstance.get(`${BASE_URL}/GetById/${Id}`, {
    headers: getAuthHeader()
  });
  return response.data.result;
};

export const fetchAllWhatsappTemplates = async (formData) => {
  return await axiosInstance.get(`${BASE_URL}/GetAll`, {
    params: formData,
    headers: getAuthHeader()
  });
};
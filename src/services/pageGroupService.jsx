import axiosInstance from "../Interceptors/axiosInstance.jsx";
import Cookies from "js-cookie";

const headers = {
  accept: "*/*",
  Authorization: `Bearer ${Cookies.get("accessToken")}`,
  "Content-Type": "application/json",
};

export const addPageGroup = async (formData) => {
  return await axiosInstance.post(
    "access/page-group",
    {
      groupName: formData.groupName,
      groupIcon: formData.groupIcon,
      groupOrder: Number(formData.groupOrder),
    },
    { headers }
  );
};

export const getPageGroups = async () => {
  return await axiosInstance.get("access/page-group", { headers });
};

export const deletePageGroup = async (groupId) => {
  return await axiosInstance.delete(`access/page-group/${groupId}`, {
    headers,
  });
};

export const updatePageGroup = async (payload) => {
  return await axiosInstance.put("/access/page-group", payload, { headers });
};

export const fetchPageGroupData = async (id) => {
  const response = await axiosInstance.get(`/access/page-group/${id}`, {
    headers,
  });
  return response.data.result;
};

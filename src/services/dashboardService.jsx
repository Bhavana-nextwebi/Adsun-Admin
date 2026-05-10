import axiosInstance from "../Interceptors/axiosInstance.jsx";
import Cookies from "js-cookie";

const headers = {
  accept: "*/*",
  Authorization: `Bearer ${Cookies.get("accessToken")}`,
  "Content-Type": "application/json",
};

export const fetchDashboardSupportStats = async () => {
  const response = await axiosInstance.get("/dashboard/admin/status-stats", {
    headers,
  });
  return response.data;
};

export const fetchDashboardCardStats = async () => {
  const response = await axiosInstance.get("/dashboard/admin/main-stats", {
    headers,
  });
  return response.data;
};

export const fetchDashboardVacationsStats = async () => {
  const response = await axiosInstance.get("/dashboard/admin/upcoming-exp", {
    headers,
  });
  return response.data;
};

export const fetchDashboardMonthwiseRevenue = async () => {
  const response = await axiosInstance.get("/dashboard/admin/revenue-12month", {
    headers,
  });
  return response.data.result;
};

export const fetchDashboardAssets = async () => {
  const response = await axiosInstance.get("/dashboard/admin/assets", {
    headers,
  });
  return response.data;
};

export const fetchDashboardTopOrders = async () => {
  const response = await axiosInstance.get("/dashboard/admin/last-order", {
    headers,
  });
  return response.data;
};

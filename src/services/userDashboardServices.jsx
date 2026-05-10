import axiosInstance from "../Interceptors/axiosInstance.jsx";
import Cookies from "js-cookie";

const headers = {
  accept: "*/*",
  Authorization: `Bearer ${Cookies.get("accessToken")}`,
  "Content-Type": "application/json",
};
export const fetchUserDashboardCardStats = async () => {
  const response = await axiosInstance.get("/dashboard/admin/mobile/support", {
    headers,
  });
  return response.data;
};
